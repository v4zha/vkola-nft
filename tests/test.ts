import { clusterApiUrl, Connection } from "@solana/web3.js";
import {VazhaNft} from './mint_gen';
import * as anchor from '@project-serum/anchor';
let keypair= anchor.web3.Keypair.generate();
let connection = new Connection(clusterApiUrl('devnet'),'confirmed');
let vnft=new VazhaNft(keypair,connection);
let mint=vnft.mint;