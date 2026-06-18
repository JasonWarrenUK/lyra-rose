import type { HandleServerError } from '@sveltejs/kit';

// Surface real SSR errors in Vercel runtime logs rather than a generic "Internal Error".
export const handleError: HandleServerError = ({ error, event }) => {
	const message = error instanceof Error ? error.message : String(error);
	const stack = error instanceof Error ? error.stack : undefined;
	console.error(`SSR error on ${event.url.pathname}: ${message}`);
	if (stack) console.error(stack);
	return { message: 'Internal Error' };
};
