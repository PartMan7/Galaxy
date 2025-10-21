import { Temporal } from '@js-temporal/polyfill';
import { cyrb128, useRNG } from '@/utils/prng';
import { getBrightness, plotGalaxy } from '../plotter';
import type { Bias, Issue, CommonStarProps } from '../types';

const MIN_SIZE = 12;
const MAX_SIZE = 16;
const COMMENTS_FOR_MIN = 2;

function getIssueSize(issue: Issue): number {
	const comments = issue.totalComments;
	if (comments <= COMMENTS_FOR_MIN) return MIN_SIZE;
	return Math.min(MAX_SIZE, comments - COMMENTS_FOR_MIN + MIN_SIZE);
}

export function issueToStar(issue: Issue, bias: Bias): CommonStarProps {
	const prngSource = useRNG(cyrb128(issue.url + 'issue')[0]);

	return {
		desc: issue.title,
		...plotGalaxy(bias, prngSource),
		size: getIssueSize(issue),
		points: 5,
		color: 'var(--color-red-200)',
		brightness: getBrightness(Temporal.Instant.from(issue.createdAt)),
		url: issue.url,
		RNG: prngSource,
	};
}
