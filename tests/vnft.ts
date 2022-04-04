import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { SystemProgram } from "@solana/web3.js";
// import { clusterApiUrl, Connection } from "@solana/web3.js";
import { Vnft } from "../target/types/vnft";
import { VazhaNft } from "./mint_gen";
describe("vnft Tests : )", () => {
    // Configure the client to use the local cluster.
    const provider = anchor.Provider.env();
    anchor.setProvider(provider);
    console.log(process.env.ANCHOR_PROVIDER_URL);
    console.log(JSON.stringify(provider.wallet.publicKey));
    const program = anchor.workspace.Vnft as Program<Vnft>;
    // let wallet=provider.wallet;
    let keypair = anchor.web3.Keypair.generate();
    let connection = provider.connection;
    it("Create Nft", async () => {
        const vnft = new VazhaNft(keypair, connection);
        await vnft.init();
        const [mint, token_acc] = vnft.get_mint();
        console.log(`Mint : ${mint}\nToken Account : ${token_acc.address}\n`);
        const [mint_pda, _] = await vnft.get_pda(program.programId);
        const name = "v4zha";
        const collection = "v-collection";
        const uri = "https://raw.githubusercontent.com/v4zha/vkola-nft/master/assets/vazha_kola.png";
        const tx = await program.rpc.createMeta(mint, name, uri, collection, {
            accounts:
            {
                authority: keypair.publicKey,
                metaData: mint_pda,
                systemProgram: SystemProgram.programId,
            },
            signers: [keypair],
        }
        );
        console.log(tx);
        const nft = await program.account.vkolaMeta.fetch(mint_pda);
        console.log(JSON.stringify(nft));
    });
});