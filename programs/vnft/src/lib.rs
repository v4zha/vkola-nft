use anchor_lang::prelude::*;
use mpl_token_metadata::{
    instruction::create_metadata_accounts_v2,
    state::{Collection, Creator, UseMethod, Uses},
};
use solana_program::program::invoke;

declare_id!("AHqPK6YeALn9xFEVqUvN41vsRxrWypWoWHjng1jSgZDj");

#[program]
pub mod vnft {

    use super::*;
    pub fn mint_nft(
        ctx: Context<MintNft>,
        token: Pubkey,
        name: String,
        symbol: String,
        uri: String
    ) -> Result<()> {
        let account = &mut ctx.accounts.mint_id;
        let account_info =account.to_account_infos();
        let meta_program=&ctx.accounts.meta_program;
        account.nft_token = token;
        account.owner = ctx.accounts.authority.key();
        let nft_meta = NtfMeta::new(meta_program.clone(),account_info, token, account.owner, name, symbol, uri);
        nft_meta.create_meta().unwrap();
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
    pub mint_id: Account<'info, VazhaNft>,
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(address = mpl_token_metadata::id())]
    meta_program: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
}
#[account]
pub struct VazhaNft {
    pub nft_token: Pubkey,
    pub owner: Pubkey,
}
// #[derive(Accounts)]
// pub struct TransferNft<'info>{
//     #[account(mut,has_one=owner)]
//     pub mint_id:Account<'info,VazhaNft>,
//     pub owner:Signer<'info>
// }

struct NtfMeta<'info> {
    meta_program:UncheckedAccount<'info>,
    account_info:Vec<AccountInfo<'info>>,
    token: Pubkey,
    owner: Pubkey,
    name: String,
    symbol: String,
    uri: String,
    creators: Option<Vec<Creator>>,
    collection: Option<Collection>,
    seller_fee_basis_points: u16,
    is_mutable: bool,
    uses: Option<Uses>,
}
impl<'info> NtfMeta<'info> {
    fn new(
        meta_program:UncheckedAccount<'info>,
        account_info:Vec<AccountInfo<'info>>,
        token: Pubkey,
        owner: Pubkey,
        name: String,
        symbol: String,
        uri: String,
    ) -> Self {
        Self {
            meta_program,
            account_info,
            token,
            owner,
            name,
            symbol,
            uri,
            creators: Some(vec![Creator {
                address: owner,
                verified: true,
                share: 100,
            }]),
            collection: Some(Collection {
                key: owner,
                verified: true,
            }),
            seller_fee_basis_points: 12,
            is_mutable: false,
            uses: Some(Uses {
                use_method: UseMethod::Single,
                remaining: 1,
                total: 1,
            }),
        }
    }
    fn create_meta(self)->Result<()> {
        let instructions = create_metadata_accounts_v2(
            self.meta_program.key(),
            self.token,
            self.token,
            self.owner,
            self.owner,
            self.owner,
            self.name,
            self.symbol,
            self.uri,
            self.creators,
            self.seller_fee_basis_points,
            true,
            self.is_mutable,
            self.collection,
            self.uses,
        );
        invoke(&instructions, &self.account_info).unwrap();
        Ok(())
    }
}
