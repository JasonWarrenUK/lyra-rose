import type { Shard, FieldShard } from '$lib/types.js';
import { nanoid } from '$lib/nanoid.js';
import { generateClipPath } from './shape.js';

const MIN_SHARDS = 3;
const MAX_SHARDS = 12;

// Full depth range across the field
const DEPTH_MIN = 0.3;
const DEPTH_MAX = 1.0;
// When only one shard is visible, constrain it to this mid-range band
const DEPTH_SOLO_MIN = 0.55;
const DEPTH_SOLO_MAX = 0.65;

function randomDepth(fieldSize: number): number {
	// Compress the depth range toward the mid-band when the field is sparse.
	// At fieldSize=1 the shard sits near the middle plane.
	// At fieldSize=MAX_SHARDS the full range is available.
	const t = Math.min(1, (fieldSize - 1) / (MAX_SHARDS - 1));
	const lo = DEPTH_SOLO_MIN + t * (DEPTH_MIN - DEPTH_SOLO_MIN);
	const hi = DEPTH_SOLO_MAX + t * (DEPTH_MAX - DEPTH_SOLO_MAX);
	return lo + Math.random() * (hi - lo);
}

function randomPosition(): { x: number; y: number } {
	// Keep shards within visible field (5–95vw/vh) so they're always partly in view on start
	return {
		x: 5 + Math.random() * 90,
		y: 5 + Math.random() * 90,
	};
}

export function randomVelocity(depth: number): { vx: number; vy: number } {
	// Max speed interpolated: 1.8 at depth 0.3 (closest) → 0.9 at depth 1.0 (furthest).
	// Depth 0.3 max was reduced 40% from the original 3.0; depth 1.0 max unchanged at 0.9.
	const t = (depth - 0.3) / 0.7; // 0 at closest, 1 at furthest
	const maxSpeed = 1.8 - t * 0.9;
	const speed = Math.random() * maxSpeed;
	const angle = Math.random() * Math.PI * 2;
	return {
		vx: Math.cos(angle) * speed,
		vy: Math.sin(angle) * speed,
	};
}

function pickShard(shards: Shard[]): Shard {
	// Uniform random sampling — same shard may appear multiple times
	const index = Math.floor(Math.random() * shards.length);
	return shards[index]!;
}

export function buildField(shards: Shard[]): FieldShard[] {
	if (shards.length === 0) return [];

	// Never show a shard more than once — cap density at pool size
	const densityTarget = MIN_SHARDS + Math.floor(Math.random() * (MAX_SHARDS - MIN_SHARDS + 1));
	const count = Math.min(densityTarget, shards.length);

	// Shuffle a copy of the pool so selection is unique without replacement
	const pool = [...shards].sort(() => Math.random() - 0.5);
	const result: FieldShard[] = [];

	for (let i = 0; i < count; i++) {
		const shard = pool[i]!;
		const depth = randomDepth(count);
		const { x, y } = randomPosition();
		const { vx, vy } = randomVelocity(depth);

		result.push({ shard, x, y, depth, vx, vy, id: nanoid(), clipPath: generateClipPath() });
	}

	return result;
}

export function spawnShard(
	shards: Shard[],
	entryEdge: 'left' | 'right' | 'top' | 'bottom',
	excludeIds: Set<string> = new Set(),
	currentFieldSize: number = MAX_SHARDS
): FieldShard | null {
	// Only pick from shards not already visible in the field
	const available = shards.filter(s => !excludeIds.has(s.id));
	if (available.length === 0) return null;

	const shard = pickShard(available);
	// +1 because we're about to add this shard to the field
	const depth = randomDepth(currentFieldSize + 1);
	const { vx, vy } = randomVelocity(depth);

	// Spawn just off the opposite edge so it drifts into view
	let x: number;
	let y: number;

	switch (entryEdge) {
		case 'left':
			x = -8;
			y = 10 + Math.random() * 80;
			break;
		case 'right':
			x = 108;
			y = 10 + Math.random() * 80;
			break;
		case 'top':
			x = 10 + Math.random() * 80;
			y = -8;
			break;
		case 'bottom':
			x = 10 + Math.random() * 80;
			y = 108;
			break;
	}

	return { shard, x: x!, y: y!, depth, vx, vy, id: nanoid(), clipPath: generateClipPath() };
}

export function replacementCount(): number {
	// Non-deterministic replacement: 0, 1, or 2 with weighted probability
	const r = Math.random();
	if (r < 0.25) return 0;
	if (r < 0.85) return 1;
	return 2;
}
