import { gsap } from 'gsap';
import type { FieldShard, Shard } from '$lib/types.js';
import { replacementCount, spawnShard } from './density.js';

/** How a shard's drift position is written to the DOM each frame. */
export type PositionMode =
	/** GPU-composited transform: translate3d — no per-frame layout (production default). */
	| 'transform'
	/** Legacy left/top offsets — triggers layout + paint each frame (kept for A/B profiling). */
	| 'offset';

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
		positionMode?: PositionMode;
	}
): { update: (p: typeof params) => void; destroy: () => void } {
	let state = { ...params };
	let departed = false;

	let x = params.fieldShard.x;
	let y = params.fieldShard.y;
	const vxBase = params.fieldShard.vx;
	const vyBase = params.fieldShard.vy;

	// Write the current (x, y) — held in vw/vh — to the element. In 'transform'
	// mode we convert to px and use a composited translate3d (no layout); in
	// 'offset' mode we set left/top directly (the legacy, layout-bound path).
	function applyPosition() {
		if ((state.positionMode ?? 'transform') === 'transform') {
			gsap.set(node, {
				x: (x / 100) * window.innerWidth,
				y: (y / 100) * window.innerHeight,
				force3D: true,
			});
		} else {
			gsap.set(node, { left: `${x}vw`, top: `${y}vh` });
		}
	}

	// Set initial position immediately so element doesn't flash at 0,0
	applyPosition();

	let lastTime = gsap.ticker.time;

	const ctx = gsap.context(() => {
		gsap.ticker.add(tick);
	});

	function tick(time: number) {
		if (departed) return;

		const dt = time - lastTime;
		lastTime = time;

		if (state.paused || dt > 0.5) return; // skip large gaps (tab hidden, etc.)

		x += vxBase * dt;
		y += vyBase * dt;

		applyPosition();

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
