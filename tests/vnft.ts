import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { clusterApiUrl, Connection } from "@solana/web3.js";
import { Vnft } from "../target/types/vnft";
import { VazhaNft } from "./mint_gen";
describe("vnft Tests : )", () => {
    // Configure the client to use the local cluster.
    const provider = anchor.Provider.env();
    anchor.setProvider(provider);
    console.log(process.env.ANCHOR_PROVIDER_URL);
    console.log(JSON.stringify(provider.wallet.publicKey));
    const program = anchor.workspace.Vnft as Program<Vnft>;
    //   let wallet=provider.wallet;
    let keypair= anchor.web3.Keypair.generate();
    let connection = provider.connection;
    it("Create Nft", async () => {
        let vnft=new VazhaNft(keypair,connection);
        let mint=vnft.mint;
        // const tx=await program.rpc.createMeta()
    });
});