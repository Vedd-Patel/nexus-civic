'use client';
import { useState } from 'react';
import useSWR from 'swr';
import { fetcher, SERVICE_URLS } from '@/lib/api';

const MOCK_LOGS = [
  { id: 1, ts: '10:42:01', role: 'OFFICER', query: 'SELECT * FROM citizens WHERE id=123', module: 'Database', status: 'ALLOWED' },
  { id: 2, ts: '10:45:12', role: 'ANON', query: 'UPDATE settings SET admin=1', module: 'Config', status: 'BLOCKED' },
  { id: 3, ts: '10:47:55', role: 'SYSTEM', query: 'CRON: sync_external_data', module: 'Jobs', status: 'ALLOWED' },
  { id: 4, ts: '10:50:33', role: 'OFFICER', query: 'DROP TABLE grievances', module: 'Database', status: 'BLOCKED' },
];

export default function AuraAuditLog() {
  const { data: rawLogs } = useSWR(`${SERVICE_URLS.auraAssist}/api/audit-logs?limit=20`, fetcher, { refreshInterval: 10000 });
  const logs = rawLogs || MOCK_LOGS;

  const [filter, setFilter] = useState('ALL');

  const filteredLogs = logs.filter((l: any) => {
    if (filter === 'BLOCKED') return l.status === 'BLOCKED';
    return true;
  });

  return (
    <div className="bg-[#1A0533] p-6 rounded-xl border border-purple-900/50 h-[400px] flex flex-col relative w-full overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold font-outfit text-white">Aura Assist Audit Log</h2>
        <div className="flex gap-2">
          <button onClick={() => setFilter('ALL')} className={`text-xs px-2 py-1 rounded ${filter === 'ALL' ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400'}`}>All</button>
          <button onClick={() => setFilter('BLOCKED')} className={`text-xs px-2 py-1 rounded ${filter === 'BLOCKED' ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400'}`}>Blocked Only</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <table className="w-full text-xs text-left">
          <thead className="text-[10px] text-gray-500 uppercase sticky top-0 bg-[#1A0533]">
            <tr>
              <th className="py-2 px-2">Time</th>
              <th className="py-2 px-2">Role</th>
              <th className="py-2 px-2">Module</th>
              <th className="py-2 px-2">Query</th>
              <th className="py-2 px-2 text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map((log: any) => (
              <tr key={log.id} className={`border-b border-gray-800/50 ${log.status === 'BLOCKED' ? 'bg-red-950/30 border-l-4 border-l-red-500' : 'border-l-4 border-l-transparent'}`}>
                <td className="py-2 px-2 text-gray-400 font-space-mono">{log.ts}</td>
                <td className="py-2 px-2"><span className="bg-gray-800 text-gray-300 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold">{log.role}</span></td>
                <td className="py-2 px-2 text-indigo-300">{log.module}</td>
                <td className="py-2 px-2 text-gray-300 max-w-[120px] truncate" title={log.query}>{log.query}</td>
                <td className="py-2 px-2 text-right">
                  <span className={`px-2 py-0.5 rounded font-bold ${log.status === 'ALLOWED' ? 'bg-green-800 text-green-300' : 'bg-red-800 text-red-300 font-bold'}`}>
                    {log.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
