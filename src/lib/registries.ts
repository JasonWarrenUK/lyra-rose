import StillImage from './renderers/surface/StillImage.svelte';
import PaginatedText from './renderers/interior/PaginatedText.svelte';

// Adding a new surface type: add an entry here + write the .svelte file
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const surfaceRenderers: Record<string, any> = {
	'still-image': StillImage,
};

// Adding a new interior type: add an entry here + write the .svelte file
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const interiorRenderers: Record<string, any> = {
	'paginated-text': PaginatedText,
};
