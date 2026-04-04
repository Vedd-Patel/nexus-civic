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
  const data = {
    departments: Array.isArray((rawData as any)?.departments)
      ? (rawData as any).departments
      : Array.isArray((rawData as any)?.data?.departments)
        ? (rawData as any).data.departments
        : MOCK_DATA.departments,
    anomalies: Array.isArray((rawData as any)?.anomalies)
      ? (rawData as any).anomalies
      : Array.isArray((rawData as any)?.data?.anomalies)
        ? (rawData as any).data.anomalies
        : MOCK_DATA.anomalies,
  };

  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [asking, setAsking] = useState(false);

  const handleAsk = async () => {
    if (!question) return;
    setAsking(true);
    try {
      const res = await fetch(`${SERVICE_URLS.ledgerCivic}/api/budget/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question })
      });
      const json = await res.json();
      if (json.success && json.data) {
        setAnswer(json.data);
      } else {
        setAnswer("Failed to process request. AI might be temporarily unavailable.");
      }
    } catch {
      setAnswer("Failed to query AI assistant. Network error.");
    } finally {
      setAsking(false);
      setQuestion('');
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-[400px] flex flex-col relative w-full overflow-hidden">
      <h2 className="text-xl font-bold font-outfit text-slate-800 mb-2">LedgerCivic Budget Analysis</h2>
      
      <div className="h-40 w-full mb-4 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.departments} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
            <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }} />
            <Legend wrapperStyle={{ fontSize: '10px' }} />
            <Bar dataKey="allocation" fill="#818CF8" radius={[4, 4, 0, 0]} name="Allocation (k)" />
            <Bar dataKey="actual" fill="#FBBF24" radius={[4, 4, 0, 0]} name="Actual (k)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex-1 overflow-y-auto mb-2 space-y-2 pr-1 shrink-0">
        {data.anomalies.map((anom: any, idx: number) => {
          if (!anom || typeof anom !== 'object') return null;
          return (
          <div key={idx} className="bg-red-50 border border-red-200 p-2 rounded-md flex justify-between items-center text-xs">
            <div>
              <span className="font-bold text-red-600">{anom.dept}</span> - <span className="text-slate-600">{anom.category}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-red-500 font-space-mono font-medium">+{anom.amount}</span>
              <a href="https://explorer.solana.com" target="_blank" rel="noreferrer" className="text-indigo-600 hover:text-indigo-800 font-medium">View on Solana ↗</a>
            </div>
          </div>
        )})}
      </div>

      <div className="mt-auto pt-2 border-t border-slate-200 relative shrink-0">
        <div className="flex gap-2">
          <input 
            type="text" 
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" 
            placeholder="Ask AI about spending..."
          />
          <button onClick={handleAsk} disabled={asking} className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs transition-colors shadow-sm">
            {asking ? '...' : 'Ask'}
          </button>
        </div>
        {answer && (
          <div className="absolute bottom-full mb-2 right-0 left-0 bg-white p-3 rounded-lg border border-indigo-200 shadow-lg text-xs text-slate-700 z-10">
            <div className="flex justify-between items-start mb-1">
              <strong className="text-indigo-600">✨ Gemini AI Insight</strong>
              <button onClick={() => setAnswer('')} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>
            {answer}
          </div>
        )}
      </div>
    </div>
  );
}
