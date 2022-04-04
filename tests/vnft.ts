import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { SystemProgram } from "@solana/web3.js";
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
        const uri = "va4zha.com hehe : )";
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
        // console.log(tx);
        //get nft : )
        const nft = await program.account.vkolaMeta.fetch(mint_pda);
        console.log(JSON.stringify(nft) + "\n");
    });
    it("Buffer Check", async () => {
        const res = async () => {
            const vnft = new VazhaNft(keypair, connection);
            await vnft.init();
            const [mint, token_acc] = vnft.get_mint();
            console.log(`Mint : ${mint}\nToken Account : ${token_acc.address}\n`);
            const [mint_pda, _] = await vnft.get_pda(program.programId);
            const name = "v4zha";
            const collection = "v-collection";
            const uri = "buffer test go brrrrrrrrrrrrrrrrrrrrrrrrrrrr";
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
        };
        await res().catch(err => console.log(`[Error] : ${err}\n`));
    });
    it("Authority Check", async () => {
        const res = async () => {
            const vnft = new VazhaNft(keypair, connection);
            await vnft.init();
            const [mint, token_acc] = vnft.get_mint();
            console.log(`Mint : ${mint}\nToken Account : ${token_acc.address}\n`);
            const [mint_pda, _] = await vnft.get_pda(program.programId);
            const name = "v4zha";
            const collection = "v-collection";
            const uri = "va4zha.com hehe : )";
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
            // console.log(tx);
            //get nft : )
            const nft = await program.account.vkolaMeta.fetch(mint_pda);
            console.log(JSON.stringify(nft) + "\n");
            const new_owner = anchor.web3.Keypair.generate();
            const v_new = new VazhaNft(new_owner, connection);
            await v_new.fund_account();
            //Sign with new account : )
            //Raise Error : )
            const own = await program.rpc.updateAuthority(mint, new_owner.publicKey, {
                accounts: {
                    authority: new_owner.publicKey,
                    metaData: mint_pda,
                },
                signers: [new_owner],
            });
            // console.log(own);
        }
        await res().catch(err => console.log(`[Error]: ${err}\n`))
    });
    it("Transfer Nft", async () => {
        const vnft = new VazhaNft(keypair, connection);
        await vnft.init();
        const [mint, token_acc] = vnft.get_mint();
        console.log(`Mint : ${mint}\nToken Account : ${token_acc.address}\n`);
        const [mint_pda, _] = await vnft.get_pda(program.programId);
        const name = "v4zha";
        const collection = "v-collection";
        const uri = "va4zha.com hehe : )";
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
        // console.log(tx);
        //get nft : )
        const nft = await program.account.vkolaMeta.fetch(mint_pda);
        console.log(JSON.stringify(nft) + "\n");

        //Create new owner
        const new_key= anchor.web3.Keypair.generate();
        const new_owner=new VazhaNft(new_key,connection);
        const recv_token_acc = await new_owner.fund_account()
                            .then(()=>{return new_owner.create_token_account(vnft.mint)});
        await vnft.fund_account();
        await vnft.send_nft(new_owner.wallet.publicKey,recv_token_acc.address);
        //transfer nft ownership
        const own = await program.rpc.updateAuthority(mint, new_owner.wallet.publicKey, {
            accounts: {
                authority: keypair.publicKey,
                metaData: mint_pda,
            },
            signers: [keypair],
        });
        // console.log(own);
        //fetch nft : )
        const nft_new = await program.account.vkolaMeta.fetch(mint_pda);
        console.log(JSON.stringify(nft_new) + "\n");
        console.log(`Old owner >> ${nft.authority} \n new owner >> ${nft_new.authority}\n`);
    });
});