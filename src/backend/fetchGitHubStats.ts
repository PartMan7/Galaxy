import { gql } from '@apollo/client';
import { Temporal } from '@js-temporal/polyfill';

import client from './gql';

type GitHubStatsResponse = {
	user: {
		contributionsCollection: {
			totalCommitContributions: number;
			totalPullRequestContributions: number;
			totalIssueContributions: number;
			commitContributionsByRepository: {
				repository: {
					name: string;
					url: string;
					defaultBranchRef: {
						target: {
							history: {
								edges: CommitEdge[];
								pageInfo: {
									hasNextPage: boolean;
									endCursor: string;
								};
							};
						};
					};
				};
			}[];
		};
	};
};

type CommitEdge = {
	node: {
		oid: string;
		messageHeadline: string;
		committedDate: string;
		author: {
			name: string;
			email: string;
		};
		additions: number;
		deletions: number;
		url: string;
	};
};

type RepositoryHistoryResponse = {
	repository: {
		defaultBranchRef: {
			target: {
				history: {
					edges: CommitEdge[];
					pageInfo: {
						hasNextPage: boolean;
						endCursor: string;
					};
				};
			};
		};
	};
};

export type GitHubCommit = {
	revision: string;
	message: string;
	additions: number;
	deletions: number;
	committedDate: string;
	url: string;
};

export type GitHubStats = {
	totalCommits: number;
	totalPullRequests: number;
	totalIssues: number;
	repositoryContributions: {
		repositoryName: string;
		commits: GitHubCommit[];
	}[];
};

const USER_ID_QUERY = gql`
	query GetUserId {
		user(login: "PartMan7") {
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
		});

		if (!userIdResponse.data?.user?.id) {
			throw new Error('Could not fetch user ID');
		}

		const authorId = userIdResponse.data.user.id;

		// Now fetch contributions with the author filter
		const response = await client.query<GitHubStatsResponse>({
			query: CONTRIBUTIONS_QUERY,
			variables: { authorName: process.env.GITHUB_USERNAME, from, to, since: from, until: to, authorId },
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

		return {
			totalCommits: collection.totalCommitContributions,
			totalPullRequests: collection.totalPullRequestContributions,
			totalIssues: collection.totalIssueContributions,
			repositoryContributions,
		};
	} catch (error) {
		if (error instanceof Error) {
			throw new Error(`Failed to fetch GitHub stats: ${error.message}`);
		}
		throw error;
	}
}
