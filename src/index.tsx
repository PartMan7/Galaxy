import { serve } from 'bun';
import index from './index.html';
import backend from './backend';

const server = serve({
	routes: {
		'/*': index,
		'/docs/screenshot.png': Bun.file('./docs/screenshot.png'),
		'/api/github/:username': {
			async GET(req) {
				const username = req.params.username;
				try {
					return Response.json(await backend.github(username));
				} catch (error: unknown) {
					if (error instanceof Error) {
						return Response.json({ error: error.message }, { status: 404 });
					}
					return Response.json({ error: 'An unknown error occurred' }, { status: 500 });
				}
			},
		},
	},
	idleTimeout: 2 * 60, // 2 minutes

	development: process.env.NODE_ENV !== 'production' && {
		hmr: true,
		console: true,
	},
});

console.log(`🚀 Server running at ${server.url}`);
