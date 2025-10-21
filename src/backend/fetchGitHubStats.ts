import { gql } from '@apollo/client';
import { Temporal } from '@js-temporal/polyfill';

import client from './gql';

import type {
	CommitEdge,
	GitHubIssue,
	GitHubPullRequest,
	GitHubStats,
	GitHubStatsResponse,
	IssueContributionsResponse,
	IssueEdge,
	PullRequestContributionsResponse,
	PullRequestEdge,
	RepositoryHistoryResponse,
} from './types';

const USERNAME = process.env.PUBLIC_GITHUB_USERNAME!;
if (!USERNAME) {
	throw new Error('PUBLIC_GITHUB_USERNAME is not set');
}

const USER_ID_QUERY = gql`
	query GetUserId($username: String!) {
		user(login: $username) {
			id
		}
	}
`;

const EDGE_FRAGMENT = gql`
	fragment EdgeFragment on CommitHistoryConnection {
		edges {
			node {
				oid
				messageHeadline
				committedDate
				url
				author {
					name
					email
				}
				additions
				deletions
			}
		}
	}
`;

const CONTRIBUTIONS_QUERY = gql`
	query Contributions(
		$from: DateTime!
		$to: DateTime!
		$since: GitTimestamp!
		$until: GitTimestamp!
		$authorName: String!
		$authorId: ID!
	) {
		user(login: $authorName) {
			contributionsCollection(from: $from, to: $to) {
				totalCommitContributions
				totalPullRequestContributions
				totalIssueContributions

				pullRequestContributions(first: 100) {
					edges {
						node {
							pullRequest {
								url
								title
								createdAt
								merged
								headRefName
								commits {
									totalCount
								}
								comments {
									totalCount
								}
							}
						}
					}
					pageInfo {
						hasNextPage
						endCursor
					}
				}

				issueContributions(first: 100) {
					edges {
						node {
							issue {
								url
								title
								createdAt
								comments {
									totalCount
								}
							}
						}
					}
					pageInfo {
						hasNextPage
						endCursor
					}
				}

				commitContributionsByRepository(maxRepositories: 100) {
					repository {
						name
						url
						defaultBranchRef {
							target {
								... on Commit {
									history(first: 100, since: $since, until: $until, author: { id: $authorId }) {
										...EdgeFragment
										pageInfo {
											hasNextPage
											endCursor
										}
									}
								}
							}
						}
					}
				}
			}
		}
	}

	${EDGE_FRAGMENT}
`;

const REPOSITORY_HISTORY_QUERY = gql`
	query RepositoryHistory(
		$owner: String!
		$name: String!
		$since: GitTimestamp!
		$until: GitTimestamp!
		$authorId: ID!
		$after: String!
	) {
		repository(owner: $owner, name: $name) {
			defaultBranchRef {
				target {
					... on Commit {
						history(first: 100, since: $since, until: $until, author: { id: $authorId }, after: $after) {
							...EdgeFragment
							pageInfo {
								hasNextPage
								endCursor
							}
						}
					}
				}
			}
		}
	}

	${EDGE_FRAGMENT}
`;

const PULL_REQUEST_CONTRIBUTIONS_QUERY = gql`
	query PullRequestContributions($from: DateTime!, $to: DateTime!, $authorName: String!, $after: String!) {
		user(login: $authorName) {
			contributionsCollection(from: $from, to: $to) {
				pullRequestContributions(first: 100, after: $after) {
					edges {
						node {
							pullRequest {
								url
								title
								createdAt
								merged
								headRefName
								commits {
									totalCount
								}
								comments {
									totalCount
								}
							}
						}
					}
					pageInfo {
						hasNextPage
						endCursor
					}
				}
			}
		}
	}
`;

const ISSUE_CONTRIBUTIONS_QUERY = gql`
	query IssueContributions($from: DateTime!, $to: DateTime!, $authorName: String!, $after: String!) {
		user(login: $authorName) {
			contributionsCollection(from: $from, to: $to) {
				issueContributions(first: 100, after: $after) {
					edges {
						node {
							issue {
								url
								title
								createdAt
								comments {
									totalCount
								}
							}
						}
					}
					pageInfo {
						hasNextPage
						endCursor
					}
				}
			}
		}
	}
`;

async function fetchAllCommitsForRepository(
	owner: string,
	name: string,
	since: string,
	until: string,
	authorId: string,
	initialEdges: CommitEdge[],
	initialPageInfo: { hasNextPage: boolean; endCursor: string }
): Promise<CommitEdge[]> {
	const allEdges: CommitEdge[] = [...initialEdges];
	let hasNextPage = initialPageInfo.hasNextPage;
	let endCursor = initialPageInfo.endCursor;

	while (hasNextPage) {
		const response = await client.query<RepositoryHistoryResponse>({
			query: REPOSITORY_HISTORY_QUERY,
			variables: { owner, name, since, until, authorId, after: endCursor },
		});

		if (!response.data?.repository?.defaultBranchRef?.target?.history) {
			break;
		}

		const history = response.data.repository.defaultBranchRef.target.history;
		allEdges.push(...history.edges);
		hasNextPage = history.pageInfo.hasNextPage;
		endCursor = history.pageInfo.endCursor;
	}

	return allEdges;
}

async function fetchAllPullRequests(
	authorName: string,
	from: string,
	to: string,
	initialEdges: PullRequestEdge[],
	initialPageInfo: { hasNextPage: boolean; endCursor: string }
): Promise<(PullRequestEdge | null)[]> {
	const allEdges: PullRequestEdge[] = [...initialEdges];
	let hasNextPage = initialPageInfo.hasNextPage;
	let endCursor = initialPageInfo.endCursor;

	while (hasNextPage) {
		const response = await client.query<PullRequestContributionsResponse>({
			query: PULL_REQUEST_CONTRIBUTIONS_QUERY,
			variables: { authorName, from, to, after: endCursor },
		});

		if (!response.data?.user?.contributionsCollection?.pullRequestContributions) {
			break;
		}

		const prContributions = response.data.user.contributionsCollection.pullRequestContributions;
		allEdges.push(...prContributions.edges);
		hasNextPage = prContributions.pageInfo.hasNextPage;
		endCursor = prContributions.pageInfo.endCursor;
	}

	return allEdges;
}

async function fetchAllIssues(
	authorName: string,
	from: string,
	to: string,
	initialEdges: IssueEdge[],
	initialPageInfo: { hasNextPage: boolean; endCursor: string }
): Promise<IssueEdge[]> {
	const allEdges: IssueEdge[] = [...initialEdges];
	let hasNextPage = initialPageInfo.hasNextPage;
	let endCursor = initialPageInfo.endCursor;

	while (hasNextPage) {
		const response = await client.query<IssueContributionsResponse>({
			query: ISSUE_CONTRIBUTIONS_QUERY,
			variables: { authorName, from, to, after: endCursor },
		});

		if (!response.data?.user?.contributionsCollection?.issueContributions) {
			break;
		}

		const issueContributions = response.data.user.contributionsCollection.issueContributions;
		allEdges.push(...issueContributions.edges);
		hasNextPage = issueContributions.pageInfo.hasNextPage;
		endCursor = issueContributions.pageInfo.endCursor;
	}

	return allEdges;
}

export async function fetchGitHubStats(
	until: Temporal.Instant = Temporal.Now.instant(),
	duration: Temporal.Duration = Temporal.Duration.from({ hours: 365 * 24 })
): Promise<GitHubStats> {
	const from = until.subtract(duration).toString();
	const to = until.toString();

	try {
		// First, get the user ID
		const userIdResponse = await client.query<{ user: { id: string } }>({
			query: USER_ID_QUERY,
			variables: { username: USERNAME },
		});

		if (!userIdResponse.data?.user?.id) {
			throw new Error('Could not fetch user ID');
		}

		const authorId = userIdResponse.data.user.id;

		// Now fetch contributions with the author filter
		const response = await client.query<GitHubStatsResponse>({
			query: CONTRIBUTIONS_QUERY,
			variables: { authorName: USERNAME, from, to, since: from, until: to, authorId },
		});

		if (response.error) {
			throw new Error(`GitHub GraphQL API errors: ${response.error.message}`);
		}

		if (!response.data?.user?.contributionsCollection) {
			throw new Error('Invalid response from GitHub API');
		}

		const collection = response.data.user.contributionsCollection;

		// Paginate through all commits for each repository
		const repositoryContributions = await Promise.all(
			collection.commitContributionsByRepository.map(async item => {
				const repoUrl = item.repository.url;
				const urlParts = repoUrl.replace('https://github.com/', '').split('/');
				const owner = urlParts[0];
				const name = urlParts[1];

				if (!owner || !name) {
					return {
						repositoryName: item.repository.name,
						commits: item.repository.defaultBranchRef.target.history.edges.map(edge => ({
							revision: edge.node.oid,
							message: edge.node.messageHeadline,
							additions: edge.node.additions,
							deletions: edge.node.deletions,
							committedDate: edge.node.committedDate,
							url: edge.node.url,
						})),
					};
				}

				const commits = await fetchAllCommitsForRepository(
					owner,
					name,
					from,
					to,
					authorId,
					item.repository.defaultBranchRef.target.history.edges,
					item.repository.defaultBranchRef.target.history.pageInfo
				);

				return {
					repositoryName: item.repository.name,
					commits: commits.map(edge => ({
						revision: edge.node.oid,
						message: edge.node.messageHeadline,
						additions: edge.node.additions,
						deletions: edge.node.deletions,
						committedDate: edge.node.committedDate,
						url: edge.node.url,
					})),
				};
			})
		);

		// Paginate through all pull requests
		const allPullRequestEdges = await fetchAllPullRequests(
			USERNAME,
			from,
			to,
			collection.pullRequestContributions.edges,
			collection.pullRequestContributions.pageInfo
		);

		const pullRequests: GitHubPullRequest[] = allPullRequestEdges.map((edge, index) =>
			edge
				? {
						url: edge.node.pullRequest.url,
						title: edge.node.pullRequest.title,
						createdAt: edge.node.pullRequest.createdAt,
						merged: edge.node.pullRequest.merged,
						headRefName: edge.node.pullRequest.headRefName,
						totalCommits: edge.node.pullRequest.commits.totalCount,
						totalComments: edge.node.pullRequest.comments.totalCount,
					}
				: { uid: index }
		);

		// Paginate through all issues
		const allIssueEdges = await fetchAllIssues(
			USERNAME,
			from,
			to,
			collection.issueContributions.edges,
			collection.issueContributions.pageInfo
		);

		const issues: GitHubIssue[] = allIssueEdges.map(edge => ({
			url: edge.node.issue.url,
			title: edge.node.issue.title,
			createdAt: edge.node.issue.createdAt,
			totalComments: edge.node.issue.comments.totalCount,
		}));

		return {
			totalCommits: collection.totalCommitContributions,
			totalPullRequests: collection.totalPullRequestContributions,
			totalIssues: collection.totalIssueContributions,
			repositoryContributions,
			pullRequests,
			issues,
		};
	} catch (error) {
		if (error instanceof Error) {
			throw new Error(`Failed to fetch GitHub stats: ${error.message}`);
		}
		throw error;
	}
}
