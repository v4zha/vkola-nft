use anchor_lang::prelude::*;
declare_id!("AHqPK6YeALn9xFEVqUvN41vsRxrWypWoWHjng1jSgZDj");
macro_rules! check_buffer {
    ($($e:expr),+) => {
      $ (
        if $e.as_bytes().len()>30{
            return err!(NftError::BufferError);
        };
    )*
    };
}
#[program]
pub mod vnft {
    use super::*;
    pub fn create_meta(
        ctx: Context<VkolaCreate>,
        _mint: Pubkey,
        name: String,
        uri: String,
        collection: String,
    ) -> Result<()> {
        check_buffer!(name, uri, collection);
        let meta_data = &mut ctx.accounts.meta_data;
        meta_data.name = name;
        meta_data.authority = ctx.accounts.authority.key();
        meta_data.creator = meta_data.authority;
        meta_data.uri = uri;
        meta_data.collection = collection;
        meta_data.bump = *ctx.bumps.get("meta_data").unwrap();
        Ok(())
    }
    pub fn update_authority(
        ctx: Context<VkolaUpdate>,
        _mint: Pubkey,
        new_authority: Pubkey,
    ) -> Result<()> {
        let meta_data = &mut ctx.accounts.meta_data;
        require_keys_eq!(
            meta_data.authority,
            ctx.accounts.authority.key(),
            NftError::AuthorityError
        );
        meta_data.authority = new_authority;
        Ok(())
    }
}
#[derive(Accounts)]
#[instruction(mint:Pubkey)]
pub struct VkolaCreate<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(init,
    payer=authority,
    space= 8+32+32+30+30+30+2,
    seeds=[b"v4zha_nft",mint.as_ref()],
    bump)]
    pub meta_data: Account<'info, VkolaMeta>,
    pub system_program: Program<'info, System>,
}

//space 8+32+32+30+30+30+2
#[account]
pub struct VkolaMeta {
    authority: Pubkey,
    creator: Pubkey,
    name: String,
    uri: String,
    collection: String,
    bump: u8,
}

#[derive(Accounts)]
#[instruction(mint:Pubkey)]
pub struct VkolaUpdate<'info> {
    pub authority: Signer<'info>,
    #[account(mut,
        seeds=[b"v4zha_nft",mint.as_ref()],
              bump=meta_data.bump)]
    pub meta_data: Account<'info, VkolaMeta>,
}

#[error_code]
enum NftError {
    #[msg("Unable to verify NFT authority :) ")]
    AuthorityError,
    #[msg("Argument size should be less than 30 bytes :) ")]
    BufferError,
}
