import { describe, it, expect } from 'vitest';
import { buildField, spawnShard, replacementCount, randomVelocity } from './density.js';
import type { Shard } from '$lib/types.js';

function makeShard(id: string): Shard {
	return {
		id,
		created_at: new Date().toISOString(),
		surface_type: 'still-image',
		surface_data: { image_path: `${id}.jpg`, alt: id },
		interior_type: null,
		interior_data: null,
		audio_path: null,
		tending_notes: null,
	};
}

const shards = Array.from({ length: 20 }, (_, i) => makeShard(`shard-${i}`));
const smallPool = Array.from({ length: 6 }, (_, i) => makeShard(`small-${i}`));

describe('buildField', () => {
	it('returns empty array when given no shards', () => {
		expect(buildField([])).toEqual([]);
	});

	it('returns at most shards.length items when pool is small', () => {
		const small = shards.slice(0, 2);
		const field = buildField(small);
		expect(field.length).toBeLessThanOrEqual(small.length);
	});

	it('produces between MIN_SHARDS (2) and pool.length for a 6-shard pool', () => {
		// Run several times to account for randomness
		for (let i = 0; i < 20; i++) {
			const field = buildField(smallPool);
			expect(field.length).toBeGreaterThanOrEqual(2);
			expect(field.length).toBeLessThanOrEqual(smallPool.length);
		}
	});

	it('produces between 2 and 12 shards for a large pool', () => {
		// Run several times to account for randomness
		for (let i = 0; i < 10; i++) {
			const field = buildField(shards);
			expect(field.length).toBeGreaterThanOrEqual(2);
			expect(field.length).toBeLessThanOrEqual(12);
		}
	});

	it('assigns unique placement ids', () => {
		const field = buildField(shards);
		const ids = field.map(fs => fs.id);
		expect(new Set(ids).size).toBe(ids.length);
	});

	it('positions shards within visible range (5–95)', () => {
		const field = buildField(shards);
		for (const fs of field) {
			expect(fs.x).toBeGreaterThanOrEqual(5);
			expect(fs.x).toBeLessThanOrEqual(95);
			expect(fs.y).toBeGreaterThanOrEqual(5);
			expect(fs.y).toBeLessThanOrEqual(95);
		}
	});

	it('assigns depth within [0.3, 1.0]', () => {
		const field = buildField(shards);
		for (const fs of field) {
			expect(fs.depth).toBeGreaterThanOrEqual(0.3);
			expect(fs.depth).toBeLessThanOrEqual(1.0);
		}
	});

	it('spreads depth across a meaningful range when field is populated (>=DEPTH_FULL_SPREAD)', () => {
		// With 6+ shards on-screen the full [0.3, 1.0] depth range should open up.
		// Across many builds we expect to see both near and far shards.
		const minDepths: number[] = [];
		const maxDepths: number[] = [];
		for (let i = 0; i < 30; i++) {
			const field = buildField(shards);
			// Only check builds where the density target was high enough
			if (field.length >= 5) {
				minDepths.push(Math.min(...field.map(fs => fs.depth)));
				maxDepths.push(Math.max(...field.map(fs => fs.depth)));
			}
		}
		// The closest shards should be well below 0.55 (the solo mid-band floor)
		expect(Math.min(...minDepths)).toBeLessThan(0.5);
		// The furthest shards should be well above 0.65 (the solo mid-band ceiling)
		expect(Math.max(...maxDepths)).toBeGreaterThan(0.8);
	});

	it('does not show the same shard twice', () => {
		const field = buildField(shards);
		const shardIds = field.map(fs => fs.shard.id);
		expect(new Set(shardIds).size).toBe(shardIds.length);
	});
});

describe('spawnShard', () => {
	it('returns null when no shards are available (all excluded)', () => {
		const allIds = new Set(shards.map(s => s.id));
		expect(spawnShard(shards, 'left', allIds)).toBeNull();
	});

	it('spawns off the correct edge', () => {
		const left = spawnShard(shards, 'left');
		expect(left!.x).toBeLessThan(0);

		const right = spawnShard(shards, 'right');
		expect(right!.x).toBeGreaterThan(100);

		const top = spawnShard(shards, 'top');
		expect(top!.y).toBeLessThan(0);

		const bottom = spawnShard(shards, 'bottom');
		expect(bottom!.y).toBeGreaterThan(100);
	});

	it('does not return an excluded shard', () => {
		const first = shards[0]!;
		const exclude = new Set([first.id]);
		for (let i = 0; i < 20; i++) {
			const spawned = spawnShard([first, shards[1]!], 'left', exclude);
			expect(spawned?.shard.id).not.toBe(first.id);
		}
	});

	it('returns the departing shard when it is the only non-visible candidate (pool exhausted)', () => {
		// Simulate the B3 scenario: a 3-shard pool where 3 are on-screen, one departs.
		// The departing shard's id is removed from excludeIds before calling spawnShard
		// (this is what drift.ts offScreen() now does).
		const pool = [makeShard('a'), makeShard('b'), makeShard('c')];
		const departing = pool[0]!;
		// All three were on-screen; the departing one has just left, so it's removed
		const excludeIds = new Set([pool[1]!.id, pool[2]!.id]); // departing NOT in exclude
		const spawned = spawnShard(pool, 'left', excludeIds);
		// The only non-excluded shard is the departing one — it must be returned
		expect(spawned).not.toBeNull();
		expect(spawned!.shard.id).toBe(departing.id);
	});

	it('never returns a shard that is still on-screen (uniqueness invariant)', () => {
		// Even in the small-pool fallback, the visible set must not produce a duplicate.
		const pool = [makeShard('x'), makeShard('y'), makeShard('z')];
		const visibleIds = new Set([pool[1]!.id, pool[2]!.id]); // x departed, y+z still visible
		for (let i = 0; i < 20; i++) {
			const spawned = spawnShard(pool, 'right', visibleIds);
			if (spawned) {
				expect(visibleIds.has(spawned.shard.id)).toBe(false);
			}
		}
	});
});

describe('replacementCount', () => {
	it('returns 0, 1, or 2', () => {
		const counts = new Set<number>();
		for (let i = 0; i < 200; i++) {
			counts.add(replacementCount());
		}
		expect(counts.has(0)).toBe(true);
		expect(counts.has(1)).toBe(true);
		expect(counts.has(2)).toBe(true);
		expect([...counts].every(c => c >= 0 && c <= 2)).toBe(true);
	});

	it('returns 1 most often (probability 0.6)', () => {
		let ones = 0;
		const n = 1000;
		for (let i = 0; i < n; i++) {
			if (replacementCount() === 1) ones++;
		}
		// Should be roughly 60% — allow ±10%
		expect(ones / n).toBeGreaterThan(0.5);
		expect(ones / n).toBeLessThan(0.7);
	});
});

describe('randomVelocity', () => {
	it('closer shards (low depth) are faster than far shards (high depth)', () => {
		const closeSpeeds: number[] = [];
		const farSpeeds: number[] = [];

		for (let i = 0; i < 50; i++) {
			const close = randomVelocity(0.3);
			const far = randomVelocity(1.0);
			closeSpeeds.push(Math.hypot(close.vx, close.vy));
			farSpeeds.push(Math.hypot(far.vx, far.vy));
		}

		const avgClose = closeSpeeds.reduce((a, b) => a + b, 0) / closeSpeeds.length;
		const avgFar = farSpeeds.reduce((a, b) => a + b, 0) / farSpeeds.length;
		expect(avgClose).toBeGreaterThan(avgFar);
	});
});
