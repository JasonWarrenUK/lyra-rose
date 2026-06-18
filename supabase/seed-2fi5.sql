-- Seed: 2FI.5 — populate considered shard set (3 new shards, June 2026)
-- Applied to: znrnnhhuvdgblbemevtd (The World I'd Build You)

insert into public.shards (surface_type, surface_data, interior_type, interior_data, audio_path, tending_notes)
values
  (
    'still-image',
    '{"image_path":"animal-bird-owl-barn.jpg","alt":"A barn owl"}',
    'paginated-text',
    '{"pages":["When I was a child, a barn owl called Sid escaped from the Owl Sanctuary","Now, every owl near Nana & Grandpa''s house is Sid"]}',
    null,
    null
  ),
  (
    'still-image',
    '{"image_path":"game-board-diy.jpg","alt":"A homemade board game"}',
    'paginated-text',
    '{"pages":["We''ll make board games together.","You''ll be in charge of all the rules, and I''ll just do what you say."]}',
    null,
    null
  ),
  (
    'still-image',
    '{"image_path":"location-newForest.jpg","alt":"The New Forest, Hampshire — tall oaks and open heathland"}',
    'paginated-text',
    '{"pages":["We''ll walk through the forest where I grew up"]}',
    null,
    null
  );
