// Auto-generated IDL as JavaScript object to avoid Vite JSON import issues
export const IDL = {
    "version": "0.1.0",
    "name": "auto_savings",
    "metadata": { "address": "GsH9GZHHiVpoTkCgcdjWsezUup8b3dC7YkPF2mbzAzsJ" },
    "instructions": [
        {
            "name": "initializeTreasury",
            "accounts": [
                { "name": "treasuryConfig", "isMut": true, "isSigner": false },
                { "name": "treasury", "isMut": false, "isSigner": false },
                { "name": "authority", "isMut": true, "isSigner": true },
                { "name": "systemProgram", "isMut": false, "isSigner": false }
            ],
            "args": []
        },
        {
            "name": "activateUser",
            "accounts": [
                { "name": "userConfig", "isMut": true, "isSigner": false },
                { "name": "vault", "isMut": false, "isSigner": false },
                { "name": "user", "isMut": true, "isSigner": true },
                { "name": "systemProgram", "isMut": false, "isSigner": false }
            ],
            "args": []
        },
        {
            "name": "saveSol",
            "accounts": [
                { "name": "userConfig", "isMut": true, "isSigner": false },
                { "name": "vault", "isMut": true, "isSigner": false },
                { "name": "treasuryConfig", "isMut": true, "isSigner": false },
                { "name": "treasury", "isMut": true, "isSigner": false },
                { "name": "user", "isMut": true, "isSigner": true },
                { "name": "owner", "isMut": false, "isSigner": true },
                { "name": "systemProgram", "isMut": false, "isSigner": false }
            ],
            "args": [{ "name": "amount", "type": "u64" }]
        },
        {
            "name": "withdrawSol",
            "accounts": [
                { "name": "userConfig", "isMut": true, "isSigner": false },
                { "name": "vault", "isMut": true, "isSigner": false },
                { "name": "treasuryConfig", "isMut": true, "isSigner": false },
                { "name": "treasury", "isMut": true, "isSigner": false },
                { "name": "user", "isMut": true, "isSigner": true },
                { "name": "owner", "isMut": false, "isSigner": true },
                { "name": "systemProgram", "isMut": false, "isSigner": false }
            ],
            "args": [{ "name": "amount", "type": "u64" }]
        }
    ],
    "accounts": [
        {
            "name": "TreasuryConfig",
            "type": {
                "kind": "struct",
                "fields": [
                    { "name": "authority", "type": "publicKey" },
                    { "name": "bump", "type": "u8" },
                    { "name": "isPaused", "type": "bool" },
                    { "name": "totalTvl", "type": "u64" },
                    { "name": "tvlCap", "type": "u64" }
                ]
            }
        },
        {
            "name": "UserConfig",
            "type": {
                "kind": "struct",
                "fields": [
                    { "name": "owner", "type": "publicKey" },
                    { "name": "bump", "type": "u8" },
                    { "name": "vaultBump", "type": "u8" },
                    { "name": "totalSaved", "type": "u64" }
                ]
            }
        }
    ],
    "errors": [
        { "code": 6000, "name": "InvalidAmount", "msg": "Invalid amount" },
        { "code": 6001, "name": "InsufficientFunds", "msg": "Insufficient funds" },
        { "code": 6002, "name": "Unauthorized", "msg": "Unauthorized" },
        { "code": 6003, "name": "Overflow", "msg": "Arithmetic overflow" },
        { "code": 6004, "name": "ProtocolPaused", "msg": "Protocol is paused" },
        { "code": 6005, "name": "TvlCapExceeded", "msg": "TVL cap exceeded" }
    ]
};
