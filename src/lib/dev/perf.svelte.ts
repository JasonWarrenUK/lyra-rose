import { gsap } from 'gsap';

/** A snapshot of recent frame performance, flushed to reactive state ~4×/sec. */
export interface PerfStats {
	/** Frames sampled since the last reset. */
	frames: number;
	/** Seconds elapsed since the last reset. */
	elapsed: number;
	/** Average frames per second over the rolling window. */
	fps: number;
	/** Average frame time over the window, in milliseconds. */
	frameAvgMs: number;
	/** 95th-percentile frame time over the window, in milliseconds. */
	frameP95Ms: number;
	/** Worst frame time over the window, in milliseconds. */
	frameMaxMs: number;
	/** Share of frames slower than 60fps (>16.7ms), 0–1. */
	long60: number;
	/** Share of frames slower than 30fps (>33.3ms), 0–1. */
	long30: number;
}

const WINDOW = 120; // rolling window of frames (~2s at 60fps)
const FLUSH_MS = 250; // throttle reactive updates so the HUD doesn't skew the measurement
const BUDGET_60 = 1000 / 60;
const BUDGET_30 = 1000 / 30;

function emptyStats(): PerfStats {
	return {
		frames: 0,
		elapsed: 0,
		fps: 0,
		frameAvgMs: 0,
		frameP95Ms: 0,
		frameMaxMs: 0,
		long60: 0,
		long30: 0,
	};
}

/**
 * Samples the GSAP ticker — the same loop that drives drift — to measure real
 * frame cadence under load. Every frame is sampled; computed stats are flushed
 * to reactive `$state` only a few times a second to keep the HUD's own rendering
 * out of the numbers.
 */
export function createPerfMonitor() {
	const stats = $state<PerfStats>(emptyStats());

	const window: number[] = []; // recent frame times (ms)
	let prev = 0;
	let totalFrames = 0;
	let startTime = 0;
	let lastFlush = 0;
	let running = false;

	function tick(time: number) {
		// gsap.ticker.time is in seconds.
		if (prev === 0) {
			prev = time;
			startTime = time;
			lastFlush = time;
			return;
		}

		const dtMs = (time - prev) * 1000;
		prev = time;

		// Ignore pathological gaps (tab hidden / debugger pause) so they don't
		// poison the averages.
		if (dtMs > 500) return;

		window.push(dtMs);
		if (window.length > WINDOW) window.shift();
		totalFrames += 1;

		if (time - lastFlush >= FLUSH_MS / 1000) {
			flush(time);
			lastFlush = time;
		}
	}

	function flush(time: number) {
		const n = window.length;
		if (n === 0) return;

		let sum = 0;
		let max = 0;
		let over60 = 0;
		let over30 = 0;
		for (const ms of window) {
			sum += ms;
			if (ms > max) max = ms;
			if (ms > BUDGET_60) over60 += 1;
			if (ms > BUDGET_30) over30 += 1;
		}
		const avg = sum / n;

		const sorted = [...window].sort((a, b) => a - b);
		const p95 = sorted[Math.min(n - 1, Math.floor(n * 0.95))]!;

		stats.frames = totalFrames;
		stats.elapsed = time - startTime;
		stats.fps = avg > 0 ? 1000 / avg : 0;
		stats.frameAvgMs = avg;
		stats.frameP95Ms = p95;
		stats.frameMaxMs = max;
		stats.long60 = over60 / n;
		stats.long30 = over30 / n;
	}

	return {
		stats,
		start() {
			if (running) return;
			running = true;
			gsap.ticker.add(tick);
		},
		stop() {
			if (!running) return;
			running = false;
			gsap.ticker.remove(tick);
		},
		reset() {
			window.length = 0;
			prev = 0;
			totalFrames = 0;
			startTime = 0;
			lastFlush = 0;
			Object.assign(stats, emptyStats());
		},
	};
}

export type PerfMonitor = ReturnType<typeof createPerfMonitor>;
