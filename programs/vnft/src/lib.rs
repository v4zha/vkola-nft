use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod vnft {

    use super::*;

    pub fn create_nft(ctx: Context<VazhaNft>,data:String) -> Result<()> {
        let account=&mut ctx.accounts.account;
        account.authority=ctx.accounts.authority.key();
        account.owner=account.key();
        account.nft_data=data;
        Ok(())
    }
    pub fn transfer_nft(ctx:Context<UpdateNft>,owner:Pubkey)->Result<()>{
        let account=&mut ctx.accounts.account;
        account.owner=owner;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct VazhaNft<'info> {
#[account(init,payer=authority,space=100)]
pub account:Account<'info,NftState>,
#[account(mut)]
pub authority:Signer<'info>,
pub system_program:Program<'info,System>,
}
#[account]
pub struct NftState{
pub nft_data:String,
pub authority:Pubkey,
pub owner:Pubkey,
}
#[derive(Accounts)]
pub struct UpdateNft<'info>{
    #[account(mut,has_one=authority)]
    pub account:Account<'info,NftState>,
    pub authority:Signer<'info>,
}
