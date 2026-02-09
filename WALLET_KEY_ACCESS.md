# 🔑 How to Access Your Solana CLI Wallet Keys

**Wallet Address:** `95DmM5xt695F18s7ouhRHf9wETgyUKxWYWa9z5gma6YG`  
**Keypair File:** `C:\Users\vclin_jjufoql\.config\solana\deployer.json`

---

## 📋 **Access Methods**

### **Method 1: View Seed Phrase**

The seed phrase was shown when you created the wallet. If you didn't save it, you can recover it from the keypair file:

```powershell
# Display the seed phrase (KEEP THIS SECRET!)
solana-keygen grind --starts-with x:1 --ignore-case
```

**Better method - Use a tool to convert the keypair:**

```powershell
# Install the tool
npm install -g @solana/web3.js

# Then use Node.js to read the keypair
node -e "const fs = require('fs'); const keypair = JSON.parse(fs.readFileSync('C:\\Users\\vclin_jjufoql\\.config\\solana\\deployer.json')); console.log('Private Key (base58):', require('@solana/web3.js').Keypair.fromSecretKey(Uint8Array.from(keypair)).secretKey.toString());"
```

---

### **Method 2: View Private Key (Raw)**

The `deployer.json` file IS your private key in JSON format:

```powershell
# View the keypair file
type C:\Users\vclin_jjufoql\.config\solana\deployer.json
```

This shows an array of numbers - that's your private key.

---

### **Method 3: Import to Phantom/Solflare**

**To import this wallet into Phantom:**

1. Open Phantom
2. Click "Add/Connect Wallet"
3. Select "Import Private Key"
4. You'll need to convert the JSON keypair to base58 format

**Conversion script:**

```javascript
// Save this as convert-key.js
const fs = require('fs');
const { Keypair } = require('@solana/web3.js');
const bs58 = require('bs58');

const keypairFile = 'C:\\Users\\vclin_jjufoql\\.config\\solana\\deployer.json';
const keypairData = JSON.parse(fs.readFileSync(keypairFile));
const keypair = Keypair.fromSecretKey(Uint8Array.from(keypairData));
const privateKeyBase58 = bs58.encode(keypair.secretKey);

console.log('Base58 Private Key (for Phantom):');
console.log(privateKeyBase58);
```

Run it:
```powershell
node convert-key.js
```

---

### **Method 4: Backup Your Wallet**

**IMPORTANT:** Back up your keypair file!

```powershell
# Copy to a safe location
copy C:\Users\vclin_jjufoql\.config\solana\deployer.json C:\Users\vclin_jjufoql\Desktop\deployer-backup.json

# Or copy to a USB drive
copy C:\Users\vclin_jjufoql\.config\solana\deployer.json E:\deployer-backup.json
```

**⚠️ CRITICAL:** This file = your money. Keep it safe!

---

## 💰 **Next Step: Fund This Wallet**

You need to send 0.5 SOL to this address:

**Address:** `95DmM5xt695F18s7ouhRHf9wETgyUKxWYWa9z5gma6YG`

**Options:**

### **Option A: From Playground Wallet**
1. Open Solana Playground
2. Click wallet → Send
3. Send 0.5 SOL to `95DmM5xt695F18s7ouhRHf9wETgyUKxWYWa9z5gma6YG`

### **Option B: From Phantom**
1. Open Phantom
2. Click Send
3. Paste address: `95DmM5xt695F18s7ouhRHf9wETgyUKxWYWa9z5gma6YG`
4. Amount: 0.5 SOL
5. Confirm

### **Option C: From Exchange**
1. Withdraw 0.5 SOL from Coinbase/Binance/etc.
2. To address: `95DmM5xt695F18s7ouhRHf9wETgyUKxWYWa9z5gma6YG`

---

## ✅ **After Funding**

Check the balance:

```powershell
solana balance
```

Should show: `0.5 SOL`

Then you're ready to deploy! 🚀

---

## 🔐 **Security Best Practices**

1. **Never share the keypair file**
2. **Never share the private key**
3. **Never share the seed phrase**
4. **Back up the keypair file to multiple safe locations**
5. **Consider using a hardware wallet for large amounts**

---

## 📝 **Summary**

✅ **Wallet Created:** `95DmM5xt695F18s7ouhRHf9wETgyUKxWYWa9z5gma6YG`  
✅ **Keypair File:** `C:\Users\vclin_jjufoql\.config\solana\deployer.json`  
✅ **You have full control** - Can import to any Solana wallet  
⏳ **Next:** Fund with 0.5 SOL  
🚀 **Then:** Deploy your program!

---

**The keypair file (`deployer.json`) is your wallet. As long as you have this file, you can:**
- Access your funds from any computer
- Import to Phantom, Solflare, Ledger
- Use with Solana CLI anywhere
- Recover your wallet anytime

**It's like having the master key to your vault!** 🔑
