import { sample } from '@/utils/prng';
import { Temporal } from '@js-temporal/polyfill';
import type { Bias } from './types';

export enum GalaxyPart {
	Center = 'center',
	Arms = 'arms',
	Scattered = 'scattered',
}

export const CENTER_RADIUS = 60;
const ARM_INIT_THETA = Math.PI / 4;
const ARM_TURNS = Math.PI * 2;
export const ARM_RADIUS = 150;
const ARM_BASE_THICKNESS = 50;
const ARM_TIP_THICKNESS = 5;
const SCATTERED_DISTANCE = 250;
export const GALAXY_SIZE = 2 * SCATTERED_DISTANCE;

/**
 * The plotter will favour more scattered layouts for lower commit counts.
 */
export function getBias(starCount: number): Bias {
	// Anchor points: 1.5 min, 3000 / stars for range, 10 max
	const scatteredWeight = Math.max(1.5, Math.min(10, 3000 / starCount));
	// Center scales smoothly from 1 to 4 until 3000 stars
	const centerWeight = Math.max(1, Math.min(3, 1 + (starCount * (4 - 1)) / 3000));

	return RNG =>
		sample({ [GalaxyPart.Center]: centerWeight, [GalaxyPart.Arms]: 3, [GalaxyPart.Scattered]: scatteredWeight }, RNG) as GalaxyPart;
}

/**
 * Returns coordinates relative to the center of the galaxy.
 */
export function plotGalaxy(
	bias: Bias,
	RNG: () => number
): {
	coords: { x: number; y: number };
	proximity: number | null;
	customRevolution: number | null;
} {
	const part = bias(RNG);
	switch (part) {
		case GalaxyPart.Center: {
			const radius = CENTER_RADIUS * RNG();
			const theta = 2 * Math.PI * RNG();
			return {
				coords: { x: radius * Math.cos(theta), y: radius * Math.sin(theta) },
				proximity: radius / GALAXY_SIZE,
				customRevolution: sample([120, 720], RNG),
			};
		}
		case GalaxyPart.Arms: {
			const useOtherArm = sample(2, RNG);
			const radius = CENTER_RADIUS + ARM_RADIUS * RNG();
			const theta = ARM_INIT_THETA + ((radius - CENTER_RADIUS) / ARM_RADIUS) * ARM_TURNS + (useOtherArm ? Math.PI : 0);
			const armThickness = ARM_TIP_THICKNESS + ((radius - CENTER_RADIUS) / ARM_RADIUS) * (ARM_BASE_THICKNESS - ARM_TIP_THICKNESS);
			const lateralOffset = armThickness * RNG() - armThickness / 2;
			const lateralOffsetX = lateralOffset * Math.cos(theta);
			const lateralOffsetY = lateralOffset * Math.sin(theta);
			return {
				coords: { x: radius * Math.cos(theta) + lateralOffsetX, y: radius * Math.sin(theta) + lateralOffsetY },
				proximity: radius / GALAXY_SIZE,
				customRevolution: null,
			};
		}
		case GalaxyPart.Scattered: {
			const radius = SCATTERED_DISTANCE * Math.sqrt(RNG());
			const theta = 2 * Math.PI * RNG();
			return {
				coords: { x: radius * Math.cos(theta), y: radius * Math.sin(theta) },
				proximity: null,
				customRevolution: sample([400, 1000], RNG),
			};
		}
	}
}

const ONE_WEEK = Temporal.Duration.from({ hours: 7 * 24 });
const ROUGH_DAYS_IN_YEAR = 400; // increased so that even dim stars don't have 0 brightness

export function getBrightness(createdAt: Temporal.Instant): number {
	const Now = Temporal.Now.instant();
	const timeElapsed = Now.since(Temporal.Instant.from(createdAt));
	if (Temporal.Duration.compare(timeElapsed, ONE_WEEK) < 0) return 1.5;
	return 1 - timeElapsed.total({ unit: 'days' }) / ROUGH_DAYS_IN_YEAR;
}
