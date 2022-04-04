import * as anchor from "@project-serum/anchor";
import { getAccount, getMint, createTransferInstruction, createMint, mintTo, getOrCreateAssociatedTokenAccount, createSetAuthorityInstruction, AuthorityType, Account, TOKEN_PROGRAM_ID, closeAccount } from "@solana/spl-token";
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
    //Airdrop sol to account : )
    async fund_account() {
        const airdropSignature = await this.connection.requestAirdrop(
            this.wallet.publicKey,
            LAMPORTS_PER_SOL,
        );
        await this.connection.confirmTransaction(airdropSignature).then(() => console.log("Transaction successful")).catch(err => console.log(`Error : ${err}\n`));
    };
    //Create spl token : )
    async mint_token(): Promise<PublicKey> {
        const mint = await createMint(
            this.connection,
            this.wallet,
            this.wallet.publicKey,
            this.wallet.publicKey,
            0
        );
        return mint;
    }
    //Create Associated Token account to store spl token info : )
    async create_token_account(mint:PublicKey=this.mint): Promise<Account> {
        const token_account = await getOrCreateAssociatedTokenAccount(
            this.connection,
            this.wallet,
            mint,
            this.wallet.publicKey,
        );
        return token_account;
    }
    //Mint 1 spl token to Token Account and freeze mint authority <Coz its NFT : ) >
    async mint_nft() {
        await mintTo(
            this.connection,
            this.wallet,
            this.mint,
            this.token_account.address,
            this.wallet,
            1
        );
        const transaction = new Transaction()
            .add(createSetAuthorityInstruction(
                this.mint,
                this.wallet.publicKey,
                AuthorityType.MintTokens,
                null
            ));
        await sendAndConfirmTransaction(this.connection, transaction, [this.wallet]);
    }
    //Check account balance : )
    async check_balance() {
        this.connection.getBalance(this.wallet.publicKey).then(balance => console.log(`Sol balance : ${balance}\n`));
    }
    //Builder function to create NFT
    //->funds account ->create spl token -> create Token account -> mint 1 token and freeze authority : )
    async init() {
        await this.fund_account()
            .then(() => this.check_balance())
            .then(() => this.mint_token())
            .then(mint => { this.mint = mint; return this.create_token_account() })
            .then(token_acc => { this.token_account = token_acc; this.mint_nft() });
    }
    //getter : )
    get_mint(): [PublicKey, Account] {
        return [this.mint, this.token_account];
    }
    //Finding PDA For V4zhaNft smart contract to store NFT Metadata : )
    async get_pda(pid: PublicKey): Promise<[PublicKey, number]> {
        const res = await PublicKey.findProgramAddress([
            anchor.utils.bytes.utf8.encode("v4zha_nft"),
            this.mint.toBuffer(),
        ], pid);
        return res;
    }
    //get info of all mint in account 
    // get_all(): Array<PublicKey> {
    //     const res: PublicKey[] = [this.mint];
    //     return res;
    // }
    //send nft to other wallet : )
    async send_nft(reciever: PublicKey,recv_token_acc:PublicKey) {
        const transaction = new Transaction()
            .add(createTransferInstruction(
                this.token_account.address,
                recv_token_acc,
                this.wallet.publicKey,
                1,
                [],
                TOKEN_PROGRAM_ID,
            )
            );
        await sendAndConfirmTransaction(this.connection, transaction, [this.wallet]);
        console.log(`Mint info of sender : ${this.wallet.publicKey}\n`);
        await this.get_mint_info(this.token_account.address);
        console.log(`Mint info of reciever : ${reciever}\n`);
        await this.get_mint_info(recv_token_acc);
    }
    
    async get_mint_info(token_account: PublicKey, mint: PublicKey = this.mint) {
        const accountInfo = await getAccount(this.connection, token_account);

        console.log(`Token Acc info : ${accountInfo.address.toBase58()}\nNo Token owned : ${accountInfo.amount}\n`);
        const mintInfo = await getMint(
            this.connection,
            mint
        );
        console.log(`Mint info : ${mintInfo.address.toBase58()}\nmint_supply : ${mintInfo.supply}\n`);
    }
}

