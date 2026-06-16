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

describe('buildField', () => {
	it('returns empty array when given no shards', () => {
		expect(buildField([])).toEqual([]);
	});

	it('returns at most shards.length items when pool is small', () => {
		const small = shards.slice(0, 2);
		const field = buildField(small);
		expect(field.length).toBeLessThanOrEqual(small.length);
	});

	it('produces between 3 and 12 shards for a large pool', () => {
		// Run several times to account for randomness
		for (let i = 0; i < 10; i++) {
			const field = buildField(shards);
			expect(field.length).toBeGreaterThanOrEqual(3);
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
