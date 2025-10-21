import { memo, type CSSProperties } from 'react';
import { sample } from '@/utils/prng';
import { FourPoints, FivePoints } from './icons';
import { HEADER_DURATION, HEADER_FADE_DURATION } from '../galaxy/Header';
import { ARM_RADIUS, CENTER_RADIUS, GALAXY_SIZE } from './plotter';
import type { StarProps } from './types';

const ICONS: Record<number, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
	4: FourPoints,
	5: FivePoints,
};

const DEFAULT_REVOLUTION = 600;

type GalaxyStarProps = { onHover: (star: { url: string | null; desc: string } | null) => void };

type AllStarProps = Omit<StarProps, 'RNG' | 'proximity' | 'coords' | 'size' | 'color' | 'brightness' | 'customRevolution'> &
	GalaxyStarProps & {
		className: string;
		style: CSSProperties;
	};

const TIME_OFFSET = (ARM_RADIUS + CENTER_RADIUS) / GALAXY_SIZE;
const COLORS = {
	red: { fill: 'var(--color-red-200)', stroke: 'var(--color-red-300)' },
	yellow: { fill: 'var(--color-amber-50)', stroke: 'var(--color-amber-200)' },
	blue: { fill: 'var(--color-blue-200)', stroke: 'var(--color-blue-300)' },
};
export function getAllStarProps({
	RNG,
	proximity,
	coords,
	size,
	color,
	brightness,
	customRevolution,
	...starProps
}: StarProps): AllStarProps {
	let animationOffset: number;

	if (typeof proximity === 'number') {
		if (proximity <= CENTER_RADIUS / GALAXY_SIZE) {
			animationOffset = HEADER_DURATION + HEADER_FADE_DURATION * (1 - (CENTER_RADIUS / GALAXY_SIZE) * RNG() - TIME_OFFSET);
		} else if (sample(2, RNG) === 0) {
			const relativeTheta = proximity;
			animationOffset = HEADER_DURATION + HEADER_FADE_DURATION * (1 - relativeTheta - TIME_OFFSET);
		} else {
			animationOffset = HEADER_DURATION + HEADER_FADE_DURATION * RNG();
		}
	} else {
		animationOffset = HEADER_DURATION + HEADER_FADE_DURATION * RNG();
	}

	const rotation = sample(360, RNG);
	const duration = sample([1000, 5000], RNG);
	const revolution = customRevolution ?? DEFAULT_REVOLUTION;

	return {
		...starProps,
		className: `${sample(5, RNG) === 0 ? 'drift' : ''}`,
		style: {
			width: size,
			height: size,
			color: COLORS[color].stroke,
			// @ts-ignore -- CSS variables
			'--fill': COLORS[color].fill,
			'--left': `${coords.x}px`,
			'--top': `${coords.y}px`,
			'--opacity': `${Math.round(brightness * 100)}%`,
			'--points': starProps.points,
			'--rotation': `${rotation}deg`,
			'--revolution': `${revolution}s`,
			'--duration': `${duration}ms`,
			'--delay': `${animationOffset}ms`,
		},
	};
}

function Star({ desc, url, onHover, points, className, style }: AllStarProps) {
	const Icon = ICONS[points] ?? FourPoints;

	const handleFocus = () => onHover?.({ url, desc });
	const handleBlur = () => onHover?.(null);
	const handleMouseEnter = () => onHover?.({ url, desc });
	const handleMouseLeave = () => onHover?.(null);
	const handleClick = () => (url ? window.open(url, '_blank') : undefined);

	return (
		<div
			tabIndex={0}
			onFocus={handleFocus}
			onBlur={handleBlur}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
			onClick={handleClick}
			className={`absolute cursor-pointer star z-0 ${className}`}
			style={style}
		>
			<Icon className="inner-star" />
		</div>
	);
}

const MemoizedStar = memo(Star);

export { MemoizedStar as Star };
