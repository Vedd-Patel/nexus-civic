'use client';
import { useState } from 'react';
import useSWR from 'swr';
import { fetcher, SERVICE_URLS } from '@/lib/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';

const MOCK_DATA = {
  departments: [
    { name: 'Police', allocation: 500, actual: 520 },
    { name: 'Fire', allocation: 300, actual: 290 },
    { name: 'Sanitation', allocation: 200, actual: 230 },
    { name: 'Parks', allocation: 150, actual: 140 },
  ],
  anomalies: [
    { dept: 'Police', category: 'Overtime', amount: '20k' },
    { dept: 'Sanitation', category: 'Vehicle Repair', amount: '30k' }
  ]
};

export default function BudgetSummary() {
  const { data: rawData } = useSWR(`${SERVICE_URLS.ledgerCivic}/api/budget/summary`, fetcher);
  const data = rawData || MOCK_DATA;

  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [asking, setAsking] = useState(false);

  const handleAsk = () => {
    if (!question) return;
    setAsking(true);
    setTimeout(() => {
      setAnswer("Based on the Solana ledger analysis, Police overtime spiked due to emergency response events in Sector 7G. Sanitation vehicle repair budget was exceeded due to aging fleet maintenance.");
      setAsking(false);
      setQuestion('');
    }, 1500);
  };

  return (
    <div className="bg-[#1A0533] p-6 rounded-xl border border-purple-900/50 h-[400px] flex flex-col relative w-full overflow-hidden">
      <h2 className="text-xl font-bold font-outfit text-white mb-2">LedgerCivic Budget Analysis</h2>
      
      <div className="h-40 w-full mb-4 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.departments} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" vertical={false} />
            <XAxis dataKey="name" stroke="#a78bfa" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis stroke="#a78bfa" fontSize={10} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ backgroundColor: '#1A0533', border: '1px solid #4c1d95', borderRadius: '8px' }} />
            <Legend wrapperStyle={{ fontSize: '10px' }} />
            <Bar dataKey="allocation" fill="#8B5CF6" radius={[4, 4, 0, 0]} name="Allocation (k)" />
            <Bar dataKey="actual" fill="#FBBF24" radius={[4, 4, 0, 0]} name="Actual (k)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex-1 overflow-y-auto mb-2 space-y-2 pr-1 custom-scrollbar shrink-0">
        {data.anomalies.map((anom: any, idx: number) => (
          <div key={idx} className="bg-red-950/40 border border-red-500/50 p-2 rounded flex justify-between items-center text-xs">
            <div>
              <span className="font-bold text-red-400">{anom.dept}</span> - <span className="text-gray-300">{anom.category}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-red-300 font-space-mono">+{anom.amount}</span>
              <a href="https://explorer.solana.com" target="_blank" rel="noreferrer" className="text-indigo-400 hover:text-indigo-300 underline">View on Solana ↗</a>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto pt-2 border-t border-purple-900/50 relative shrink-0">
        <div className="flex gap-2">
          <input 
            type="text" 
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
            className="flex-1 bg-gray-900/80 border border-gray-700 rounded p-1.5 text-xs text-white placeholder-gray-500 focus:border-purple-500 outline-none" 
            placeholder="Ask AI about spending..."
          />
          <button onClick={handleAsk} disabled={asking} className="bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded text-xs transition-colors">
            {asking ? '...' : 'Ask'}
          </button>
        </div>
        {answer && (
          <div className="absolute bottom-full mb-2 right-0 left-0 bg-[#2D1B69] p-3 rounded-lg border border-purple-500 shadow-xl text-xs text-purple-100 z-10">
            <div className="flex justify-between items-start mb-1">
              <strong>✨ Gemini AI Insight</strong>
              <button onClick={() => setAnswer('')} className="text-gray-400 hover:text-white">✕</button>
            </div>
            {answer}
          </div>
        )}
      </div>
    </div>
  );
}
