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

type OnHover = (star: { url: string | null; desc: string } | null) => void;

function Star({ desc, url, onHover, RNG, coords, size, color, brightness, points }: CommonStarProps & { onHover: OnHover }) {
	const Icon = ICONS[points] ?? FourPoints;

	const [duration] = useState(() => sample([1000, 5000], RNG));
	const [animationOffset] = useState(() => {
		// Override some stars to animate from outside-in
		const timeOffset = (ARM_RADIUS + CENTER_RADIUS) / GALAXY_SIZE;
		if (typeof coords.proximity === 'number') {
			if (coords.proximity <= CENTER_RADIUS / GALAXY_SIZE) {
				return HEADER_DURATION + HEADER_FADE_DURATION * (1 - (CENTER_RADIUS / GALAXY_SIZE) * RNG() - timeOffset);
			}
			if (sample(2, RNG) === 0) {
				const relativeTheta = coords.proximity;
				return HEADER_DURATION + HEADER_FADE_DURATION * (1 - relativeTheta - timeOffset);
			}
		}
		return HEADER_DURATION + HEADER_FADE_DURATION * RNG();
	});
	const [rotation] = useState(() => sample(360, RNG));
	const [drift] = useState(() => sample(5, RNG) === 0);

	return (
		<Icon
			tabIndex={0}
			onFocus={() => onHover?.({ url, desc })}
			onBlur={() => onHover?.(null)}
			onMouseEnter={() => onHover?.({ url, desc })}
			onMouseLeave={() => onHover?.(null)}
			onClick={() => (url ? window.open(url, '_blank') : undefined)}
			className={`absolute cursor-pointer star z-0 ${drift ? 'drift' : ''}`}
			style={{
				left: coords.x,
				top: coords.y,
				width: size,
				height: size,
				color: color,
				// @ts-ignore -- CSS variables -- TODO add types for variables somewhere
				'--opacity': `${Math.round(brightness * 100)}%`,
				'--points': points,
				'--rotation': `${rotation}deg`,
				'--duration': `${duration}ms`, // halved because the transition is on 'alternate'
				'--delay': `${animationOffset}ms`, // we need to do something about all stars starting 'bright'; maybe something to animate them in?
			}}
		/>
	);
}

const MemoizedStar = memo(Star);

export { MemoizedStar as Star };
