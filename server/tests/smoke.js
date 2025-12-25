// Lightweight backend smoke tests using native fetch (Node 18+ / 24+)
// Usage:
//   MONGODB_URI='mongodb://localhost:27017/NexusNetwork' node server/tests/smoke.js
// Optional: set TEST_TOKEN to call protected endpoints

const BASE_PORT = process.env.PORT || process.env.SERVER_PORT || 5000;
const HOST = process.env.HOST || 'http://localhost';
const API_BASE = process.env.API_BASE || `${HOST}:${BASE_PORT}/api`;
const ROOT = process.env.ROOT || `${HOST}:${BASE_PORT}`;
const TEST_TOKEN = process.env.TEST_TOKEN || '';

async function test() {
  const results = [];

  try {
    console.log('Running backend smoke tests against', ROOT);

    // 1) GET /
    try {
      const r = await fetch(ROOT);
      const ok = r.ok;
      console.log('[GET /] ->', r.status);
      results.push(ok);
    } catch (err) {
      console.error('[GET /] failed:', err.message);
      results.push(false);
    }

    // 2) GET /api
    try {
      const r = await fetch(`${API_BASE}`);
      console.log('[GET /api] ->', r.status);
      results.push(r.ok);
    } catch (err) {
      console.error('[GET /api] failed:', err.message);
      results.push(false);
    }

    // 3) GET /api/products (public)
    try {
      const r = await fetch(`${API_BASE}/products`);
      console.log('[GET /api/products] ->', r.status);
      if (r.ok) {
        const json = await r.json();
        console.log('  products returned:', Array.isArray(json.products) ? json.products.length : 'unknown');
      }
      results.push(r.ok);
    } catch (err) {
      console.error('[GET /api/products] failed:', err.message);
      results.push(false);
    }

    // 4) GET /api/orders/user (protected) - optional
    if (TEST_TOKEN) {
      try {
        const r = await fetch(`${API_BASE}/orders/user`, {
          headers: { Authorization: `Bearer ${TEST_TOKEN}` }
        });
        console.log('[GET /api/orders/user] ->', r.status);
        if (r.ok) {
          const json = await r.json();
          console.log('  orders:', (json.orders || []).length);
        } else {
          console.log('  response:', await r.text());
        }
        results.push(r.ok);
      } catch (err) {
        console.error('[GET /api/orders/user] failed:', err.message);
        results.push(false);
      }
    } else {
      console.log('Skipping protected orders test (no TEST_TOKEN)');
    }

    const allOk = results.every(Boolean);
    if (allOk) {
      console.log('\nSMOKE TESTS PASSED');
      process.exit(0);
    } else {
      console.error('\nSMOKE TESTS FAILED');
      process.exit(1);
    }
  } catch (err) {
    console.error('Unexpected error during smoke tests:', err);
    process.exit(2);
  }
}

// Node global fetch is available in Node 18+. If not, instruct user.
if (typeof fetch !== 'function') {
  console.error('Global fetch is not available in this Node runtime. Use Node 18+ or 24+.');
  process.exit(2);
}

test();
