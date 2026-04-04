import { Connection, Keypair, LAMPORTS_PER_SOL } from '@solana/web3.js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function main() {
  const privateKeyStr = process.env.SOLANA_WALLET_PRIVATE_KEY;
  if (!privateKeyStr) throw new Error('No private key');
  
  let privateKeyArr: number[];
  try {
    privateKeyArr = JSON.parse(privateKeyStr);
  } catch {
    privateKeyArr = privateKeyStr.split(',').map(n => parseInt(n.trim(), 10));
  }
  
  const keypair = Keypair.fromSecretKey(new Uint8Array(privateKeyArr));
  console.log('Public Key:', keypair.publicKey.toBase58());
  
  const connection = new Connection(process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com', 'confirmed');
  const balance = await connection.getBalance(keypair.publicKey);
  console.log(`Balance: ${balance / LAMPORTS_PER_SOL} SOL`);
  
  if (balance === 0) {
    console.log('Airdropping 1 SOL...');
    const sig = await connection.requestAirdrop(keypair.publicKey, 1 * LAMPORTS_PER_SOL);
    await connection.confirmTransaction(sig);
    console.log('Airdropped 1 SOL, new balance:', await connection.getBalance(keypair.publicKey) / LAMPORTS_PER_SOL);
  }
}

main().catch(console.error);
