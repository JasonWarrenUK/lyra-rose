<script lang="ts">
	import type { PaginatedTextData } from '$lib/types.js';

	interface Props {
		data: PaginatedTextData;
	}

	let { data }: Props = $props();

	let currentPage = $state(0);
	const totalPages = $derived(data.pages.length);
	const text = $derived(data.pages[currentPage] ?? '');

	function prev() {
		if (currentPage > 0) currentPage--;
	}

	function next() {
		if (currentPage < totalPages - 1) currentPage++;
	}

	function onKeydown(event: KeyboardEvent) {
		if (event.key === 'ArrowLeft') prev();
		if (event.key === 'ArrowRight') next();
	}

	// Touch swipe detection
	let touchStartX = 0;

	function onTouchStart(event: TouchEvent) {
		touchStartX = event.touches[0]?.clientX ?? 0;
	}

	function onTouchEnd(event: TouchEvent) {
		const dx = (event.changedTouches[0]?.clientX ?? 0) - touchStartX;
		if (Math.abs(dx) < 40) return;
		if (dx < 0) next();
		else prev();
	}
</script>

<svelte:window onkeydown={onKeydown} />

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div
	class="paginated-text"
	role="article"
	ontouchstart={onTouchStart}
	ontouchend={onTouchEnd}
>
	<p class="text">{text}</p>

	{#if totalPages > 1}
		<div class="controls">
			<button
				onclick={prev}
				disabled={currentPage === 0}
				aria-label="Previous page"
			>&#8592;</button>

			<div class="dots" role="tablist" aria-label="Pages">
				{#each data.pages as _, i}
					<button
						role="tab"
						aria-selected={i === currentPage}
						aria-label="Page {i + 1}"
						class="dot"
						class:active={i === currentPage}
						onclick={() => (currentPage = i)}
					></button>
				{/each}
			</div>

			<button
				onclick={next}
				disabled={currentPage === totalPages - 1}
				aria-label="Next page"
			>&#8594;</button>
		</div>
	{/if}
</div>

<style>
	.paginated-text {
		display: flex;
		flex-direction: column;
		height: 100%;
		padding: 2rem;
		gap: 1.5rem;
		overflow: hidden;
	}

	.text {
		flex: 1;
		overflow-y: auto;
		font-size: clamp(1rem, 2.5vw, 1.4rem);
		line-height: 1.7;
		color: var(--color-text);
		white-space: pre-wrap;
	}

	.controls {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		flex-shrink: 0;
	}

	.controls button {
		font-size: 1.4rem;
		color: var(--color-text);
		opacity: 0.7;
		transition: opacity 0.15s;
		padding: 0.25rem 0.5rem;
	}

	.controls button:disabled {
		opacity: 0.2;
		cursor: default;
	}

	.dots {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}

	.dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: var(--color-page-indicator-inactive);
		transition: background 0.2s;
		padding: 0;
	}

	.dot.active {
		background: var(--color-page-indicator);
	}
</style>
