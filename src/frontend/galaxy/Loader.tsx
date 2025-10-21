import { memo } from 'react';
import './loader.css';
import { HEADER_DURATION } from './Header';

// animates in after the header fades out
function Loader({ hide }: { hide: boolean }) {
	return (
		<div
			id="loader"
			className={`absolute top-0 left-0 w-full h-full flex items-center justify-center ${hide ? 'opacity-0' : ''}`}
			// @ts-ignore -- CSS variables -- TODO add types for variables somewhere
			style={{ '--delay': `${HEADER_DURATION}ms` }}
		>
			<div className="w-10 h-10 border-4 border-amber-50 border-t-transparent rounded-full animate-spin"></div>
		</div>
	);
}

const MemoizedLoader = memo(Loader);
export { MemoizedLoader as Loader };
