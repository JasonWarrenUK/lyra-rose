// Generates a random irregular polygon for a shard — broken mirror fragment.
// Returns a CSS polygon() string for clip-path.
// Approach: distribute N points around an approximate circle, then perturb
// each radially and angularly so no two shards look alike and no shape is regular.

interface ShapeOptions {
	vertices?: number;    // 3–6; randomised if omitted (3 most likely)
	roughness?: number;   // 0–1; how jagged. Default 0.4
	angularJitter?: number; // max angular jitter in radians. Default 0.5
}

export function generateClipPath(options: ShapeOptions = {}): string {
	const {
		roughness = 0.4,
		angularJitter = 0.5,
	} = options;

	// Random vertex count in [5, 8] biased away from extremes
	const vertexCount = options.vertices ?? pickVertexCount();

	const cx = 50; // % centre x
	const cy = 50; // % centre y
	const baseRadius = 46; // % — stays close to edges without clipping

	const points: string[] = [];
	const angleStep = (Math.PI * 2) / vertexCount;

	for (let i = 0; i < vertexCount; i++) {
		// Angular jitter: shift vertex clockwise or anticlockwise
		const jitter = (Math.random() - 0.5) * 2 * angularJitter;
		const angle = i * angleStep + jitter - Math.PI / 2; // start at top

		// Radial jitter: pull vertex in or push it out
		const radial = baseRadius * (1 - roughness * Math.random());

		const x = cx + Math.cos(angle) * radial;
		const y = cy + Math.sin(angle) * radial;

		// Clamp to [2, 98] so nothing clips completely off
		points.push(`${clamp(x, 2, 98).toFixed(1)}% ${clamp(y, 2, 98).toFixed(1)}%`);
	}

	return `polygon(${points.join(', ')})`;
}

function pickVertexCount(): number {
	// Weighted: 3 most likely, probability drops with each additional vertex
	// Weights: 3→16, 4→8, 5→4, 6→2 (halving each step)
	const options = [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 6, 6];
	return options[Math.floor(Math.random() * options.length)]!;
}

function clamp(v: number, min: number, max: number): number {
	return Math.max(min, Math.min(max, v));
}
