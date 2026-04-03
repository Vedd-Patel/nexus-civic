import { Connection, Keypair, Transaction, TransactionInstruction, sendAndConfirmTransaction, PublicKey } from '@solana/web3.js';
import { logger } from './logger';

// Solana Memo Program v2
const MEMO_PROGRAM_ID = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');

export async function postExpenditureOnChain(entryId: string, metadata: Record<string, any>): Promise<string> {
  if (process.env.SOLANA_ENABLED !== 'true') {
    logger.warn('Solana is disabled. Returning mock signature.');
    return `mock_${Math.random().toString(36).substring(2, 15)}`;
  }

  try {
    const rpcUrl = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';
    const connection = new Connection(rpcUrl, 'confirmed');

    const privateKeyStr = process.env.SOLANA_WALLET_PRIVATE_KEY;
    if (!privateKeyStr) {
      throw new Error('SOLANA_WALLET_PRIVATE_KEY is not defined');
    }

    let privateKeyArr: number[];
    try {
      privateKeyArr = JSON.parse(privateKeyStr);
    } catch {
      privateKeyArr = privateKeyStr.split(',').map(n => parseInt(n.trim(), 10));
    }
    
    const keypair = Keypair.fromSecretKey(new Uint8Array(privateKeyArr));
    const memoText = JSON.stringify({ entryId, ...metadata });

    const transaction = new Transaction().add(
      new TransactionInstruction({
        keys: [],
        programId: MEMO_PROGRAM_ID,
        data: Buffer.from(memoText, 'utf8'),
      })
    );

    const signature = await sendAndConfirmTransaction(connection, transaction, [keypair]);
    logger.info(`Successfully posted expenditure to Solana: ${signature}`);
    return signature;
  } catch (error) {
    logger.error('Failed to post expenditure on chain', { error });
    throw error;
  }
}

export function getExplorerUrl(signature: string): string {
  if (signature.startsWith('mock_')) {
    return '#mock';
  }
  return `https://explorer.solana.com/tx/${signature}?cluster=devnet`;
}
