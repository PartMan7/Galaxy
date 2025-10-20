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

	const hover = useHover(context, { move: false, delay: { close: 1000 } });
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
				className="fixed top-8 right-8 z-50 bg-zinc-800 text-amber-50 w-8 h-8 rounded-full flex items-center justify-center text-xl font-bold border-2 border-amber-50 hover:bg-zinc-700 transition-colors cursor-pointer shadow-lg"
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
									This visualization shows a user`s GitHub contributions (in this case,{' '}
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
										<strong>Pull Requests</strong> - All Pull Requests are rendered as bright blue, four-pointed stars. Brighter stars
										represent more recent Pull Requests.
									</li>
									<li>
										<strong>Issues</strong> - Issues are rendered as bright red, five-pointed stars. Brighter stars represent more
										recent issues, and issues with more comments are larger.
									</li>
								</ul>
								<p className="pt-2">
									Hover over any star to see details about that contribution. Click on a star to view it on GitHub.
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
