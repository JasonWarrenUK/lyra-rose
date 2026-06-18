import type { HandleServerError } from '@sveltejs/kit';

// Surface real SSR errors in Vercel runtime logs rather than a generic "Internal Error".
export const handleError: HandleServerError = ({ error, event }) => {
	console.error(`SSR error on ${event.url.pathname}:`, error);
	return { message: 'Internal Error' };
};
