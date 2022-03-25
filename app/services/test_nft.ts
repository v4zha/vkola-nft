import {NftGen} from "./nft-gen";
import * as anchor from "@project-serum/anchor";
const keypair=anchor.web3.Keypair.generate();
const nft_gen=new NftGen();
const meta_data="https://raw.githubusercontent.com/v4zha/v4zha/main/assets/vazha_token.png"
nft_gen.mint_nft(keypair.publicKey,meta_data);
nft_gen.get_nft(keypair.publicKey);


