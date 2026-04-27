// Web Audio API — proximity-based gain for pointer, attention-based for touch.
// AudioContext is lazy-created on first user gesture (browser autoplay policy).

let ctx: AudioContext | null = null;
let expandBuffer: AudioBuffer | null = null;
let collapseBuffer: AudioBuffer | null = null;

function getContext(): AudioContext {
	if (!ctx) ctx = new AudioContext();
	return ctx;
}

async function loadBuffer(audioCtx: AudioContext, path: string): Promise<AudioBuffer | null> {
	try {
		const res = await fetch(path);
		const arrayBuffer = await res.arrayBuffer();
		return await audioCtx.decodeAudioData(arrayBuffer);
	} catch {
		return null;
	}
}

// Call once on first user gesture
export async function initAudio(): Promise<void> {
	const audioCtx = getContext();
	if (audioCtx.state === 'suspended') await audioCtx.resume();
	if (!expandBuffer) expandBuffer = await loadBuffer(audioCtx, '/audio/expand.mp3');
	if (!collapseBuffer) collapseBuffer = await loadBuffer(audioCtx, '/audio/collapse.mp3');
}

export function playExpand(): void {
	if (!ctx || !expandBuffer) return;
	const src = ctx.createBufferSource();
	src.buffer = expandBuffer;
	src.connect(ctx.destination);
	src.start();
}

export function playCollapse(): void {
	if (!ctx || !collapseBuffer) return;
	const src = ctx.createBufferSource();
	src.buffer = collapseBuffer;
	src.connect(ctx.destination);
	src.start();
}

// Per-shard audio source — created when a shard with audio is in the field
export class ShardAudio {
	private gainNode: GainNode;
	private source: AudioBufferSourceNode | null = null;
	private _ready = false;

	constructor(private readonly audioPath: string) {
		const audioCtx = getContext();
		this.gainNode = audioCtx.createGain();
		this.gainNode.gain.value = 0;
		this.gainNode.connect(audioCtx.destination);
		this.load();
	}

	private async load() {
		const audioCtx = getContext();
		const buffer = await loadBuffer(audioCtx, audioPath(this.audioPath));
		if (!buffer) return;

		this.source = audioCtx.createBufferSource();
		this.source.buffer = buffer;
		this.source.loop = true;
		this.source.connect(this.gainNode);
		this.source.start();
		this._ready = true;
	}

	/** 0–1 target gain, ramped smoothly */
	setGain(target: number, rampMs = 300): void {
		if (!this._ready) return;
		const audioCtx = getContext();
		this.gainNode.gain.cancelScheduledValues(audioCtx.currentTime);
		this.gainNode.gain.linearRampToValueAtTime(target, audioCtx.currentTime + rampMs / 1000);
	}

	destroy(): void {
		this.gainNode.gain.setValueAtTime(0, getContext().currentTime);
		setTimeout(() => {
			this.source?.stop();
			this.gainNode.disconnect();
		}, 400);
	}
}

function audioPath(path: string): string {
	// Paths stored in Supabase Storage are full URLs; static audio uses /audio/ prefix
	if (path.startsWith('http')) return path;
	return `/audio/${path}`;
}

/**
 * Calculate gain from cursor distance to element centre.
 * Returns 0–1 where 1 = cursor is over the element, 0 = cursor is >300px away.
 */
export function gainFromDistance(
	cursorX: number,
	cursorY: number,
	element: HTMLElement
): number {
	const rect = element.getBoundingClientRect();
	const cx = rect.left + rect.width / 2;
	const cy = rect.top + rect.height / 2;
	const dist = Math.hypot(cursorX - cx, cursorY - cy);
	const maxDist = 300;
	return Math.max(0, 1 - dist / maxDist);
}
