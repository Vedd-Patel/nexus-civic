'use client';
import useSWR from 'swr';
import { fetcher, SERVICE_URLS } from '@/lib/api';

export default function AdminExpenditureList() {
  const { data: expData } = useSWR(`${SERVICE_URLS.ledgerCivic}/api/expenditures`, fetcher);

  const expenditures = expData?.data?.map((e: any) => ({
    id: e._id,
    date: new Date(e.createdAt).toISOString().split('T')[0],
    dept: e.department,
    cat: e.category,
    amt: `$${e.amount.toLocaleString()}`,
    status: 'Completed',
    link: e.solanaSignature,
    isMock: e.isMockSignature || (e.solanaSignature && e.solanaSignature.startsWith('mock_'))
  })) || [];

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col relative w-full h-full">
      <div className="flex items-center gap-3 mb-4">
        <span className="p-2 bg-blue-50 rounded-lg text-blue-600 text-xl overflow-hidden shrink-0">🧾</span>
        <h2 className="text-xl font-bold font-outfit text-slate-800">Actual Ledger Log</h2>
      </div>

      <div className="flex-1 overflow-y-auto pr-2">
        <div className="space-y-3">
          {expenditures.map((e: any) => (
            <div key={e.id} className="p-3 border border-slate-100 bg-slate-50 rounded-lg flex justify-between items-center group hover:bg-white transition-colors">
              <div>
                <p className="text-sm font-bold text-slate-800">{e.dept} <span className="text-xs text-slate-500 font-normal ml-1">({e.cat})</span></p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-mono text-indigo-600 font-medium text-sm">{e.amt}</span>
                  <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">{e.date}</span>
                </div>
              </div>
              <a 
                href={e.isMock ? 'https://explorer.solana.com/?cluster=devnet' : `https://explorer.solana.com/tx/${e.link}?cluster=devnet`} 
                target="_blank" 
                rel="noreferrer"
                className={`text-[10px] px-3 py-1.5 rounded-full font-bold flex items-center gap-1.5 transition-all ${e.isMock ? 'bg-slate-100 text-slate-500 hover:bg-slate-200' : 'bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100'}`}
              >
                {e.isMock ? <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span> : <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>}
                {e.isMock ? 'Mock Link ↗' : 'Devnet Link ↗'}
              </a>
            </div>
          ))}
          {expenditures.length === 0 && (
             <p className="text-xs text-slate-400 italic text-center py-4">No expenditures parsed.</p>
          )}
        </div>
      </div>
    </div>
  );
}
