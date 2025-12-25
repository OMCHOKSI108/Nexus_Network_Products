**Production Readiness & Testing Checklist**

- **Environment**: Ensure `server/.env` contains correct values for `MONGODB_URI`, `PORT`, `CORS_ORIGIN`, `JWT_SECRET`, and email configs.
- **DB**: Verify backups exist before running seeds against production. Do NOT run `seed-all-products.js` in production unless explicitly intended.
- **CORS**: `CORS_ORIGIN` must include production domain(s).
- **TLS**: Run behind an HTTPS reverse proxy (nginx, Traefik) with valid certificates.
- **Secrets**: `JWT_SECRET` and DB credentials must be set via secure vaults/environment variables.
- **Logging & Monitoring**: Configure logs (stdout for container), and add health checks for readiness and liveness.
- **Scaling**: Use stateless server instances; persistence should be in MongoDB and object storage for images.
- **Static assets**: Deploy `frontend/dist` (build) to a static host or serve via CDN. Ensure product images are stored in accessible storage (S3 or equivalent), not only local `public/images`.
- **Database migrations**: For schema changes, provide migration scripts. Seeds should be idempotent or provide `--wipe` flags.

Quick test steps (local)

1. Start server (dev):

```powershell
cd server
# ensure server/.env has MONGODB_URI
npm run dev
```

2. Start frontend (dev):

```bash
cd frontend
npm run dev
```

3. Run backend smoke tests:

```powershell
cd server
# optional: include TEST_TOKEN to validate protected endpoints
$env:TEST_TOKEN='eyJ...'; node tests/smoke.js
```

4. Verify seeds safely:

```powershell
# admin seed (safe)
node seed-admin.js
# product seed (destructive: clears products)
node seed-all-products.js
```

If you want, I can:
- Convert `seed-all-products.js` to non-destructive upserts and add a `--wipe` flag.
- Add CI job definitions (GitHub Actions) to run smoke tests on PRs.
- Add integration tests for checkout flow (requires test payment stub).

---

If you'd like, I can now:
- Implement the non-destructive seeding change (upsert + `--wipe` flag), and
- Add a GitHub Actions workflow that runs `server/tests/smoke.js` on pushes/PRs.

Tell me which of the two I should implement next.