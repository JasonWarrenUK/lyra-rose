<script lang="ts">
	import type { PageData } from './$types.js';
	import type { FieldShard, Shard as ShardType } from '$lib/types.js';
	import type { PositionMode } from '$lib/field/drift.js';
	import Viewport from '$lib/components/Viewport.svelte';
	import Shard from '$lib/components/Shard.svelte';
	import PerfHud from '$lib/dev/PerfHud.svelte';
	import { createPerfMonitor } from '$lib/dev/perf.svelte.js';
	import { skyStyle } from '$lib/field/sky.js';
	import { randomVelocity } from '$lib/field/density.js';
	import { generateClipPath } from '$lib/field/shape.js';
	import { nanoid } from '$lib/nanoid.js';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	// Use the seeded pool when available; otherwise synthesise a placeholder shard
	// so the harness profiles drift with no database dependency.
	const placeholder: ShardType = {
		id: 'perf-placeholder',
		created_at: new Date().toISOString(),
		audio_path: null,
		tending_notes: null,
		surface_type: 'still-image',
		surface_data: { image_path: '/og-card.jpg', alt: 'placeholder shard' },
		interior_type: null,
		interior_data: null,
	};
	const pool = $derived(data.shards.length > 0 ? data.shards : [placeholder]);

	let shardCount = $state(15);
	let mode = $state<PositionMode>('transform');
	let fieldShards = $state<FieldShard[]>([]);

	const monitor = createPerfMonitor();
	const sky = skyStyle();

	// Build a field of exactly `n` shards. Deliberately bypasses buildField's
	// MIN/MAX_SHARDS cap so we can stress the field at 20–30 simultaneous drifts.
	function makeField(n: number): FieldShard[] {
		const out: FieldShard[] = [];
		for (let i = 0; i < n; i++) {
			const shard = pool[Math.floor(Math.random() * pool.length)]!;
			const depth = 0.3 + Math.random() * 0.7;
			const { vx, vy } = randomVelocity(depth);
			out.push({
				shard,
				x: 5 + Math.random() * 90,
				y: 5 + Math.random() * 90,
				depth,
				vx,
				vy,
				id: nanoid(),
				clipPath: generateClipPath(),
			});
		}
		return out;
	}

	// Rebuild whenever the shard count changes; mode changes remount via {#key}.
	$effect(() => {
		fieldShards = makeField(shardCount);
		monitor.reset();
	});

	$effect(() => {
		monitor.start();
		return () => monitor.stop();
	});

	function setCount(n: number) {
		shardCount = n;
	}

	function setMode(m: PositionMode) {
		mode = m;
		monitor.reset();
	}

	// Replacement keeps the field full so long runs stay at the target count.
	function replaceShard(departed: FieldShard, replacements: FieldShard[]) {
		fieldShards = [...fieldShards.filter((fs) => fs.id !== departed.id), ...replacements];
	}
</script>

<!-- DEV ROUTE — drift performance profiling harness (2FI.7). Not for production. -->

<Viewport style={sky}>
	<div class="field">
		{#key mode}
			{#each fieldShards as fieldShard (fieldShard.id)}
				<Shard
					{fieldShard}
					allShards={pool}
					onopen={() => {}}
					onreplace={replaceShard}
					positionMode={mode}
				/>
			{/each}
		{/key}
	</div>
</Viewport>

<PerfHud
	stats={monitor.stats}
	{shardCount}
	{mode}
	onsetcount={setCount}
	onsetmode={setMode}
	onreset={monitor.reset}
/>

<style>
	.field {
		width: 100%;
		height: 100%;
		position: relative;
	}
</style>
