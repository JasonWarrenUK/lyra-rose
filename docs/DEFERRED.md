# Deferred Features and Decisions

Things explicitly out of scope for MVP, recorded here so they don't get lost.

---

## Features

### Capture pipeline
The frictionless capture surface: browser extension, phone shortcut, PWA client. All send to a single capture endpoint. The data layer is built to accept it cleanly when added.

- Browser extension (one-click send of link, image, or quote)
- Phone shortcut client
- OpenGraph metadata fetch + local asset archival at capture time
- Immediate-regret undo on most recent capture (extension-side)

### Catch endpoint / API
The backend endpoint that receives captures from any client. Not needed until the capture pipeline ships.

### Custom Tend UI
A purpose-built private interface for enriching shards (adding interior content, tending notes, context). Supabase Studio covers this for MVP.

### Additional surface renderers
MVP ships still images only. Architecture supports future types:
- Looping video
- Subtle animation
- Others not yet imagined

### Additional interior renderers
MVP ships paginated text only. Architecture supports:
- Sub-shard field (a shard that opens into its own drifting field)
- Small interactive thing
- Image sequence / slideshow
- Others not yet imagined

### Harriet's capture access
Co-contributor access to the catch endpoint from a device Harriet uses.

---

## Decisions deferred to build

These are design questions with constraints already defined; they need to be resolved during build, not before.

### Touch grammar
A parallel, independent grammar for touch — not a port of the pointer model. Constraints:
1. Must preserve "noticing without committing" (not every contact opens a shard)
2. Must find a non-cursor equivalent for audio-summons-by-attention (gesture duration, slow drag, held finger, or something else)
3. Must feel like its own inhabitation of the field

### Audio on touch
Cursor-proximity summons doesn't exist on touch. What replaces it is unresolved; see touch grammar above.

### Surface motion architecture
Whether non-still surface types (looping video, animation) ship in MVP+1 or later, and which come first.

### The URL
Whether the site's address is plain, considered, or part of the meaning of the work.

### OpenGraph card and search metadata
The only place the site speaks in language to the public. Title, meta description, OG card — all need deliberate editorial design rather than defaults.
