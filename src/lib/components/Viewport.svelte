<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		style?: string;
	}

	let { children, style = '' }: Props = $props();
</script>

<div class="viewport" {style}>
	{@render children()}
</div>

<style>
	.viewport {
		position: fixed;
		inset: 0;
		width: 100dvw;
		height: 100dvh;
		overflow: hidden;
	}
</style>
