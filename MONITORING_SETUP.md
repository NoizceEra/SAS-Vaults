# 🔍 Monitoring Infrastructure Setup Guide

**Created:** February 7, 2026  
**Status:** Ready for deployment  
**Purpose:** Real-time monitoring of mainnet deployment

---

## ⚠️ CRITICAL WARNINGS

**BEFORE YOU DEPLOY TO MAINNET:**

This monitoring system will help you **detect problems** but **CANNOT prevent them**. You are deploying:
- ❌ **Incomplete Jupiter integration** (swaps won't work)
- ❌ **No security audit** (unknown vulnerabilities)
- ❌ **Limited testing** (unknown edge cases)

**UNDERSTAND THE RISKS:**
- 💸 You could lose all deposited funds
- 🔒 Hackers could exploit vulnerabilities
- ⚖️ You face legal liability for user losses
- 📉 Project reputation could be permanently damaged

**Monitoring shows you the fire AFTER your house is burning.**

---

## 📦 What You Get

### 1. Real-Time Transaction Monitor (`monitor-mainnet.js`)
- Monitors all program transactions in real-time
- Tracks success/failure rates
- Alerts on transaction failures
- Parses transaction logs for events
- Sends Discord and Telegram notifications

### 2. Health Check Script (`health-check.js`)
- Comprehensive system health verification
- Checks program deployment
- Validates treasury initialization
- Monitors balance and activity
- Verifies RPC connection

### 3. Error Logging System
- Automatic error logging to `logs/mainnet-errors.log`
- Timestamped error records
- Detailed transaction signatures and error messages

---

## 🚀 Quick Setup (15 minutes)

### Step 1: Install Dependencies

```bash
cd scripts
npm install node-fetch
```

### Step 2: Set Up Discord Webhook (Optional but Recommended)

1. Go to your Discord server settings
2. Navigate to "Integrations" → "Webhooks"
3. Click "New Webhook"
4. Name it "Slice Monitor"
5. Choose a channel (create #slice-alerts)
6. Copy the webhook URL

### Step 3: Set Up Telegram Bot (Optional)

1. Message @BotFather on Telegram
2. Send `/newbot` and follow prompts
3. Copy your bot token
4. Start a chat with your bot
5. Send any message
6. Visit: `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
7. Find your `chat.id` in the response

### Step 4: Create Environment File

Create `scripts/.env`:

```bash
# Your mainnet program ID
PROGRAM_ID=YOUR_MAINNET_PROGRAM_ID_HERE

# RPC endpoint (use a premium provider for production)
RPC_URL=https://api.mainnet-beta.solana.com

# Discord webhook (optional but recommended)
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/YOUR_WEBHOOK_HERE

# Telegram alerts (optional)
TELEGRAM_BOT_TOKEN=YOUR_BOT_TOKEN_HERE
TELEGRAM_CHAT_ID=YOUR_CHAT_ID_HERE
```

### Step 5: Update Package.json with Scripts

```bash
# Add to scripts/package.json under "scripts":
{
  "monitor": "node monitor-mainnet.js",
  "health": "node health-check.js"
}
```

---

## 🎯 Usage

### Run Health Check (Before Deployment)

```bash
# Set your environment variables first
$env:PROGRAM_ID = "YOUR_MAINNET_PROGRAM_ID"
$env:RPC_URL = "https://api.mainnet-beta.solana.com"

# Run health check
node scripts/health-check.js
```

**Expected Output:**
```
✅ Program Deployed
✅ Treasury Config Initialized
✅ Treasury Vault Exists
✅ Treasury Funded
✅ RPC Connection
✅ RPC Block Time
...
All health checks passed! System is healthy.
```

### Start Real-Time Monitoring (After Deployment)

```bash
# Start the monitor
node scripts/monitor-mainnet.js
```

**Expected Output:**
```
🚀 Mainnet Monitor Starting...
Program ID: YOUR_PROGRAM_ID
RPC URL: https://api.mainnet-beta.solana.com
Check Interval: 30 seconds
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Monitor initialized successfully!
🔄 Starting monitoring loop...

💰 Treasury Balance: 1.2345 SOL
✅ Monitor is running! Press Ctrl+C to stop.
```

---

## 🌐 RPC Provider Setup (CRITICAL FOR PRODUCTION)

**DO NOT use public RPC for production!** You'll hit rate limits quickly.

### Recommended Providers:

#### 1. Helius (Recommended) ⭐
- **Cost:** $50-99/month
- **Features:** 
  - Webhooks for instant alerts
  - Transaction history API
  - Enhanced RPC methods
  - 99.9% uptime SLA

**Setup:**
1. Sign up: https://helius.dev/
2. Create API key
3. Use: `https://mainnet.helius-rpc.com/?api-key=YOUR_KEY`

#### 2. QuickNode
- **Cost:** $49-299/month
- **Features:**
  - Global load balancing
  - Archive node access
  - Dedicated nodes

**Setup:**
1. Sign up: https://quicknode.com/
2. Create Solana endpoint
3. Use provided HTTP endpoint

#### 3. Triton One
- **Cost:** Free tier available, $99+/month
- **Features:**
  - High performance
  - Dedicated capacity
  - Transaction streaming

**Setup:**
1. Sign up: https://triton.one/
2. Create RPC endpoint
3. Use provided URL

### Update Your Environment:
```bash
# Use your RPC provider URL
$env:RPC_URL = "https://mainnet.helius-rpc.com/?api-key=YOUR_KEY"
```

---

## 🔔 Alert System

### What Triggers Alerts:

#### 🚨 Critical Alerts
- Transaction failures
- High error rate (>10%)
- Treasury balance below threshold
- Monitor errors/crashes

#### ⚠️ Warning Alerts
- Low treasury balance (<1 SOL)
- Elevated error rate (5-10%)
- No recent activity (>24 hours)

#### ✅ Info Alerts
- Monitor started/stopped
- Daily summary reports

### Alert Channels:

1. **Console Output** - Always on
2. **Discord** - If webhook configured
3. **Telegram** - If bot configured
4. **Log Files** - All errors saved to disk

---

## 📊 Monitoring Features

### Real-Time Metrics:
- ✅ Transaction success/failure count
- 💰 Treasury balance tracking
- 📈 Success rate percentage
- ⏱️ System uptime
- 🔄 Transaction volume

### Transaction Parsing:
- 💰 Deposit amounts
- 💸 Withdrawal amounts
- 🔄 Swap amounts
- 💵 Fee collection

### Error Tracking:
- Automatic error logging
- Transaction signatures
- Error messages and codes
- Timestamp recording

---

## 🐛 Troubleshooting

### Monitor Not Starting:

**Error: "Cannot find module 'node-fetch'"**
```bash
cd scripts
npm install node-fetch
```

**Error: "Invalid Program ID"**
```bash
# Verify your program ID is set correctly
$env:PROGRAM_ID
# Should output your mainnet program ID
```

**Error: "Connection refused"**
```bash
# Check RPC endpoint
$env:RPC_URL
# Try public endpoint for testing:
$env:RPC_URL = "https://api.mainnet-beta.solana.com"
```

### No Transactions Appearing:

1. Verify program ID is correct
2. Check if program has been deployed
3. Ensure transactions are actually happening
4. Try increasing CHECK_INTERVAL in monitor script

### Discord Webhook Not Working:

1. Verify webhook URL is correct
2. Check channel permissions
3. Test webhook manually:
```bash
curl -X POST $env:DISCORD_WEBHOOK_URL `
  -H "Content-Type: application/json" `
  -d '{"content": "Test message"}'
```

---

## 🚀 Production Deployment Checklist

### Before You Deploy:

- [ ] RPC provider configured (Helius/QuickNode/Triton)
- [ ] Discord webhook set up
- [ ] Telegram bot configured
- [ ] Environment variables set
- [ ] Health check passes
- [ ] Monitor script tested on devnet
- [ ] Emergency procedures documented
- [ ] Team notified and ready

### During Deployment:

1. Run health check BEFORE deploying
2. Start monitor IMMEDIATELY after deployment
3. Watch monitor for first 30 minutes continuously
4. Test with small amounts first
5. Monitor Discord/Telegram for alerts

### After Deployment:

- [ ] Monitor running 24/7
- [ ] Daily health checks scheduled
- [ ] Error logs reviewed daily
- [ ] Treasury balance checked
- [ ] Transaction success rate reviewed
- [ ] Team on-call for first week

---

## ⚡ Running in Production

### Keep Monitor Running (Windows):

**Option 1: PowerShell Background Job**
```powershell
# Start monitor in background
Start-Job -ScriptBlock {
    $env:PROGRAM_ID = "YOUR_PROGRAM_ID"
    $env:RPC_URL = "YOUR_RPC_URL"
    node C:\Users\vclin_jjufoql\Documents\SAS\scripts\monitor-mainnet.js
}

# Check status
Get-Job

# View output
Receive-Job -Id 1 -Keep
```

**Option 2: Run on Server (Recommended)**

Use a VPS or cloud server to run monitor 24/7:

1. **AWS EC2** - t2.micro ($8-10/month)
2. **DigitalOcean Droplet** - Basic ($6/month)
3. **Linode** - Nanode 1GB ($5/month)
4. **Dedicated Windows Server** - Keep your PC running

**Setup on Linux Server:**
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone your repo
git clone YOUR_REPO_URL
cd SAS/scripts
npm install

# Install PM2 for process management
sudo npm install -g pm2

# Start monitor
pm2 start monitor-mainnet.js --name slice-monitor

# Set to restart on reboot
pm2 startup
pm2 save

# View logs
pm2 logs slice-monitor
```

---

## 📈 Monitoring Dashboard (Optional)

For a visual dashboard, consider:

### Grafana + Prometheus Setup:
1. Export metrics from monitor script
2. Set up Prometheus to scrape metrics
3. Create Grafana dashboards
4. **Cost:** Free, ~$20/month for hosting

### Pre-built Solutions:
- **Solana Beach** - Free, basic monitoring
- **Helius Dashboard** - Included with RPC subscription
- **QuickNode Analytics** - Included with subscription

---

## 💰 Monthly Costs for Production Monitoring

| Item | Cost |
|------|------|
| RPC Provider (Helius/QuickNode) | $50-99 |
| VPS for Monitor | $5-10 |
| Discord (Free) | $0 |
| Telegram (Free) | $0 |
| **Total** | **$55-109/month** |

**Optional Add-ons:**
- Grafana Cloud: $0-50/month
- Additional alerting (PagerDuty): $21/month
- Backup RPC provider: $50+/month

---

## 🚨 FINAL WARNING - READ THIS CAREFULLY

### What Monitoring CAN Do:
✅ Alert you when transactions fail  
✅ Track treasury balance  
✅ Log all errors for debugging  
✅ Send notifications to your team  
✅ Provide transaction history  

### What Monitoring CANNOT Do:
❌ Prevent security exploits  
❌ Fix bugs in your code  
❌ Protect user funds  
❌ Stop hackers from attacking  
❌ Make incomplete features work  
❌ Reduce legal liability  

### The Truth:
**Monitoring is a REACTIVE tool, not a PREVENTIVE one.**

You are about to deploy:
- Incomplete code (Jupiter swaps won't work)
- Unaudited smart contract (unknown vulnerabilities)
- Minimally tested system (unknown edge cases)

**This is like installing smoke detectors in a house made of gasoline-soaked wood and then lighting a match.**

The monitors will tell you the house is burning, but they won't stop it from happening.

---

## 🤔 Seriously, Should You Deploy Now?

### If You Absolutely Must Deploy NOW:

**Mitigation Strategies (won't prevent all issues, but might help):**

1. **Start with TVL Cap**
   - Limit total deposits to $1,000 initially
   - Gradually increase as confidence builds
   - Implement deposit limits per user

2. **Beta Testing Period**
   - Invite only trusted testers initially
   - Require sign-off on risk disclosure
   - Monitor VERY closely for first week

3. **Emergency Kill Switch**
   - Implement pause functionality
   - Keep upgrade authority secure
   - Document emergency procedures

4. **Disable Incomplete Features**
   - Comment out swap functionality entirely
   - Only allow deposits and withdrawals
   - Add swaps after Jupiter integration complete

5. **Clear User Warnings**
   - Big red banner: "BETA - Use at your own risk"
   - Require checkbox acknowledgment
   - Display all known limitations

### Better Alternative: Delay 8 Weeks

**Do this instead:**
1. Complete Jupiter integration (1-2 weeks)
2. Get security audit (2-4 weeks)
3. Extended testing (2-3 weeks)
4. Launch safely with confidence

**The difference:**
- NOW: High risk, incomplete product, potential disaster
- 8 WEEKS: Low risk, complete product, successful launch

**Your reputation is worth the wait.**

---

## 📚 Resources

### Monitoring Tools:
- **Solscan**: https://solscan.io/ - Transaction explorer
- **Solana Beach**: https://solanabeach.io/ - Network stats
- **Helius**: https://helius.dev/ - Enhanced RPC + webhooks

### Security:
- **OtterSec**: https://osec.io/ - Security audits
- **Neodyme**: https://neodyme.io/ - Smart contract audits
- **Immunefi**: https://immunefi.com/ - Bug bounty platform

### Support:
- **Solana Discord**: https://discord.gg/solana
- **Anchor Discord**: https://discord.gg/anchor
- **Jupiter Discord**: https://discord.gg/jup

---

## ✅ Quick Start Summary

```powershell
# 1. Install dependencies
cd scripts
npm install node-fetch

# 2. Set environment variables
$env:PROGRAM_ID = "YOUR_MAINNET_PROGRAM_ID"
$env:RPC_URL = "https://mainnet.helius-rpc.com/?api-key=YOUR_KEY"
$env:DISCORD_WEBHOOK_URL = "YOUR_WEBHOOK_URL"

# 3. Run health check
node health-check.js

# 4. Start monitoring
node monitor-mainnet.js
```

---

## 🆘 Emergency Contacts

**If something goes wrong:**

1. **Stop Monitor**: Ctrl+C
2. **Check Logs**: `logs/mainnet-errors.log`
3. **Discord Alert**: Check #slice-alerts channel
4. **Review Explorer**: https://solscan.io/account/YOUR_PROGRAM_ID
5. **Get Help**: Solana Discord #developer-support

---

**Last Updated:** February 7, 2026  
**Monitoring Scripts Created By:** Development Team  
**Status:** Production Ready (Scripts Only - NOT the smart contract!)

**Remember:** Good monitoring doesn't fix bad code. It just lets you know when bad code breaks. 🔥
