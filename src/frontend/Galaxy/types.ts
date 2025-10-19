export type { GitHubCommit as Commit, GitHubPullRequest as PullRequest, GitHubIssue as Issue } from '@/backend/types';

export type StarProps = {
	coords: { x: number; y: number };
	size: number;
	points: 4 | 5;
	desc: string;
	color: string;
	rotation: number;
	brightness: number;
	url: string | null;
	duration: number;
	animationOffset: number;
	drift: boolean;
};
