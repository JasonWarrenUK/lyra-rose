import { gsap } from 'gsap';
import type { FieldShard, Shard } from '$lib/types.js';
import { replacementCount, spawnShard } from './density.js';

/**
 * Svelte action: drives GSAP-ticked drift for a single shard element.
 * Wraps everything in gsap.context() so ctx.revert() cleans up completely.
 *
 * Usage: <div use:drift={{ fieldShard, allShards, onReplace, paused }}>
 */
export function drift(
	node: HTMLElement,
	params: {
		fieldShard: FieldShard;
		allShards: Shard[];
		onReplace: (departed: FieldShard, replacements: FieldShard[]) => void;
		paused?: boolean;
		excludeIds?: Set<string>;
		fieldSize?: number;
	}
): { update: (p: typeof params) => void; destroy: () => void } {
	let state = { ...params };
	let departed = false;

	let x = params.fieldShard.x;
	let y = params.fieldShard.y;
	const vxBase = params.fieldShard.vx;
	const vyBase = params.fieldShard.vy;

	// Set initial position immediately so element doesn't flash at 0,0
	gsap.set(node, { left: `${x}vw`, top: `${y}vh` });

	let lastTime = gsap.ticker.time;

	const ctx = gsap.context(() => {
		gsap.ticker.add(tick);
	});

	function tick(time: number) {
		if (departed) return;

		const dt = time - lastTime;
		lastTime = time;

		if (state.paused || dt > 0.5) return; // skip large gaps (tab hidden, etc.)

		const speedFactor = 1; // slowdown is handled by CSS scale, not velocity
		x += vxBase * speedFactor * dt;
		y += vyBase * speedFactor * dt;

		gsap.set(node, { left: `${x}vw`, top: `${y}vh` });

		// Off-screen: >15 units outside viewport boundary
		if (x < -15 || x > 115 || y < -15 || y > 115) {
			departed = true;
			offScreen();
		}
	}

	function offScreen() {
		ctx.revert(); // stops the ticker callback

		const count = replacementCount();
		const replacements: FieldShard[] = [];
		const edges: Array<'left' | 'right' | 'top' | 'bottom'> = ['left', 'right', 'top', 'bottom'];
		// Track which shard IDs are being added in this batch to avoid duplicating within the batch
		const usedIds = new Set(state.excludeIds ?? []);

		for (let i = 0; i < count; i++) {
			const edge = edges[Math.floor(Math.random() * edges.length)]!;
			const spawned = spawnShard(state.allShards, edge, usedIds, state.fieldSize);
			if (spawned) {
				usedIds.add(spawned.shard.id);
				replacements.push(spawned);
			}
		}

		state.onReplace(state.fieldShard, replacements);
	}

	return {
		update(newParams) {
			state = { ...newParams };
		},
		destroy() {
			departed = true;
			ctx.revert();
		},
	};
}
