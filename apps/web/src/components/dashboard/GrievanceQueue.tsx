'use client';
import useSWR from 'swr';
import axios from 'axios';

const fetcher = (url: string) => axios.get(url).then(res => res.data.data);

export default function GrievanceQueue() {
  const { data: rawData, mutate } = useSWR('/api/reports', fetcher, { refreshInterval: 5000 });
  const data = Array.isArray(rawData) ? rawData : [];

  const getPriorityStyle = (p: string) => {
    switch(p) {
      case 'CRITICAL': return 'bg-red-100 text-red-700 border border-red-200 animate-pulse';
      case 'HIGH': return 'bg-orange-100 text-orange-700 border border-orange-200';
      case 'MEDIUM': return 'bg-amber-100 text-amber-700 border border-amber-200';
      case 'LOW': return 'bg-slate-100 text-slate-600 border border-slate-200';
      default: return 'bg-slate-100 text-slate-600 border border-slate-200';
    }
  };

  const derivePriority = (cat: string) => {
    const c = cat.toLowerCase();
    if (c.includes('fire') || c.includes('safety') || c.includes('water')) return 'CRITICAL';
    if (c.includes('pothole') || c.includes('waste')) return 'HIGH';
    return 'MEDIUM';
  };

  const handleResolve = async (id: string) => {
    try {
      await axios.delete(`/api/reports/${id}`);
      mutate(); // Immediately re-fetch
    } catch (e) {
      console.error('Error resolving grievance:', e);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-[400px] flex flex-col">
      <h2 className="text-xl font-bold font-outfit text-slate-800 mb-4">Grievance Queue</h2>
      <div className="overflow-y-auto flex-1 pr-2">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50 sticky top-0">
            <tr>
              <th className="px-4 py-3 rounded-tl-lg">Ticket ID</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Priority</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Elapsed Time</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 rounded-tr-lg">Action</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item: any, idx: number) => {
              if (!item || typeof item !== 'object') return null;
              const priority = item.priority || derivePriority(item.category);
              
              const displayTime = item.createdAt 
                ? new Date(item.createdAt).toLocaleDateString() + ' ' + new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                : item.time;
              
              const displayLocation = typeof item.location === 'object' 
                ? (item.location?.address || item.district || 'Unknown') 
                : (item.location || item.district || 'Unknown');

              return (
                <tr key={String(item?._id ?? idx)} className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${priority === 'CRITICAL' ? 'bg-red-50/50 border-l-2 border-l-red-400' : ''}`}>
                  <td className="px-4 py-3 font-space-mono text-indigo-600 font-medium truncate max-w-[120px]" title={item._id}>{item._id}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100 text-xs font-medium uppercase truncate block max-w-[100px]">{item.category}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-md text-xs font-bold ${getPriorityStyle(priority)}`}>
                      {priority}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600 truncate max-w-[150px]" title={displayLocation}>
                    {displayLocation}
                  </td>
                  <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                    {displayTime}
                  </td>
                  <td className="px-4 py-3 text-slate-600 uppercase font-semibold text-xs tracking-wider">
                    {item.status}
                  </td>
                  <td className="px-4 py-3">
                    {item.status !== 'resolved' && (
                      <button 
                        onClick={() => handleResolve(item._id)}
                        className="text-indigo-600 hover:text-white hover:bg-indigo-600 border border-indigo-600 font-bold px-3 py-1.5 rounded-lg text-xs transition-all active:scale-95"
                      >
                        Resolve
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
