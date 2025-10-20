import { sample } from '@/utils/prng';
import { Temporal } from '@js-temporal/polyfill';

enum GalaxyPart {
	Center = 'center',
	Arms = 'arms',
	Scattered = 'scattered',
}

export const CENTER_RADIUS = 60;
const ARM_INIT_THETA = Math.PI / 4;
const ARM_TURNS = Math.PI * 2; // 1 full turn
export const ARM_RADIUS = 150;
const ARM_BASE_THICKNESS = 50;
const ARM_TIP_THICKNESS = 5;
const SCATTERED_DISTANCE = 250;
export const GALAXY_SIZE = 2 * SCATTERED_DISTANCE;

/**
 * Returns coordinates relative to the center of the galaxy.
 * @param RNG
 * @returns
 */
export function plotGalaxy(RNG: () => number): { x: number; y: number; proximity: number | null } {
	const part = sample({ [GalaxyPart.Center]: 3, [GalaxyPart.Arms]: 3, [GalaxyPart.Scattered]: 2 }, RNG) as GalaxyPart;
	switch (part) {
		case GalaxyPart.Center: {
			const radius = CENTER_RADIUS * RNG();
			const theta = 2 * Math.PI * RNG();
			return { x: radius * Math.cos(theta), y: radius * Math.sin(theta), proximity: radius / GALAXY_SIZE };
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
				x: radius * Math.cos(theta) + lateralOffsetX,
				y: radius * Math.sin(theta) + lateralOffsetY,
				proximity: radius / GALAXY_SIZE,
			};
		}
		case GalaxyPart.Scattered: {
			const xRNG = RNG();
			const yRNG = RNG();
			return {
				x: SCATTERED_DISTANCE * (2 * xRNG - 1),
				y: SCATTERED_DISTANCE * (2 * yRNG - 1),
				proximity: null,
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
