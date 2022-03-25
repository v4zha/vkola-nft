import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { Keypair, PublicKey } from "@solana/web3.js";
import { Vnft } from "../../target/types/vnft";

export class NftGen {
  provider: anchor.Provider;
  program: Program<Vnft>;
  constructor() {
    this.provider = anchor.Provider.env();
    anchor.setProvider(this.provider);
    this.program = anchor.workspace.Vnft as Program<Vnft>;
  }
  async mint_nft(accnt:PublicKey , meta_data:string) {
    const trans_res = await this.program.rpc.mintNft(meta_data, {
      accounts: {
        account: accnt,
        authority: this.provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      }
    });
  }
  async get_nft(accnt:PublicKey) {
    const account = await this.program.account.vazhaNft.fetch(accnt);
    console.log(`User :${accnt}\naccount  : ${JSON.stringify(account)}`)
  }
  async transfer_owner(accnt:PublicKey, new_owner:PublicKey) {
    const trans_res = await this.program.rpc.transferNft(new_owner, {
      accounts: {
        account: accnt,
        authority: this.provider.wallet.publicKey,
      }
    });
  }
}


