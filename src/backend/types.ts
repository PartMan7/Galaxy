export type GitHubStatsResponse = {
	user: {
		contributionsCollection: {
			totalCommitContributions: number;
			totalPullRequestContributions: number;
			totalIssueContributions: number;
			pullRequestContributions: {
				edges: PullRequestEdge[];
				pageInfo: {
					hasNextPage: boolean;
					endCursor: string;
				};
			};
			issueContributions: {
				edges: IssueEdge[];
				pageInfo: {
					hasNextPage: boolean;
					endCursor: string;
				};
			};
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

export type CommitEdge = {
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

export type PullRequestEdge = {
	node: {
		pullRequest: {
			url: string;
			title: string;
			createdAt: string;
			merged: boolean;
			headRefName: string;
			commits: {
				totalCount: number;
			};
			comments: {
				totalCount: number;
			};
		};
	};
};

export type IssueEdge = {
	node: {
		issue: {
			url: string;
			title: string;
			createdAt: string;
			comments: {
				totalCount: number;
			};
		};
	};
};

export type RepositoryHistoryResponse = {
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

export type PullRequestContributionsResponse = {
	user: {
		contributionsCollection: {
			pullRequestContributions: {
				edges: PullRequestEdge[];
				pageInfo: {
					hasNextPage: boolean;
					endCursor: string;
				};
			};
		};
	};
};

export type IssueContributionsResponse = {
	user: {
		contributionsCollection: {
			issueContributions: {
				edges: IssueEdge[];
				pageInfo: {
					hasNextPage: boolean;
					endCursor: string;
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

export type GitHubPullRequest =
	| {
			url: string;
			title: string;
			createdAt: string;
			merged: boolean;
			headRefName: string;
			totalCommits: number;
			totalComments: number;
	  }
	| {
			uid: number;
	  };

export type GitHubIssue = {
	url: string;
	title: string;
	createdAt: string;
	totalComments: number;
};

export type GitHubStats = {
	totalCommits: number;
	totalPullRequests: number;
	totalIssues: number;
	repositoryContributions: {
		repositoryName: string;
		commits: GitHubCommit[];
	}[];
	pullRequests: GitHubPullRequest[];
	issues: GitHubIssue[];
};
