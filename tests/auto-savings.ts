import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { AutoSavings } from "../target/types/auto_savings";
import { assert } from "chai";

describe("auto-savings", () => {
  // Configure the client to use the local cluster
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.AutoSavings as Program<AutoSavings>;
  const user = provider.wallet;

  let userConfigPDA: PublicKey;
  let vaultPDA: PublicKey;
  let configBump: number;
  let vaultBump: number;

  before(async () => {
    // Derive PDAs
    [userConfigPDA, configBump] = PublicKey.findProgramAddressSync(
      [Buffer.from("config"), user.publicKey.toBuffer()],
      program.programId
    );

    [vaultPDA, vaultBump] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), user.publicKey.toBuffer()],
      program.programId
    );
  });

  it("Initializes user with 10% savings rate", async () => {
    const savingsRate = 10;

    const tx = await program.methods
      .initializeUser(savingsRate)
      .accounts({
        userConfig: userConfigPDA,
        vault: vaultPDA,
        user: user.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log("Initialize transaction signature:", tx);

    // Fetch the created account
    const userConfig = await program.account.userConfig.fetch(userConfigPDA);

    assert.equal(userConfig.owner.toString(), user.publicKey.toString());
    assert.equal(userConfig.savingsRate, savingsRate);
    assert.equal(userConfig.totalSaved.toNumber(), 0);
    assert.equal(userConfig.totalWithdrawn.toNumber(), 0);
    assert.equal(userConfig.transactionCount.toNumber(), 0);
    assert.equal(userConfig.isActive, true);
  });

  it("Updates savings rate to 15%", async () => {
    const newRate = 15;

    const tx = await program.methods
      .updateSavingsRate(newRate)
      .accounts({
        userConfig: userConfigPDA,
        user: user.publicKey,
        owner: user.publicKey,
      })
      .rpc();

    console.log("Update rate transaction signature:", tx);

    const userConfig = await program.account.userConfig.fetch(userConfigPDA);
    assert.equal(userConfig.savingsRate, newRate);
  });

  it("Deposits 1 SOL to vault", async () => {
    const depositAmount = new anchor.BN(1 * LAMPORTS_PER_SOL);

    const vaultBalanceBefore = await provider.connection.getBalance(vaultPDA);

    const tx = await program.methods
      .deposit(depositAmount)
      .accounts({
        userConfig: userConfigPDA,
        vault: vaultPDA,
        user: user.publicKey,
        owner: user.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log("Deposit transaction signature:", tx);

    const vaultBalanceAfter = await provider.connection.getBalance(vaultPDA);
    const userConfig = await program.account.userConfig.fetch(userConfigPDA);

    assert.equal(
      vaultBalanceAfter - vaultBalanceBefore,
      depositAmount.toNumber()
    );
    assert.equal(userConfig.totalSaved.toNumber(), depositAmount.toNumber());
    assert.equal(userConfig.transactionCount.toNumber(), 1);
  });

  it("Processes a transfer with 15% auto-save", async () => {
    const transferAmount = new anchor.BN(2 * LAMPORTS_PER_SOL);
    const expectedSavings = transferAmount.muln(15).divn(100);

    const vaultBalanceBefore = await provider.connection.getBalance(vaultPDA);
    const userConfigBefore = await program.account.userConfig.fetch(userConfigPDA);

    const tx = await program.methods
      .processTransfer(transferAmount)
      .accounts({
        userConfig: userConfigPDA,
        vault: vaultPDA,
        user: user.publicKey,
        owner: user.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log("Process transfer transaction signature:", tx);

    const vaultBalanceAfter = await provider.connection.getBalance(vaultPDA);
    const userConfigAfter = await program.account.userConfig.fetch(userConfigPDA);

    assert.equal(
      vaultBalanceAfter - vaultBalanceBefore,
      expectedSavings.toNumber()
    );
    assert.equal(
      userConfigAfter.totalSaved.toNumber() - userConfigBefore.totalSaved.toNumber(),
      expectedSavings.toNumber()
    );
    assert.equal(
      userConfigAfter.transactionCount.toNumber(),
      userConfigBefore.transactionCount.toNumber() + 1
    );
  });

  it("Withdraws 0.5 SOL from vault", async () => {
    const withdrawAmount = new anchor.BN(0.5 * LAMPORTS_PER_SOL);

    const vaultBalanceBefore = await provider.connection.getBalance(vaultPDA);
    const userBalanceBefore = await provider.connection.getBalance(user.publicKey);

    const tx = await program.methods
      .withdraw(withdrawAmount)
      .accounts({
        userConfig: userConfigPDA,
        vault: vaultPDA,
        user: user.publicKey,
        owner: user.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log("Withdraw transaction signature:", tx);

    const vaultBalanceAfter = await provider.connection.getBalance(vaultPDA);
    const userConfig = await program.account.userConfig.fetch(userConfigPDA);

    assert.equal(
      vaultBalanceBefore - vaultBalanceAfter,
      withdrawAmount.toNumber()
    );
    assert.equal(userConfig.totalWithdrawn.toNumber(), withdrawAmount.toNumber());
  });

  it("Deactivates user account", async () => {
    const tx = await program.methods
      .deactivate()
      .accounts({
        userConfig: userConfigPDA,
        user: user.publicKey,
        owner: user.publicKey,
      })
      .rpc();

    console.log("Deactivate transaction signature:", tx);

    const userConfig = await program.account.userConfig.fetch(userConfigPDA);
    assert.equal(userConfig.isActive, false);
  });

  it("Reactivates user account", async () => {
    const tx = await program.methods
      .reactivate()
      .accounts({
        userConfig: userConfigPDA,
        user: user.publicKey,
        owner: user.publicKey,
      })
      .rpc();

    console.log("Reactivate transaction signature:", tx);

    const userConfig = await program.account.userConfig.fetch(userConfigPDA);
    assert.equal(userConfig.isActive, true);
  });

  it("Fails to deposit with invalid amount", async () => {
    try {
      await program.methods
        .deposit(new anchor.BN(0))
        .accounts({
          userConfig: userConfigPDA,
          vault: vaultPDA,
          user: user.publicKey,
          owner: user.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      assert.fail("Should have failed with invalid amount");
    } catch (error) {
      assert.include(error.toString(), "InvalidAmount");
    }
  });

  it("Fails to update savings rate outside valid range", async () => {
    try {
      await program.methods
        .updateSavingsRate(95)
        .accounts({
          userConfig: userConfigPDA,
          user: user.publicKey,
          owner: user.publicKey,
        })
        .rpc();
      assert.fail("Should have failed with invalid savings rate");
    } catch (error) {
      assert.include(error.toString(), "InvalidSavingsRate");
    }
  });
});
