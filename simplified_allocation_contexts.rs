// SIMPLIFIED ACCOUNT CONTEXTS
// Copy these to replace the existing DepositWithAllocation and WithdrawFromAllocation contexts

#[derive(Accounts)]
pub struct DepositWithAllocation<'info> {
    #[account(
        mut,
        seeds = [b"allocation_config", user.key().as_ref()],
        bump = allocation_config.bump,
        has_one = owner @ ErrorCode::Unauthorized
    )]
    pub allocation_config: Account<'info, AllocationConfig>,

    #[account(
        mut,
        seeds = [b"config", user.key().as_ref()],
        bump = user_config.bump,
        has_one = owner @ ErrorCode::Unauthorized
    )]
    pub user_config: Account<'info, UserConfig>,

    #[account(
        mut,
        seeds = [b"vault", user.key().as_ref()],
        bump = user_config.vault_bump
    )]
    /// CHECK: Main SOL vault PDA
    pub sol_vault: AccountInfo<'info>,

    #[account(
        mut,
        seeds = [b"treasury_config"],
        bump = treasury_config.bump
    )]
    pub treasury_config: Account<'info, TreasuryConfig>,

    #[account(
        mut,
        seeds = [b"treasury"],
        bump
    )]
    /// CHECK: Treasury PDA
    pub treasury: AccountInfo<'info>,

    #[account(mut)]
    pub user: Signer<'info>,

    /// CHECK: Owner validation
    pub owner: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(index: u8)]
pub struct WithdrawFromAllocation<'info> {
    #[account(
        mut,
        seeds = [b"allocation_config", user.key().as_ref()],
        bump = allocation_config.bump,
        has_one = owner @ ErrorCode::Unauthorized
    )]
    pub allocation_config: Account<'info, AllocationConfig>,

    #[account(
        mut,
        seeds = [b"config", user.key().as_ref()],
        bump = user_config.bump,
        has_one = owner @ ErrorCode::Unauthorized
    )]
    pub user_config: Account<'info, UserConfig>,

    #[account(
        mut,
        seeds = [b"vault", user.key().as_ref()],
        bump = user_config.vault_bump
    )]
    /// CHECK: Main SOL vault PDA
    pub sol_vault: AccountInfo<'info>,

    #[account(mut)]
    pub user: Signer<'info>,

    /// CHECK: Owner validation
    pub owner: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}
