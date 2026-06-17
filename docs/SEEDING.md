# Seeding and Storage Workflow

> How to add shards to the collection manually (MVP stopgap — the capture pipeline replaces this later).

---

## Supabase Storage bucket

**Bucket:** `shards` (public, read-only for anonymous)

RLS policies are already applied. Assets served at:
```
{SUPABASE_URL}/storage/v1/object/public/shards/{path}
```

## Image naming convention

```
{category}-{name}.{ext}

# Examples:
book-redwall.jpg
animal-orangutan.jpg
location-stonehenge.jpg
animal-bird-owl-barn.jpg
game-board-diy.jpg
location-newForest.jpg
```

- Flat at the bucket root (no sub-folders)
- `{category}` is a broad type: `book`, `animal`, `location`, `game`, `art`, etc.
- `{name}` is a brief descriptor — lowercase, hyphens, no spaces
- Alt text is stored in the shard row, not in the filename

## Adding a shard (full workflow)

1. **Upload the image** to the `shards` bucket via Supabase Studio > Storage.
2. **Note the path** — everything after `/shards/` in the public URL.
3. **Insert a row** in the `shards` table via Supabase Studio > Table editor:

   | Column | Value |
   |---|---|
   | `surface_type` | `still-image` |
   | `surface_data` | `{"image_path": "your/path.jpg", "alt": "Descriptive alt text"}` |
   | `interior_type` | `paginated-text` or `null` |
   | `interior_data` | `{"pages": ["Page one text.", "Page two text."]}` or `null` |
   | `audio_path` | Supabase Storage URL or `null` |
   | `tending_notes` | Private notes (never shown publicly) or `null` |

4. Reload the site — the shard will appear in the field immediately.

## Alt text discipline

Every image must have meaningful alt text. The site is wordless visually, but alt text serves screen readers. Write what the image *is*, not what it *does*. Avoid "image of" or "photo of" — just describe the content.

```json
// Good
{"image_path": "redwall-cover/cover.jpg", "alt": "Cover of Redwall by Brian Jacques — a mouse warrior in armour holding a sword"}

// Too generic
{"image_path": "redwall-cover/cover.jpg", "alt": "Book cover"}
```

## Paginated text

Each entry in `pages` is one screenful. Keep pages short — three to six sentences feels right. The renderer handles overflow-y for longer pages, but the intent is that a single page fits comfortably in view without scrolling.

```json
{
  "pages": [
    "The first line.",
    "The second page. More thought here.",
    "A final image or phrase."
  ]
}
```

## Audio

Audio files go in the `shards` bucket at `audio/{slug}.mp3`. Pass the full storage URL as `audio_path`. The proximity module handles looping and gain ramping automatically.

Shards without audio leave `audio_path` as `null`.

## Considered set (Redwall + companions)

The initial seeding is a small, deliberate set. No target number — stop when the field feels right. Candidates should have surface images that work at the shard sizes (14–34vw square, polygon-clipped). Portraits and flat-colour art hold up better than busy photographs at small scale.
