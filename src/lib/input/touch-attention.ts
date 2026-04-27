// Touch attention detection.
// A finger held on a shard for ≥ ATTENTION_MS without lifting triggers "attentive" state.
// Attentive state: shard slows + audio fades in (if present).
// Lifting the finger ends attention immediately.

export const ATTENTION_MS = 400;

export interface TouchAttentionOptions {
	onAttentive: () => void;
	onInattentive: () => void;
}

export function touchAttention(
	node: HTMLElement,
	options: TouchAttentionOptions
): { destroy: () => void } {
	let timer: ReturnType<typeof setTimeout> | null = null;
	let attentive = false;

	function startTimer() {
		timer = setTimeout(() => {
			attentive = true;
			options.onAttentive();
		}, ATTENTION_MS);
	}

	function clearTimer() {
		if (timer) {
			clearTimeout(timer);
			timer = null;
		}
		if (attentive) {
			attentive = false;
			options.onInattentive();
		}
	}

	function onTouchStart(event: TouchEvent) {
		// Don't steal the event — let tap/click handlers still fire
		startTimer();
	}

	function onTouchEnd() {
		clearTimer();
	}

	function onTouchCancel() {
		clearTimer();
	}

	node.addEventListener('touchstart', onTouchStart, { passive: true });
	node.addEventListener('touchend', onTouchEnd, { passive: true });
	node.addEventListener('touchcancel', onTouchCancel, { passive: true });

	return {
		destroy() {
			clearTimer();
			node.removeEventListener('touchstart', onTouchStart);
			node.removeEventListener('touchend', onTouchEnd);
			node.removeEventListener('touchcancel', onTouchCancel);
		},
	};
}
