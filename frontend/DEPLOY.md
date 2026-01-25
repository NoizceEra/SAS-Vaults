# Deploying the Frontend (Vercel / Netlify)

This file explains how to publish the `frontend` app and wire the deployed Program ID.

Quick local build

```bash
# dev server (already running in this workspace)
cd frontend
npm install
npm run dev

# build for production
npm run build
# preview production build
npm run preview
```

Environment variable

- The frontend reads the program ID from `import.meta.env.VITE_PROGRAM_ID`.
- Locally create `frontend/.env` or `frontend/.env.local` with:

```
VITE_PROGRAM_ID=8hoCkMSWSvSt9oCokRKsKx8wqvVSWjGNnZTuvRFYhDMR
```

Vercel

1. Connect your GitHub/Git repo to Vercel and select the `frontend` folder as the project root (or set the Build & Output settings below).
2. Build command: `npm ci && npm run build`
3. Output directory: `dist`
4. Add Environment Variable (Project Settings) `VITE_PROGRAM_ID` = `8hoCkMSWSvSt9oCokRKsKx8wqvVSWjGNnZTuvRFYhDMR`
5. Deploy — Vercel will build and publish the site.

Netlify

1. Connect the repo to Netlify and set the base directory to `frontend`.
2. Build command: `npm ci && npm run build`
3. Publish directory: `dist`
4. In Site settings → Build & deploy → Environment: add `VITE_PROGRAM_ID` with the Program ID above.
5. Deploy site.

Notes & verification

- After deploy, open the site and connect a wallet (Devnet). Use the UI to `Initialize User` and perform a small `Deposit` to verify the Program ID is correct.
- If you change the Program ID later, update `VITE_PROGRAM_ID` in the hosting provider and re-deploy.

Optional: I can add CI-friendly scripts or a small GitHub Actions workflow to auto-deploy to Vercel/Netlify on push — tell me if you want that.
