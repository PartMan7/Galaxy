import './galaxy.css';

import { useState, useMemo, useEffect, useLayoutEffect } from 'react';
import type { GitHubStats } from '@/backend/fetchGitHubStats';
import { commitToStar, GALAXY_SIZE } from './commitToStar';
import { Star } from './Star';

const MARGIN = 50;

export function Galaxy() {
	const [data, setData] = useState<GitHubStats | null>(null);
	useEffect(() => {
		fetch('/api/github')
			.then(res => res.json())
			.then(setData);
	}, []);

	const [windowWidth, setWindowWidth] = useState(window.innerWidth / 2);
	const [windowHeight, setWindowHeight] = useState(window.innerHeight / 2);

	useLayoutEffect(() => {
		function updateSize() {
			setWindowWidth(window.innerWidth);
			setWindowHeight(window.innerHeight);
		}
		window.addEventListener('resize', updateSize);
		updateSize();
		return () => window.removeEventListener('resize', updateSize);
	}, []);

	const stars = useMemo(() => {
		return (data?.repositoryContributions.flatMap(repo => repo.commits.map(commit => commitToStar(commit))) ?? []).map(props => ({
			...props,
			coords: {
				x: (props.coords.x * (windowWidth - 2 * MARGIN)) / GALAXY_SIZE + windowWidth / 2,
				y: (props.coords.y * (windowHeight - 2 * MARGIN)) / GALAXY_SIZE + windowHeight / 2,
			},
		}));
	}, [data, windowWidth, windowHeight]);

	const [hoveredStar, setHoveredStar] = useState<{ url: string; desc: string } | null>(null);

	return (
		<div id="galaxy" className="h-full w-full">
			<div id="hovered-star" className="absolute top-0 left-0 bg-black/50 z-10">
				{hoveredStar?.desc}
			</div>
			{stars.map(star => (
				<Star key={star.url} {...star} onHover={setHoveredStar} />
			))}
		</div>
	);
}
