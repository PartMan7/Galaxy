import { fetchGitHubStats, type GitHubStats } from '@/backend/fetchGitHubStats';
import { Temporal } from '@js-temporal/polyfill';

let mockStats: GitHubStats | null = null;
try {
	mockStats = require('./github-stats.json');
} catch {}

let lastUpdated: Temporal.Instant | null = null;
const cacheDuration = Temporal.Duration.from({ hours: 1 });
let cached: GitHubStats | null = null;

export default {
	async github(): Promise<GitHubStats> {
		if (process.env.DEBUG && mockStats) return mockStats;
		if (cached && lastUpdated) {
			const timeSinceLastUpdate = Temporal.Now.instant().since(lastUpdated);
			if (Temporal.Duration.compare(timeSinceLastUpdate, cacheDuration) < 0) {
				return cached;
			}
		}
		lastUpdated = Temporal.Now.instant();
		const newCached = await fetchGitHubStats();
		cached = newCached;
		return newCached;
	},
};
