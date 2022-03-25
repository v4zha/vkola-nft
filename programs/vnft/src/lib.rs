
use anchor_lang::{prelude::*};

declare_id!("AHqPK6YeALn9xFEVqUvN41vsRxrWypWoWHjng1jSgZDj");

#[program]
pub mod vnft {

    use super::*;
     pub fn mint_nft(ctx: Context<MintNft>) -> Result<()> {
        let account=&mut ctx.accounts.mint_id;
        account.owner=ctx.accounts.authority.key();
        Ok(())
    }
    pub fn transfer_owner(ctx:Context<TransferNft>,owner:Pubkey)->Result<()>{
        let account=&mut ctx.accounts.mint_id;
        account.owner=owner;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct MintNft<'info> {
#[account(init,payer=authority,space=64)]
pub mint_id:Account<'info,VazhaNft>,
#[account(mut)]
pub authority:Signer<'info>,
pub system_program:Program<'info,System>,
}
#[account]
pub struct VazhaNft{
pub nft_token:Pubkey,
pub nft_meta:String,
pub owner:Pubkey,
}
#[derive(Accounts)]
pub struct TransferNft<'info>{
    #[account(mut,has_one=owner)]
    pub mint_id:Account<'info,VazhaNft>,
    pub owner:Signer<'info>
}