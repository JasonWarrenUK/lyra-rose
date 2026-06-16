<script lang="ts">
	import type { PositionMode } from '$lib/field/drift.js';
	import type { PerfStats } from './perf.svelte.js';

	interface Props {
		stats: PerfStats;
		shardCount: number;
		mode: PositionMode;
		counts?: number[];
		onsetcount: (n: number) => void;
		onsetmode: (mode: PositionMode) => void;
		onreset: () => void;
	}

	let {
		stats,
		shardCount,
		mode,
		counts = [5, 10, 15, 20, 30],
		onsetcount,
		onsetmode,
		onreset,
	}: Props = $props();

	const pct = (v: number) => `${(v * 100).toFixed(0)}%`;
	const ms = (v: number) => `${v.toFixed(1)}ms`;
</script>

<aside class="hud">
	<div class="row title">drift perf · <span class="mode">{mode}</span></div>

	<dl>
		<dt>shards</dt>
		<dd>{shardCount}</dd>
		<dt>fps</dt>
		<dd class:warn={stats.fps < 55} class:bad={stats.fps < 30}>{stats.fps.toFixed(0)}</dd>
		<dt>frame avg</dt>
		<dd>{ms(stats.frameAvgMs)}</dd>
		<dt>frame p95</dt>
		<dd class:warn={stats.frameP95Ms > 16.7}>{ms(stats.frameP95Ms)}</dd>
		<dt>frame max</dt>
		<dd>{ms(stats.frameMaxMs)}</dd>
		<dt>&gt;16.7ms</dt>
		<dd class:warn={stats.long60 > 0.05}>{pct(stats.long60)}</dd>
		<dt>&gt;33ms</dt>
		<dd class:bad={stats.long30 > 0.01}>{pct(stats.long30)}</dd>
		<dt>frames</dt>
		<dd>{stats.frames} · {stats.elapsed.toFixed(0)}s</dd>
	</dl>

	<div class="row">
		<span class="label">count</span>
		{#each counts as n (n)}
			<button class:active={n === shardCount} onclick={() => onsetcount(n)}>{n}</button>
		{/each}
	</div>

	<div class="row">
		<span class="label">mode</span>
		<button class:active={mode === 'transform'} onclick={() => onsetmode('transform')}>transform</button>
		<button class:active={mode === 'offset'} onclick={() => onsetmode('offset')}>offset</button>
	</div>

	<div class="row">
		<button class="wide" onclick={onreset}>reset stats</button>
	</div>
</aside>

<style>
	.hud {
		position: fixed;
		top: 12px;
		left: 12px;
		z-index: 9999;
		width: 220px;
		padding: 10px 12px;
		font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
		font-size: 12px;
		line-height: 1.4;
		color: #e8e8e8;
		background: rgba(12, 12, 16, 0.82);
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-radius: 8px;
		backdrop-filter: blur(4px);
		user-select: none;
	}

	.title {
		margin-bottom: 6px;
		font-weight: 600;
		letter-spacing: 0.02em;
	}

	.mode {
		color: #7fd1ff;
	}

	dl {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 1px 10px;
		margin: 0 0 8px;
	}

	dt {
		color: #9a9aa2;
	}

	dd {
		margin: 0;
		text-align: right;
		font-variant-numeric: tabular-nums;
	}

	.warn {
		color: #ffcf5c;
	}

	.bad {
		color: #ff6b6b;
	}

	.row {
		display: flex;
		align-items: center;
		gap: 4px;
		margin-top: 6px;
	}

	.label {
		width: 44px;
		color: #9a9aa2;
	}

	button {
		flex: 1;
		padding: 3px 0;
		font: inherit;
		color: #e8e8e8;
		background: rgba(255, 255, 255, 0.06);
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-radius: 4px;
		cursor: pointer;
	}

	button:hover {
		background: rgba(255, 255, 255, 0.14);
	}

	button.active {
		color: #0c0c10;
		background: #7fd1ff;
		border-color: #7fd1ff;
	}

	button.wide {
		flex: 1 0 100%;
	}
</style>
