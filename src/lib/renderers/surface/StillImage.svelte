<script lang="ts">
	import type { StillImageData } from '$lib/types.js';
	import { PUBLIC_SUPABASE_URL } from '$env/static/public';

	interface Props {
		data: StillImageData;
		/** When true, renders at larger scale for the opened state */
		opened?: boolean;
	}

	let { data, opened = false }: Props = $props();

	const storageBase = `${PUBLIC_SUPABASE_URL}/storage/v1/object/public/shards/`;

	// Absolute paths (http(s):, data:, or root-relative /) are used as-is; bare
	// keys are resolved against Supabase Storage. Lets local/placeholder assets work.
	const src = $derived(
		/^(https?:|data:|\/)/.test(data.image_path) ? data.image_path : storageBase + data.image_path
	);
</script>

<img
	{src}
	alt={data.alt}
	class:opened
	draggable="false"
/>

<style>
	img {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
		user-select: none;
		-webkit-user-drag: none;
	}

	img.opened {
		object-fit: contain;
	}
</style>
