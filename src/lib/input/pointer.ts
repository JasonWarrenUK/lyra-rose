// Unified input store. kind is set on first interaction and doesn't switch mid-session.
// Components use kind to select pointer vs touch grammar.

export type PointerKind = 'mouse' | 'touch' | null;

let kind: PointerKind = null;

const listeners = new Set<() => void>();

function notify() {
	for (const l of listeners) l();
}

export function getPointerKind(): PointerKind {
	return kind;
}

export function setPointerKind(k: 'mouse' | 'touch') {
	if (kind !== null) return; // locked on first interaction
	kind = k;
	notify();
}

export function subscribePointerKind(fn: () => void): () => void {
	listeners.add(fn);
	return () => listeners.delete(fn);
}

// Attach global listeners once (idempotent via module-level flag)
if (typeof window !== 'undefined') {
	window.addEventListener('mousemove', () => setPointerKind('mouse'), { passive: true, once: true });
	window.addEventListener('touchstart', () => setPointerKind('touch'), { passive: true, once: true });
}
