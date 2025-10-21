import type { GalaxyPart } from './plotter';
export type { GitHubCommit as Commit, GitHubPullRequest as PullRequest, GitHubIssue as Issue } from '@/backend/types';

// 'bias' is used by the plotting algorithm to favor certain layouts depending on the user's commit count
export type Bias = (RNG: () => number) => GalaxyPart;

export type StarProps = {
	coords: { x: number; y: number };
	size: number;
	points: 4 | 5;
	desc: string;
	color: 'red' | 'yellow' | 'blue';
	brightness: number;
	url: string | null;
	proximity: number | null;
	customRevolution: number | null;
	uid?: string;
	RNG: () => number;
};
