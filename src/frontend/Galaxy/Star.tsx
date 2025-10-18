import { memo } from 'react';
import type { StarProps } from './types';

function Star({
	coords,
	size,
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
	return (
		<div
			tabIndex={0}
			onFocus={() => onHover?.({ url, desc })}
			onBlur={() => onHover?.(null)}
			onMouseEnter={() => onHover?.({ url, desc })}
			onMouseLeave={() => onHover?.(null)}
			onClick={() => window.open(url, '_blank')}
			className="absolute rounded-full cursor-pointer star"
			style={{
				left: coords.x,
				top: coords.y,
				width: size,
				height: size,
				backgroundColor: color,
				opacity: brightness,
				// @ts-ignore -- CSS variables -- TODO add types for variables somewhere
				'--duration': `${duration}ms`,
				'--delay': `${animationOffset}ms`,
			}}
		/>
	);
}

const MemoizedStar = memo(Star);

export { MemoizedStar as Star };
