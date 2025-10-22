import path from 'path';
import { Temporal } from '@js-temporal/polyfill';
import { fetchGitHubStats } from '@/backend/fetchGitHubStats';
import type { GitHubStats } from '@/backend/types';

const CACHE_FILE = path.join(process.cwd(), 'src', 'backend', 'cache.json');

type Cache = Record<string, { username: string; stats: GitHubStats | null; lastUpdated: number }>;

let cached: Cache = {};
try {
	cached = JSON.parse(await Bun.file(CACHE_FILE).text());
} catch {}

const cacheDuration = Temporal.Duration.from({ hours: 1 });

async function updateCached(username: string, newCached: GitHubStats): Promise<GitHubStats> {
	cached[username] = { username, stats: newCached, lastUpdated: Temporal.Now.instant().epochMilliseconds };
	await Bun.write(CACHE_FILE, JSON.stringify(cached, null, 2));

	return newCached;
}

const VALID_GITHUB_USERNAMES = process.env.VALID_GITHUB_USERNAMES?.split(/\s*,\s*/) ?? [];

export default {
	async github(username: string): Promise<GitHubStats> {
		if (!VALID_GITHUB_USERNAMES.includes(username) && !VALID_GITHUB_USERNAMES.includes('*')) {
			throw new Error(
				`The username '${username}' has not been whitelisted. Reach out to PartMan7 on the GitHub repository if you'd like to see your galaxy added.`
			);
		}

		const cachedData = cached[username];
		if (cachedData?.stats) {
			const lastUpdated = Temporal.Instant.fromEpochMilliseconds(cachedData.lastUpdated);
			const timeSinceLastUpdate = Temporal.Now.instant().since(lastUpdated);
			if (Temporal.Duration.compare(timeSinceLastUpdate, cacheDuration) < 0) {
				return cachedData.stats;
			}
		}

		cached[username] ??= { username, stats: null, lastUpdated: Temporal.Now.instant().epochMilliseconds };

		const fetchPromise = fetchGitHubStats(username).then(stats => updateCached(username, stats));
		if (cachedData?.stats) return cachedData.stats;
		return fetchPromise;
	},
};
