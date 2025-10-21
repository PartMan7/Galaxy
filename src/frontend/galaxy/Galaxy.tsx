import './galaxy.css';

import { useState, useMemo, useEffect, useLayoutEffect } from 'react';
import type { GitHubStats } from '@/backend/types';

import { Star } from './Star';
import { Header } from './Header';
import { Help } from './Help';
import { commitToStar } from './generators/commitToStar';
import { pullRequestToStar } from './generators/pullRequestToStar';
import { issueToStar } from './generators/issueToStar';
import { getBias } from './plotter';

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
			setWindowWidth(document.documentElement.clientWidth);
			setWindowHeight(document.documentElement.clientHeight);
		}
		window.addEventListener('resize', updateSize);
		updateSize();
		return () => window.removeEventListener('resize', updateSize);
	}, []);

	const stars = useMemo(() => {
		const bias = getBias((data?.totalCommits ?? 0) + (data?.totalPullRequests ?? 0) + (data?.totalIssues ?? 0));

		const commitStars = data?.repositoryContributions.flatMap(repo => repo.commits.map(commit => commitToStar(commit, bias))) ?? [];
		const pullRequestStars = data?.pullRequests.map(pullRequest => pullRequestToStar(pullRequest, bias)) ?? [];
		const issueStars = data?.issues.map(issue => issueToStar(issue, bias)) ?? [];

		return [...commitStars, ...pullRequestStars, ...issueStars];
	}, [data, windowWidth, windowHeight]);

	const [hoveredStar, setHoveredStar] = useState<{ url: string | null; desc: string } | null>(null);

	return (
		<>
			<Header />
			<Help />
			<div id="galaxy" className="inset-0 h-full w-full isolate grid place-items-center">
				{hoveredStar ? (
					<div
						id="hovered-star"
						className="absolute top-0 left-0 bg-zinc-800 max-w-sm z-10 p-4 border-r-4 border-b-4 border-double border-amber-50 pointer-events-none"
					>
						{hoveredStar?.desc}
						<br />
						{hoveredStar?.url ? 'Click to view on GitHub' : null}
					</div>
				) : null}
				{stars.map(star => (
					<Star key={star.url} {...star} center={{ x: windowWidth, y: windowHeight }} onHover={setHoveredStar} />
				))}
			</div>
		</>
	);
}
