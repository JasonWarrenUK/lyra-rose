# The World I'd Build You
> A vision document

## The work
A wordless, publicly indexable site that offers a drifting field of shards. Each shard is a piece of a world someone would want to build for someone. The someone is Lyra Rose Layhe Warren, daughter of Jason and Harriet Warren. The visitor's own someone is the implicit second register; the site never names this, but the structure permits it.

The site has no about page, no signature, no caption, no memory. It opens; it offers; it offers again.

## Core principles
These emerged through design and are non-negotiable.

The site never explains itself. No words frame the work. The only prose anywhere on the public face is whatever metadata search engines require, and that should be considered language rather than house-style copy.

Nothing persists across visits. The site has no analytics, no return state, no awareness of any visitor as an individual or a returning entity. Any repetition a visitor encounters is coincidence.

All shards are equal. No hierarchy of source (mine, found, theirs), no weighting by age, no algorithmic prominence. Uniform random sampling from the full pool, forever.

Catching is offering. Anything caught into the collection appears in the field; tending may enrich a shard, but never gates whether it appears.

The visitor's mind is the only place connections happen. The site does not thread, relate, recommend, or thematise. Composition is the visitor's work.

The viewport is the canvas. Nothing scrolls. Every state composes within whatever rectangle the visitor brought.

## The field
Shards drift at varied depths with slow parallax. The field's density varies by its own logic; a visitor might arrive to three shards in a quiet sky or a dozen in richer composition, with no way to tell which mode they have walked into.

The background shifts across the real day, taking its cues from the actual time at the visitor's location rather than session state. A visitor at 3am gets a different sky than one at noon, without the site claiming to care about who it is showing this to.

Replacement is non-deterministic. When a shard drifts off-screen, it may be replaced by zero, one, or more new shards at varying depths. The composition is always provisional.

## The shard
Each shard has a surface (the thing visible in the field) and may optionally have an interior (additional content surfaced when the shard is opened). The data model carries:

- `surface_type`, `surface_data`
- `interior_type`, `interior_data` (optional)
- `audio_data` (optional)
- tending notes (private, never displayed publicly)

Surfaces in MVP are still images only. The architecture supports future surface types (looping video, subtle animation, others not yet imagined) through additional renderers, but none ship with MVP.

Interiors are the most architecturally consequential element of the design. They are pluggable: each `interior_type` maps to a renderer that controls how the interior behaves. A renderer might present paginated text, expand the shard into its own field of floating sub-shards, surface a small interactive thing, advance through a sequence of images, or do something not yet imagined. Adding an interior type is "write a new renderer," not "modify core opening logic."

MVP ships with one interior renderer (paginated text), proving the modular system end to end.

The mix of caught content is undifferentiated. Book covers, photographs, quotes, links, audio: all treated equally, no source labelled. The curator disappears into the curation.

## Opening
Hover slows a shard; click opens it. The opened shard sits foreground. The rest of the field continues drifting, blurred, behind it; the world does not pause for the visitor.

Surface-only shards open to themselves at larger scale, with nothing else in the frame. Shards with interiors open to whatever their renderer produces.

Click outside dismisses the opened state. There is no close button. Escape key works for accessibility. The visitor's attention moves elsewhere, and the focus releases.

## Sound
Silent by default. Shards carrying audio become audible as the cursor approaches them; the proximity of attention summons the sound. Two effect sounds (expand, collapse) mark opening and closing. Beyond that, the site produces nothing.

Audio behaviour on touch is part of the parallel touch grammar and is not a port of the cursor-proximity model.

## Touch
A deliberately parallel grammar, designed in from MVP rather than adapted from the pointer interaction model. Hover does not exist on touch. Proximity does not exist on touch. The cursor-as-listening-ear metaphor needs a different physical analogue.

Specific touch interactions are to be designed during build under the following constraints:

1. Touch must preserve "noticing without committing"; not every contact should open a shard.
2. The audio-summons-by-attention quality needs a non-cursor equivalent (gesture duration, slow drag, finger held near a shard, or another mechanism yet to be determined).
3. The grammar should feel like its own inhabitation of the field. Touch needs design at the same level of attention as pointer; responsive breakpoints alone are insufficient.

## Capture and tending
Two surfaces, structurally separate.

1. **Catch** is the frictionless capture surface. A browser extension lets Jason (and eventually Harriet, on a device she uses) send a link, image, or quote into the collection in one click. Capture is a pipe: the extension is one client, but the same endpoint accepts input from a phone shortcut, a PWA, or any other client without modification.
2. **Tend** is the deliberate, private surface where shards can be enriched with context, a "why," or other tending notes. Tending is optional; it never gates whether a shard appears in the offering. Tending notes never appear in the public face.

Previews are archived at capture time. Title, description, and hero image are pulled down and stored locally rather than fetched live from the source. Shards do not decay when their source URLs change, paywall, or die.

Deletion has two paths: a considered path inside the tending view, for noticed-later mistakes, and an immediate-regret action in the extension that operates on the most recent capture.

## What never appears
- Per-shard sharing: no affordance to share a single shard. The site has one URL.
- Cross-shard relationships: no "related shards," no threads, no thematic groupings, no kin. Connection is the visitor's work.
- Memory of the visitor: no analytics tracking individuals, no return state, no personalised offering.
- App/Page-level scroll: every state composes within the viewport.

## The public surface
One URL, publicly indexable. A search engine can find the site; a stranger can stumble through the door.

The site is wordless inside, but search results are not. The OpenGraph card, meta description, and title shown in search results are the only place the site speaks in language to the public, and they need deliberate design rather than defaults. This is the one piece of editorial voice the work cannot avoid, and it should be considered as carefully as any shard.

There are no deep links. Every URL leads to the door; the door opens onto whatever the field is currently offering.

## MVP
End-to-end vertical slice. The smallest version that is recognisably the work:

- Drifting field with variable density and varied-depth parallax
- Day-cycle background, synced to the visitor's local time
- One surface renderer (still image)
- Opening behaviour with click-outside dismissal and a blurred-but-drifting backdrop
- One interior renderer (paginated text)
- Hand-populated database with a small considered set of shards (Redwall among them)
- Phone and desktop both functional, with parallel touch grammar

Capture pipeline is not part of MVP. The data layer is built such that capture slots in cleanly when added.

The test of MVP success: a single shard carrying interior content can be authored, displayed in the drifting field, opened to its renderer, paginated through, and dismissed; in both pointer and touch grammars. If that loop is right, the rest is patterns.

## Engineering profile
The work is substantial. Load-bearing decisions:

- **Pluggable renderer architecture from day one** (both surfaces and interiors). Building this on top of a non-pluggable MVP costs more than building it correctly initially.
- **Viewport-bounded layout discipline at every level**. No "below the fold" anywhere in the system. Interior content that exceeds the viewport must paginate, animate, or reflow within a contained region.
- **Dual-grammar responsive design** (pointer and touch as parallel inhabitations of the same essence). Real touch design work, performed in parallel with pointer design, not after it.
- **Archived previews for durability**. Capture-time fetching of OpenGraph metadata and local storage of the resulting assets. The site's permanence is not subject to the open web's churn.
- **Day-cycle background synced to real time**. Implementation accounts for the visitor's local time so the sky on the site is congruent with the sky outside their window.
- **Backdrop-filter performance on the moving field during opened state**. The blurred-but-drifting background is technically demanding and needs an explicit performance budget. CSS `backdrop-filter` on a continuously transforming layer is non-trivial; this needs profiling early.

This is not a weekend project.

## Pacing
The work is committed-personal: serious enough to keep moving on, not hostage to a date that would force compromises. Sustained pace, no deadline, regular progress.

## Open questions
Deferred for resolution during build:

- The URL itself. Whether the address is plain, considered, or part of the meaning.
- The specific touch grammar. Designed during build; constraints listed above.
- Surface motion architecture. Whether it ships in MVP+1 or later, and which surface types come first.
- The OpenGraph card, meta description, and search-result title. The site's only public language.
- The handling of audio shards on touch (proximity summons does not exist; what replaces it).
