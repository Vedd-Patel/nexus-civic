'use client';
import useSWR from 'swr';
import { fetcher, SERVICE_URLS } from '@/lib/api';

const MOCK_DATA = [
  { id: 'TKT-102', category: 'Infrastructure', priority: 'CRITICAL', location: 'Downtown', time: '2h 15m ago', status: 'OPEN' },
  { id: 'TKT-103', category: 'Sanitation', priority: 'HIGH', location: 'East Side', time: '3h ago', status: 'OPEN' },
  { id: 'TKT-104', category: 'Noise', priority: 'MEDIUM', location: 'West End', time: '5h ago', status: 'OPEN' },
  { id: 'TKT-105', category: 'Parking', priority: 'LOW', location: 'North Hills', time: '1d ago', status: 'OPEN' },
];

export default function GrievanceQueue() {
  const { data: rawData } = useSWR(`${SERVICE_URLS.pulseReport}/api/grievances?public=1&status=OPEN&limit=20`, fetcher, { refreshInterval: 30000 });
  const data = Array.isArray(rawData)
    ? rawData
    : Array.isArray((rawData as any)?.grievances)
      ? (rawData as any).grievances
      : Array.isArray((rawData as any)?.data)
        ? (rawData as any).data
        : MOCK_DATA;

  const getPriorityStyle = (p: string) => {
    switch(p) {
      case 'CRITICAL': return 'bg-red-100 text-red-700 border border-red-200 animate-pulse';
      case 'HIGH': return 'bg-orange-100 text-orange-700 border border-orange-200';
      case 'MEDIUM': return 'bg-amber-100 text-amber-700 border border-amber-200';
      case 'LOW': return 'bg-slate-100 text-slate-600 border border-slate-200';
      default: return 'bg-slate-100 text-slate-600 border border-slate-200';
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
              return (
              <tr key={String(item?.id ?? idx)} className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${item.priority === 'CRITICAL' ? 'bg-red-50/50 border-l-2 border-l-red-400' : ''}`}>
                <td className="px-4 py-3 font-space-mono text-indigo-600 font-medium">{item.ticketId || item.id}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100 text-xs font-medium">{item.category}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-md text-xs font-bold ${getPriorityStyle(item.priority)}`}>
                    {item.priority}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {typeof item.location === 'object' ? (item.location?.address || item.district || 'Unknown') : (item.location || item.district || 'Unknown')}
                </td>
                <td className="px-4 py-3 text-slate-400">
                  {item.createdAt ? new Date(item.createdAt).toLocaleDateString() + ' ' + new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : item.time}
                </td>
                <td className="px-4 py-3 text-slate-600">{item.status}</td>
                <td className="px-4 py-3">
                  <button className="text-indigo-600 hover:text-indigo-800 font-medium text-xs">Resolve</button>
                </td>
              </tr>
            )})}
          </tbody>
        </table>
      </div>
    </div>
  );
}
