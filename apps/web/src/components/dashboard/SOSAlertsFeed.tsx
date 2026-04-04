'use client';

import { useState, useEffect } from 'react';
import { AlertOctagon, CheckCircle, Clock } from 'lucide-react';
import axios from 'axios';

interface Alert {
  _id: string;
  location: { lat: number; lng: number };
  status: 'active' | 'resolved';
  createdAt: string;
}

export default function SOSAlertsFeed() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    try {
      const res = await axios.get('/api/sos');
      if (res.data.success) {
        setAlerts(res.data.data);
      }
    } catch (e) {
      console.error('Error fetching SOS alerts:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    // Poll every 3 seconds for real-time vibe
    const interval = setInterval(fetchAlerts, 3000);
    return () => clearInterval(interval);
  }, []);

  const resolveAlert = async (id: string) => {
    try {
      await axios.patch(`/api/sos/${id}`);
      fetchAlerts(); // Refresh immediately
    } catch (e) {
      console.error('Error resolving alert:', e);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-red-100 shadow-sm overflow-hidden flex flex-col h-full relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-red-400"></div>
      <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-red-50/30">
        <div className="flex items-center gap-3">
          <div className="bg-red-100 p-2 rounded-xl text-red-600 relative">
            <AlertOctagon className="w-5 h-5 relative z-10" />
            <div className="absolute inset-0 bg-red-400 rounded-xl animate-ping opacity-20"></div>
          </div>
          <div>
            <h3 className="font-bold text-slate-800 tracking-tight flex items-center gap-2">
              Live SOS Operations Feed
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
            </h3>
            <p className="text-xs text-slate-500 font-medium">Real-time emergency requests</p>
          </div>
        </div>
      </div>

      <div className="p-4 flex-1 overflow-y-auto min-h-[300px]">
        {loading && alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
            <div className="w-6 h-6 border-2 border-red-200 border-t-red-500 rounded-full animate-spin"></div>
            <p className="text-sm">Connecting to Dispatch...</p>
          </div>
        ) : alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
            <CheckCircle className="w-8 h-8 text-emerald-300" />
            <p className="text-sm font-medium">No active emergencies</p>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div 
                key={alert._id} 
                className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row gap-4 ${
                  alert.status === 'active' 
                    ? 'bg-red-50 border-red-200 shadow-sm' 
                    : 'bg-slate-50 border-slate-200 opacity-60'
                }`}
              >
                {/* Left side info */}
                <div className="flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(alert.createdAt).toLocaleTimeString()}
                    </div>
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                      alert.status === 'active' 
                        ? 'bg-red-100 text-red-600' 
                        : 'bg-slate-200 text-slate-500'
                    }`}>
                      {alert.status}
                    </span>
                  </div>
                  
                  <p className="text-sm font-medium text-slate-700 mb-3 flex-1">
                    Emergency Reported At Location: <br/>
                    <span className="text-indigo-600 font-mono text-base font-bold block mt-1">
                      {alert.location?.lat.toFixed(4)}, {alert.location?.lng.toFixed(4)}
                    </span>
                  </p>

                  {alert.status === 'active' && (
                    <button 
                      onClick={async () => {
                        try {
                          await axios.delete(`/api/sos/${alert._id}`);
                          fetchAlerts();
                        } catch (e) {
                          console.error('Error completing operation:', e);
                        }
                      }}
                      className="w-full bg-slate-800 hover:bg-slate-700 text-emerald-400 text-sm font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md active:scale-95"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Completed Operation
                    </button>
                  )}
                </div>

                {/* Right side Location View */}
                <div className="w-full md:w-32 md:h-auto min-h-[120px] bg-slate-200 shrink-0 rounded-xl overflow-hidden border border-red-100 relative">
                  {alert.location && (
                    <iframe 
                      title="Alert Location Map"
                      width="100%" 
                      height="100%" 
                      className="absolute inset-0"
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=${alert.location.lng-0.005},${alert.location.lat-0.005},${alert.location.lng+0.005},${alert.location.lat+0.005}&layer=mapnik&marker=${alert.location.lat},${alert.location.lng}`} 
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
