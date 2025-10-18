import { serve } from 'bun';
import index from './index.html';
import backend from './backend';

const server = serve({
	routes: {
		// Serve index.html for all unmatched routes.
		'/*': index,

		'/api/github': {
			async GET(req) {
				return Response.json(await backend.github());
			},
		},
	},

	development: process.env.NODE_ENV !== 'production' && {
		hmr: true,
		console: true,
	},
});

console.log(`🚀 Server running at ${server.url}`);
