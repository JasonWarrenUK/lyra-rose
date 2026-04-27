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

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let fieldShards = $state<FieldShard[]>([]);
	let openedFieldShard = $state<FieldShard | null>(null);

	// Set of shard IDs currently visible — used to prevent duplicates on replacement
	const visibleShardIds = $derived(new Set(fieldShards.map(fs => fs.shard.id)));
	const fieldSize = $derived(fieldShards.length);
	let currentSkyStyle = $state('');
	let cursorX = $state(-9999);
	let cursorY = $state(-9999);
	let audioReady = $state(false);

	$effect(() => {
		if (data.shards.length === 0) return;
		fieldShards = buildField(data.shards);
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
