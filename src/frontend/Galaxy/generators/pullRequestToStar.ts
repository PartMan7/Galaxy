import { Temporal } from '@js-temporal/polyfill';
import { cyrb128, sample, useRNG } from '@/utils/prng';
import { getBrightness, plotGalaxy } from '../plotter';
import type { PullRequest, StarProps } from '../types';

const MIN_SIZE = 12;
const MAX_SIZE = 16;
const COMMENTS_FOR_MIN = 2;

function getPRSize(pullRequest: PullRequest): number {
	const comments = pullRequest?.totalComments ?? 2;
	if (comments <= COMMENTS_FOR_MIN) return MIN_SIZE;
	return Math.min(MAX_SIZE, comments - COMMENTS_FOR_MIN + MIN_SIZE);
}

const ANIMATION_DURATION_RANGE = [2000, 10000] as [number, number];
const ANIMATION_OFFSET_RANGE = [0, 1000] as [number, number];

export function pullRequestToStar(pullRequest: PullRequest): StarProps {
	const prngSource = useRNG(pullRequest ? cyrb128(pullRequest?.url + 'pullRequest')[0] : undefined);

	return {
		desc: pullRequest?.title ?? '(Private Pull Request)',
		coords: plotGalaxy(prngSource),
		duration: sample(ANIMATION_DURATION_RANGE, prngSource),
		animationOffset: sample(ANIMATION_OFFSET_RANGE, prngSource),
		size: getPRSize(pullRequest),
		points: 4,
		color: 'var(--color-blue-200)',
		rotation: sample(360, prngSource),
		brightness: pullRequest ? getBrightness(Temporal.Instant.from(pullRequest?.createdAt)) : 0.5,
		url: pullRequest?.url ?? null,
		drift: sample(5, prngSource) === 0,
	};
}
