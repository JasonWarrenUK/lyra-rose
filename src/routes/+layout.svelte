<script lang="ts">
	import '../app.css';
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();
</script>

<svelte:head>
	<title>The World I'd Build You</title>
	<meta name="description" content="A drifting field of shards. A world for someone." />
	<meta property="og:title" content="The World I'd Build You" />
	<meta property="og:description" content="A drifting field of shards. A world for someone." />
	<meta property="og:type" content="website" />
	<meta property="og:image" content="/og-card.jpg" />
	<meta name="robots" content="index, follow" />
</svelte:head>

{@render children()}
