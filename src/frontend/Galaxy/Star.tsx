import { memo } from 'react';
import type { StarProps } from './types';
import { FourPoints, FivePoints } from './icons';

const ICONS: Record<number, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
	4: FourPoints,
	5: FivePoints,
};

function Star({
	coords,
	size,
	points,
	color,
	brightness,
	duration,
	animationOffset,
	desc,
	url,
	onHover,
}: StarProps & {
	onHover: (star: { url: string; desc: string } | null) => void;
}) {
	const Icon = ICONS[points] ?? FourPoints;
	return (
		<Icon
			tabIndex={0}
			onFocus={() => onHover?.({ url, desc })}
			onBlur={() => onHover?.(null)}
			onMouseEnter={() => onHover?.({ url, desc })}
			onMouseLeave={() => onHover?.(null)}
			onClick={() => window.open(url, '_blank')}
			className="absolute cursor-pointer star"
			style={{
				left: coords.x,
				top: coords.y,
				width: size,
				height: size,
				color,
				opacity: Math.round(brightness * 100),
				// @ts-ignore -- CSS variables -- TODO add types for variables somewhere
				'--duration': `${duration / 2}ms`, // halved because the transition is on 'alternate'
				'--delay': `-${animationOffset}ms`, // we need to do something about all stars starting 'bright'; maybe something to animate them in?
			}}
		/>
	);
}

const MemoizedStar = memo(Star);

export { MemoizedStar as Star };
