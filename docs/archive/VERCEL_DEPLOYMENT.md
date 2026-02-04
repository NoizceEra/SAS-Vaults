# 🚀 Vercel Deployment Guide

## ✅ Pre-Deployment Checklist

### Local Checks Completed

- [x] **Dependencies Installed** - All npm packages installed successfully
- [x] **Build Test Passed** - `npm run build` completed without errors
- [x] **Vercel Config Updated** - `vercel.json` configured for Vite
- [x] **Environment Variables** - `.env.example` and `.env.local` created
- [x] **Program ID Verified** - Matches deployed program: `8hoCkMSWSvSt9oCokRKsKx8wqvVSWjGNnZTuvRFYhDMR`

### Build Output

```
✓ Build completed successfully
✓ Output directory: dist/
✓ Bundle size: 816.94 kB (238.25 kB gzipped)
```

**Note:** Large bundle size is normal for Solana apps due to wallet adapter dependencies.

---

## 📋 Deployment Steps

### Option 1: Deploy via Vercel CLI (Recommended)

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

4. **Deploy to Vercel**:
   ```bash
   vercel
   ```
   
   For production deployment:
   ```bash
   vercel --prod
   ```

5. **Set Environment Variables** (if not using .env):
   ```bash
   vercel env add VITE_PROGRAM_ID
   # Enter: 8hoCkMSWSvSt9oCokRKsKx8wqvVSWjGNnZTuvRFYhDMR
   
   vercel env add VITE_NETWORK
   # Enter: devnet
   ```

---

### Option 2: Deploy via Vercel Dashboard

1. **Go to [vercel.com](https://vercel.com)** and sign in

2. **Import Project**:
   - Click "Add New" → "Project"
   - Import your Git repository (GitHub/GitLab/Bitbucket)
   - Select the `frontend` folder as the root directory

3. **Configure Build Settings**:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

4. **Add Environment Variables**:
   - Go to Project Settings → Environment Variables
   - Add the following:
     ```
     VITE_PROGRAM_ID = 8hoCkMSWSvSt9oCokRKsKx8wqvVSWjGNnZTuvRFYhDMR
     VITE_NETWORK = devnet
     ```

5. **Deploy**:
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live at `your-project.vercel.app`

---

## 🔧 Configuration Files

### vercel.json
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
  ]
}
```

### Environment Variables

**Required:**
- `VITE_PROGRAM_ID` - Your deployed Solana program ID
- `VITE_NETWORK` - Network (devnet/mainnet)

**Optional:**
- `VITE_RPC_ENDPOINT` - Custom RPC endpoint

---

## 🧪 Post-Deployment Verification

After deployment, verify:

1. **Check Build Logs**:
   - Ensure build completed successfully
   - Check for any warnings or errors

2. **Test Application**:
   - Visit your Vercel URL
   - Connect wallet (Phantom, etc.)
   - Test wallet connection
   - Verify Program ID is correct in browser console

3. **Check Environment Variables**:
   ```javascript
   // In browser console
   console.log(import.meta.env.VITE_PROGRAM_ID)
   // Should output: 8hoCkMSWSvSt9oCokRKsKx8wqvVSWjGNnZTuvRFYhDMR
   ```

4. **Test Core Functions**:
   - [ ] Wallet connection works
   - [ ] Initialize user account
   - [ ] View account balance
   - [ ] Deposit functionality
   - [ ] Withdraw functionality

---

## 🔍 Troubleshooting

### Build Fails

**Error: "Cannot find module"**
- Solution: Ensure all dependencies are in `package.json`
- Run `npm install` locally to verify

**Error: "Environment variable not found"**
- Solution: Add environment variables in Vercel dashboard
- Ensure variables start with `VITE_` prefix

### Runtime Errors

**Error: "Program ID mismatch"**
- Solution: Verify `VITE_PROGRAM_ID` in Vercel environment variables
- Check browser console for actual value

**Error: "Wallet connection failed"**
- Solution: Ensure wallet adapter is properly configured
- Check network (devnet/mainnet) matches your program

**Error: "IDL not found"**
- Solution: Ensure `src/idl/auto_savings.json` exists
- Verify IDL matches your deployed program

### Performance Issues

**Large Bundle Size:**
- This is normal for Solana apps (~800KB)
- Consider code splitting for future optimization
- Current size is acceptable for MVP

---

## 📊 Deployment Checklist

### Before Deployment

- [ ] All local tests pass
- [ ] Build completes without errors
- [ ] Environment variables documented
- [ ] Program ID verified
- [ ] IDL file is up to date
- [ ] `.gitignore` includes build artifacts

### During Deployment

- [ ] Vercel project created/configured
- [ ] Environment variables set
- [ ] Build command verified
- [ ] Output directory set to `dist`
- [ ] Framework preset: Vite

### After Deployment

- [ ] Build logs show success
- [ ] Application loads without errors
- [ ] Wallet connection works
- [ ] Program ID is correct
- [ ] Core functions tested
- [ ] Mobile responsiveness checked

---

## 🔄 Continuous Deployment

### GitHub Integration

If you connect your GitHub repository:

1. **Automatic Deployments**:
   - Every push to `main` branch → Production
   - Every push to other branches → Preview deployment

2. **Pull Request Previews**:
   - Each PR gets its own preview URL
   - Test changes before merging

3. **Deployment Hooks**:
   - Configure webhooks if needed
   - Set up notifications

---

## 🌐 Custom Domain (Optional)

1. **Add Domain in Vercel**:
   - Go to Project Settings → Domains
   - Add your custom domain
   - Follow DNS configuration instructions

2. **SSL Certificate**:
   - Vercel automatically provisions SSL
   - HTTPS enabled by default

---

## 📝 Environment-Specific Deployments

### Development
- **Branch:** `develop` or `dev`
- **Environment:** `VITE_NETWORK=devnet`
- **URL:** `your-project-dev.vercel.app`

### Staging
- **Branch:** `staging`
- **Environment:** `VITE_NETWORK=devnet`
- **URL:** `your-project-staging.vercel.app`

### Production
- **Branch:** `main` or `master`
- **Environment:** `VITE_NETWORK=mainnet` (when ready)
- **URL:** `your-project.vercel.app` or custom domain

---

## 🚨 Important Notes

### Security

- ✅ Never commit `.env.local` files
- ✅ Use Vercel environment variables for secrets
- ✅ Program ID is public (safe to expose)
- ✅ Wallet private keys never leave the wallet

### Performance

- Bundle size is large but acceptable for MVP
- Consider lazy loading for future optimization
- Vercel CDN handles static assets efficiently

### Network Configuration

- **Current:** Devnet (for testing)
- **Future:** Mainnet (when ready for production)
- Update `VITE_NETWORK` environment variable accordingly

---

## 📞 Support

### Vercel Documentation
- [Vercel Docs](https://vercel.com/docs)
- [Vite Deployment](https://vercel.com/docs/frameworks/vite)

### Solana Resources
- [Solana Web3.js Docs](https://solana-labs.github.io/solana-web3.js/)
- [Anchor Documentation](https://www.anchor-lang.com/)

---

## ✅ Quick Deploy Command

```bash
# One-line deployment (after initial setup)
cd frontend && vercel --prod
```

---

**Last Updated:** January 24, 2026  
**Status:** Ready for Deployment ✅
