export type { GitHubCommit as Commit } from '@/backend/fetchGitHubStats';

export type StarProps = {
	coords: { x: number; y: number };
	size: number;
	points: 4 | 6;
	desc: string;
	color: string;
	rotation: number;
	brightness: number;
	url: string;
	duration: number;
	animationOffset: number;
};
