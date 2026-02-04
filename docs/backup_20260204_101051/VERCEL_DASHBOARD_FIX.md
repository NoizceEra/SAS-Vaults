# 🔧 Vercel Dashboard Configuration - EXACT SETTINGS

## ⚠️ Important: Configure These Settings in Vercel Dashboard

Since your build is failing, you need to configure the build settings in the Vercel Dashboard.

---

## 📋 Step-by-Step Configuration

### **1. Go to Your Vercel Project**
- Visit https://vercel.com/dashboard
- Click on your project (solana-auto-savings or similar)
- Go to **Settings**

### **2. Configure Build & Development Settings**

Click on **"Build & Development Settings"** and enter these **EXACT** values:

#### **Framework Preset:**
```
Other
```
(Select "Other" from dropdown, NOT "Vite")

#### **Root Directory:**
```
frontend
```
⚠️ **IMPORTANT:** Click the "Edit" button next to Root Directory and type `frontend`

#### **Build Command:**
```
npm run build
```

#### **Output Directory:**
```
dist
```

#### **Install Command:**
```
npm install
```

---

### **3. Environment Variables**

Go to **Settings** → **Environment Variables** and add:

| Name | Value | Environment |
|------|-------|-------------|
| `VITE_NETWORK` | `devnet` | Production, Preview, Development |
| `VITE_PROGRAM_ID` | `11111111111111111111111111111111` | Production, Preview, Development |

Click **Save** after adding each variable.

---

### **4. Redeploy**

After saving settings:
1. Go to **Deployments** tab
2. Click the **three dots (...)** on the latest deployment
3. Click **Redeploy**
4. Wait 2-3 minutes

---

## ✅ Expected Build Output

You should see:
```
Running "npm install"...
✓ Installed dependencies

Running "npm run build"...
✓ building for production...
✓ built in ~10s

Build Completed
```

---

## 🐛 If Build Still Fails

### **Check package.json exists in frontend/**
```bash
# Verify this file exists:
frontend/package.json
```

### **Check node version**
In Vercel Dashboard → Settings → General:
- **Node.js Version:** 18.x (recommended)

### **Clear Build Cache**
In Vercel Dashboard:
1. Settings → General
2. Scroll to "Build & Development Settings"
3. Click "Clear Cache"
4. Redeploy

---

## 📸 Visual Guide

### **Root Directory Setting:**
```
┌─────────────────────────────────────┐
│ Root Directory                      │
│ ┌─────────────────────────────────┐ │
│ │ frontend                        │ │ ← Type this
│ └─────────────────────────────────┘ │
│ ☑ Include source files outside     │
│   of the Root Directory             │
└─────────────────────────────────────┘
```

### **Build Settings:**
```
┌─────────────────────────────────────┐
│ Framework Preset: Other             │
│                                     │
│ Build Command:                      │
│ ┌─────────────────────────────────┐ │
│ │ npm run build                   │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Output Directory:                   │
│ ┌─────────────────────────────────┐ │
│ │ dist                            │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Install Command:                    │
│ ┌─────────────────────────────────┐ │
│ │ npm install                     │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

---

## 🎯 Quick Checklist

Before redeploying, verify:

- [ ] Root Directory = `frontend`
- [ ] Framework Preset = `Other`
- [ ] Build Command = `npm run build`
- [ ] Output Directory = `dist`
- [ ] Install Command = `npm install`
- [ ] Environment variables added
- [ ] Build cache cleared (if needed)

---

## 🚀 Alternative: Deploy from CLI

If dashboard configuration doesn't work, try CLI with explicit settings:

```bash
# From project root
cd C:\Users\vclin_jjufoql\Documents\SAS

# Deploy with explicit directory
vercel --cwd frontend
```

Or create a `vercel.json` in the **frontend** directory:

```bash
# Create frontend/vercel.json
cd frontend
```

Then create `vercel.json` with:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

Then deploy:
```bash
vercel --prod
```

---

## 📞 Still Having Issues?

### **Option 1: Use Vercel's Auto-Detection**
1. Delete all custom build settings
2. Let Vercel auto-detect (it should find Vite)
3. Just set Root Directory to `frontend`

### **Option 2: Move Files**
If all else fails, you can move frontend files to root:
```bash
# NOT RECOMMENDED, but works
mv frontend/* .
```

---

## ✅ Success Indicators

Build is successful when you see:
```
✓ Build Completed
✓ Deployment Ready
```

And your site loads at:
```
https://your-project.vercel.app
```

---

**Most Common Fix:** Just set **Root Directory** to `frontend` in the dashboard!

---

**Last Updated:** 2026-02-01  
**Status:** Configuration guide for Vercel Dashboard
