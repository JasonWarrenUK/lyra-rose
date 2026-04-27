<script lang="ts">
	import type { PageData } from './$types.js';
	import type { FieldShard } from '$lib/types.js';
	import Viewport from '$lib/components/Viewport.svelte';
	import Shard from '$lib/components/Shard.svelte';
	import OpenedShard from '$lib/components/OpenedShard.svelte';
	import { buildField } from '$lib/field/density.js';
	import { skyStyle } from '$lib/field/sky.js';
	import { initAudio, playExpand, playCollapse } from '$lib/audio/proximity.js';
	import { setPointerKind } from '$lib/input/pointer.js';
	import { generateClipPath } from '$lib/field/shape.js';
	import { randomVelocity } from '$lib/field/density.js';
	import { nanoid } from '$lib/nanoid.js';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let fieldShards = $state<FieldShard[]>([]);
	let openedFieldShard = $state<FieldShard | null>(null);

	const visibleShardIds = $derived(new Set(fieldShards.map(fs => fs.shard.id)));
	const fieldSize = $derived(fieldShards.length);
	let currentSkyStyle = $state('');
	let cursorX = $state(-9999);
	let cursorY = $state(-9999);
	let audioReady = $state(false);

	$effect(() => {
		if (data.shards.length === 0) return;

		const base = buildField(data.shards);

		// Find the first Redwall shard (surface_data.alt contains "Redwall")
		const redwall = data.shards.find((s: (typeof data.shards)[number]) => {
			const d = s.surface_data as Record<string, unknown>;
			return typeof d['alt'] === 'string' && d['alt'].toLowerCase().includes('redwall');
		});

		const extras: FieldShard[] = [];

		if (redwall) {
			const makeExtra = (depth: number, x: number, y: number): FieldShard => {
				const { vx, vy } = randomVelocity(depth);
				return { shard: redwall, x, y, depth, vx, vy, id: nanoid(), clipPath: generateClipPath() };
			};

			// Min depth (0.3) — furthest, smallest — left side
			extras.push(makeExtra(0.3, 20, 50));
			// Max depth (1.0) — closest, largest — right side
			extras.push(makeExtra(1.0, 75, 50));
		}

		fieldShards = [...base, ...extras];
	});

	$effect(() => {
		currentSkyStyle = skyStyle();
		const interval = setInterval(() => {
			currentSkyStyle = skyStyle();
		}, 5 * 60 * 1000);
		return () => clearInterval(interval);
	});

	function openShard(fieldShard: FieldShard) {
		openedFieldShard = fieldShard;
		if (audioReady) playExpand();
	}

	function closeShard() {
		openedFieldShard = null;
		if (audioReady) playCollapse();
	}

	function replaceShard(departed: FieldShard, replacements: FieldShard[]) {
		fieldShards = [
			...fieldShards.filter(fs => fs.id !== departed.id),
			...replacements,
		];
	}

	function onMouseMove(event: MouseEvent) {
		cursorX = event.clientX;
		cursorY = event.clientY;
	}

	async function onFirstInteraction() {
		if (audioReady) return;
		setPointerKind('mouse');
		await initAudio();
		audioReady = true;
	}

	async function onFirstTouch() {
		if (audioReady) return;
		setPointerKind('touch');
		await initAudio();
		audioReady = true;
	}
</script>

<!-- DEV ROUTE — depth extremes test. Remove before deploy. -->

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<Viewport style={currentSkyStyle}>
	<div
		class="field"
		onmousemove={onMouseMove}
		onclick={onFirstInteraction}
		ontouchstart={onFirstTouch}
		role="presentation"
	>
		{#each fieldShards as fieldShard (fieldShard.id)}
			<Shard
				{fieldShard}
				allShards={data.shards}
				onopen={openShard}
				onreplace={replaceShard}
				paused={openedFieldShard !== null}
				{cursorX}
				{cursorY}
				excludeIds={visibleShardIds}
				{fieldSize}
			/>
		{/each}
	</div>

	{#if openedFieldShard}
		<OpenedShard fieldShard={openedFieldShard} onclose={closeShard} />
	{/if}
</Viewport>

<style>
	.field {
		width: 100%;
		height: 100%;
		position: relative;
	}
</style>
