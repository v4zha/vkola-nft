import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { Keypair } from "@solana/web3.js";
import { Vnft } from "../target/types/vnft";

describe("vnft Tests : )", () => {
  // Configure the client to use the local cluster.
  const provider=anchor.Provider.env();
  anchor.setProvider(provider);
  console.log(process.env.ANCHOR_PROVIDER_URL);
  console.log(JSON.stringify(provider.wallet.publicKey));
  const program = anchor.workspace.Vnft as Program<Vnft>;
  const keypair1=anchor.web3.Keypair.generate();
  const keypair2=anchor.web3.Keypair.generate();
  it("Create account 1", async () => {
    // Add your test here.
    const data="hello";
    const tx = await program.rpc.mintNft(data,{
      accounts:{
        account:keypair1.publicKey,
        authority:provider.wallet.publicKey,
        systemProgram:anchor.web3.SystemProgram.programId,
      },
      signers:[keypair1]
    });
    console.log("Your transaction signature", tx);
  });
  it("Create account 2",async ()=>{
        const data="vazha";
    const tx = await program.rpc.mintNft(data,{
      accounts:{
        account:keypair2.publicKey,
        // authority:provider.wallet.publicKey,
        systemProgram:anchor.web3.SystemProgram.programId,
      },
      signers:[keypair2]
    });
    console.log("Your transaction signature", tx);
  });
  it("Fetch account 1 ",async ()=>{
  const account=await program.account.vazhaNft.fetch(keypair1.publicKey);
  console.log(`User 1:${keypair1.publicKey}\naccount 1 : ${JSON.stringify(account)}`)
  });
  it("Fetch account 2 ",async ()=>{
  const account=await program.account.vazhaNft.fetch(keypair2.publicKey);
  console.log(`User 2:${keypair2.publicKey}\naccount 2 : ${JSON.stringify(account)}`);
  })
  it("Transfer OwnerShip",async ()=>{
      console.log("Transfer ownership from User1 to User2");
      const tx=await program.rpc.transferNft(keypair2.publicKey,{
        accounts:{
          account:keypair1.publicKey,
          authority:provider.wallet.publicKey,
        }
      });
    const account1=await program.account.vazhaNft.fetch(keypair1.publicKey);
    console.log(`User 1:${keypair1.publicKey}\naccount 1 : ${JSON.stringify(account1)}`);
    const account2=await program.account.vazhaNft.fetch(keypair2.publicKey);
  console.log(`User 2:${keypair2.publicKey}\naccount 2 : ${JSON.stringify(account2)}`);
  });
});
