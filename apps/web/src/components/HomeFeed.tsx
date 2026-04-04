'use client';
import useSWR from 'swr';
import { fetcher, SERVICE_URLS } from '@/lib/api';
import { Clock, MapPin, CheckCircle2 } from 'lucide-react';

export default function HomeFeed() {
  const { data: rawData, error } = useSWR(`${SERVICE_URLS.pulseReport}/api/grievances?limit=3`, fetcher, { refreshInterval: 60000 });
  
  const grievances = Array.isArray(rawData) ? rawData : (rawData?.grievances || rawData?.data || []);
  const isLoading = !rawData && !error;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3 px-2">
        <h3 className="font-bold text-lg text-slate-700">Recent Activity</h3>
        <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
          Live
        </span>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-slate-400 animate-pulse font-medium">Loading live feed...</div>
        ) : grievances.length === 0 ? (
          <div className="p-8 text-center text-slate-400 font-medium">No recent activity detected.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {grievances.map((item: any) => (
              <div key={item.id || item._id} className="p-5 flex items-start gap-4 hover:bg-slate-50 transition-colors">
                <div className={`mt-1 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white
                  ${item.priority === 'CRITICAL' ? 'bg-red-500' : 
                    item.priority === 'HIGH' ? 'bg-amber-500' : 
                    'bg-indigo-500'}`}
                >
                  {item.category?.charAt(0) || '📝'}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-slate-800 text-sm leading-tight">{item.title || `${item.category} reported`}</h4>
                    <span className="text-xs text-slate-400 whitespace-nowrap flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {new Date(item.createdAt || item.time || Date.now()).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mb-2">
                    <MapPin className="w-3 h-3" /> {item.location?.address || item.location || 'Unknown Location'}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest ${
                      item.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-700' : 
                      item.status === 'IN_PROGRESS' || item.status === 'RESPONDING' ? 'bg-indigo-100 text-indigo-700' : 
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {item.status}
                    </span>
                    {item.status === 'RESOLVED' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
