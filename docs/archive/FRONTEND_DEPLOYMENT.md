# 🚀 Frontend Deployment Guide

**Last Updated:** February 4, 2026  
**Version:** 2.0  
**Status:** Complete

---

## 📋 Overview

This guide covers deploying the Solana Auto-Savings Protocol frontend to Vercel, including both demo mode (before smart contract deployment) and production mode (with live blockchain integration).

---

## ✅ Pre-Deployment Checklist

### Local Verification

- [ ] **Dependencies installed:** `npm install` completes successfully
- [ ] **Build test passed:** `npm run build` works without errors
- [ ] **Environment variables configured:** `.env.local` created
- [ ] **Program ID verified:** Matches your deployed program
- [ ] **Local dev server works:** `npm run dev` runs successfully

### Configuration Files

- [ ] **vercel.json created:** Build settings configured
- [ ] **package.json updated:** Engines field added
- [ ] **.npmrc created:** Handles peer dependencies
- [ ] **.gitignore updated:** Excludes build artifacts

---

## 🎯 Deployment Options

### Option 1: Vercel Dashboard (Recommended for First Deploy)

#### Step 1: Create Vercel Account

1. Go to https://vercel.com
2. Sign up with GitHub, GitLab, or Bitbucket
3. Authorize Vercel to access your repositories

#### Step 2: Import Project

1. Click "Add New..." → "Project"
2. Import your Git repository
3. **Important:** Select the repository containing your project

#### Step 3: Configure Build Settings

**Framework Preset:** Vite  
**Root Directory:** `frontend` ✅ (Click "Edit" to change)  
**Build Command:** `npm run build`  
**Output Directory:** `dist`  
**Install Command:** `npm install`

**Important Settings:**
- ✅ Check "Include source files outside Root Directory in the Build Step"

#### Step 4: Add Environment Variables

Click "Environment Variables" and add:

**Required:**
```
VITE_PROGRAM_ID=<your-program-id>
VITE_NETWORK=devnet
```

**Optional:**
```
VITE_RPC_ENDPOINT=https://api.devnet.solana.com
```

**For Demo Mode (before contract deployment):**
```
VITE_PROGRAM_ID=11111111111111111111111111111111
VITE_NETWORK=devnet
```

#### Step 5: Deploy

1. Click "Deploy"
2. Wait 2-3 minutes for build
3. Your app will be live at `https://<project-name>.vercel.app`

---

### Option 2: Vercel CLI (For Quick Updates)

#### Install Vercel CLI

```bash
npm install -g vercel
```

#### Login to Vercel

```bash
vercel login
```

#### Deploy from Project Root

```bash
# Navigate to your project
cd C:\Users\<username>\Documents\SAS

# First time deployment
vercel

# Follow interactive prompts:
# - Set up and deploy? Yes
# - Which scope? (select your account)
# - Link to existing project? No (or Yes if re-deploying)
# - Project name? solana-auto-savings
# - Directory? ./frontend
# - Override settings? No
```

#### Production Deployment

```bash
# Deploy to production
vercel --prod

# Or from frontend directory
cd frontend
vercel --prod
```

---

## 🔧 Configuration Files

### vercel.json

Create `frontend/vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite",
  "cleanUrls": true,
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

### .npmrc

Create `frontend/.npmrc`:

```
legacy-peer-deps=true
engine-strict=false
```

**Purpose:**
- Handles peer dependency conflicts
- Allows flexible Node.js versions
- Prevents npm install failures

### package.json

Update `frontend/package.json` to include:

```json
{
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  },
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

---

## 🎨 Demo Mode vs Production Mode

### Demo Mode (Before Contract Deployment)

**When to use:**
- Smart contract not yet deployed
- Want to showcase UI
- Testing frontend features

**Configuration:**
```bash
# .env.local
VITE_PROGRAM_ID=11111111111111111111111111111111
VITE_NETWORK=devnet
VITE_DEMO_MODE=true
```

**Features:**
- ✅ Beautiful UI demonstration
- ✅ Wallet connection works
- ✅ UI interactions functional
- ⚠️ Demo mode banner displayed
- ❌ Actual transactions disabled

**Update frontend/src/config/solana.js:**
```javascript
export const FEATURES = {
  ENABLE_DEPOSITS: false,
  ENABLE_WITHDRAWALS: false,
  ENABLE_RATE_UPDATES: false,
  SHOW_DEMO_MODE: true,
};
```

### Production Mode (With Live Contract)

**When to use:**
- Smart contract deployed
- Ready for real transactions
- Production launch

**Configuration:**
```bash
# .env.local
VITE_PROGRAM_ID=<your-deployed-program-id>
VITE_NETWORK=devnet  # or mainnet-beta
VITE_DEMO_MODE=false
```

**Update frontend/src/config/solana.js:**
```javascript
export const PROGRAM_ID = new PublicKey('<your-program-id>');

export const FEATURES = {
  ENABLE_DEPOSITS: true,
  ENABLE_WITHDRAWALS: true,
  ENABLE_RATE_UPDATES: true,
  SHOW_DEMO_MODE: false,
};
```

---

## 🔄 Updating Environment Variables

### Via Vercel Dashboard

1. Go to project → Settings → Environment Variables
2. Click "Add New"
3. Enter key: `VITE_PROGRAM_ID`
4. Enter value: `<your-program-id>`
5. Select environments (Production, Preview, Development)
6. Click "Save"
7. **Important:** Redeploy for changes to take effect

### Via CLI

```bash
# Add new variable
vercel env add VITE_PROGRAM_ID

# Remove variable
vercel env rm VITE_PROGRAM_ID

# List all variables
vercel env ls

# Pull variables to local .env
vercel env pull
```

---

## 🧪 Post-Deployment Testing

### 1. Verify Build Success

Check Vercel deployment logs for:
```
✓ Building for production
✓ Transforming modules
✓ Build completed
✓ Deployment ready
```

### 2. Test Live Application

Visit your Vercel URL and verify:

- [ ] **Page loads** without errors
- [ ] **Wallet connection** works (Phantom, Solflare)
- [ ] **Network detection** correct (Devnet/Mainnet)
- [ ] **Program ID** correct (check console)
- [ ] **UI responsive** on mobile
- [ ] **All pages** navigate correctly

**Browser Console Check:**
```javascript
console.log(import.meta.env.VITE_PROGRAM_ID)
// Should output: <your-program-id>

console.log(import.meta.env.VITE_NETWORK)
// Should output: devnet or mainnet-beta
```

### 3. Test Core Functions

If in production mode:

- [ ] **Initialize user account** works
- [ ] **Deposit** processes successfully
- [ ] **Withdraw** processes successfully
- [ ] **Balance updates** display correctly
- [ ] **Transaction history** shows recent activity

---

## 🚨 Common Issues & Solutions

### Build Fails

#### Issue: "npm install exited with 1"

**Solution:**

1. Create `frontend/.npmrc`:
   ```
   legacy-peer-deps=true
   engine-strict=false
   ```

2. Add `engines` to `package.json`:
   ```json
   "engines": {
     "node": ">=18.0.0"
   }
   ```

3. Clean and rebuild locally:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   npm run build
   ```

4. Commit and push changes:
   ```bash
   git add .
   git commit -m "Fix npm install for Vercel"
   git push
   ```

#### Issue: "Cannot find module '@solana/web3.js'"

**Solution:**
- Already in `package.json` dependencies
- If still failing, add explicitly:
  ```bash
  npm install @solana/web3.js @coral-xyz/anchor
  ```

#### Issue: "Module not found: Error: Can't resolve 'buffer'"

**Solution:**

Add to `vite.config.js`:
```javascript
import { defineConfig } from 'vite';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';

export default defineConfig({
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis'
      },
      plugins: [
        NodeGlobalsPolyfillPlugin({
          buffer: true
        })
      ]
    }
  }
});
```

### Runtime Errors

#### Issue: "Program ID mismatch"

**Solution:**
1. Verify environment variable in Vercel
2. Check browser console for actual value
3. Ensure it matches deployed program:
   ```bash
   solana program show <PROGRAM_ID> --url devnet
   ```

#### Issue: "Wallet connection failed"

**Solution:**
1. Ensure wallet is installed
2. Check network matches (Devnet/Mainnet)
3. Refresh page
4. Try different wallet

#### Issue: Blank page after deployment

**Solution:**
1. Check `vercel.json` has proper rewrites:
   ```json
   "rewrites": [
     { "source": "/(.*)", "destination": "/index.html" }
   ]
   ```

2. Check `vite.config.js`:
   ```javascript
   base: '/'  // Ensure this is '/'
   ```

3. Clear browser cache and reload

### Performance Issues

#### Issue: Large bundle size warning

**Expected:** ~800KB (normal for Solana apps)

**Why:** Wallet adapter dependencies are large

**Not a problem for:**
- Users have fast internet
- Vercel CDN optimizes delivery
- Modern browsers handle efficiently

**Optional optimizations:**
- Code splitting (lazy loading routes)
- Tree shaking (remove unused imports)
- Compression (Vercel does automatically)

---

## 🌐 Custom Domain Setup

### Step 1: Add Domain in Vercel

1. Go to Project → Settings → Domains
2. Click "Add"
3. Enter your domain (e.g., `autosave.finance`)
4. Vercel provides DNS configuration

### Step 2: Configure DNS

**For root domain (@):**
```
Type: A
Name: @
Value: 76.76.21.21
```

**For www subdomain:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### Step 3: Wait for Propagation

- DNS changes take 24-48 hours (usually faster)
- Check status: `nslookup yourdomain.com`
- Vercel shows "Valid" when ready

### Step 4: SSL Certificate

- Vercel automatically provisions SSL
- HTTPS enabled by default
- Certificate auto-renews
- No configuration needed ✅

---

## 🔄 Continuous Deployment

### Automatic Deployments

**When you push to GitHub:**

- **Main branch** → Production deployment
- **Other branches** → Preview deployment
- **Pull requests** → Unique preview URL

### Preview Deployments

Every PR gets a unique URL:
- Test changes before merging
- Share with team for review
- Automatic cleanup after merge

### Deployment Hooks

Configure in Vercel Dashboard:
- **Deploy Succeeded** → Slack notification
- **Deploy Failed** → Email alert
- **Custom webhooks** → Your backend

---

## 📊 Environment-Specific Deployments

### Development

**Branch:** `develop` or `dev`  
**Environment:** Devnet  
**URL:** `https://<project>-dev.vercel.app`

```bash
# Environment variables
VITE_PROGRAM_ID=<devnet-program-id>
VITE_NETWORK=devnet
```

### Staging

**Branch:** `staging`  
**Environment:** Devnet (with production features)  
**URL:** `https://<project>-staging.vercel.app`

```bash
# Environment variables
VITE_PROGRAM_ID=<devnet-program-id>
VITE_NETWORK=devnet
VITE_ENABLE_ANALYTICS=true
```

### Production

**Branch:** `main` or `master`  
**Environment:** Mainnet  
**URL:** `https://<project>.vercel.app` or custom domain

```bash
# Environment variables
VITE_PROGRAM_ID=<mainnet-program-id>
VITE_NETWORK=mainnet-beta
VITE_ENABLE_ANALYTICS=true
```

---

## 📈 Analytics & Monitoring

### Vercel Analytics (Free)

**Automatically tracks:**
- Page views
- User sessions
- Geographic distribution
- Device types
- Performance metrics

**Enable:**
1. Project Settings → Analytics
2. Toggle "Enable Vercel Analytics"
3. View real-time data in dashboard

### Web Vitals

**Tracks:**
- Largest Contentful Paint (LCP)
- First Input Delay (FID)
- Cumulative Layout Shift (CLS)

**View:**
- Vercel Dashboard → Speed Insights
- See performance scores
- Identify slow pages

### Custom Analytics

**Add Google Analytics:**

```javascript
// In index.html or App.jsx
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

---

## 🔐 Security Best Practices

### Environment Variables

**✅ Safe to Expose:**
- Program ID (public on blockchain)
- Network (Devnet/Mainnet)
- RPC endpoint (public)

**❌ Never Expose:**
- Private keys
- Wallet seeds
- API secrets (if any)
- Admin credentials

### HTTPS

- Vercel provides automatic HTTPS ✅
- All connections encrypted
- SSL certificates auto-renewed
- HTTP automatically redirects to HTTPS

### Content Security Policy

Add to `vercel.json`:
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.devnet.solana.com https://api.mainnet-beta.solana.com;"
        }
      ]
    }
  ]
}
```

---

## 📱 Mobile Optimization

### Responsive Design

**Already implemented:**
- Mobile-first CSS
- Responsive grid layouts
- Touch-optimized buttons
- Mobile-friendly modals
- Adaptive text sizes

### Testing

**Test on:**
- iPhone (Safari)
- Android (Chrome)
- iPad (Safari)
- Various screen sizes

**Tools:**
- Chrome DevTools (Device Mode)
- BrowserStack
- Real devices

### Performance

**Optimizations:**
- Image lazy loading
- Code splitting
- Minified bundles
- Gzip compression (Vercel automatic)

---

## 🧪 Testing Workflow

### Local Testing

```bash
# Development server
npm run dev

# Build and preview
npm run build
npm run preview
```

### Preview Deployments

```bash
# Deploy preview
vercel

# Get preview URL
# Test on preview before production
```

### Production Testing

```bash
# Deploy to production
vercel --prod

# Test live URL
# Verify all features
# Check analytics
```

---

## 🚀 Quick Deployment Commands

### First Time Setup

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
cd frontend
vercel
```

### Regular Updates

```bash
# Quick deploy to production
cd frontend
vercel --prod

# Or push to main branch
git push origin main
# Automatic deployment via GitHub
```

### Emergency Rollback

```bash
# Via Vercel Dashboard:
# Deployments → Find previous deployment → Promote to Production

# Via CLI:
vercel rollback
```

---

## ✅ Deployment Checklist

### Before Deployment

- [ ] Code committed to Git
- [ ] `npm run build` succeeds locally
- [ ] Environment variables documented
- [ ] `.env.example` updated
- [ ] Configuration files created
- [ ] README updated

### During Deployment

- [ ] Vercel project configured
- [ ] Environment variables set
- [ ] Build settings verified
- [ ] Root directory correct
- [ ] Framework preset: Vite

### After Deployment

- [ ] Build logs show success
- [ ] Application loads without errors
- [ ] Wallet connection works
- [ ] Environment variables correct
- [ ] Mobile responsive
- [ ] All features tested
- [ ] Analytics enabled
- [ ] Custom domain configured (if applicable)

---

## 📞 Support & Resources

### Vercel Documentation

- Main docs: https://vercel.com/docs
- Vite deployment: https://vercel.com/docs/frameworks/vite
- Environment variables: https://vercel.com/docs/environment-variables

### Community

- Vercel Discord: https://vercel.com/discord
- GitHub Discussions: https://github.com/vercel/vercel/discussions

### Project Resources

- Frontend README: `frontend/README.md`
- Main README: `README.md`
- Troubleshooting: `TROUBLESHOOTING.md`

---

**Last Updated:** February 4, 2026  
**Version:** 2.0  
**Status:** Production Ready ✅
