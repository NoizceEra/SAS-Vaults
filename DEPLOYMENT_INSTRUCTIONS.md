# 🚀 Solana Deployment & Testing Guide (Hybrid Workflow)

Since our local Windows environment has build issues, we are using **GitHub Actions** for building and **WSL** for deploying.

## Phase 1: Build the Program (Cloud)

1.  **Commit and Push** your changes to GitHub (I already did this for you):
    ```bash
    git push origin master
    ```

2.  **Wait for the Build:**
    - Go to your GitHub repository > **Actions** tab.
    - Click on the latest workflow run ("Build Solana Program").
    - Wait for it to complete (green checkmark).

3.  **Download Artifacts:**
    - Once finished, scroll down to the **Artifacts** section at the bottom of the workflow run page.
    - Download `program-artifacts.zip`.
    - Extract this zip file into: `c:\Users\vclin_jjufoql\Documents\SAS\target\artifact_download`.

---

## Phase 2: Deploy to Devnet (WSL)

1.  **Open WSL Terminal:**
    ```powershell
    wsl
    cd /mnt/c/Users/vclin_jjufoql/Documents/SAS
    ```

2.  **Ensure Devnet Funds:**
    ```bash
    solana config set --url devnet
    solana airdrop 2
    ```

3.  **Deploy the Program:**
    Use your local keypair to deploy the compiled binary from GitHub:
    ```bash
    solana program deploy \
      --program-id target/deploy/auto_savings-keypair.json \
      target/artifact_download/deploy/auto_savings.so
    ```

    **Program ID:** `8AZGuEtnmaqT97sMeF2zUAnv5J89iXCBVPnxw5fULzoS`

---

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
    - [ ] Create Allocation (e.g., "Savings 20%")
    - [ ] Verify Dashboard updates
