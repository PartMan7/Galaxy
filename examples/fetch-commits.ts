#!/usr/bin/env bun
/**
 * Example script demonstrating how to fetch commits from a repository
 * using the fetchRepositoryCommits function.
 *
 * Usage:
 *   bun examples/fetch-commits.ts
 */

import { fetchRepositoryCommits } from '../src/backend/fetchGitHubStats';
import { Temporal } from '@js-temporal/polyfill';

async function main() {
	try {
		// Example 1: Fetch all commits from the last 30 days
		console.log('Example 1: Fetching commits from the last 30 days...\n');

		const thirtyDaysAgo = Temporal.Now.instant().subtract(Temporal.Duration.from({ days: 30 }));

		const recentCommits = await fetchRepositoryCommits({
			owner: 'facebook',
			repo: 'react',
			since: thirtyDaysAgo,
			maxCommits: 10,
		});

		console.log(`Found ${recentCommits.length} commits:`);
		recentCommits.forEach(commit => {
			console.log(`  - ${commit.revision.slice(0, 7)}: ${commit.message.split('\n')[0]}`);
			console.log(`    by ${commit.author.name} on ${commit.author.date}`);
		});

		// Example 2: Fetch commits by a specific author with line changes
		console.log('\n\nExample 2: Fetching commits by a specific author with line changes...\n');

		const authorCommits = await fetchRepositoryCommits({
			owner: 'facebook',
			repo: 'react',
			author: 'Dan Abramov', // Filter by author name
			since: Temporal.Instant.from('2024-01-01T00:00:00Z'),
			until: Temporal.Instant.from('2024-12-31T23:59:59Z'),
			includeLinesChanged: true,
			maxCommits: 5,
		});

		console.log(`Found ${authorCommits.length} commits by author:`);
		authorCommits.forEach(commit => {
			console.log(`  - ${commit.revision.slice(0, 7)}: ${commit.message.split('\n')[0]}`);
			console.log(`    by ${commit.author.name} <${commit.author.email}>`);
			if (commit.linesChanged) {
				console.log(
					`    +${commit.linesChanged.additions} -${commit.linesChanged.deletions} (${commit.linesChanged.total} total)`
				);
			}
		});

		// Example 3: Fetch commits within a specific time range
		console.log('\n\nExample 3: Fetching commits within a specific time range...\n');

		const startDate = Temporal.Instant.from('2024-10-01T00:00:00Z');
		const endDate = Temporal.Instant.from('2024-10-15T23:59:59Z');

		const timeRangeCommits = await fetchRepositoryCommits({
			owner: 'microsoft',
			repo: 'TypeScript',
			since: startDate,
			until: endDate,
			maxCommits: 10,
		});

		console.log(`Found ${timeRangeCommits.length} commits in time range:`);
		timeRangeCommits.forEach(commit => {
			console.log(`  - ${commit.revision.slice(0, 7)}: ${commit.message.split('\n')[0]}`);
		});
	} catch (error) {
		console.error('Error:', error);
		process.exit(1);
	}
}

main();

