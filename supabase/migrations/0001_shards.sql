-- Shards table
create table if not exists public.shards (
	id            uuid primary key default gen_random_uuid(),
	surface_type  text not null,
	surface_data  jsonb not null,
	interior_type text,
	interior_data jsonb,
	audio_path    text,
	tending_notes text,
	created_at    timestamptz not null default now()
);

-- Index for ordered fetching
create index if not exists shards_created_at_idx on public.shards (created_at desc);

-- Enable RLS
alter table public.shards enable row level security;

-- Public read: any visitor (anon role) can select shards.
-- tending_notes is selected out in application code, but excluded here for defence in depth.
create policy "anon can read shards"
	on public.shards
	for select
	to anon
	using (true);
