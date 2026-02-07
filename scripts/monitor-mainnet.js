/**
 * 🔍 Mainnet Monitoring Script
 * 
 * Real-time monitoring of your Solana Auto-Savings Protocol on mainnet
 * 
 * Features:
 * - Real-time transaction monitoring
 * - Treasury balance tracking
 * - Failed transaction alerts
 * - Discord/Telegram webhook integration
 * - Error logging and notifications
 * 
 * Usage:
 *   node scripts/monitor-mainnet.js
 * 
 * Environment Variables Required:
 *   PROGRAM_ID - Your mainnet program ID
 *   DISCORD_WEBHOOK_URL - (Optional) Discord webhook for alerts
 *   TELEGRAM_BOT_TOKEN - (Optional) Telegram bot token
 *   TELEGRAM_CHAT_ID - (Optional) Telegram chat ID
 *   RPC_URL - (Optional) Custom RPC endpoint
 */

const { Connection, PublicKey, clusterApiUrl } = require('@solana/web3.js');
const fs = require('fs');
const path = require('path');

// Configuration
const PROGRAM_ID = new PublicKey(process.env.PROGRAM_ID || '8AZGuEtnmaqT97sMeF2zUAnv5J89iXCBVPnxw5fULzoS');
const RPC_URL = process.env.RPC_URL || clusterApiUrl('devnet');
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const CHECK_INTERVAL = 30000; // 30 seconds

// State tracking
let lastSignature = null;
let treasuryBalance = 0;
let errorCount = 0;
let successCount = 0;
let startTime = Date.now();

// Alert thresholds
const TREASURY_LOW_THRESHOLD = 1 * 1e9; // 1 SOL in lamports
const ERROR_RATE_THRESHOLD = 0.1; // 10% error rate
const CONSECUTIVE_ERRORS_THRESHOLD = 5;

const connection = new Connection(RPC_URL, 'confirmed');

console.log('🚀 Mainnet Monitor Starting...');
console.log('━'.repeat(60));
console.log('Program ID:', PROGRAM_ID.toString());
console.log('RPC URL:', RPC_URL);
console.log('Check Interval:', CHECK_INTERVAL / 1000, 'seconds');
console.log('━'.repeat(60));

// Derive PDAs
const [treasuryConfig] = PublicKey.findProgramAddressSync(
    [Buffer.from('treasury')],
    PROGRAM_ID
);

const [treasuryVault] = PublicKey.findProgramAddressSync(
    [Buffer.from('treasury_vault')],
    PROGRAM_ID
);

console.log('Treasury Config PDA:', treasuryConfig.toString());
console.log('Treasury Vault PDA:', treasuryVault.toString());
console.log('━'.repeat(60));

// Send Discord alert
async function sendDiscordAlert(title, message, color = 0xFF0000) {
    if (!DISCORD_WEBHOOK_URL) return;

    try {
        const response = await fetch(DISCORD_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                embeds: [{
                    title: `🚨 ${title}`,
                    description: message,
                    color: color,
                    timestamp: new Date().toISOString(),
                    footer: { text: 'Slice Protocol Monitor' }
                }]
            })
        });

        if (!response.ok) {
            console.error('Discord webhook failed:', await response.text());
        }
    } catch (error) {
        console.error('Error sending Discord alert:', error);
    }
}

// Send Telegram alert
async function sendTelegramAlert(message) {
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return;

    try {
        const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: `🚨 *Slice Protocol Alert*\n\n${message}`,
                parse_mode: 'Markdown'
            })
        });

        if (!response.ok) {
            console.error('Telegram alert failed:', await response.text());
        }
    } catch (error) {
        console.error('Error sending Telegram alert:', error);
    }
}

// Send alerts to all configured channels
async function sendAlert(title, message, severity = 'error') {
    const timestamp = new Date().toISOString();
    console.log(`\n[${timestamp}] 🚨 ALERT: ${title}`);
    console.log(message);

    const color = severity === 'error' ? 0xFF0000 :
        severity === 'warning' ? 0xFFA500 : 0x00FF00;

    await Promise.all([
        sendDiscordAlert(title, message, color),
        sendTelegramAlert(`*${title}*\n${message}`)
    ]);
}

// Check treasury balance
async function checkTreasuryBalance() {
    try {
        const balance = await connection.getBalance(treasuryVault);
        const balanceSOL = balance / 1e9;

        if (balance !== treasuryBalance) {
            const change = (balance - treasuryBalance) / 1e9;
            console.log(`💰 Treasury Balance: ${balanceSOL.toFixed(4)} SOL (${change >= 0 ? '+' : ''}${change.toFixed(4)} SOL)`);

            treasuryBalance = balance;
        }

        // Alert if treasury is low
        if (balance < TREASURY_LOW_THRESHOLD) {
            await sendAlert(
                'Low Treasury Balance',
                `Treasury balance is ${balanceSOL.toFixed(4)} SOL, below threshold of ${TREASURY_LOW_THRESHOLD / 1e9} SOL`,
                'warning'
            );
        }

        return balance;
    } catch (error) {
        console.error('Error checking treasury balance:', error);
        return 0;
    }
}

// Monitor program transactions
async function monitorTransactions() {
    try {
        const signatures = await connection.getSignaturesForAddress(PROGRAM_ID, {
            limit: 10
        });

        if (signatures.length === 0) return;

        // Check for new transactions
        const newTransactions = [];
        for (const sig of signatures) {
            if (lastSignature && sig.signature === lastSignature) break;
            newTransactions.push(sig);
        }

        if (newTransactions.length > 0) {
            lastSignature = signatures[0].signature;

            // Process each transaction
            for (const sig of newTransactions.reverse()) {
                const tx = await connection.getTransaction(sig.signature, {
                    maxSupportedTransactionVersion: 0
                });

                if (!tx) continue;

                const status = sig.err ? '❌ FAILED' : '✅ SUCCESS';
                const timestamp = new Date(sig.blockTime * 1000).toISOString();

                console.log(`\n[${timestamp}] ${status}`);
                console.log(`Signature: ${sig.signature}`);
                console.log(`Slot: ${sig.slot}`);

                if (sig.err) {
                    errorCount++;
                    const errorMsg = JSON.stringify(sig.err);
                    console.log(`Error: ${errorMsg}`);

                    // Log error to file
                    logError(sig.signature, errorMsg, timestamp);

                    // Alert on transaction failure
                    await sendAlert(
                        'Transaction Failed',
                        `Signature: ${sig.signature}\nError: ${errorMsg}\nSlot: ${sig.slot}`,
                        'error'
                    );
                } else {
                    successCount++;
                }

                // Parse transaction for specific events
                if (tx.meta && tx.meta.logMessages) {
                    parseTransactionLogs(tx.meta.logMessages, sig.signature);
                }
            }

            // Check error rate
            const totalTx = errorCount + successCount;
            if (totalTx >= 10) {
                const errorRate = errorCount / totalTx;
                if (errorRate > ERROR_RATE_THRESHOLD) {
                    await sendAlert(
                        'High Error Rate',
                        `Error rate: ${(errorRate * 100).toFixed(1)}% (${errorCount}/${totalTx} transactions failed)`,
                        'warning'
                    );
                }
            }
        }
    } catch (error) {
        console.error('Error monitoring transactions:', error);
        await sendAlert('Monitor Error', `Failed to monitor transactions: ${error.message}`, 'error');
    }
}

// Parse transaction logs for important events
function parseTransactionLogs(logs, signature) {
    let depositAmount = null;
    let withdrawAmount = null;
    let swapAmount = null;
    let feeCollected = null;

    for (const log of logs) {
        // Look for custom program logs
        if (log.includes('Deposit:')) {
            const match = log.match(/Deposit: (\d+)/);
            if (match) depositAmount = parseInt(match[1]) / 1e9;
        }
        if (log.includes('Withdraw:')) {
            const match = log.match(/Withdraw: (\d+)/);
            if (match) withdrawAmount = parseInt(match[1]) / 1e9;
        }
        if (log.includes('Swap:')) {
            const match = log.match(/Swap: (\d+)/);
            if (match) swapAmount = parseInt(match[1]) / 1e9;
        }
        if (log.includes('Fee:')) {
            const match = log.match(/Fee: (\d+)/);
            if (match) feeCollected = parseInt(match[1]) / 1e9;
        }
    }

    if (depositAmount) console.log(`  💰 Deposit: ${depositAmount.toFixed(4)} SOL`);
    if (withdrawAmount) console.log(`  💸 Withdraw: ${withdrawAmount.toFixed(4)} SOL`);
    if (swapAmount) console.log(`  🔄 Swap: ${swapAmount.toFixed(4)} SOL`);
    if (feeCollected) console.log(`  💵 Fee Collected: ${feeCollected.toFixed(6)} SOL`);
}

// Log errors to file
function logError(signature, error, timestamp) {
    const logDir = path.join(__dirname, '..', 'logs');
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
    }

    const logFile = path.join(logDir, 'mainnet-errors.log');
    const logEntry = `[${timestamp}] ${signature}: ${error}\n`;

    fs.appendFileSync(logFile, logEntry);
}

// Print status summary
function printStatus() {
    const uptime = Math.floor((Date.now() - startTime) / 1000);
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = uptime % 60;

    console.log('\n' + '═'.repeat(60));
    console.log('📊 STATUS SUMMARY');
    console.log('═'.repeat(60));
    console.log(`⏱️  Uptime: ${hours}h ${minutes}m ${seconds}s`);
    console.log(`✅ Successful Transactions: ${successCount}`);
    console.log(`❌ Failed Transactions: ${errorCount}`);
    console.log(`💰 Treasury Balance: ${(treasuryBalance / 1e9).toFixed(4)} SOL`);
    console.log(`🔗 Explorer: https://solscan.io/account/${PROGRAM_ID.toString()}`);
    console.log('═'.repeat(60));
}

// Main monitoring loop
async function monitor() {
    try {
        await checkTreasuryBalance();
        await monitorTransactions();
    } catch (error) {
        console.error('Monitor cycle error:', error);
    }
}

// Startup
(async () => {
    console.log('\n✅ Monitor initialized successfully!');
    console.log('🔄 Starting monitoring loop...\n');

    // Send startup notification
    await sendAlert(
        'Monitor Started',
        `Monitoring started for program: ${PROGRAM_ID.toString()}\nRPC: ${RPC_URL}`,
        'success'
    );

    // Initial check
    await monitor();

    // Print status every 5 minutes
    setInterval(printStatus, 5 * 60 * 1000);

    // Main monitoring loop
    setInterval(monitor, CHECK_INTERVAL);

    console.log('✅ Monitor is running! Press Ctrl+C to stop.\n');
})();

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n\n🛑 Shutting down monitor...');
    await sendAlert('Monitor Stopped', 'Monitoring has been stopped', 'warning');
    process.exit(0);
});
