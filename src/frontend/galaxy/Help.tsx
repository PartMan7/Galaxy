import { memo, useRef, useState } from 'react';
import {
	useFloating,
	autoUpdate,
	offset,
	flip,
	shift,
	arrow,
	useHover,
	useFocus,
	useDismiss,
	useRole,
	useClick,
	useInteractions,
	FloatingPortal,
	FloatingFocusManager,
} from '@floating-ui/react';

function GitHubIcon() {
	return (
		<svg
			viewBox="0 0 98 96"
			xmlns="http://www.w3.org/2000/svg"
			className="float-right bg-white fill-black h-8 w-8 rounded-full border-2 border-white"
		>
			<path
				fillRule="evenodd"
				clipRule="evenodd"
				d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z"
			/>
		</svg>
	);
}

function Help() {
	const [isOpen, setIsOpen] = useState(false);
	const arrowRef = useRef(null);

	const { refs, floatingStyles, context, placement, middlewareData } = useFloating({
		open: isOpen,
		onOpenChange: setIsOpen,
		placement: 'bottom-start',
		whileElementsMounted: autoUpdate,
		middleware: [offset(16), flip({ fallbackAxisSideDirection: 'start' }), shift(), arrow({ element: arrowRef })],
	});

	const hover = useHover(context, { move: false, delay: { close: 300 } });
	const focus = useFocus(context);
	const dismiss = useDismiss(context, { referencePress: false });
	const role = useRole(context, { role: 'dialog' });
	const click = useClick(context);

	const { getReferenceProps, getFloatingProps } = useInteractions([hover, focus, dismiss, role, click]);

	const side = placement.split('-')[0] as 'top' | 'right' | 'bottom' | 'left';
	const staticSide = {
		top: 'bottom',
		right: 'left',
		bottom: 'top',
		left: 'right',
	}[side];

	// Determine which borders to show based on arrow position
	const arrowBorderClass = {
		top: 'border-t-4 border-l-4',
		bottom: 'border-b-4 border-r-4',
		left: 'border-l-4 border-b-4',
		right: 'border-r-4 border-t-4',
	}[staticSide];

	return (
		<>
			<button
				ref={refs.setReference}
				{...getReferenceProps()}
				className="absolute top-8 right-8 z-50 bg-zinc-800 text-amber-50 w-8 h-8 rounded-full flex items-center justify-center text-xl font-bold border-2 border-amber-50 hover:bg-zinc-700 transition-colors cursor-pointer shadow-lg"
				aria-label="Help"
			>
				?
			</button>
			{isOpen && (
				<FloatingPortal>
					<FloatingFocusManager context={context} modal={false}>
						<div
							ref={refs.setFloating}
							style={floatingStyles}
							{...getFloatingProps()}
							className="bg-zinc-800 max-w-md z-50 p-4 outline-4 outline-double border-amber-50 shadow-xl"
						>
							<h3 className="text-amber-50 text-lg font-bold mb-2">How to Use GitHub Galaxy</h3>
							<div className="text-amber-50 text-sm space-y-2">
								<p>
									This visualization shows a user's GitHub contributions (in this case,{' '}
									<a href={`https://github.com/${process.env.PUBLIC_GITHUB_USERNAME}`} target="_blank" rel="noopener noreferrer">
										{process.env.PUBLIC_GITHUB_USERNAME}'s
									</a>{' '}
									contributions) as a galaxy of stars. Each star represents a different type of contribution:
								</p>
								<ul className="list-disc pl-5 space-y-1">
									<li>
										<strong>Commits</strong> - Commits are rendered as bright yellow, four-pointed stars. Brighter stars represent more
										recent commits, and commits with more changes are larger.
									</li>
									<li>
										<strong>Pull Requests</strong> - All pull requests are rendered as bright blue, four-pointed stars. Brighter stars
										represent more recent pull requests.
									</li>
									<li>
										<strong>Issues</strong> - Issues are rendered as bright red, five-pointed stars. Brighter stars represent more
										recent issues, and issues with more comments are larger.
									</li>
								</ul>
								<p className="py-2">
									Hover over any star to see details about that contribution. Click on a star to view it on GitHub.
								</p>
								<hr />
								<p className="pt-2 text-xs">
									Check out the project on{' '}
									<a href="https://github.com/PartMan7/Galaxy" target="_blank" rel="noopener noreferrer">
										GitHub
									</a>
									! And if you'd like to see something similar for yourself, do reach out. I'll see if I can support other people's
									galaxies.
								</p>
							</div>
							<div
								ref={arrowRef}
								style={{
									left: middlewareData.arrow?.x != null ? `${middlewareData.arrow.x}px` : '',
									top: middlewareData.arrow?.y != null ? `${middlewareData.arrow.y}px` : '',
									[staticSide as string]: '-11px',
								}}
								className={`absolute w-4 h-4 rotate-45 bg-zinc-800 border-double border-amber-50 ${arrowBorderClass}`}
							/>
						</div>
					</FloatingFocusManager>
				</FloatingPortal>
			)}
		</>
	);
}

const MemoizedHelp = memo(Help);
export { MemoizedHelp as Help };
