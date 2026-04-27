-- Storage bucket for shard assets (images, audio).
-- Create via Supabase Studio: Storage → New bucket → name "shards", Public ON.
-- Then apply this policy so the anon role can read objects.

-- Public read policy on the shards bucket
insert into storage.buckets (id, name, public)
values ('shards', 'shards', true)
on conflict (id) do update set public = true;

-- Allow anonymous users to read any object in the shards bucket
create policy "anon can read shard assets"
	on storage.objects
	for select
	to anon
	using (bucket_id = 'shards');
