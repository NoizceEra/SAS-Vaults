# 🚨 MONITORING QUICK REFERENCE

## Setup (One Time)
```powershell
cd scripts
npm install node-fetch
```

## Environment Variables
```powershell
$env:PROGRAM_ID = "YOUR_MAINNET_PROGRAM_ID"
$env:RPC_URL = "https://mainnet.helius-rpc.com/?api-key=YOUR_KEY"
$env:DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/..."
$env:TELEGRAM_BOT_TOKEN = "YOUR_BOT_TOKEN"
$env:TELEGRAM_CHAT_ID = "YOUR_CHAT_ID"
```

## Daily Commands
```powershell
# Health Check
node scripts/health-check.js

# Start Monitor
node scripts/monitor-mainnet.js

# View Logs
cat logs/mainnet-errors.log
```

## Emergency Procedures

### Transaction Failures Spike
1. Check `logs/mainnet-errors.log`
2. Review recent code changes
3. Check Solscan for details
4. Consider pausing deposits

### Treasury Balance Low
1. Check for unexpected withdrawals
2. Review fee collection
3. Add funds if legitimate
4. Investigate if suspicious

### Monitor Crashes
1. Check error message
2. Verify RPC endpoint
3. Check internet connection
4. Restart monitor

## Alert Severity

### 🔴 CRITICAL - Act Immediately
- Transaction failures
- High error rate (>10%)
- Exploit attempts
- Unauthorized treasury access

### 🟡 WARNING - Investigate Soon
- Low treasury balance
- Moderate error rate (5-10%)
- No activity for 24h
- RPC issues

### 🟢 INFO - Routine
- Monitor started/stopped
- Daily summaries
- Balance changes

## Key Metrics to Watch

| Metric | Good | Warning | Critical |
|--------|------|---------|----------|
| Success Rate | >95% | 90-95% | <90% |
| Treasury Balance | >5 SOL | 1-5 SOL | <1 SOL |
| Error Count/Hour | <5 | 5-20 | >20 |

## Explorer Links
- Program: https://solscan.io/account/[PROGRAM_ID]
- Treasury: https://solscan.io/account/[TREASURY_PDA]

## Support
- Solana Discord: #developer-support
- Audit Firm: [Contact]
- Emergency Team: [Contact]

---
**⚠️ Remember: Monitoring alerts you to problems, it doesn't prevent them!**
