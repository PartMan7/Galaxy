export type { GitHubCommit as Commit, GitHubPullRequest as PullRequest, GitHubIssue as Issue } from '@/backend/types';

export type CommonStarProps = {
	coords: { x: number; y: number; proximity: number | null };
	size: number;
	points: 4 | 5;
	desc: string;
	color: string;
	brightness: number;
	url: string | null;
	RNG: () => number;
};
