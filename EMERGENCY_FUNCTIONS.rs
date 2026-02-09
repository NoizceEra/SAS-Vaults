// Add this function to your lib.rs after withdraw_treasury

    /// Emergency pause toggle (authority only)
    /// Pauses all deposits, withdrawals still work
    pub fn toggle_pause(ctx: Context<TogglePause>) -> Result<()> {
        let treasury_config = &mut ctx.accounts.treasury_config;
        
        require!(
            ctx.accounts.authority.key() == treasury_config.authority,
            ErrorCode::Unauthorized
        );
        
        treasury_config.is_paused = !treasury_config.is_paused;
        
        // Log the state change (will be removed in optimization)
        msg!("Protocol pause toggled: {}", treasury_config.is_paused);
        Ok(())
    }

    /// Update TVL cap (authority only)
    /// Allows increasing cap if needed
    pub fn update_tvl_cap(ctx: Context<UpdateTvlCap>, new_cap: u64) -> Result<()> {
        let treasury_config = &mut ctx.accounts.treasury_config;
        
        require!(
            ctx.accounts.authority.key() == treasury_config.authority,
            ErrorCode::Unauthorized
        );
        
        require!(
            new_cap >= treasury_config.total_tvl,
            ErrorCode::InvalidAmount
        );
        
        let old_cap = treasury_config.tvl_cap;
        treasury_config.tvl_cap = new_cap;
        
        msg!("TVL cap updated from {} to {} lamports", old_cap, new_cap);
        Ok(())
    }

// Add these context structs at the end of file with other contexts

#[derive(Accounts)]
pub struct TogglePause<'info> {
    #[account(mut)]
    pub treasury_config: Account<'info, TreasuryConfig>,
    #[account(mut)]
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct UpdateTvlCap<'info> {
    #[account(mut)]
    pub treasury_config: Account<'info, TreasuryConfig>,
    #[account(mut)]
    pub authority: Signer<'info>,
}
