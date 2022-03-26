
use anchor_lang::{prelude::*};
use mpl_token_metadata::{instruction::create_metadata_accounts_v2, state::{Collection,Creator,Uses, UseMethod}};

declare_id!("AHqPK6YeALn9xFEVqUvN41vsRxrWypWoWHjng1jSgZDj");

#[program]
pub mod vnft {

    use super::*;
     pub fn mint_nft(ctx: Context<MintNft>,token:Pubkey,name:String,symbol:String,uri:String,creator:String,collection:String) -> Result<()> {
        let account=&mut ctx.accounts.mint_id;
        account.nft_token=token;
        account.owner=ctx.accounts.authority.key();
        let nft_meta=NtfMeta::new(token,account.owner,name,symbol,uri);
        nft_meta.create_meta();
        Ok(())
    }
    // pub fn transfer_owner(ctx:Context<TransferNft>,owner:Pubkey)->Result<()>{
    //     let account=&mut ctx.accounts.mint_id;
    //     account.owner=owner;
    //     Ok(())
    // }
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
pub owner:Pubkey,
}
// #[derive(Accounts)]
// pub struct TransferNft<'info>{
//     #[account(mut,has_one=owner)]
//     pub mint_id:Account<'info,VazhaNft>,
//     pub owner:Signer<'info>
// }

struct NtfMeta{
pid:Pubkey,
account:Pubkey,
mint:Pubkey,
owner:Pubkey,
name:String,
symbol:String,
uri:String,
creator:Option<Vec<Creator>>,
collection:Option<Collection>,
seller_fee_basis_points:u16,
is_mutable:bool,
uses:Option<Uses>,
}
impl NtfMeta{
    fn new(mint:Pubkey,owner:Pubkey,name:String,symbol:String,uri:String)->Self{
       Self{
           pid:Pubkey::new(b"metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"),
            account:owner,
            mint,
            owner,
            name,
            symbol,
            uri,
            creator:Some(vec![Creator{address:owner,verified:true,share:100}]),
            collection:Some(Collection{key:owner,verified:true}),
            seller_fee_basis_points:12,
            is_mutable:false,
            uses:Some(Uses{use_method:UseMethod::Single,remaining:1,total:1})
       } 
    }
    fn create_meta(self){
        // let instructions=create_metadata_accounts_v2(program_id, metadata_account, mint, mint_authority, payer, update_authority, name, symbol, uri, creators, seller_fee_basis_points, update_authority_is_signer, is_mutable, collection, uses);
    }
}
