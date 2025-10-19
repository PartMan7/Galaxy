import { sample } from '@/utils/prng';

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
export function plotGalaxy(RNG: () => number): { x: number; y: number } {
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
