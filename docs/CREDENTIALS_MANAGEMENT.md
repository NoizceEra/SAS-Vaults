# 🔐 Credentials Management Guide

**Last Updated:** February 6, 2026

---

## 📋 Overview

This guide explains how to securely manage credentials, API keys, and sensitive information for the Slice (SAS Protocol) project.

---

## 🔑 Adding Your Claude Pro Subscription

### Method 1: Environment Variables (Recommended)

1. **Create a `.credentials` file** in the project root:
   ```bash
   cp .credentials.template .credentials
   ```

2. **Add your Claude credentials:**
   ```bash
   # Open .credentials in your editor
   # Add these lines:
   CLAUDE_API_KEY=sk-ant-api03-...your-key-here
   CLAUDE_SUBSCRIPTION_TIER=pro
   CLAUDE_ACCOUNT_EMAIL=your.email@example.com
   ```

3. **Ensure `.credentials` is in `.gitignore`:**
   ```bash
   echo ".credentials" >> .gitignore
   ```

### Method 2: System Environment Variables

**Windows PowerShell:**
```powershell
# Set for current session
$env:CLAUDE_API_KEY = "sk-ant-api03-...your-key-here"
$env:CLAUDE_SUBSCRIPTION_TIER = "pro"

# Set permanently (user level)
[System.Environment]::SetEnvironmentVariable('CLAUDE_API_KEY', 'sk-ant-api03-...', 'User')
[System.Environment]::SetEnvironmentVariable('CLAUDE_SUBSCRIPTION_TIER', 'pro', 'User')
```

**Windows Command Prompt:**
```cmd
setx CLAUDE_API_KEY "sk-ant-api03-...your-key-here"
setx CLAUDE_SUBSCRIPTION_TIER "pro"
```

### Method 3: Project Configuration File

Create `config/credentials.json` (add to `.gitignore`):
```json
{
  "claude": {
    "apiKey": "sk-ant-api03-...your-key-here",
    "subscriptionTier": "pro",
    "accountEmail": "your.email@example.com"
  }
}
```

---

## 🌐 RPC Provider Setup

### Recommended: Helius (Best for Production)

1. **Sign up:** https://helius.dev/
2. **Get API key** from dashboard
3. **Add to configuration:**
   ```bash
   HELIUS_API_KEY=your_helius_api_key_here
   HELIUS_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_KEY
   ```

**Benefits:**
- 99.9% uptime SLA
- Dedicated support
- Enhanced APIs (webhooks, DAS API)
- Free tier: 100k credits/month

### Alternative: QuickNode

1. **Sign up:** https://quicknode.com/
2. **Create Solana endpoint**
3. **Add to configuration:**
   ```bash
   QUICKNODE_RPC_URL=https://your-endpoint.solana-mainnet.quiknode.pro/your-token/
   ```

### Alternative: Alchemy

1. **Sign up:** https://alchemy.com/
2. **Create Solana app**
3. **Add to configuration:**
   ```bash
   ALCHEMY_API_KEY=your_alchemy_api_key_here
   ALCHEMY_RPC_URL=https://solana-mainnet.g.alchemy.com/v2/YOUR_KEY
   ```

---

## 💼 Wallet Management

### Creating Secure Wallets

**For Mainnet Deployment (Use Hardware Wallet):**

1. **Get a hardware wallet:**
   - Ledger Nano X/S Plus (recommended)
   - Trezor Model T

2. **Set up with Solana:**
   ```bash
   # Install Solana app on Ledger
   # Connect via Phantom or Solflare
   ```

3. **Export public key only:**
   ```bash
   # Never export private key from hardware wallet
   solana-keygen pubkey usb://ledger
   ```

**For Development/Testing:**

```bash
# Create new wallet
solana-keygen new -o ~/.config/solana/devnet-wallet.json

# Get public key
solana-keygen pubkey ~/.config/solana/devnet-wallet.json

# Add to .credentials
DEVNET_WALLET_PUBLIC_KEY=<public_key_here>
```

### Wallet Security Best Practices

✅ **DO:**
- Use hardware wallets for mainnet
- Keep seed phrases offline and encrypted
- Use separate wallets for different purposes
- Enable 2FA on all wallet services
- Test with small amounts first

❌ **DON'T:**
- Store private keys in code
- Commit wallet files to git
- Share private keys via email/chat
- Use the same wallet for dev and prod
- Store unencrypted keys on cloud services

---

## 🚀 Vercel Configuration

### Getting Your Vercel Token

1. **Log in to Vercel:** https://vercel.com/
2. **Go to Settings → Tokens**
3. **Create new token:**
   - Name: "SAS Deployment"
   - Scope: Full Account
   - Expiration: 1 year

4. **Add to `.credentials`:**
   ```bash
   VERCEL_TOKEN=your_vercel_token_here
   ```

### Setting Environment Variables in Vercel

**Via CLI:**
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Set environment variables
vercel env add NEXT_PUBLIC_PROGRAM_ID production
vercel env add NEXT_PUBLIC_SOLANA_NETWORK production
```

**Via Dashboard:**
1. Go to project settings
2. Navigate to "Environment Variables"
3. Add variables for Production, Preview, Development

---

## 📊 Monitoring & Alerts Setup

### Discord Webhooks

1. **Create webhook in Discord:**
   - Server Settings → Integrations → Webhooks
   - Create webhook for each alert type

2. **Add to `.credentials`:**
   ```bash
   DISCORD_WEBHOOK_ERRORS=https://discord.com/api/webhooks/...
   DISCORD_WEBHOOK_TRANSACTIONS=https://discord.com/api/webhooks/...
   DISCORD_WEBHOOK_SECURITY=https://discord.com/api/webhooks/...
   ```

3. **Test webhook:**
   ```bash
   curl -X POST "YOUR_WEBHOOK_URL" \
     -H "Content-Type: application/json" \
     -d '{"content": "Test alert from SAS Protocol"}'
   ```

### Telegram Bot

1. **Create bot with BotFather:**
   - Message @BotFather on Telegram
   - Use `/newbot` command
   - Save the token

2. **Get your chat ID:**
   - Message your bot
   - Visit: `https://api.telegram.org/bot<TOKEN>/getUpdates`
   - Find your chat ID in the response

3. **Add to `.credentials`:**
   ```bash
   TELEGRAM_BOT_TOKEN=your_bot_token_here
   TELEGRAM_CHAT_ID=your_chat_id_here
   ```

---

## 🔒 Security Best Practices

### 1. Credential Storage

**Use a Password Manager:**
- 1Password (recommended)
- Bitwarden
- LastPass

**Store in secure vault:**
- All API keys
- Wallet seed phrases
- Private keys
- Service credentials

### 2. Access Control

**Principle of Least Privilege:**
- Only grant necessary permissions
- Use read-only keys where possible
- Separate dev/staging/prod credentials

**Team Access:**
- Use shared vaults for team credentials
- Implement role-based access
- Audit access logs regularly

### 3. Credential Rotation

**Regular Rotation Schedule:**
- API keys: Every 90 days
- Service tokens: Every 6 months
- Wallet keys: Never (unless compromised)

**Rotation Process:**
1. Generate new credential
2. Update in all systems
3. Test thoroughly
4. Revoke old credential
5. Document change

### 4. Monitoring

**Set up alerts for:**
- Unusual API usage
- Failed authentication attempts
- Wallet balance changes
- Unauthorized access attempts

**Regular audits:**
- Review active credentials monthly
- Check for unused credentials
- Verify access permissions
- Update documentation

---

## 📝 Credential Checklist

### Development Phase
- [ ] Claude Pro API key configured
- [ ] Devnet wallet created
- [ ] RPC endpoint configured (devnet)
- [ ] GitHub token for CI/CD
- [ ] Vercel token for deployments

### Pre-Mainnet
- [ ] Mainnet deployer wallet (hardware)
- [ ] Treasury authority wallet (hardware)
- [ ] Premium RPC provider (Helius/QuickNode)
- [ ] Monitoring webhooks configured
- [ ] Error tracking (Sentry) set up
- [ ] Analytics configured

### Mainnet Launch
- [ ] All credentials rotated
- [ ] Backup credentials stored securely
- [ ] Emergency contact list updated
- [ ] Team access documented
- [ ] Audit trail enabled

---

## 🆘 Emergency Procedures

### If Credentials Are Compromised

**Immediate Actions:**
1. **Revoke compromised credential** immediately
2. **Generate new credential**
3. **Update all systems**
4. **Audit access logs** for unauthorized use
5. **Notify team** and stakeholders

**For Wallet Compromise:**
1. **Transfer funds** to new wallet immediately
2. **Revoke all permissions** on compromised wallet
3. **Update program upgrade authority** if needed
4. **Investigate** how compromise occurred
5. **Document incident** for future prevention

### Emergency Contacts

Keep this information in your password manager:

- **Security Lead:** [Your security contact]
- **Audit Firm:** [Audit firm emergency contact]
- **Solana Foundation:** security@solana.foundation
- **Wallet Provider Support:** [Phantom/Solflare support]

---

## 📚 Additional Resources

- **Solana Security Best Practices:** https://docs.solana.com/developing/programming-model/security
- **Anchor Security:** https://www.anchor-lang.com/docs/security
- **OWASP API Security:** https://owasp.org/www-project-api-security/
- **Hardware Wallet Guide:** https://www.ledger.com/academy

---

## 🔄 Maintenance Schedule

| Task | Frequency | Owner |
|------|-----------|-------|
| Rotate API keys | Quarterly | DevOps |
| Audit access logs | Monthly | Security |
| Update documentation | As needed | Team Lead |
| Test backup procedures | Quarterly | DevOps |
| Review permissions | Monthly | Security |
| Credential inventory | Quarterly | Team Lead |

---

**Remember: Security is not a one-time task, it's an ongoing process!** 🔐
