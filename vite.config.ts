import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [sveltekit()],
	ssr: {
		// gsap ships an ESM-only entry (index.js) with no "type":"module" declaration,
		// which causes "Cannot use import statement outside a module" in the Vercel Lambda.
		// Bundling it at build time avoids the runtime CJS/ESM mismatch.
		noExternal: ['gsap'],
	},
	test: {
		environment: 'happy-dom',
		include: ['src/**/*.test.ts'],
	},
});
