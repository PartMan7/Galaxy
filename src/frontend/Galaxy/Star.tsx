import { memo } from 'react';
import { FourPoints, FivePoints } from './icons';
import type { StarProps } from './types';

const ICONS: Record<number, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
	4: FourPoints,
	5: FivePoints,
};

type OnHover = (star: { url: string | null; desc: string } | null) => void;

function Star({ desc, url, onHover, ...props }: StarProps & { onHover: OnHover }) {
	const Icon = ICONS[props.points] ?? FourPoints;
	return (
		<Icon
			tabIndex={0}
			onFocus={() => onHover?.({ url, desc })}
			onBlur={() => onHover?.(null)}
			onMouseEnter={() => onHover?.({ url, desc })}
			onMouseLeave={() => onHover?.(null)}
			onClick={() => (url ? window.open(url, '_blank') : undefined)}
			className={`absolute cursor-pointer star ${props.drift ? 'drift' : ''}`}
			style={{
				left: props.coords.x,
				top: props.coords.y,
				width: props.size,
				height: props.size,
				color: props.color,
				opacity: Math.round(props.brightness * 100),
				// @ts-ignore -- CSS variables -- TODO add types for variables somewhere
				'--points': props.points,
				'--rotation': `${props.rotation}deg`,
				'--duration': `${props.duration / 2}ms`, // halved because the transition is on 'alternate'
				'--delay': `-${props.animationOffset}ms`, // we need to do something about all stars starting 'bright'; maybe something to animate them in?
			}}
		/>
	);
}

const MemoizedStar = memo(Star);

export { MemoizedStar as Star };
