// Dev profiling harness — client-only. It synthesises its own shards, so it needs
// no server load (and must not depend on Supabase, which may be unreachable on
// preview deploys). Rendering on the client also avoids an SSR pass for a tool
// that only does anything once GSAP's ticker is running in the browser.
export const ssr = false;
