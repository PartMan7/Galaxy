import { memo, useEffect, useState } from 'react';
import './header.css';

export const HEADER_DURATION = 1000;
export const HEADER_FADE_DURATION = 5000;

const KEY = 'headerShown';

function Header() {
	// This only ever renders once
	const [shown, setShown] = useState(() => {
		const shown = localStorage.getItem(KEY);
		if (shown) {
			return true;
		}
		return false;
	});
	useEffect(() => {
		if (!shown) {
			const timeout = setTimeout(
				() => {
					setShown(true);
					localStorage.setItem(KEY, 'true');
				},
				HEADER_DURATION + HEADER_FADE_DURATION + 50
			);
			return () => clearTimeout(timeout);
		}
	}, [shown]);

	// For now we'll always show the header, I guess
	return true ? (
		<header
			id="header"
			className="z-1 absolute top-0 left-0 w-full h-full flex items-center justify-center text-2xl sm:text-4xl md:text-6xl lg:text-9xl xl:text-12xl pointer-events-none font-bold"
			// @ts-ignore -- CSS variables -- TODO add types for variables somewhere
			style={{ '--duration': `${HEADER_FADE_DURATION}ms`, '--delay': `${HEADER_DURATION}ms` }}
		>
			<h1>GitHub Galaxy</h1>
		</header>
	) : null;
}

const MemoizedHeader = memo(Header);
export { MemoizedHeader as Header };
