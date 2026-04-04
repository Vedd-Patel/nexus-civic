'use client';
import { useState } from 'react';
import { SERVICE_URLS } from '@/lib/api';

export default function AddExpenditureCard() {
  const [department, setDepartment] = useState('Public Works');
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'idle'|'loading'|'success'|'error'>('idle');
  const [hash, setHash] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setHash(null);

    try {
      // NOTE: token normally required here, mock auth header for demo
      const res = await fetch(`${SERVICE_URLS.ledgerCivic}/api/expenditures`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer admin-mock-token'
        },
        body: JSON.stringify({
          department,
          category,
          amount: Number(amount),
          description
        })
      });

      const json = await res.json();
      if (json.success) {
        setStatus('success');
        setHash(json.data?.solanaSignature || null);
        setCategory('');
        setAmount('');
        setDescription('');
      } else {
        setStatus('error');
      }
    } catch (error) {
      console.error(error);
      setStatus('error');
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col relative w-full h-full">
      <div className="flex items-center gap-3 mb-4">
        <span className="p-2 bg-indigo-50 rounded-lg text-indigo-600 text-xl overflow-hidden shrink-0">💸</span>
        <h2 className="text-xl font-bold font-outfit text-slate-800">Log Expenditure (Solana)</h2>
      </div>
      
      <p className="text-xs text-slate-500 mb-6">Create a secure immutable record of city spending on the Solana Devnet ledger. This will sync immediately to the citizen dashboard.</p>

      <form onSubmit={handleSubmit} className="space-y-4 flex-1">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Department</label>
            <select 
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full text-sm border-slate-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50 p-2 border"
            >
              <option value="Public Works">Public Works</option>
              <option value="Health">Health</option>
              <option value="Education">Education</option>
              <option value="Security">Security</option>
              <option value="Sanitation">Sanitation</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Category</label>
            <input 
              required
              type="text" 
              placeholder="e.g. Roads, Supplies"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full text-sm border-slate-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50 p-2 border"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700">Amount (USD)</label>
          <input 
            required
            type="number" 
            placeholder="50000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full text-sm border-slate-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50 p-2 border"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700">Description</label>
          <textarea 
            required
            placeholder="Detail the expense..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full text-sm border-slate-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50 p-2 border min-h-[80px]"
          />
        </div>

        <button 
          type="submit" 
          disabled={status === 'loading'}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {status === 'loading' ? 'Encrypting & Broadcasting...' : 'Log on Solana'}
        </button>

        {status === 'success' && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
            <p className="text-xs text-emerald-800 font-medium">Successfully logged to Solana devnet!</p>
            {hash && (
              <a 
                href={hash.startsWith('mock_') ? 'https://explorer.solana.com/?cluster=devnet' : `https://explorer.solana.com/tx/${hash}?cluster=devnet`} 
                target="_blank" 
                rel="noreferrer"
                className="mt-1 flex items-center gap-1 text-[10px] text-emerald-600 font-mono break-all hover:underline"
              >
                {hash.startsWith('mock_') ? 'Simulated Devnet Link ↗' : `Signature: ${hash} ↗`}
              </a>
            )}
          </div>
        )}
        
        {status === 'error' && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-xs text-red-800 font-medium">Failed to broadcast transaction to Solana.</p>
          </div>
        )}
      </form>
    </div>
  );
}
