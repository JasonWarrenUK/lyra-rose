<script lang="ts">
	import type { FieldShard } from '$lib/types.js';
	import { surfaceRenderers, interiorRenderers } from '$lib/registries.js';

	interface Props {
		fieldShard: FieldShard;
		onclose: () => void;
	}

	let { fieldShard, onclose }: Props = $props();

	const shard = $derived(fieldShard.shard);
	const SurfaceRenderer = $derived(surfaceRenderers[shard.surface_type]);
	const InteriorRenderer = $derived(
		shard.interior_type ? (interiorRenderers[shard.interior_type] ?? null) : null
	);
	const hasInterior = $derived(InteriorRenderer !== null && shard.interior_data !== null);

	function onBackdropClick(event: MouseEvent | TouchEvent) {
		if ((event.target as HTMLElement).classList.contains('backdrop')) {
			onclose();
		}
	}

	function onKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') onclose();
	}
</script>

<svelte:window onkeydown={onKeydown} />

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div
	class="backdrop"
	onclick={onBackdropClick}
	ontouchend={onBackdropClick}
	role="presentation"
>
	<div
		class="panel"
		class:has-interior={hasInterior}
		role="dialog"
		aria-modal="true"
		aria-label="Opened shard"
	>
		{#if hasInterior}
			<div class="surface-strip">
				{#if SurfaceRenderer}
					<SurfaceRenderer data={shard.surface_data} opened />
				{/if}
			</div>
			<div class="interior">
				<!-- @ts-ignore — InteriorRenderer is narrowed by hasInterior -->
				<InteriorRenderer data={shard.interior_data} />
			</div>
		{:else}
			<div class="surface-full">
				{#if SurfaceRenderer}
					<SurfaceRenderer data={shard.surface_data} opened />
				{/if}
			</div>
		{/if}
	</div>
</div>

<style>
	.backdrop {
		position: fixed;
		inset: 0;
		z-index: 100;
		display: flex;
		align-items: center;
		justify-content: center;
		/* The blur is applied via backdrop-filter on this element.
		   The drifting field continues behind it; we don't capture a static frame. */
		background: rgba(0, 0, 0, 0.15);
		-webkit-backdrop-filter: blur(12px);
		backdrop-filter: blur(12px);
	}

	.panel {
		position: relative;
		background: rgba(255, 255, 255, 0.92);
		border-radius: 8px;
		overflow: hidden;
		max-width: min(90vw, 800px);
		max-height: 85dvh;
		width: 100%;
		display: flex;
		flex-direction: column;
		box-shadow: 0 24px 80px rgba(0, 0, 0, 0.35);
	}

	.surface-full {
		width: 100%;
		aspect-ratio: 4 / 3;
		max-height: 85dvh;
	}

	.surface-strip {
		width: 100%;
		height: 240px;
		flex-shrink: 0;
	}

	.interior {
		flex: 1;
		overflow: hidden;
		min-height: 0;
	}
</style>
