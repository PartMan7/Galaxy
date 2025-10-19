import { Temporal } from '@js-temporal/polyfill';
import { cyrb128, sample, useRNG } from '@/utils/prng';
import { getBrightness, plotGalaxy } from '../plotter';
import type { Commit, StarProps } from '../types';

const MIN_SIZE = 10;
const MAX_SIZE = 16;
const MIN_CHANGES = 10;
const MAX_CHANGES = 1000;
function getCommitSize(commit: Commit): number {
	const changes = commit.additions + commit.deletions;
	if (changes < MIN_CHANGES) return MIN_SIZE;
	if (changes >= MAX_CHANGES) return MAX_SIZE;
	// linear interpolation between MIN_SIZE and MAX_SIZE
	return Math.round(MIN_SIZE + ((changes - MIN_CHANGES) / (MAX_CHANGES - MIN_CHANGES)) * (MAX_SIZE - MIN_SIZE));
}

const ANIMATION_DURATION_RANGE = [2000, 10000] as [number, number];
const ANIMATION_OFFSET_RANGE = [0, 1000] as [number, number];

export function commitToStar(commit: Commit): StarProps {
	const prngSource = useRNG(cyrb128(commit.revision + 'commit')[0]);

	return {
		desc: commit.message,
		coords: plotGalaxy(prngSource),
		duration: sample(ANIMATION_DURATION_RANGE, prngSource),
		animationOffset: sample(ANIMATION_OFFSET_RANGE, prngSource),
		size: getCommitSize(commit),
		points: 4,
		color: 'var(--color-amber-50)',
		rotation: sample(360, prngSource),
		brightness: getBrightness(Temporal.Instant.from(commit.committedDate)),
		url: commit.url,
		drift: sample(5, prngSource) === 0,
	};
}
