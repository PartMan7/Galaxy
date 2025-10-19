import path from 'path';
import { Temporal } from '@js-temporal/polyfill';
import { fetchGitHubStats } from '@/backend/fetchGitHubStats';
import type { GitHubStats } from '@/backend/types';

const CACHE_FILE = path.join(process.cwd(), 'src', 'backend', 'github-stats.json');

let cached: GitHubStats | null = null;
try {
	cached = JSON.parse(await Bun.file(CACHE_FILE).text());
} catch {}

let lastUpdated: Temporal.Instant | null = null;
const cacheDuration = Temporal.Duration.from({ hours: 1 });

async function updateCached(newCached: GitHubStats): Promise<GitHubStats> {
	cached = newCached;
	await Bun.write(CACHE_FILE, JSON.stringify(newCached, null, 2));

	return newCached;
}

export default {
	async github(): Promise<GitHubStats> {
		if (cached && lastUpdated) {
			const timeSinceLastUpdate = Temporal.Now.instant().since(lastUpdated);
			if (Temporal.Duration.compare(timeSinceLastUpdate, cacheDuration) < 0) {
				return cached;
			}
		}

		lastUpdated = Temporal.Now.instant();
		const fetchPromise = fetchGitHubStats().then(updateCached);
		if (cached) return cached;
		return fetchPromise;
	},
};
