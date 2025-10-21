export type { GitHubCommit as Commit, GitHubPullRequest as PullRequest, GitHubIssue as Issue } from '@/backend/types';

export type CommonStarProps = {
	coords: { x: number; y: number };
	size: number;
	points: 4 | 5;
	desc: string;
	color: string;
	brightness: number;
	url: string | null;
	proximity: number | null;
	customRevolution: number | null;
	RNG: () => number;
};
