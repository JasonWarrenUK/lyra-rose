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
</script>

<img
	src={storageBase + data.image_path}
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
