# 🚀 Solana Deployment & Testing Guide (Hybrid Workflow)

Since our local Windows environment has build issues, we are using **GitHub Actions** for building and **WSL** for deploying.

## Phase 1: Build the Program (Cloud)

1.  **Commit and Push** your changes to GitHub:
    ```bash
    git add .
    git commit -m "feat: complete multi-account allocation & ui updates"
    git push origin main
    ```

2.  **Wait for the Build:**
    - Go to your GitHub repository > **Actions** tab.
    - Click on the latest workflow run ("Build Solana Program").
    - Wait for it to complete (green checkmark).

3.  **Download Artifacts:**
    - Once finished, scroll down to the **Artifacts** section at the bottom of the workflow run page.
    - Download `program-artifacts.zip`.
    - Extract this zip file into your project folder: `C:\Users\vclin_jjufoql\Documents\SAS\target\artifact_download`.

## Phase 2: Deploy to Devnet (WSL)

1.  **Open WSL Terminal:**
    ```powershell
    wsl
    cd /mnt/c/Users/vclin_jjufoql/Documents/SAS
    ```

2.  **Prepare the Keypair:**
    Ensure you have your deployment wallet keypair ready (e.g., `~/.config/solana/id.json` or create a new one).
    ```bash
    solana config set --url devnet
    solana airdrop 2  # Get devnet SOL for deployment fees
    ```

3.  **Deploy the Program:**
    Use the downloaded `.so` file to deploy.
    ```bash
    # Navigate to where you extracted the artifact
    cd target/artifact_download/deploy

    # Deploy!
    solana program deploy auto_savings.so
    ```

    *Note the Program ID output by this command! It should match `Gy7UQGE8yjuVSswfL7hipUstrwNgwJrwvbv2KQsk6wpD`. If it's different, we'll update it later.*

## Phase 3: Update Frontend & Test

1.  **Update IDL:**
    Copy the downloaded IDL to your frontend:
    ```bash
    cp target/artifact_download/idl/auto_savings.json frontend/src/idl/
    ```

2.  **Run Frontend:**
    ```bash
    cd frontend
    npm run dev
    ```

3.  **Live Testing Checklist:**
    - [ ] Connect Wallet (Devnet)
    - [ ] Create Vault (Initialize)
    - [ ] Deposit SOL
    - [ ] Verify Dashboard Balance updates
    - [ ] Test Allocation Creation (e.g., "Savings 20%")
    - [ ] Deposit again -> verify allocation split
    - [ ] Withdraw from Allocation

## Troubleshooting
- If deployment fails with "insufficient funds", run `solana airdrop 2` again.
- If Program ID mismatch, update `Anchor.toml` and frontend config with the new ID.
