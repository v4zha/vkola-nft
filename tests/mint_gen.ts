// import { Wallet } from "@project-serum/anchor";
import { getAccount, createMint, mintTo, getOrCreateAssociatedTokenAccount, getMint, createSetAuthorityInstruction, AuthorityType, Account } from "@solana/spl-token";
import {  Connection, LAMPORTS_PER_SOL, Transaction, sendAndConfirmTransaction, Signer, PublicKey } from "@solana/web3.js";

export class VazhaNft {
    wallet:Signer;
    connection:Connection;
    mint:PublicKey;
    token_account:Account;

    constructor(wallet:Signer,connection:Connection){
        this.wallet=wallet;
        this.connection=connection;
        this.fund_account();
        this.mint_token().then(mint=>this.mint=mint).catch(err=>`Error in minting token : ) ${err}`);
        this.create_token_account().then(token_acc=>this.token_account=token_acc).catch(err=>`Error creating ATA ${err}`);
        this.mint_nft().then(()=>"Nft Mint successful : )").catch(err=>`Error in minting Nft ${err}`);
    }
    async fund_account() {
        const airdropSignature = await this.connection.requestAirdrop(
            this.wallet.publicKey,
            LAMPORTS_PER_SOL,
        );
        await this.connection.confirmTransaction(airdropSignature);
    };

    async mint_token(): Promise<PublicKey> {
        const mint = await createMint(
            this.connection,
            this.wallet,
            this.wallet.publicKey,
            this.wallet.publicKey,
            0
        );
        console.log(`token id : ${mint}`);
        return mint;
    }

    async create_token_account(): Promise<Account> {
        const token_account = await getOrCreateAssociatedTokenAccount(
            this.connection,
            this.wallet,
            this.mint,
            this.wallet.publicKey,
        );
        console.log(`token account : ${token_account.address}`);
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

        const accountInfo = await getAccount(this.connection, this.token_account.address);

        console.log(accountInfo.amount);
        const mintInfo = await getMint(
            this.connection,
            this.mint
        );
        console.log(mintInfo);
    }
}

