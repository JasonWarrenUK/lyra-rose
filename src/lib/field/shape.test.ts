import { describe, it, expect } from 'vitest';
import { generateClipPath } from './shape.js';

describe('generateClipPath', () => {
	it('returns a valid CSS polygon() string', () => {
		const path = generateClipPath();
		expect(path).toMatch(/^polygon\(.+\)$/);
	});

	it('contains at least 3 coordinate pairs', () => {
		const path = generateClipPath();
		// Each point is "X% Y%" separated by ", "
		const pairs = path.slice('polygon('.length, -1).split(', ');
		expect(pairs.length).toBeGreaterThanOrEqual(3);
	});

	it('all coordinates are clamped within [2, 98]%', () => {
		for (let i = 0; i < 20; i++) {
			const path = generateClipPath();
			const inner = path.slice('polygon('.length, -1);
			const values = inner.match(/[\d.]+(?=%)/g) ?? [];
			for (const v of values) {
				const n = parseFloat(v);
				expect(n).toBeGreaterThanOrEqual(2);
				expect(n).toBeLessThanOrEqual(98);
			}
		}
	});

	it('produces different shapes each call', () => {
		const paths = new Set(Array.from({ length: 10 }, () => generateClipPath()));
		// Extremely unlikely to get the same polygon twice
		expect(paths.size).toBeGreaterThan(1);
	});

	it('respects explicit vertex count', () => {
		for (let v = 3; v <= 6; v++) {
			const path = generateClipPath({ vertices: v });
			const pairs = path.slice('polygon('.length, -1).split(', ');
			expect(pairs.length).toBe(v);
		}
	});
});
