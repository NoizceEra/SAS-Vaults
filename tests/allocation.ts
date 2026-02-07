import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { AutoSavings } from "../target/types/auto_savings";
import { assert } from "chai";

describe("Multi-Account Allocation", () => {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const program = anchor.workspace.AutoSavings as Program<AutoSavings>;
    const user = provider.wallet;

    let allocationConfigPDA: PublicKey;
    let configBump: number;

    before(async () => {
        // Derive allocation config PDA
        [allocationConfigPDA, configBump] = PublicKey.findProgramAddressSync(
            [Buffer.from("allocation_config"), user.publicKey.toBuffer()],
            program.programId
        );
    });

    it("Initializes allocation config", async () => {
        const tx = await program.methods
            .initializeAllocationConfig()
            .accounts({
                allocationConfig: allocationConfigPDA,
                user: user.publicKey,
                systemProgram: SystemProgram.programId,
            })
            .rpc();

        console.log("Initialize allocation config tx:", tx);

        const config = await program.account.allocationConfig.fetch(allocationConfigPDA);
        assert.equal(config.owner.toString(), user.publicKey.toString());
        assert.equal(config.totalAllocations, 0);
        assert.equal(config.allocations.length, 0);
    });

    it("Creates first allocation (Emergency Fund 40%)", async () => {
        const tx = await program.methods
            .createAllocation("Emergency Fund", 40)
            .accounts({
                allocationConfig: allocationConfigPDA,
                user: user.publicKey,
                owner: user.publicKey,
                systemProgram: SystemProgram.programId,
            })
            .rpc();

        console.log("Create allocation tx:", tx);

        const config = await program.account.allocationConfig.fetch(allocationConfigPDA);
        assert.equal(config.totalAllocations, 1);
        assert.equal(config.allocations.length, 1);
        assert.equal(config.allocations[0].name, "Emergency Fund");
        assert.equal(config.allocations[0].percentage, 40);
        assert.equal(config.allocations[0].isActive, true);
    });

    it("Creates second allocation (Vacation 30%)", async () => {
        const tx = await program.methods
            .createAllocation("Vacation", 30)
            .accounts({
                allocationConfig: allocationConfigPDA,
                user: user.publicKey,
                owner: user.publicKey,
                systemProgram: SystemProgram.programId,
            })
            .rpc();

        const config = await program.account.allocationConfig.fetch(allocationConfigPDA);
        assert.equal(config.totalAllocations, 2);
        assert.equal(config.allocations[1].name, "Vacation");
        assert.equal(config.allocations[1].percentage, 30);
    });

    it("Creates third allocation (Investment 30%)", async () => {
        const tx = await program.methods
            .createAllocation("Investment", 30)
            .accounts({
                allocationConfig: allocationConfigPDA,
                user: user.publicKey,
                owner: user.publicKey,
                systemProgram: SystemProgram.programId,
            })
            .rpc();

        const config = await program.account.allocationConfig.fetch(allocationConfigPDA);
        assert.equal(config.totalAllocations, 3);

        // Verify total percentage is 100%
        const totalPercentage = config.allocations
            .filter(a => a.isActive)
            .reduce((sum, a) => sum + a.percentage, 0);
        assert.equal(totalPercentage, 100);
    });

    it("Fails to create allocation exceeding 100%", async () => {
        try {
            await program.methods
                .createAllocation("Extra", 10)
                .accounts({
                    allocationConfig: allocationConfigPDA,
                    user: user.publicKey,
                    owner: user.publicKey,
                    systemProgram: SystemProgram.programId,
                })
                .rpc();
            assert.fail("Should have failed with percentage exceeded error");
        } catch (error) {
            assert.include(error.toString(), "AllocationPercentageExceeded");
        }
    });

    it("Updates allocation percentage", async () => {
        // Change Emergency Fund from 40% to 50%
        const tx = await program.methods
            .updateAllocation(0, null, 50)
            .accounts({
                allocationConfig: allocationConfigPDA,
                user: user.publicKey,
                owner: user.publicKey,
            })
            .rpc();

        const config = await program.account.allocationConfig.fetch(allocationConfigPDA);
        assert.equal(config.allocations[0].percentage, 50);
    });

    it("Updates allocation name", async () => {
        const tx = await program.methods
            .updateAllocation(0, "Emergency Savings", null)
            .accounts({
                allocationConfig: allocationConfigPDA,
                user: user.publicKey,
                owner: user.publicKey,
            })
            .rpc();

        const config = await program.account.allocationConfig.fetch(allocationConfigPDA);
        assert.equal(config.allocations[0].name, "Emergency Savings");
    });

    it("Removes allocation", async () => {
        const tx = await program.methods
            .removeAllocation(2) // Remove Investment
            .accounts({
                allocationConfig: allocationConfigPDA,
                user: user.publicKey,
                owner: user.publicKey,
            })
            .rpc();

        const config = await program.account.allocationConfig.fetch(allocationConfigPDA);
        assert.equal(config.allocations[2].isActive, false);
        assert.equal(config.allocations[2].percentage, 0);
    });

    it("Fails with invalid allocation name", async () => {
        try {
            await program.methods
                .createAllocation("", 10)
                .accounts({
                    allocationConfig: allocationConfigPDA,
                    user: user.publicKey,
                    owner: user.publicKey,
                    systemProgram: SystemProgram.programId,
                })
                .rpc();
            assert.fail("Should have failed with invalid name error");
        } catch (error) {
            assert.include(error.toString(), "InvalidAllocationName");
        }
    });

    it("Fails with invalid percentage", async () => {
        try {
            await program.methods
                .createAllocation("Test", 0)
                .accounts({
                    allocationConfig: allocationConfigPDA,
                    user: user.publicKey,
                    owner: user.publicKey,
                    systemProgram: SystemProgram.programId,
                })
                .rpc();
            assert.fail("Should have failed with invalid percentage error");
        } catch (error) {
            assert.include(error.toString(), "InvalidAllocationPercentage");
        }
    });
});
