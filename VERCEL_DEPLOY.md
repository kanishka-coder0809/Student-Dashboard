Goal: Deploy the Next.js frontend to Vercel without changing frontend code, and keep the existing Express backend separate.

Summary of minimal changes added:
- .vercelignore: excludes the `server/` folder so Vercel will not upload or try to run the Express backend.

Why this approach:
- Keeps `app/`, `components/`, `styles/` unchanged.
- Prevents Vercel from trying to run the Express server inside your Next deployment.
- You can deploy your Express backend separately (Railway, Render, Heroku, Fly, etc.) and point the frontend to it via `NEXT_PUBLIC_API_URL`.

Files added:
- .vercelignore — prevents uploading `server/` to Vercel

Checklist / steps to deploy

1) Push repository to GitHub (if not already):

   git add .
   git commit -m "Prepare for Vercel: ignore server/"
   git push origin main

2) Backend deployment (recommended: Railway or Render):
   - Railway: New Project -> Deploy from GitHub -> select repo -> for backend choose folder `server/` (or point to server entry)
   - Add env var `MONGODB_URI` in Railway, and any other server envs (e.g., `NODE_ENV`).
   - Start command: `node --experimental-modules server/server.js` (or `npm run server` if Railway runs npm scripts).
   - After deploy, copy the public URL (e.g., https://my-backend.up.railway.app)

3) Frontend deployment (Vercel):
   - Go to Vercel → New Project → Import Git Repository → select your repo.
   - Root directory: default (project root). Vercel will detect Next.js automatically.
   - In Project Settings > Environment Variables, add:
       - NEXT_PUBLIC_API_URL = https://<your-backend-url>
   - Deploy. Vercel will run `npm run build` (uses `next build`) and serve the Next app.

4) CORS / Backend config:
   - Ensure your Express server allows cross-origin requests from your Vercel domain.
   - Example (in `server/server.js`):

     import cors from 'cors';
     app.use(cors({ origin: process.env.ALLOWED_ORIGINS || '*' }));

   - Add `ALLOWED_ORIGINS` env in Railway to your Vercel site URL.

5) Verify homepage and API calls:
   - Open Vercel URL — homepage should load.
   - Use browser devtools network tab to confirm client requests go to `NEXT_PUBLIC_API_URL`.

Optional: Convert Express routes into Next API routes
- If you prefer a single Vercel deploy (no separate backend), we can port `server/routes/*.js` into `app/api/` (Next route handlers). This requires more edits but I can help do it step-by-step.

If you want, I can now:
- (A) Add a short `README` to the `server/` folder with start instructions for Railway/Render; or
- (B) Convert core backend routes into Next `app/api` endpoints so the whole app lives on Vercel.

Which option do you want next?