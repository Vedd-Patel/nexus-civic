"use client";
import React, { useState } from 'react';
import useSWR from 'swr';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function BudgetPage() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loadingAnswer, setLoadingAnswer] = useState(false);

  const baseUrl = process.env.NEXT_PUBLIC_LEDGER_CIVIC_URL || 'http://localhost:3009';
  const { data: budgetData } = useSWR(`${baseUrl}/api/budget/summary`, fetcher);
  const { data: expData } = useSWR(`${baseUrl}/api/expenditures`, fetcher);

  const data = budgetData?.data?.departments?.map((d: any) => ({
    name: d.name,
    alloc: d.allocation * 1000,
    actual: d.actual * 1000
  })) || [
    { name: 'Public Works', alloc: 500000, actual: 480000 },
    { name: 'Health', alloc: 300000, actual: 320000 },
    { name: 'Education', alloc: 800000, actual: 750000 },
    { name: 'Security', alloc: 400000, actual: 440000 }
  ];

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

  const handleAsk = async () => {
    if(!question) return;
    setLoadingAnswer(true);
    setAnswer("");
    try {
      const response = await fetch(`${baseUrl}/api/budget/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question })
      });
      const resData = await response.json();
      if (resData.success && resData.data) {
        setAnswer(resData.data);
      } else {
        setAnswer("Sorry, I couldn't retrieve an answer at this time.");
      }
    } catch (error) {
      console.error('Error asking budget question:', error);
      setAnswer("Sorry, there was an error processing your request.");
    } finally {
      setLoadingAnswer(false);
    }
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-lg">
          <p className="font-bold text-lg text-slate-800 mb-2">{label}</p>
          <div className="space-y-1">
             <p className="text-indigo-600 font-mono flex justify-between gap-4">
                <span>Allocated:</span> 
                <span className="text-slate-800">${payload[0].value.toLocaleString()}</span>
             </p>
             <p className="text-sky-500 font-mono flex justify-between gap-4">
                <span>Actual:</span> 
                <span className="text-slate-800">${payload[1].value.toLocaleString()}</span>
             </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 mt-6 pb-20">
      
      {/* Header */}
      <div className="text-center space-y-2 mb-10">
         <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 font-outfit">
           LedgerCivic Explorer
         </h1>
         <p className="text-xl text-slate-500 font-light tracking-wide">Your Tax Money, Transparently.</p>
      </div>

      {/* Anomaly Banner */}
      {budgetData?.data?.anomalies?.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-center gap-4 text-red-600 relative overflow-hidden group">
           <span className="text-3xl animate-bounce">⚠️</span>
           <div>
              <p className="font-bold text-lg">Budget Anomaly Detected</p>
              <p className="text-red-500">{budgetData.data.anomalies.length} departments are flagged for budget variance this month.</p>
           </div>
        </div>
      )}

      {/* Chart Section */}
      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm relative overflow-hidden group">
        <h3 className="font-bold text-2xl mb-8 flex items-center gap-3 text-slate-800">
           <span className="p-2 bg-indigo-50 rounded-lg text-indigo-600">📊</span> 
           Allocation vs Actual (USD)
        </h3>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
              <XAxis dataKey="name" stroke="#94A3B8" tick={{fill: '#64748B'}} tickLine={false} axisLine={false} />
              <YAxis stroke="#94A3B8" tick={{fill: '#64748B'}} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value/1000}k`} />
              <Tooltip content={<CustomTooltip />} cursor={{fill: '#F1F5F9'}} />
              <Legend wrapperStyle={{paddingTop: '20px'}} />
              <Bar dataKey="alloc" name="Allocated" fill="#818CF8" radius={[6, 6, 0, 0]} barSize={40} />
              <Bar dataKey="actual" name="Actual Spend" fill="#38BDF8" radius={[6, 6, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid for Table & Chat */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
        {/* Table Section */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm overflow-hidden lg:col-span-2">
           <h3 className="font-bold text-xl mb-6 flex items-center gap-3 text-slate-800">
             <span className="p-2 bg-blue-50 rounded-lg text-blue-500">🧾</span>
             Recent Expenditures
           </h3>
           <div className="overflow-x-auto">
             <table className="w-full text-left text-sm">
               <thead className="text-slate-500 border-b border-slate-200">
                 <tr>
                   <th className="pb-4 font-semibold">Date</th>
                   <th className="pb-4 font-semibold">Department</th>
                   <th className="pb-4 font-semibold">Amount</th>
                   <th className="pb-4 font-semibold">Status</th>
                   <th className="pb-4 font-semibold">Verification</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                 {expenditures.map((e: any) => (
                   <tr key={e.id} className="hover:bg-slate-50 transition-colors group">
                     <td className="py-4 text-slate-500 group-hover:text-slate-700 transition-colors">{e.date}</td>
                     <td className="py-4">
                        <p className="font-medium text-slate-700">{e.dept}</p>
                        <p className="text-xs text-slate-400">{e.cat}</p>
                     </td>
                     <td className="py-4 font-mono font-bold text-lg text-indigo-600">{e.amt}</td>
                     <td className="py-4">
                       <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider ${e.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-amber-50 text-amber-600 border border-amber-200'}`}>
                         {e.status}
                       </span>
                     </td>
                     <td className="py-4">
                       <a 
                         href={e.isMock ? 'https://explorer.solana.com/?cluster=devnet' : `https://explorer.solana.com/tx/${e.link}?cluster=devnet`} 
                         target="_blank" 
                         rel="noreferrer" 
                         className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${e.isMock ? 'bg-slate-50 border border-slate-200 text-slate-500 hover:bg-slate-100' : 'bg-blue-50 border border-blue-200 text-blue-600 hover:bg-blue-100'}`}
                       >
                         {e.isMock ? <span className="w-2 h-2 rounded-full bg-slate-400"></span> : <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>}
                         {e.isMock ? 'Simulated Log ↗' : 'View on Solana ↗'}
                       </a>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </div>

        {/* AI Chat Section */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col relative overflow-hidden">
           
           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
           
           <h3 className="font-bold text-xl mb-2 flex items-center gap-3 text-slate-800">
             <span className="text-2xl">🤖</span> Civic AI
           </h3>
           <p className="text-sm text-slate-500 mb-6">Ask natural language questions about city spending.</p>
           
           <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2">
              {loadingAnswer && (
                 <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 self-start animate-pulse flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-indigo-600 text-sm">Analyzing ledgers...</span>
                 </div>
              )}
              {answer && (
                 <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-slate-700 animate-in fade-in slide-in-from-bottom-2 duration-300 shadow-sm">
                   <p className="leading-relaxed text-sm">{answer}</p>
                 </div>
              )}
           </div>

           <div className="mt-auto">
              <div className="relative group">
                 <input 
                   className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-12 py-3 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" 
                   placeholder="e.g., Why is health over budget?" 
                   value={question} 
                   onChange={e => setQuestion(e.target.value)}
                   onKeyDown={e => e.key === 'Enter' && handleAsk()}
                 />
                 <button 
                    onClick={handleAsk} 
                    disabled={!question || loadingAnswer}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm"
                 >
                    <span className="text-sm text-white">↗️</span>
                 </button>
              </div>
           </div>
        </div>

      </div>

    </div>
  );
}
