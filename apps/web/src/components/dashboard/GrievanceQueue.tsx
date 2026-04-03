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
  const { data: rawData } = useSWR(`${SERVICE_URLS.pulseReport}/api/grievances?status=open&limit=20`, fetcher, { refreshInterval: 30000 });
  const data = rawData || MOCK_DATA;

  const getPriorityStyle = (p: string) => {
    switch(p) {
      case 'CRITICAL': return 'bg-red-600 animate-pulse text-white';
      case 'HIGH': return 'bg-orange-500 text-white';
      case 'MEDIUM': return 'bg-yellow-500 text-black';
      case 'LOW': return 'bg-gray-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  return (
    <div className="bg-[#1A0533] p-6 rounded-xl border border-purple-900/50 h-[400px] flex flex-col">
      <h2 className="text-xl font-bold font-outfit text-white mb-4">Grievance Queue</h2>
      <div className="overflow-y-auto flex-1 pr-2">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-400 uppercase bg-gray-800/50 sticky top-0">
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
            {data.map((item: any, idx: number) => (
              <tr key={idx} className={`border-b border-gray-700/50 hover:bg-gray-800/30 transition-colors ${item.priority === 'CRITICAL' ? 'border shadow-[0_0_10px_rgba(220,38,38,0.5)] border-red-500/50' : ''}`}>
                <td className="px-4 py-3 font-space-mono text-purple-300">{item.id}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 rounded bg-indigo-900/50 text-indigo-200 border border-indigo-700/50">{item.category}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${getPriorityStyle(item.priority)}`}>
                    {item.priority}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-300">{item.location}</td>
                <td className="px-4 py-3 text-gray-400">{item.time}</td>
                <td className="px-4 py-3 text-gray-300">{item.status}</td>
                <td className="px-4 py-3">
                  <button className="text-indigo-400 hover:text-indigo-300 underline text-xs">Resolve</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
