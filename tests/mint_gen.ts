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
    async fund_account(wallet: anchor.web3.Signer = this.wallet) {
        const airdropSignature = await this.connection.requestAirdrop(
            wallet.publicKey,
            LAMPORTS_PER_SOL,
        );
        await this.connection.confirmTransaction(airdropSignature).then(() => console.log("Transaction successful")).catch(err => console.log(`Error : ${err}\n`));
    };

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

    async create_token_account(usr_wallet: anchor.web3.Signer = this.wallet): Promise<Account> {
        const token_account = await getOrCreateAssociatedTokenAccount(
            this.connection,
            usr_wallet,
            this.mint,
            usr_wallet.publicKey,
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
        const transaction = new Transaction()
            .add(createSetAuthorityInstruction(
                this.mint,
                this.wallet.publicKey,
                AuthorityType.MintTokens,
                null
            ));
        await sendAndConfirmTransaction(this.connection, transaction, [this.wallet]);
    }
    async check_balance() {
        this.connection.getBalance(this.wallet.publicKey).then(balance => console.log(`Sol balance : ${balance}\n`));
    }
    async init() {
        await this.fund_account()
            .then(() => this.check_balance())
            .then(() => this.mint_token())
            .then(mint => { this.mint = mint; return this.create_token_account() })
            .then(token_acc => { this.token_account = token_acc; this.mint_nft() });
    }
    get_mint(): [PublicKey, Account] {
        return [this.mint, this.token_account];
    }
    async get_pda(pid: PublicKey): Promise<[PublicKey, number]> {
        const res = await PublicKey.findProgramAddress([
            anchor.utils.bytes.utf8.encode("v4zha_nft"),
            this.mint.toBuffer(),
        ], pid);
        return res;
    }
    get_all(): Array<PublicKey> {
        const res: PublicKey[] = [this.mint];
        return res;
    }
    async send_nft(reciever: anchor.web3.Signer) {
        const recv_token_acc = await this.fund_account(reciever)
            .then(() => this.create_token_account(reciever))
            .then(token_acc => { return token_acc });
        const transaction = new Transaction()
            .add(createTransferInstruction(
                this.token_account.address,
                recv_token_acc.address,
                this.wallet.publicKey,
                1,
                [],
                TOKEN_PROGRAM_ID,
            )
            );
        await sendAndConfirmTransaction(this.connection, transaction, [this.wallet]);
        console.log(`Mint info of sender : ${this.wallet.publicKey}\n`);
        await this.get_mint_info(this.token_account);
        console.log(`Mint info of reciever : ${reciever.publicKey}\n`);
        await this.get_mint_info(recv_token_acc);
    }
    async get_mint_info(token_account: Account, mint:PublicKey=this.mint) {
        const accountInfo = await getAccount(this.connection, token_account.address);

        console.log(`Token Acc info : ${accountInfo.address.toBase58()}\nNo Token owned : ${accountInfo.amount}\n`);
        const mintInfo = await getMint(
            this.connection,
            mint
        );
        console.log(`Mint info : ${mintInfo.address.toBase58()}\nmint_supply : ${mintInfo.supply}\n`);
    }
}

