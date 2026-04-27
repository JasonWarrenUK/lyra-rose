// Day-cycle background — synced to visitor's local time.
// Six bands interpolated. Returns a CSS style string for use on the Viewport element.

interface SkyBand {
	hour: number;      // start hour (0–23)
	top: string;       // gradient top colour
	bottom: string;    // gradient bottom colour
}

const bands: SkyBand[] = [
	{ hour: 0,  top: '#0a0e1f', bottom: '#0f1533' },  // night
	{ hour: 4,  top: '#1a1040', bottom: '#3d2060' },  // pre-dawn
	{ hour: 6,  top: '#e8754a', bottom: '#f5c06a' },  // dawn
	{ hour: 10, top: '#87ceeb', bottom: '#c8e8f8' },  // day
	{ hour: 17, top: '#e87c3a', bottom: '#f5a53a' },  // golden hour
	{ hour: 20, top: '#2c1654', bottom: '#6b3080' },  // dusk
	{ hour: 22, top: '#0d1230', bottom: '#1a2050' },  // late night (wraps to night at 24)
];

function interpolateColour(a: string, b: string, t: number): string {
	const parse = (hex: string) => [
		parseInt(hex.slice(1, 3), 16),
		parseInt(hex.slice(3, 5), 16),
		parseInt(hex.slice(5, 7), 16),
	];
	const [ar, ag, ab] = parse(a);
	const [br, bg, bb] = parse(b);
	const r = Math.round((ar ?? 0) + ((br ?? 0) - (ar ?? 0)) * t);
	const g = Math.round((ag ?? 0) + ((bg ?? 0) - (ag ?? 0)) * t);
	const blue = Math.round((ab ?? 0) + ((bb ?? 0) - (ab ?? 0)) * t);
	return `rgb(${r},${g},${blue})`;
}

export function skyStyle(): string {
	const now = new Date();
	const hour = now.getHours() + now.getMinutes() / 60;

	// Find the surrounding bands
	let prev = bands[bands.length - 1]!;
	let next = bands[0]!;

	for (let i = 0; i < bands.length; i++) {
		const band = bands[i]!;
		const following = bands[(i + 1) % bands.length]!;

		// Adjust for wrap-around (hour 22 → hour 24 = hour 0)
		const bandHour = band.hour;
		const followHour = following.hour <= band.hour ? following.hour + 24 : following.hour;
		const h = hour < band.hour ? hour + 24 : hour;

		if (h >= bandHour && h < followHour) {
			prev = band;
			next = following;
			const t = (h - bandHour) / (followHour - bandHour);
			const top = interpolateColour(prev.top, next.top, t);
			const bottom = interpolateColour(prev.bottom, next.bottom, t);
			return `background: linear-gradient(to bottom, ${top}, ${bottom});`;
		}
	}

	// Fallback
	return `background: linear-gradient(to bottom, ${bands[0]!.top}, ${bands[0]!.bottom});`;
}
