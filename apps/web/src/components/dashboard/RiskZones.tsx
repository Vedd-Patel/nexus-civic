'use client';
import { useState } from 'react';
import useSWR from 'swr';
import { fetcher, SERVICE_URLS } from '@/lib/api';

const MOCK_ZONES = [
  { id: '1', name: 'Downtown Financial District', score: 8.5, trend: 'up', time: '5m' },
  { id: '2', name: 'Industrial Park South', score: 7.2, trend: 'up', time: '12m' },
  { id: '3', name: 'West End Residential', score: 4.1, trend: 'down', time: '1h' },
];

export default function RiskZones() {
  const { data: rawZones } = useSWR(`${SERVICE_URLS.sentinelAI}/api/predictions/top-zones`, fetcher, { refreshInterval: 60000 });
  const zones = Array.isArray(rawZones)
    ? rawZones
    : Array.isArray((rawZones as any)?.zones)
      ? (rawZones as any).zones
      : Array.isArray((rawZones as any)?.data)
        ? (rawZones as any).data
        : MOCK_ZONES;

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedZone, setSelectedZone] = useState<any>(null);
  const [activeDispatches, setActiveDispatches] = useState([{ officer: 'Off. Miller', status: 'ACKNOWLEDGED', zone: 'Downtown Financial District' }]);

  const handleDispatch = (zone: any) => {
    setSelectedZone(zone);
    setModalOpen(true);
  };

  const confirmDispatch = async () => {
    try {
      await fetch(`${SERVICE_URLS.sentinelAI}/api/dispatch/trigger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ predictionId: selectedZone._id || selectedZone.id })
      });
      setActiveDispatches([...activeDispatches, { officer: 'Pending Assignment', status: 'DISPATCHED', zone: selectedZone.name || selectedZone.s2CellId || 'Unknown Zone' }]);
    } catch (e) {
      console.error('Failed to trigger AI dispatch', e);
    }
    setModalOpen(false);
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-[400px] flex flex-col relative">
      <h2 className="text-xl font-bold font-outfit text-slate-800 mb-4">Predicted Risk Zones</h2>
      <div className="flex-1 overflow-y-auto mb-4 space-y-3 pr-2">
        {zones.map((zone: any, idx: number) => {
          if (!zone || typeof zone !== 'object') return null;
          return (
          <div key={String(zone?.id ?? idx)} className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex flex-col space-y-2 hover:bg-slate-100 transition-colors">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-slate-700">{zone.name}</span>
              <span className="text-xs text-slate-400">{zone.time} ago</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex-1 bg-slate-200 rounded-full h-2">
                <div className="bg-red-500 h-2 rounded-full transition-all" style={{ width: `${(Number(zone?.score) / 10) * 100}%` }}></div>
              </div>
              <span className="font-space-mono text-sm text-red-600 font-bold">{Number(zone?.score || 0).toFixed(1)}/10</span>
              <span className={zone?.trend === 'up' ? 'text-red-500' : 'text-emerald-500'}>{zone?.trend === 'up' ? '↑' : '↓'}</span>
            </div>
            <div className="flex justify-end">
              <button onClick={() => handleDispatch(zone)} className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-3 py-1 rounded-md transition-colors shadow-sm">
                Dispatch Patrol
              </button>
            </div>
          </div>
        )})}
      </div>

      {activeDispatches.length > 0 && (
        <div className="mt-auto border-t border-slate-200 pt-3">
          <h3 className="text-sm font-semibold text-slate-500 mb-2">Active Dispatches</h3>
          <div className="space-y-2 max-h-[80px] overflow-y-auto">
            {activeDispatches.map((d, i) => (
              <div key={i} className="flex justify-between items-center text-xs bg-slate-50 p-2 rounded border border-slate-200">
                <span className="text-indigo-600 font-medium">{d.officer} ➡️ {d.zone}</span>
                <span className={`px-2 py-0.5 rounded font-bold ${d.status === 'ACKNOWLEDGED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  {d.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {modalOpen && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center p-4 rounded-xl z-10 backdrop-blur-sm">
           <div className="bg-white p-5 rounded-xl w-full border border-slate-200 shadow-lg">
               <h3 className="text-lg font-bold text-slate-800 mb-2">Confirm Dispatch</h3>
               <p className="text-sm text-slate-600 mb-4">Send nearest unit to <strong>{selectedZone?.name}</strong>?</p>
               <div className="flex justify-end space-x-2">
                 <button onClick={() => setModalOpen(false)} className="px-3 py-1 text-sm bg-slate-100 hover:bg-slate-200 rounded-md text-slate-700 cursor-pointer">Cancel</button>
                 <button onClick={confirmDispatch} className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 rounded-md text-white cursor-pointer shadow-sm">CONFIRM DISPATCH</button>
               </div>
           </div>
        </div>
      )}
    </div>
  );
}
