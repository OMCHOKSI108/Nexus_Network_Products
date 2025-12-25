# Deployment Guide — Vercel (frontend) + Render (backend)

This file contains the minimal, necessary steps to deploy the frontend to Vercel and the backend to Render so you can upload and go live quickly.

Prerequisites
- Git repository connected to Vercel and Render.
- Node.js 18+ (Render will install on build).
- A production MongoDB (MongoDB Atlas) connection string.
- SMTP credentials if you use contact/email features.

Required environment variables

Backend (Render) -- set these in the Render dashboard for the service:
- `MONGODB_URI`  (mongodb://... or mongodb+srv://...)
- `JWT_SECRET`   (strong secret)
- `CORS_ORIGIN`  (comma-separated allowed origins, include your Vercel domain, e.g. https://your-site.vercel.app)
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `FROM_EMAIL` (only if using email features)
- (optional) `PORT` (Render sets PORT automatically)

Frontend (Vercel) -- set this in the Vercel project settings:
- `VITE_API_URL` (e.g. `https://your-backend.onrender.com/api`)

Quick Backend (Render) deploy steps
1. In Render, create a new **Web Service** and connect your repo.
2. Set the root/build directory to the repository root; set the **Start Command** to:

```bash
npm install
npm start
```

Render will run `npm install` in the repo root and `npm start` (server/server.js) which uses `process.env.PORT`.

3. Add the required environment variables (see list above).
4. After deployment, update `CORS_ORIGIN` with the frontend URL from Vercel.

Quick Frontend (Vercel) deploy steps
1. In Vercel, create a new project and select the `frontend` folder as root.
2. Set **Build Command**: `npm run build` and **Output Directory**: `dist`.
3. Add an environment variable: `VITE_API_URL=https://your-backend.onrender.com/api`.
4. Deploy — Vercel will provide the site URL (copy it).

Seed data (optional)
- Safe (default) upsert seeding: run on a machine with network access to your Atlas DB:

```bash
cd server
node seed-all-products.js
```

- Destructive (wipe) seeding — only if you want to replace all products:

```bash
cd server
node seed-all-products.js --wipe
```

Verification
- Backend health:

```bash
curl https://your-backend.onrender.com/
curl https://your-backend.onrender.com/api
```

- Frontend: visit Vercel URL and browse products, contact, checkout flows. Use browser console & network tab to verify API calls go to `VITE_API_URL`.

Notes & critical warnings (necessary to know)
- Render's filesystem is ephemeral. Uploaded files saved to `/uploads` will NOT persist after instance restart. If you need persistent user uploads, use S3 (recommended) and update server upload handling and `UPLOADS_BASE`.
- Never check secrets into the repo. Set them only in the Render and Vercel dashboards.
- Ensure `JWT_SECRET` is long and unique.
- `seed-all-products.js` now runs in safe upsert mode by default; use `--wipe` intentionally to clear.

If you want, I can add a minimal `render.yaml` template to the repo so you can add it to Render for infra-as-code.

---
End of deploy guide — follow the steps above to go live.
