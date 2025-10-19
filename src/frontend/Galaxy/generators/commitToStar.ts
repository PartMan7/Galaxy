import { Temporal } from '@js-temporal/polyfill';
import { cyrb128, sample, useRNG } from '@/utils/prng';
import type { Commit, StarProps } from '../types';
import { plotGalaxy } from '../plotter';

const MIN_SIZE = 8;
const MAX_SIZE = 12;
const MIN_CHANGES = 10;
const MAX_CHANGES = 1000;
function getCommitSize(commit: Commit): number {
	const changes = commit.additions + commit.deletions;
	if (changes < MIN_CHANGES) return MIN_SIZE;
	if (changes >= MAX_CHANGES) return MAX_SIZE;
	// linear interpolation between MIN_SIZE and MAX_SIZE
	return Math.round(MIN_SIZE + ((changes - MIN_CHANGES) / (MAX_CHANGES - MIN_CHANGES)) * (MAX_SIZE - MIN_SIZE));
}

const ONE_WEEK = Temporal.Duration.from({ hours: 7 * 24 });
const ROUGH_DAYS_IN_YEAR = 400; // increased so that even dim stars don't have 0 brightness

function getCommitBrightness(commit: Commit): number {
	const Now = Temporal.Now.instant();
	const timeElapsed = Now.since(Temporal.Instant.from(commit.committedDate));
	if (Temporal.Duration.compare(timeElapsed, ONE_WEEK) < 0) return 1.5;
	return 1 - timeElapsed.total({ unit: 'days' }) / ROUGH_DAYS_IN_YEAR;
}

function getCommitDuration(RNG: () => number): number {
	return sample([2000, 10000], RNG);
}

function getCommitAnimationOffset(RNG: () => number): number {
	return sample([0, 1000], RNG);
}

export function commitToStar(commit: Commit): StarProps {
	const prngSource = useRNG(cyrb128(commit.revision + 'commit')[0]);

	return {
		desc: commit.message,
		coords: plotGalaxy(prngSource),
		duration: getCommitDuration(prngSource),
		animationOffset: getCommitAnimationOffset(prngSource),
		size: getCommitSize(commit),
		points: 4,
		color: 'var(--color-amber-50)',
		rotation: 0,
		brightness: getCommitBrightness(commit),
		url: commit.url,
	};
}
