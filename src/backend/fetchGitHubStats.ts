import fs from 'node:fs';
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
								edges: {
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
									};
								}[];
							};
						};
					};
				};
			}[];
		};
	};
};

export type GitHubStats = {
	totalCommits: number;
	totalPullRequests: number;
	totalIssues: number;
	repositoryContributions: {
		repositoryName: string;
		commitCount: number;
	}[];
};

const USER_ID_QUERY = gql`
	query GetUserId {
		user(login: "PartMan7") {
			id
		}
	}
`;

const CONTRIBUTIONS_QUERY = gql`
	query Contributions($from: DateTime!, $to: DateTime!, $since: GitTimestamp!, $until: GitTimestamp!, $authorId: ID!) {
		user(login: "PartMan7") {
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
										edges {
											node {
												oid
												messageHeadline
												committedDate
												author {
													name
													email
												}
												additions
												deletions
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
					}
				}
			}
		}
	}
`;

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
			variables: { username: process.env.GITHUB_USERNAME, from, to, since: from, until: to, authorId },
		});

		if (response.error) {
			throw new Error(`GitHub GraphQL API errors: ${response.error.message}`);
		}

		if (!response.data?.user?.contributionsCollection) {
			throw new Error('Invalid response from GitHub API');
		}

		const collection = response.data.user.contributionsCollection;

		return {
			totalCommits: collection.totalCommitContributions,
			totalPullRequests: collection.totalPullRequestContributions,
			totalIssues: collection.totalIssueContributions,
			repositoryContributions: collection.commitContributionsByRepository.map(item => ({
				repositoryName: item.repository.name,
				commitCount: item.repository.defaultBranchRef.target.history.edges.length,
			})),
		};
	} catch (error) {
		if (error instanceof Error) {
			throw new Error(`Failed to fetch GitHub stats: ${error.message}`);
		}
		throw error;
	}
}

console.log(await fetchGitHubStats());
