'use client';

import { useState, useEffect } from 'react';
import { FileText, CheckCircle, Clock } from 'lucide-react';
import axios from 'axios';

interface Report {
  _id: string;
  title: string;
  description: string;
  category: string;
  district: string;
  location: { lat: number; lng: number, address?: string };
  status: 'active' | 'resolved';
  createdAt: string;
}

export default function IssueReportsFeed() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      const res = await axios.get('/api/reports');
      if (res.data.success) {
        setReports(res.data.data);
      }
    } catch (e) {
      console.error('Error fetching Issue Reports:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
    // Poll every 5 seconds
    const interval = setInterval(fetchReports, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white rounded-3xl border border-indigo-100 shadow-sm overflow-hidden flex flex-col h-full relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-600 to-indigo-400"></div>
      <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-indigo-50/30">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-100 p-2 rounded-xl text-indigo-600 relative">
            <FileText className="w-5 h-5 relative z-10" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 tracking-tight flex items-center gap-2">
              Citizen Issue Reports
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
            </h3>
            <p className="text-xs text-slate-500 font-medium">Real-time civic complaints</p>
          </div>
        </div>
      </div>

      <div className="p-4 flex-1 overflow-y-auto min-h-[300px]">
        {loading && reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
            <div className="w-6 h-6 border-2 border-indigo-200 border-t-indigo-500 rounded-full animate-spin"></div>
            <p className="text-sm">Connecting to Database...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
            <CheckCircle className="w-8 h-8 text-emerald-300" />
            <p className="text-sm font-medium">No active issue reports</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <div 
                key={report._id} 
                className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row gap-4 ${
                  report.status === 'active' 
                    ? 'bg-indigo-50/30 border-indigo-100 shadow-sm' 
                    : 'bg-slate-50 border-slate-200 opacity-60'
                }`}
              >
                {/* Left side info */}
                <div className="flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(report.createdAt).toLocaleTimeString()}
                    </div>
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                      report.status === 'active' 
                        ? 'bg-indigo-100 text-indigo-600' 
                        : 'bg-slate-200 text-slate-500'
                    }`}>
                      {report.status} • {report.category}
                    </span>
                  </div>
                  
                  <h4 className="text-lg font-bold text-slate-800 mb-1">{report.title}</h4>
                  <p className="text-sm text-slate-600 line-clamp-2 mb-3">{report.description}</p>
                  
                  <p className="text-xs font-medium text-slate-500 mb-4 flex-1">
                    Location: <span className="text-indigo-600">{report.district || 'N/A'}</span>
                  </p>

                  {report.status === 'active' && (
                    <button 
                      onClick={async () => {
                        try {
                          await axios.delete(`/api/reports/${report._id}`);
                          fetchReports();
                        } catch (e) {
                          console.error('Error deleting report:', e);
                        }
                      }}
                      className="w-full bg-slate-800 hover:bg-slate-700 text-emerald-400 text-sm font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md active:scale-95 mt-auto"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Completed Operation
                    </button>
                  )}
                </div>

                {/* Right side Location View */}
                <div className="w-full md:w-32 md:h-auto min-h-[120px] bg-slate-200 shrink-0 rounded-xl overflow-hidden border border-indigo-100 relative">
                  {report.location && report.location.lat ? (
                    <iframe 
                      title="Report Location Map"
                      width="100%" 
                      height="100%" 
                      className="absolute inset-0"
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=${report.location.lng-0.005},${report.location.lat-0.005},${report.location.lng+0.005},${report.location.lat+0.005}&layer=mapnik&marker=${report.location.lat},${report.location.lng}`} 
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-xs text-center p-2">
                       No GPS Location
                    </div>
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
