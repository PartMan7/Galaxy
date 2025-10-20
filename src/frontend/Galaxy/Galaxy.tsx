import './galaxy.css';

import { useState, useMemo, useEffect, useLayoutEffect } from 'react';
import type { GitHubStats } from '@/backend/types';

import { Star } from './Star';
import { Header } from './Header';
import { GALAXY_SIZE } from './plotter';
import { commitToStar } from './generators/commitToStar';
import { pullRequestToStar } from './generators/pullRequestToStar';
import { issueToStar } from './generators/issueToStar';

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
		const normalize = (coords: { x: number; y: number; proximity: number | null }) => ({
			x: (coords.x * (windowWidth - 2 * MARGIN)) / GALAXY_SIZE + windowWidth / 2,
			y: (coords.y * (windowHeight - 2 * MARGIN)) / GALAXY_SIZE + windowHeight / 2,
			proximity: coords.proximity,
		});

		const commitStars =
			data?.repositoryContributions
				.flatMap(repo => repo.commits.map(commitToStar))
				.map(props => ({ ...props, coords: normalize(props.coords) })) ?? [];
		const pullRequestStars =
			data?.pullRequests.map(pullRequestToStar).map(props => ({ ...props, coords: normalize(props.coords) })) ?? [];
		const issueStars = data?.issues.map(issueToStar).map(props => ({ ...props, coords: normalize(props.coords) })) ?? [];

		return [...commitStars, ...pullRequestStars, ...issueStars];
	}, [data, windowWidth, windowHeight]);

	const [hoveredStar, setHoveredStar] = useState<{ url: string | null; desc: string } | null>(null);

	return (
		<>
			<Header />
			<div id="galaxy" className="left-0 top-0 h-full w-full isolate">
				{hoveredStar ? (
					<div
						id="hovered-star"
						className="absolute top-0 left-0 bg-zinc-800 max-w-sm z-10 p-4  border-r-4 border-b-4 border-double border-amber-50 pointer-events-none"
					>
						{hoveredStar?.desc}
						<br />
						{hoveredStar?.url ? 'Click to view on GitHub' : null}
					</div>
				) : null}
				{stars.map(star => (
					<Star key={star.url} {...star} onHover={setHoveredStar} />
				))}
			</div>
		</>
	);
}
