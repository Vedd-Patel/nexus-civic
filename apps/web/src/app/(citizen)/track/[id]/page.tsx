'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, CheckCircle2, Clock, MapPin, Search, 
  Map as MapIcon, Loader2, AlertCircle, Eye, Wrench, ShieldCheck
} from 'lucide-react';

export default function TrackComplaintPage({ params }: { params: { id: string } }) {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const ticketId = params.id;

  useEffect(() => {
    fetch(`/api/reports/${ticketId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setReport(data.data);
        } else {
          setError(data.message || 'Report not found');
        }
      })
      .catch(err => {
        console.error(err);
        setError('Failed to load tracking data.');
      })
      .finally(() => setLoading(false));
  }, [ticketId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F8FC] flex flex-col items-center justify-center p-6 text-slate-800 text-center">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
        <h2 className="text-xl font-bold">Locating Ticket...</h2>
        <p className="text-slate-500">Retrieving your civic report.</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-[#F7F8FC] flex flex-col items-center justify-center p-6 text-slate-800 text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-black mb-2">Complaint Not Found</h2>
        <p className="text-slate-500 mb-8">{error || 'Invalid ticket ID.'}</p>
        <Link href="/" className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-md hover:bg-indigo-700 transition">
          Return to Hub
        </Link>
      </div>
    );
  }

  // Determine active step based on status
  const isResolved = report.status === 'resolved';
  const steps = [
    { title: 'Submitted', description: 'Your report was safely received.', icon: CheckCircle2, completed: true, active: false, time: report.createdAt },
    { title: 'Under Review', description: 'City officials are reviewing the issue.', icon: Eye, completed: isResolved, active: !isResolved, time: null },
    { title: 'In Progress', description: 'Work crew assigned & dispatched.', icon: Wrench, completed: isResolved, active: false, time: null },
    { title: 'Resolved', description: 'The issue has been resolved safely.', icon: ShieldCheck, completed: isResolved, active: isResolved, time: isResolved ? new Date() : null },
  ];

  return (
    <div className="min-h-screen bg-[#F7F8FC] text-slate-800 pb-20 max-w-md mx-auto md:max-w-2xl">
      {/* Header */}
      <header className="p-6 sticky top-0 bg-[#F7F8FC]/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2 border border-slate-200 rounded-full hover:bg-white transition-colors bg-white/50 shadow-sm active:scale-95">
            <ArrowLeft className="w-5 h-5 text-slate-700" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-800 uppercase tracking-wide">Tracking</h1>
            <p className="text-slate-500 text-xs font-mono">ID: {ticketId}</p>
          </div>
        </div>
      </header>

      <main className="px-6 space-y-6">
        {/* Ticket Header Card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-start justify-between mb-4">
            <div className="bg-indigo-50 p-3 rounded-2xl text-indigo-600">
              <Search className="w-8 h-8" />
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              isResolved ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
            }`}>
              {report.status}
            </span>
          </div>
          
          <h2 className="text-2xl font-black mb-2">{report.title}</h2>
          <p className="text-slate-500 text-sm mb-4 leading-relaxed line-clamp-2">
            {report.description}
          </p>

          <div className="flex items-center gap-2 text-xs font-medium text-slate-600 bg-slate-50 p-3 rounded-xl">
            <MapPin className="w-4 h-4 text-indigo-500 shrink-0" />
            <span className="truncate">{report.district || 'City Limits'} - {report.location?.lat?.toFixed(4)}, {report.location?.lng?.toFixed(4)}</span>
          </div>
        </div>

        {/* Timeline Status */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
          <h3 className="font-bold text-lg mb-8">Status Timeline</h3>
          
          <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 shrink-0 shadow-sm relative z-10 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2
                    ${step.completed ? 'bg-emerald-500 border-white text-white' : 
                      step.active ? 'bg-indigo-500 border-indigo-100 text-white animate-pulse' : 
                      'bg-slate-100 border-white text-slate-400'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-2xl border border-slate-100 shadow-sm ml-4 md:ml-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className={`font-bold ${step.completed || step.active ? 'text-slate-800' : 'text-slate-400'}`}>
                        {step.title}
                      </h4>
                    </div>
                    <p className={`text-xs ${step.completed || step.active ? 'text-slate-500' : 'text-slate-300'}`}>
                      {step.description}
                    </p>
                    {step.time && (
                      <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1 font-medium">
                        <Clock className="w-3 h-3" />
                        {new Date(step.time).toLocaleDateString()} {new Date(step.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
