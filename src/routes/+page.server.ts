import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import type { PageServerLoad } from './$types.js';
import type { Shard, Database } from '$lib/types.js';

// Prerendered at build time — redeploy after adding new shards to the database
export const prerender = true;

export const load: PageServerLoad = async () => {
	const client = createClient<Database>(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);

	const { data, error } = await client
		.from('shards')
		.select('id, surface_type, surface_data, interior_type, interior_data, audio_path, created_at')
		.order('created_at', { ascending: false });

	if (error) {
		console.error('Failed to load shards:', error.message);
		return { shards: [] as Shard[] };
	}

	return { shards: (data ?? []) as Shard[] };
};
