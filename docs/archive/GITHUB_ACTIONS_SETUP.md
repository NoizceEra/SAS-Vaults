# 🚀 GitHub Actions Auto-Deploy Setup Guide

## Overview

I've created **3 GitHub Actions workflows** for automatic frontend deployment:

1. **Vercel** (Recommended) - `deploy-frontend.yml`
2. **Netlify** - `deploy-netlify.yml`
3. **GitHub Pages** - `deploy-pages.yml`

Choose ONE based on your preference. Each workflow automatically deploys when you push to `main` or `master` branch.

---

## 📋 Quick Comparison

| Platform | Speed | Custom Domain | SSL | Cost | Best For |
|----------|-------|---------------|-----|------|----------|
| **Vercel** | ⚡⚡⚡ | ✅ Free | ✅ Auto | Free | Production apps |
| **Netlify** | ⚡⚡⚡ | ✅ Free | ✅ Auto | Free | Teams |
| **GitHub Pages** | ⚡⚡ | ✅ Free | ✅ Auto | Free | Open source |

---

## 🎯 Option 1: Vercel (Recommended)

### Step 1: Create Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Import your repository (optional, we'll use GitHub Actions)

### Step 2: Get Vercel Tokens

1. Go to [vercel.com/account/tokens](https://vercel.com/account/tokens)
2. Click "Create Token"
3. Name it: `GitHub Actions`
4. Copy the token (you'll need this)

### Step 3: Get Vercel Project IDs

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link your project
cd frontend
vercel link

# Get your IDs (they'll be in .vercel/project.json)
cat .vercel/project.json
```

You'll see:
```json
{
  "orgId": "team_xxxxxxxxxxxxx",
  "projectId": "prj_xxxxxxxxxxxxx"
}
```

### Step 4: Add GitHub Secrets

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add these secrets:

| Secret Name | Value | Where to Get It |
|-------------|-------|-----------------|
| `VERCEL_TOKEN` | Your Vercel token | Step 2 above |
| `VERCEL_ORG_ID` | Your org ID | Step 3 - `orgId` |
| `VERCEL_PROJECT_ID` | Your project ID | Step 3 - `projectId` |
| `VITE_PROGRAM_ID` | `8hoCkMSWSvSt9oCokRKsKx8wqvVSWjGNnZTuvRFYhDMR` | Your Solana Program ID |

### Step 5: Enable the Workflow

The workflow is already in `.github/workflows/deploy-frontend.yml`.

**To activate:**
1. Commit and push your code:
   ```bash
   git add .
   git commit -m "Add Vercel auto-deploy workflow"
   git push origin main
   ```

2. Go to **Actions** tab in GitHub
3. You'll see the deployment running!

### Step 6: Get Your URL

After deployment completes:
- Your app will be live at: `https://your-project.vercel.app`
- Check the Actions log for the exact URL

---

## 🎯 Option 2: Netlify

### Step 1: Create Netlify Account

1. Go to [netlify.com](https://netlify.com)
2. Sign up with GitHub

### Step 2: Create New Site

1. Click "Add new site" → "Import an existing project"
2. Connect to GitHub
3. Select your repository
4. **Don't deploy yet** - we'll use GitHub Actions

### Step 3: Get Netlify Tokens

1. Go to [app.netlify.com/user/applications](https://app.netlify.com/user/applications)
2. Click "New access token"
3. Name it: `GitHub Actions`
4. Copy the token

### Step 4: Get Site ID

1. Go to your site in Netlify
2. Click **Site settings**
3. Copy the **Site ID** (under "Site information")

### Step 5: Add GitHub Secrets

Add these secrets to your GitHub repository:

| Secret Name | Value |
|-------------|-------|
| `NETLIFY_AUTH_TOKEN` | Your Netlify token |
| `NETLIFY_SITE_ID` | Your site ID |
| `VITE_PROGRAM_ID` | `8hoCkMSWSvSt9oCokRKsKx8wqvVSWjGNnZTuvRFYhDMR` |

### Step 6: Disable Other Workflows

Since you're using Netlify, disable the Vercel workflow:

```bash
# Rename to disable
mv .github/workflows/deploy-frontend.yml .github/workflows/deploy-frontend.yml.disabled
```

### Step 7: Push and Deploy

```bash
git add .
git commit -m "Add Netlify auto-deploy workflow"
git push origin main
```

Your site will be live at: `https://your-site-name.netlify.app`

---

## 🎯 Option 3: GitHub Pages

### Step 1: Enable GitHub Pages

1. Go to your repository → **Settings** → **Pages**
2. Under "Build and deployment":
   - Source: **GitHub Actions**

### Step 2: Add GitHub Secret

Add this secret:

| Secret Name | Value |
|-------------|-------|
| `VITE_PROGRAM_ID` | `8hoCkMSWSvSt9oCokRKsKx8wqvVSWjGNnZTuvRFYhDMR` |

### Step 3: Update Vite Config

Add base path to `frontend/vite.config.js`:

```javascript
export default defineConfig({
  plugins: [react()],
  base: '/SAS/', // Replace 'SAS' with your repo name
  // ... rest of config
})
```

### Step 4: Disable Other Workflows

```bash
mv .github/workflows/deploy-frontend.yml .github/workflows/deploy-frontend.yml.disabled
mv .github/workflows/deploy-netlify.yml .github/workflows/deploy-netlify.yml.disabled
```

### Step 5: Push and Deploy

```bash
git add .
git commit -m "Add GitHub Pages auto-deploy workflow"
git push origin main
```

Your site will be live at: `https://yourusername.github.io/SAS/`

---

## 🔧 Workflow Features

All workflows include:

- ✅ **Auto-deploy on push** to main/master
- ✅ **Manual trigger** via workflow_dispatch
- ✅ **Only deploys when frontend changes** (path filtering)
- ✅ **Caches dependencies** for faster builds
- ✅ **Injects environment variables** (Program ID)
- ✅ **Production builds** optimized

---

## 🎨 Custom Domain Setup

### For Vercel:

1. Go to your project → **Settings** → **Domains**
2. Click "Add Domain"
3. Enter your domain: `autosave.finance`
4. Follow DNS instructions from Vercel

### For Netlify:

1. Go to **Site settings** → **Domain management**
2. Click "Add custom domain"
3. Enter your domain
4. Update DNS records as instructed

### For GitHub Pages:

1. Go to **Settings** → **Pages**
2. Under "Custom domain", enter your domain
3. Add a `CNAME` record pointing to `yourusername.github.io`

---

## 🔄 How Auto-Deploy Works

```
1. You push code to GitHub
   ↓
2. GitHub Actions detects push to main
   ↓
3. Workflow runs:
   - Checks out code
   - Installs dependencies
   - Builds frontend (with env vars)
   - Deploys to platform
   ↓
4. Your site is live! 🎉
```

---

## 📊 Monitoring Deployments

### View Deployment Status:

1. Go to your repository
2. Click **Actions** tab
3. See all deployment runs
4. Click any run to see logs

### Deployment Notifications:

GitHub will:
- ✅ Show green checkmark on successful deploy
- ❌ Show red X if deploy fails
- 📧 Email you on failures (if enabled)

---

## 🐛 Troubleshooting

### Build Fails?

**Check the logs:**
1. Go to Actions tab
2. Click the failed workflow
3. Expand the failed step
4. Read the error message

**Common issues:**
- Missing secrets → Add them in Settings → Secrets
- Wrong Node version → Update `node-version` in workflow
- Build errors → Test locally first: `cd frontend && yarn build`

### Deployment Succeeds but Site Broken?

**Check environment variables:**
- Make sure `VITE_PROGRAM_ID` is set correctly
- Vite env vars must start with `VITE_`
- Check browser console for errors

### Wrong Program ID?

Update the secret:
1. Settings → Secrets → Actions
2. Click `VITE_PROGRAM_ID`
3. Update value
4. Re-run workflow

---

## 🚀 Quick Start Commands

```bash
# 1. Add all files
git add .

# 2. Commit
git commit -m "Add auto-deploy workflow"

# 3. Push to trigger deployment
git push origin main

# 4. Watch deployment
# Go to: https://github.com/yourusername/SAS/actions
```

---

## 📝 Environment Variables Reference

Your frontend can access:

```javascript
// In your code
const programId = import.meta.env.VITE_PROGRAM_ID;
const isDev = import.meta.env.DEV;
const isProd = import.meta.env.PROD;
```

**Add more env vars:**
1. Add to GitHub Secrets
2. Add to workflow under `env:`
3. Use in code with `import.meta.env.VITE_YOUR_VAR`

---

## 🎯 Next Steps

1. **Choose your platform** (Vercel recommended)
2. **Follow the setup steps** for that platform
3. **Add GitHub secrets**
4. **Push your code**
5. **Watch it deploy automatically!**

Your Auto-Savings Protocol frontend will now deploy automatically on every push! 🚀

---

## 💡 Pro Tips

- **Preview Deployments**: Vercel/Netlify create preview URLs for PRs
- **Rollback**: Easy to rollback to previous deployments
- **Analytics**: Enable analytics in platform settings
- **Performance**: All platforms include CDN and optimization
- **SSL**: Automatic HTTPS on all platforms

---

**Ready to deploy?** Choose your platform and follow the steps above! 🎉
