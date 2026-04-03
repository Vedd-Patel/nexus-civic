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
  const zones = rawZones || MOCK_ZONES;

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedZone, setSelectedZone] = useState<any>(null);
  const [activeDispatches, setActiveDispatches] = useState([{ officer: 'Off. Miller', status: 'ACKNOWLEDGED', zone: 'Downtown Financial District' }]);

  const handleDispatch = (zone: any) => {
    setSelectedZone(zone);
    setModalOpen(true);
  };

  const confirmDispatch = async () => {
    setActiveDispatches([...activeDispatches, { officer: 'Pending Assignment', status: 'DISPATCHED', zone: selectedZone.name }]);
    setModalOpen(false);
  };

  return (
    <div className="bg-[#1A0533] p-6 rounded-xl border border-purple-900/50 h-[400px] flex flex-col relative">
      <h2 className="text-xl font-bold font-outfit text-white mb-4">Predicted Risk Zones</h2>
      <div className="flex-1 overflow-y-auto mb-4 space-y-3 pr-2">
        {zones.map((zone: any) => (
          <div key={zone.id} className="bg-gray-800/40 p-3 rounded-lg border border-gray-700/50 flex flex-col space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-200">{zone.name}</span>
              <span className="text-xs text-gray-500">{zone.time} ago</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex-1 bg-gray-900 rounded-full h-2">
                <div className="bg-red-500 h-2 rounded-full transition-all" style={{ width: `${(zone.score / 10) * 100}%` }}></div>
              </div>
              <span className="font-space-mono text-sm text-red-400 font-bold">{zone.score.toFixed(1)}/10</span>
              <span className={zone.trend === 'up' ? 'text-red-500' : 'text-green-500'}>{zone.trend === 'up' ? '↑' : '↓'}</span>
            </div>
            <div className="flex justify-end">
              <button onClick={() => handleDispatch(zone)} className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-3 py-1 rounded transition-colors">
                Dispatch Patrol
              </button>
            </div>
          </div>
        ))}
      </div>

      {activeDispatches.length > 0 && (
        <div className="mt-auto border-t border-gray-700/50 pt-3">
          <h3 className="text-sm font-semibold text-gray-400 mb-2">Active Dispatches</h3>
          <div className="space-y-2 max-h-[80px] overflow-y-auto">
            {activeDispatches.map((d, i) => (
              <div key={i} className="flex justify-between items-center text-xs bg-gray-900/50 p-2 rounded border border-gray-800">
                <span className="text-indigo-300">{d.officer} ➡️ {d.zone}</span>
                <span className={`px-2 py-0.5 rounded font-bold ${d.status === 'ACKNOWLEDGED' ? 'bg-green-800 text-green-300' : 'bg-orange-800 text-orange-300'}`}>
                  {d.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {modalOpen && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-4 rounded-xl z-10 backdrop-blur-sm">
           <div className="bg-[#2D1B69] p-5 rounded-lg w-full border border-purple-500/30">
               <h3 className="text-lg font-bold text-white mb-2">Confirm Dispatch</h3>
               <p className="text-sm text-gray-300 mb-4">Send nearest unit to <strong>{selectedZone?.name}</strong>?</p>
               <div className="flex justify-end space-x-2">
                 <button onClick={() => setModalOpen(false)} className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded text-white cursor-pointer">Cancel</button>
                 <button onClick={confirmDispatch} className="px-3 py-1 text-sm bg-red-600 hover:bg-red-500 rounded text-white cursor-pointer shadow-[0_0_10px_rgba(220,38,38,0.5)]">CONFIRM DISPATCH</button>
               </div>
           </div>
        </div>
      )}
    </div>
  );
}
