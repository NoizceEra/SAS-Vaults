// Auto-generated IDL as JavaScript object to avoid Vite JSON import issues
export const IDL = {
    "version": "0.1.0",
    "name": "auto_savings",
    "metadata": { "address": "8hoCkMSWSvSt9oCokRKsKx8wqvVSWjGNnZTuvRFYhDMR" },
    "instructions": [
        {
            "name": "initializeUser",
            "accounts": [
                { "name": "userConfig", "isMut": true, "isSigner": false },
                { "name": "vault", "isMut": true, "isSigner": false },
                { "name": "user", "isMut": true, "isSigner": true },
                { "name": "systemProgram", "isMut": false, "isSigner": false }
            ],
            "args": [{ "name": "savingsRate", "type": "u8" }]
        },
        {
            "name": "updateSavingsRate",
            "accounts": [
                { "name": "userConfig", "isMut": true, "isSigner": false },
                { "name": "user", "isMut": true, "isSigner": true },
                { "name": "owner", "isMut": false, "isSigner": false }
            ],
            "args": [{ "name": "newRate", "type": "u8" }]
        },
        {
            "name": "deposit",
            "accounts": [
                { "name": "userConfig", "isMut": true, "isSigner": false },
                { "name": "vault", "isMut": true, "isSigner": false },
                { "name": "user", "isMut": true, "isSigner": true },
                { "name": "owner", "isMut": false, "isSigner": false },
                { "name": "systemProgram", "isMut": false, "isSigner": false }
            ],
            "args": [{ "name": "amount", "type": "u64" }]
        },
        {
            "name": "withdraw",
            "accounts": [
                { "name": "userConfig", "isMut": true, "isSigner": false },
                { "name": "vault", "isMut": true, "isSigner": false },
                { "name": "user", "isMut": true, "isSigner": true },
                { "name": "owner", "isMut": false, "isSigner": false },
                { "name": "systemProgram", "isMut": false, "isSigner": false }
            ],
            "args": [{ "name": "amount", "type": "u64" }]
        },
        {
            "name": "processTransfer",
            "accounts": [
                { "name": "userConfig", "isMut": true, "isSigner": false },
                { "name": "vault", "isMut": true, "isSigner": false },
                { "name": "user", "isMut": true, "isSigner": true },
                { "name": "owner", "isMut": false, "isSigner": false },
                { "name": "systemProgram", "isMut": false, "isSigner": false }
            ],
            "args": [{ "name": "transferAmount", "type": "u64" }]
        },
        {
            "name": "deactivate",
            "accounts": [
                { "name": "userConfig", "isMut": true, "isSigner": false },
                { "name": "user", "isMut": true, "isSigner": true },
                { "name": "owner", "isMut": false, "isSigner": false }
            ],
            "args": []
        },
        {
            "name": "reactivate",
            "accounts": [
                { "name": "userConfig", "isMut": true, "isSigner": false },
                { "name": "user", "isMut": true, "isSigner": true },
                { "name": "owner", "isMut": false, "isSigner": false }
            ],
            "args": []
        }
    ],
    "accounts": [
        {
            "name": "UserConfig",
            "type": {
                "kind": "struct",
                "fields": [
                    { "name": "owner", "type": "publicKey" },
                    { "name": "savingsRate", "type": "u8" },
                    { "name": "totalSaved", "type": "u64" },
                    { "name": "totalWithdrawn", "type": "u64" },
                    { "name": "transactionCount", "type": "u64" },
                    { "name": "isActive", "type": "bool" },
                    { "name": "bump", "type": "u8" },
                    { "name": "vaultBump", "type": "u8" }
                ]
            }
        }
    ],
    "errors": [
        { "code": 6000, "name": "InvalidSavingsRate", "msg": "Savings rate must be between 1 and 90" },
        { "code": 6001, "name": "InvalidAmount", "msg": "Amount must be greater than 0" },
        { "code": 6002, "name": "InsufficientFunds", "msg": "Insufficient funds in vault" },
        { "code": 6003, "name": "AccountNotActive", "msg": "Account is not active" },
        { "code": 6004, "name": "Unauthorized", "msg": "Unauthorized access" },
        { "code": 6005, "name": "Overflow", "msg": "Arithmetic overflow" }
    ]
};
