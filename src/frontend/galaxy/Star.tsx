import { memo, useMemo, useState } from 'react';
import { sample } from '@/utils/prng';
import { FourPoints, FivePoints } from './icons';
import type { CommonStarProps } from './types';
import { HEADER_DURATION, HEADER_FADE_DURATION } from '../galaxy/Header';
import { ARM_RADIUS, CENTER_RADIUS, GALAXY_SIZE } from './plotter';

const ICONS: Record<number, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
	4: FourPoints,
	5: FivePoints,
};

const MARGIN = 50;
const DEFAULT_REVOLUTION = 600;

type OnHover = (star: { url: string | null; desc: string } | null) => void;

function Star({
	desc,
	url,
	onHover,
	RNG,
	coords,
	proximity,
	size,
	color,
	brightness,
	points,
	center,
	customRevolution,
}: CommonStarProps & { center: { x: number; y: number }; onHover: OnHover }) {
	const Icon = ICONS[points] ?? FourPoints;

	const [duration] = useState(() => sample([1000, 5000], RNG));
	const [animationOffset] = useState(() => {
		// Override some stars to animate from outside-in
		const timeOffset = (ARM_RADIUS + CENTER_RADIUS) / GALAXY_SIZE;
		if (typeof proximity === 'number') {
			if (proximity <= CENTER_RADIUS / GALAXY_SIZE) {
				return HEADER_DURATION + HEADER_FADE_DURATION * (1 - (CENTER_RADIUS / GALAXY_SIZE) * RNG() - timeOffset);
			}
			if (sample(2, RNG) === 0) {
				const relativeTheta = proximity;
				return HEADER_DURATION + HEADER_FADE_DURATION * (1 - relativeTheta - timeOffset);
			}
		}
		return HEADER_DURATION + HEADER_FADE_DURATION * RNG();
	});
	const [rotation] = useState(() => sample(360, RNG));
	const [drift] = useState(() => sample(5, RNG) === 0);

	const revolution = customRevolution ?? DEFAULT_REVOLUTION;

	return (
		<div
			tabIndex={0}
			onFocus={() => onHover?.({ url, desc })}
			onBlur={() => onHover?.(null)}
			onMouseEnter={() => onHover?.({ url, desc })}
			onMouseLeave={() => onHover?.(null)}
			onClick={() => (url ? window.open(url, '_blank') : undefined)}
			className={`absolute cursor-pointer star z-0 ${drift ? 'drift' : ''}`}
			style={{
				width: size,
				height: size,
				color: color,
				// @ts-ignore -- CSS variables -- TODO add types for variables somewhere
				'--left': `${coords.x}px`,
				'--top': `${coords.y}px`,
				'--center-x': `${center.x}px`,
				'--center-y': `${center.y}px`,
				'--scale-x': (center.x - MARGIN) / GALAXY_SIZE,
				'--scale-y': (center.y - MARGIN) / GALAXY_SIZE,
				'--opacity': `${Math.round(brightness * 100)}%`,
				'--points': points,
				'--rotation': `${rotation}deg`,
				'--revolution': `${revolution}s`,
				'--duration': `${duration}ms`, // halved because the transition is on 'alternate'
				'--delay': `${animationOffset}ms`, // we need to do something about all stars starting 'bright'; maybe something to animate them in?
			}}
		>
			<Icon className="inner-star" />
		</div>
	);
}

const MemoizedStar = memo(Star);

export { MemoizedStar as Star };
