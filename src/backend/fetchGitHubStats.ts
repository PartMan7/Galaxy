import { Temporal } from '@js-temporal/polyfill';

interface CommitContribution {
	repository: {
		name: string;
	};
	contributions: {
		totalCount: number;
	};
}

interface ContributionsCollection {
	totalCommitContributions: number;
	totalPullRequestContributions: number;
	totalIssueContributions: number;
	commitContributionsByRepository: CommitContribution[];
}

interface GitHubStatsResponse {
	data: {
		user: {
			contributionsCollection: ContributionsCollection;
		};
	};
	errors?: Array<{
		message: string;
		locations?: Array<{ line: number; column: number }>;
		path?: string[];
	}>;
}

export interface GitHubStats {
	totalCommits: number;
	totalPullRequests: number;
	totalIssues: number;
	repositoryContributions: Array<{
		repositoryName: string;
		commitCount: number;
	}>;
}

export async function fetchGitHubStats(
	until: Temporal.Instant = Temporal.Now.instant(),
	duration: Temporal.Duration = Temporal.Duration.from({ hours: 365 * 24 })
): Promise<GitHubStats> {
	const from = until.subtract(duration).toString();
	const to = until.toString();

	const query = `
    query($username: String!, $from: DateTime!, $to: DateTime!) {
      user(login: $username) {
        contributionsCollection(from: $from, to: $to) {
          totalCommitContributions
          totalPullRequestContributions
          totalIssueContributions
          commitContributionsByRepository(maxRepositories: 100) {
            repository {
              name
            }
            contributions {
              totalCount
            }
          }
        }
      }
    }
  `;

	const variables = {
		username: process.env.GITHUB_USERNAME,
		from,
		to,
	};

	try {
		const response = await fetch('https://api.github.com/graphql', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
				'User-Agent': 'Galaxy-Stats-App',
			},
			body: JSON.stringify({
				query,
				variables,
			}),
		});

		if (!response.ok) {
			throw new Error(`GitHub API request failed: ${response.status} ${response.statusText}`);
		}

		const result: GitHubStatsResponse = await response.json();

		if (result.errors) {
			const errorMessages = result.errors.map(e => e.message).join(', ');
			throw new Error(`GitHub GraphQL API errors: ${errorMessages}`);
		}

		if (!result.data?.user?.contributionsCollection) {
			throw new Error('Invalid response from GitHub API');
		}

		const collection = result.data.user.contributionsCollection;

		return {
			totalCommits: collection.totalCommitContributions,
			totalPullRequests: collection.totalPullRequestContributions,
			totalIssues: collection.totalIssueContributions,
			repositoryContributions: collection.commitContributionsByRepository.map(item => ({
				repositoryName: item.repository.name,
				commitCount: item.contributions.totalCount,
			})),
		};
	} catch (error) {
		if (error instanceof Error) {
			throw new Error(`Failed to fetch GitHub stats: ${error.message}`);
		}
		throw error;
	}
}
