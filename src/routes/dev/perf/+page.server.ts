// Reuse the root page load — identical data, no duplication of Supabase logic.
// The perf harness synthesises shards when the pool is empty, so this works
// even without a seeded database.
export { load } from '../../+page.server.js';
