"use client";
import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

export default function BudgetPage() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loadingAnswer, setLoadingAnswer] = useState(false);

  const data = [
    { name: 'Public Works', alloc: 500000, actual: 480000 },
    { name: 'Health', alloc: 300000, actual: 320000 },
    { name: 'Education', alloc: 800000, actual: 750000 },
    { name: 'Security', alloc: 400000, actual: 440000 }
  ];

  const expenditures = [
    { id: 1, date: "2026-04-01", dept: "Public Works", cat: "Road Repair", amt: "$15,000", status: "Completed", link: "0xMockHash123a" },
    { id: 2, date: "2026-04-02", dept: "Health", cat: "Supplies", amt: "$8,200", status: "Processing", link: null },
    { id: 3, date: "2026-04-03", dept: "Security", cat: "Equipment", amt: "$45,000", status: "Completed", link: "0xMockHash456b" }
  ];

  const handleAsk = () => {
    if(!question) return;
    setLoadingAnswer(true);
    setAnswer("");
    setTimeout(() => {
       setAnswer("Based on recent blockchain records, the city has allocated exactly 15% more budget toward road repairs this quarter. Transactions for 'Public Works' are up.");
       setLoadingAnswer(false);
    }, 1500);
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1e1b4b]/95 border border-indigo-500/50 p-4 rounded-xl shadow-2xl backdrop-blur-md">
          <p className="font-bold text-lg text-white mb-2">{label}</p>
          <div className="space-y-1">
             <p className="text-indigo-400 font-mono flex justify-between gap-4">
                <span>Allocated:</span> 
                <span className="text-white">${payload[0].value.toLocaleString()}</span>
             </p>
             <p className="text-sky-400 font-mono flex justify-between gap-4">
                <span>Actual:</span> 
                <span className="text-white">${payload[1].value.toLocaleString()}</span>
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
         <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 font-outfit">
           LedgerCivic Explorer
         </h1>
         <p className="text-xl text-slate-400 font-light tracking-wide">Your Tax Money, Transparently.</p>
      </div>

      {/* Anomaly Banner */}
      <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-5 flex items-center gap-4 text-red-400 shadow-[0_0_30px_rgba(239,68,68,0.1)] relative overflow-hidden group">
         <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/10 to-red-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
         <span className="text-3xl animate-bounce">⚠️</span>
         <div>
            <p className="font-bold text-lg">Budget Anomaly Detected</p>
            <p className="text-red-300">2 departments (Health, Security) are over budget this month.</p>
         </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -z-10 group-hover:bg-indigo-500/20 transition-colors"></div>
        <h3 className="font-bold text-2xl mb-8 flex items-center gap-3">
           <span className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">📊</span> 
           Allocation vs Actual (USD)
        </h3>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
              <XAxis dataKey="name" stroke="#64748b" tick={{fill: '#94a3b8'}} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" tick={{fill: '#94a3b8'}} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value/1000}k`} />
              <Tooltip content={<CustomTooltip />} cursor={{fill: '#ffffff05'}} />
              <Legend wrapperStyle={{paddingTop: '20px'}} />
              <Bar dataKey="alloc" name="Allocated" fill="url(#colorAlloc)" radius={[6, 6, 0, 0]} barSize={40} />
              <Bar dataKey="actual" name="Actual Spend" fill="url(#colorActual)" radius={[6, 6, 0, 0]} barSize={40} />
              <defs>
                 <linearGradient id="colorAlloc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.8}/>
                 </linearGradient>
                 <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0.8}/>
                 </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid for Table & Chat */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
        {/* Table Section */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl overflow-hidden lg:col-span-2">
           <h3 className="font-bold text-xl mb-6 flex items-center gap-3">
             <span className="p-2 bg-blue-500/20 rounded-lg text-blue-400">🧾</span>
             Recent Expenditures
           </h3>
           <div className="overflow-x-auto">
             <table className="w-full text-left text-sm">
               <thead className="text-slate-400 border-b border-white/10">
                 <tr>
                   <th className="pb-4 font-semibold">Date</th>
                   <th className="pb-4 font-semibold">Department</th>
                   <th className="pb-4 font-semibold">Amount</th>
                   <th className="pb-4 font-semibold">Status</th>
                   <th className="pb-4 font-semibold">Verification</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-white/5">
                 {expenditures.map(e => (
                   <tr key={e.id} className="hover:bg-white/5 transition-colors group">
                     <td className="py-4 text-slate-300 group-hover:text-white transition-colors">{e.date}</td>
                     <td className="py-4">
                        <p className="font-medium text-slate-200">{e.dept}</p>
                        <p className="text-xs text-slate-500">{e.cat}</p>
                     </td>
                     <td className="py-4 font-mono font-bold text-lg text-indigo-300">{e.amt}</td>
                     <td className="py-4">
                       <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider ${e.status === 'Completed' ? 'bg-green-500/20 text-green-400 border border-green-500/20' : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/20'}`}>
                         {e.status}
                       </span>
                     </td>
                     <td className="py-4">
                       {e.link ? (
                         <a href={`https://explorer.solana.com/tx/${e.link}?cluster=devnet`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 text-blue-300 px-4 py-1.5 rounded-full text-xs font-semibold hover:from-blue-500/40 hover:to-purple-500/40 transition-all shadow-[0_0_10px_rgba(59,130,246,0.2)]">
                           <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                           View on Solana ↗
                         </a>
                       ) : (
                         <span className="inline-flex items-center gap-2 bg-slate-800 border border-slate-700 text-slate-400 px-4 py-1.5 rounded-full text-xs font-semibold">
                           <span className="w-2 h-2 rounded-full bg-slate-600"></span>
                           Mock Record
                         </span>
                       )}
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </div>

        {/* AI Chat Section */}
        <div className="bg-gradient-to-b from-indigo-900/40 to-black/40 backdrop-blur-xl border border-indigo-500/20 rounded-3xl p-6 shadow-2xl flex flex-col relative overflow-hidden">
           
           {/* Decorative elements */}
           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
           
           <h3 className="font-bold text-xl mb-2 flex items-center gap-3">
             <span className="text-2xl">🤖</span> Civic AI
           </h3>
           <p className="text-sm text-indigo-300 mb-6">Ask natural language questions about city spending.</p>
           
           <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2">
              {loadingAnswer && (
                 <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 self-start animate-pulse flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-indigo-300 text-sm">Analyzing ledgers...</span>
                 </div>
              )}
              {answer && (
                 <div className="bg-indigo-600/20 border border-indigo-500/30 rounded-xl p-4 text-indigo-100 animate-in fade-in slide-in-from-bottom-2 duration-300 shadow-lg">
                   <p className="leading-relaxed text-sm">{answer}</p>
                 </div>
              )}
           </div>

           <div className="mt-auto">
              <div className="relative group">
                 <input 
                   className="w-full bg-black/50 border border-indigo-500/30 rounded-xl pl-4 pr-12 py-3 text-white placeholder:text-indigo-500/50 focus:outline-none focus:border-indigo-400 focus:bg-indigo-950/30 transition-all shadow-inner" 
                   placeholder="e.g., Why is health over budget?" 
                   value={question} 
                   onChange={e => setQuestion(e.target.value)}
                   onKeyDown={e => e.key === 'Enter' && handleAsk()}
                 />
                 <button 
                    onClick={handleAsk} 
                    disabled={!question || loadingAnswer}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-500 rounded-lg hover:bg-indigo-400 disabled:opacity-50 transition-colors shadow-lg"
                 >
                    <span className="text-sm">↗️</span>
                 </button>
              </div>
           </div>
        </div>

      </div>

    </div>
  );
}
