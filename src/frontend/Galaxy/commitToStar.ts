import { Temporal } from '@js-temporal/polyfill';
import { cyrb128, sample, useRNG, randomString } from '@/utils/prng';
import type { Commit, StarProps } from './types';

enum GalaxyPart {
	Center = 'center',
	Arms = 'arms',
	Scattered = 'scattered',
}

const CENTER_RADIUS = 50;
const ARM_INIT_THETA = Math.PI / 4;
const ARM_TURNS = Math.PI * 2; // 1 full turn
const ARM_RADIUS = 100;
const ARM_BASE_THICKNESS = 40;
const ARM_TIP_THICKNESS = 10;
const SCATTERED_DISTANCE = 200;
export const GALAXY_SIZE = 2 * SCATTERED_DISTANCE;
/**
 * Returns coordinates relative to the center of the galaxy.
 * @param RNG
 * @returns
 */
function baseHashToCoords(RNG: () => number): { x: number; y: number } {
	const part = sample({ [GalaxyPart.Center]: 2, [GalaxyPart.Arms]: 3, [GalaxyPart.Scattered]: 2 }, RNG) as GalaxyPart;
	switch (part) {
		case GalaxyPart.Center: {
			const radius = CENTER_RADIUS * RNG();
			const theta = RNG() * 2 * Math.PI;
			return { x: radius * Math.cos(theta), y: radius * Math.sin(theta) };
		}
		case GalaxyPart.Arms: {
			const useOtherArm = sample(2, RNG);
			const radius = CENTER_RADIUS + ARM_RADIUS * RNG();
			const theta = ARM_INIT_THETA + ((radius - CENTER_RADIUS) / ARM_RADIUS) * ARM_TURNS + (useOtherArm ? Math.PI : 0);
			const armThickness = ARM_TIP_THICKNESS + ((radius - CENTER_RADIUS) / ARM_RADIUS) * (ARM_BASE_THICKNESS - ARM_TIP_THICKNESS);
			const lateralOffset = armThickness * RNG() - armThickness / 2;
			const lateralOffsetX = lateralOffset * Math.sin(theta);
			const lateralOffsetY = lateralOffset * Math.cos(theta);
			return {
				x: radius * Math.cos(theta) + lateralOffsetX,
				y: radius * Math.sin(theta) + lateralOffsetY,
			};
		}
		case GalaxyPart.Scattered: {
			return {
				x: 2 * SCATTERED_DISTANCE * RNG() - SCATTERED_DISTANCE,
				y: 2 * SCATTERED_DISTANCE * RNG() - SCATTERED_DISTANCE,
			};
		}
	}
}

function hashToCoords(hash: string, modifier: string): { x: number; y: number } {
	const prngSource = useRNG(cyrb128(hash + modifier)[0]);
	return baseHashToCoords(prngSource);
}

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

const OneWeek = Temporal.Duration.from({ hours: 7 * 24 });
const ROUGH_DAYS_IN_YEAR = 400; // increased so that even dim stars don't have 0 brightness

function getCommitBrightness(commit: Commit): number {
	const Now = Temporal.Now.instant();
	const timeElapsed = Now.since(Temporal.Instant.from(commit.committedDate));
	if (Temporal.Duration.compare(timeElapsed, OneWeek) < 0) return 1.5;
	return 1 - timeElapsed.total({ unit: 'days' }) / ROUGH_DAYS_IN_YEAR;
}

function getCommitDuration(commit: Commit): number {
	const RNG = useRNG(cyrb128(commit.revision)[0]);
	return sample([2000, 10000], RNG);
}

function getCommitAnimationOffset(commit: Commit): number {
	const RNG = useRNG(cyrb128(commit.revision)[0]);
	return sample([0, 1000], RNG);
}

export const commitToStar = (commit: Commit): StarProps => {
	return {
		desc: commit.message,
		coords: hashToCoords(commit.revision, 'commit'),
		size: getCommitSize(commit),
		points: 4,
		color: 'var(--color-amber-50)',
		rotation: 0,
		brightness: getCommitBrightness(commit),
		url: commit.url,
		duration: getCommitDuration(commit),
		animationOffset: getCommitAnimationOffset(commit),
	};
};
