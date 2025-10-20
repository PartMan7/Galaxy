import { Temporal } from '@js-temporal/polyfill';
import { cyrb128, sample, useRNG } from '@/utils/prng';
import { getBrightness, plotGalaxy } from '../plotter';
import type { PullRequest, CommonStarProps } from '../types';

const MIN_SIZE = 12;
const MAX_SIZE = 16;
const COMMENTS_FOR_MIN = 2;

function getPRSize(pullRequest: PullRequest): number {
	const comments = pullRequest?.totalComments ?? 2;
	if (comments <= COMMENTS_FOR_MIN) return MIN_SIZE;
	return Math.min(MAX_SIZE, comments - COMMENTS_FOR_MIN + MIN_SIZE);
}

export function pullRequestToStar(pullRequest: PullRequest): CommonStarProps {
	const prngSource = useRNG(pullRequest ? cyrb128(pullRequest?.url + 'pullRequest')[0] : undefined);

	return {
		desc: pullRequest?.title ?? '(Private Pull Request)',
		coords: plotGalaxy(prngSource),
		size: getPRSize(pullRequest),
		points: 4,
		color: 'var(--color-blue-200)',
		brightness: pullRequest ? getBrightness(Temporal.Instant.from(pullRequest?.createdAt)) : 0.5,
		url: pullRequest?.url ?? null,
		RNG: prngSource,
	};
}
