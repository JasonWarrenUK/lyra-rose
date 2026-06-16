<script lang="ts">
	import type { FieldShard, Shard as ShardType } from '$lib/types.js';
	import { surfaceRenderers } from '$lib/registries.js';
	import { drift, type PositionMode } from '$lib/field/drift.js';
	import { touchAttention } from '$lib/input/touch-attention.js';
	import { getPointerKind } from '$lib/input/pointer.js';
	import { ShardAudio, gainFromDistance, initAudio } from '$lib/audio/proximity.js';

	interface Props {
		fieldShard: FieldShard;
		allShards: ShardType[];
		onopen: (shard: FieldShard) => void;
		onreplace: (departed: FieldShard, replacements: FieldShard[]) => void;
		paused?: boolean;
		cursorX?: number;
		cursorY?: number;
		excludeIds?: Set<string>;
		fieldSize?: number;
		positionMode?: PositionMode;
	}

	let { fieldShard, allShards, onopen, onreplace, paused = false, cursorX = -9999, cursorY = -9999, excludeIds, fieldSize, positionMode = 'transform' }: Props = $props();

	const SurfaceRenderer = $derived(surfaceRenderers[fieldShard.shard.surface_type]);
	// 34vw at depth 0.3 (closest) → 14vw at depth 1.0 (furthest)
	const sizeVw = $derived((34 - (fieldShard.depth - 0.3) / 0.7 * 20).toFixed(2));

	let el = $state<HTMLElement | null>(null);
	let slowed = $state(false);
	let shardAudio: ShardAudio | null = null;

	// Initialise audio for shards that carry it
	$effect(() => {
		if (fieldShard.shard.audio_path) {
			shardAudio = new ShardAudio(fieldShard.shard.audio_path);
			return () => shardAudio?.destroy();
		}
	});

	// Pointer proximity → gain
	$effect(() => {
		if (!shardAudio || !el || getPointerKind() !== 'mouse') return;
		const gain = gainFromDistance(cursorX, cursorY, el);
		shardAudio.setGain(gain);
	});

	function handleClick(event: MouseEvent) {
		if (getPointerKind() === 'touch') return;
		onopen(fieldShard);
	}

	function handleTap(event: TouchEvent) {
		onopen(fieldShard);
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			onopen(fieldShard);
		}
	}

	async function onAttentive() {
		slowed = true;
		await initAudio();
		shardAudio?.setGain(1);
	}

	function onInattentive() {
		slowed = false;
		shardAudio?.setGain(0);
	}
</script>

{#if SurfaceRenderer}
	<!-- Outer layer: GSAP owns the drift transform here (translate3d, composited).
	     Kept as a zero-size anchor so the inner element can centre on the drift point. -->
	<div
		class="shard-drift"
		style="z-index: {Math.round((1.3 - fieldShard.depth) * 10)};"
		use:drift={{ fieldShard, allShards, onReplace: onreplace, paused: paused || slowed, excludeIds, fieldSize, positionMode }}
	>
		<!-- Inner layer: size, shape, interaction. CSS owns the centring + hover-scale
		     transform here so it never collides with the drift transform above. -->
		<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
		<div
			bind:this={el}
			class="shard"
			class:slowed
			style="
				width: {sizeVw}vw;
				height: {sizeVw}vw;
				--depth: {fieldShard.depth};
				--clip: {fieldShard.clipPath};
			"
			data-shard-id={fieldShard.id}
			role="button"
			tabindex="0"
			aria-label="Open shard"
			onclick={handleClick}
			ontouchend={handleTap}
			onkeydown={handleKeydown}
			use:touchAttention={{ onAttentive, onInattentive }}
		>
			<SurfaceRenderer data={fieldShard.shard.surface_data} />
		</div>
	</div>
{/if}

<style>
	.shard-drift {
		position: absolute;
		top: 0;
		left: 0;
		width: 0;
		height: 0;
		/* Drift writes transform every frame — promote to its own layer. */
		will-change: transform;
	}

	.shard {
		position: absolute;
		transform: translate(-50%, -50%);
		/* No border-radius — the polygon handles shaping */
		overflow: hidden;
		cursor: pointer;
		will-change: transform;
		clip-path: var(--clip);
		/* drop-shadow follows the clip-path; box-shadow would ignore it */
		filter: drop-shadow(0 calc(var(--depth, 0.5) * 6px) calc(var(--depth, 0.5) * 18px) rgba(0, 0, 0, calc(var(--depth, 0.5) * 0.5)));
		transition: filter 0.2s, transform 0.3s, clip-path 0.4s ease-out;
	}

	.shard:hover,
	.shard.slowed {
		transform: translate(-50%, -50%) scale(1.05);
		filter: drop-shadow(0 calc(var(--depth, 0.5) * 10px) calc(var(--depth, 0.5) * 26px) rgba(0, 0, 0, calc(var(--depth, 0.5) * 0.6)));
	}

	.shard:focus-visible {
		/* outline doesn't work with clip-path — use a drop-shadow ring instead */
		filter: drop-shadow(0 0 0 3px var(--color-accent));
	}

	@media (prefers-reduced-motion: reduce) {
		.shard {
			transition: none;
		}
	}
</style>
