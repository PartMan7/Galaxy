import { Temporal } from '@js-temporal/polyfill';
import { cyrb128, sample, useRNG } from '@/utils/prng';
import { getBrightness, plotGalaxy } from '../plotter';
import type { Issue, StarProps } from '../types';

const MIN_SIZE = 12;
const MAX_SIZE = 16;
const COMMENTS_FOR_MIN = 2;

function getIssueSize(issue: Issue): number {
	const comments = issue.totalComments;
	if (comments <= COMMENTS_FOR_MIN) return MIN_SIZE;
	return Math.min(MAX_SIZE, comments - COMMENTS_FOR_MIN + MIN_SIZE);
}

const ANIMATION_DURATION_RANGE = [2000, 10000] as [number, number];
const ANIMATION_OFFSET_RANGE = [0, 1000] as [number, number];

export function issueToStar(issue: Issue): StarProps {
	const prngSource = useRNG(cyrb128(issue.url + 'issue')[0]);

	return {
		desc: issue.title,
		coords: plotGalaxy(prngSource),
		duration: sample(ANIMATION_DURATION_RANGE, prngSource),
		animationOffset: sample(ANIMATION_OFFSET_RANGE, prngSource),
		size: getIssueSize(issue),
		points: 5,
		color: 'var(--color-red-200)',
		rotation: sample(360, prngSource),
		brightness: getBrightness(Temporal.Instant.from(issue.createdAt)),
		url: issue.url,
        drift: sample(5, prngSource) === 0,
	};
}
