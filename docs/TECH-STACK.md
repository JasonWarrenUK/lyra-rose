# Tech Stack

> Decisions recorded: 2026-04-26

## Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | SvelteKit (Svelte 5) | |
| Runtime | Bun | |
| Animation | GSAP | Shard drift, parallax, hover slowdown, opening transitions |
| Audio | Web Audio API | Native; no library. Proximity detection via pointer distance calculation |
| Database | Supabase (PostgreSQL) | |
| File storage | Supabase Storage | Archived preview images, shard images, audio |
| Admin / Tending (MVP) | Supabase Studio | Stopgap for MVP; custom Tend UI is a post-MVP build |
| Deployment | Vercel | `@sveltejs/adapter-vercel`; free tier covers SSR |

## Rationale

**Supabase** — PostgreSQL matches the existing schema fluency; built-in Storage removes a separate file hosting decision; Studio covers the tending interface without building one for MVP; RLS handles the private tending routes. One service for database, files, and admin.

**Vercel** — Zero-config SvelteKit deployment. Free tier supports SSR via serverless functions. Infrastructure that disappears.

**GSAP** — Proven for 10–20 simultaneously animating elements. GPU-accelerated transforms. Integrates cleanly with Svelte 5 `$effect`. Handles the `backdrop-filter` performance problem better than vanilla CSS via batched transform updates and `will-change` management.

**Web Audio API** — Cursor-proximity audio summons requires only distance calculation and gain ramping. No synthesis library needed for MVP.
