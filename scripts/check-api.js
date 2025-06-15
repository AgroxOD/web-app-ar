const base =
  (process.env.VITE_API_BASE_URL || '').trim() || 'http://localhost:3000';
const url = base.replace(/\/$/, '') + '/api/models';
fetch(url)
  .then((res) => {
    if (!res.ok) throw new Error(`Status ${res.status}`);
    return res.json();
  })
  .then(() => {
    console.log(`✅ [api] reachable at ${base}`);
  })
  .catch((err) => {
    console.error(`❌ [api] request failed: ${err.message}`);
    process.exit(1);
  });
