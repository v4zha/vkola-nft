 import * as anchor from "@project-serum/anchor";
import { getAccount, createMint, mintTo, getOrCreateAssociatedTokenAccount, getMint, createSetAuthorityInstruction, AuthorityType, Account } from "@solana/spl-token";
import { Connection, LAMPORTS_PER_SOL, Transaction, sendAndConfirmTransaction, Signer, PublicKey } from "@solana/web3.js";

export class VazhaNft {
    wallet: Signer;
    connection: Connection;
    mint: PublicKey;
    token_account: Account;

     constructor(wallet: Signer, connection: Connection) {
        this.wallet = wallet;
        this.connection = connection;        
    }
    async fund_account() {
        const airdropSignature = await this.connection.requestAirdrop(
            this.wallet.publicKey,
            LAMPORTS_PER_SOL,
        );
        await this.connection.confirmTransaction(airdropSignature).then(() => console.log("Transaction successful")).catch(err => console.log(`Error : ${err}\n`));
    };

    async mint_token() :Promise<PublicKey>{
        const mint = await createMint(
            this.connection,
            this.wallet,
            this.wallet.publicKey,
            this.wallet.publicKey,
            0
        );
        return mint;
    }

    async create_token_account():Promise<Account>{
        const token_account = await getOrCreateAssociatedTokenAccount(
            this.connection,
            this.wallet,
            this.mint,
            this.wallet.publicKey,
        );
        return token_account;
    }
    async mint_nft() {
        await mintTo(
            this.connection,
            this.wallet,
            this.mint,
            this.token_account.address,
            this.wallet,
            1
        );
        let transaction = new Transaction()
            .add(createSetAuthorityInstruction(
                this.mint,
                this.wallet.publicKey,
                AuthorityType.MintTokens,
                null
            ));
        await sendAndConfirmTransaction(this.connection, transaction, [this.wallet]);

        // const accountInfo = await getAccount(this.connection, this.token_account.address);

        // console.log(accountInfo.amount);
        // const mintInfo = await getMint(
        //     this.connection,
        //     this.mint
        // );
        // console.log(mintInfo);
    }
    async check_balance() {
        this.connection.getBalance(this.wallet.publicKey).then(balance => console.log(`Sol balance : ${balance}\n`));
    }
    async init(){
        await this.fund_account()
        .then(()=>this.check_balance())        
        .then(()=>this.mint_token())
        .then(mint=>{this.mint=mint;return this.create_token_account()})
        .then(token_acc=>{this.token_account=token_acc;this.mint_nft()});
    }
    get_mint():[PublicKey,Account]{
        return [this.mint,this.token_account];
    }
    async get_pda(pid:PublicKey):Promise<[PublicKey,number]>{
       const res=await PublicKey.findProgramAddress([
            anchor.utils.bytes.utf8.encode("v4zha_nft"),
            this.mint.toBuffer(),
        ],pid);
        return res;
    }
    get_all():Array<PublicKey>{
        const res:PublicKey[]=[this.mint];
        return res;
    }
}

