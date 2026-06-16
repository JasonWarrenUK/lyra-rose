import { describe, it, expect } from 'vitest';
import { surfaceRenderers, interiorRenderers } from './registries.js';

describe('surfaceRenderers', () => {
	it('resolves known type still-image', () => {
		expect(surfaceRenderers['still-image']).toBeDefined();
	});

	it('returns undefined for unknown surface type', () => {
		expect(surfaceRenderers['looping-video']).toBeUndefined();
		expect(surfaceRenderers['unknown-type']).toBeUndefined();
		expect(surfaceRenderers['']).toBeUndefined();
	});
});

describe('interiorRenderers', () => {
	it('resolves known type paginated-text', () => {
		expect(interiorRenderers['paginated-text']).toBeDefined();
	});

	it('returns undefined for unknown interior type', () => {
		expect(interiorRenderers['sub-shard-field']).toBeUndefined();
		expect(interiorRenderers['image-sequence']).toBeUndefined();
		expect(interiorRenderers['']).toBeUndefined();
	});
});
