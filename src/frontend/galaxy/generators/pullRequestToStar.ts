import { Temporal } from '@js-temporal/polyfill';
import { cyrb128, useRNG } from '@/utils/prng';
import { getBrightness, plotGalaxy } from '../plotter';
import type { Bias, PullRequest, StarProps } from '../types';

const MIN_SIZE = 12;
const MAX_SIZE = 16;
const COMMENTS_FOR_MIN = 2;

function getPRSize(pullRequest: PullRequest): number {
	const comments = 'totalComments' in pullRequest ? pullRequest.totalComments : 2;
	if (comments <= COMMENTS_FOR_MIN) return MIN_SIZE;
	return Math.min(MAX_SIZE, comments - COMMENTS_FOR_MIN + MIN_SIZE);
}

export function pullRequestToStar(pullRequest: PullRequest, bias: Bias): StarProps {
	const prngSource = useRNG(cyrb128('url' in pullRequest ? pullRequest.url : pullRequest.uid + 'pullRequest')[0]);

	return {
		desc: 'title' in pullRequest ? pullRequest.title : '(Private Pull Request)',
		...plotGalaxy(bias, prngSource),
		size: getPRSize(pullRequest),
		points: 4,
		color: 'blue',
		brightness: 'createdAt' in pullRequest ? getBrightness(Temporal.Instant.from(pullRequest.createdAt)) : 0.5,
		url: 'url' in pullRequest ? pullRequest.url : null,
		uid: 'uid' in pullRequest ? pullRequest.uid + '-pr' : undefined,
		RNG: prngSource,
	};
}
