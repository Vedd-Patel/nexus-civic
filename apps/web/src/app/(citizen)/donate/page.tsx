"use client";
import React, { useState } from 'react';
import dynamic from 'next/dynamic';

const NGOsMap = dynamic(() => import('./NGOsMap'), { 
  ssr: false, 
  loading: () => <div className="h-[300px] w-full bg-white/5 animate-pulse rounded-xl" /> 
});

const STEPS = ['Details', 'Photo', 'Match', 'Schedule'];

export default function DonatePage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ name: '', category: '', condition: ''});
  const [photo, setPhoto] = useState<string | null>(null);
  const [qcStatus, setQcStatus] = useState<null | 'pending' | 'accepted' | 'rejected'>(null);
  const [selectedNGO, setSelectedNGO] = useState<any>(null);
  const [timelineMode, setTimelineMode] = useState(false);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
        setQcStatus('pending');
        // mock quality check via Gemini
        setTimeout(() => setQcStatus('accepted'), 2000);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleScheduleSubmit = () => {
     setTimelineMode(true);
  };

  if (timelineMode) {
    return (
      <div className="p-6 max-w-2xl mx-auto space-y-6 mt-12">
         <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-400 font-outfit text-center mb-8">
           Donation Tracking
         </h1>
         <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
             
             {/* Timeline Stepper */}
             <div className="flex justify-between items-center relative z-10 pt-4">
                 <div className="absolute left-0 top-1/2 w-full h-1 bg-white/10 -z-10 -translate-y-1/2 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 w-[10%] animate-pulse"></div>
                 </div>
                 {['Submitted', 'Verified', 'Matched', 'Collected', 'Delivered'].map((s, i) => (
                    <div key={s} className="flex flex-col items-center gap-3">
                       <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-xl transition-all ${i < 3 ? 'bg-gradient-to-br from-green-400 to-emerald-600 text-white' : 'bg-slate-800 text-gray-500 border border-white/10'}`}>
                         {i < 3 ? '✓' : i+1}
                       </div>
                       <span className={`text-xs font-medium tracking-wide ${i < 3 ? 'text-green-300' : 'text-slate-500'}`}>{s}</span>
                    </div>
                 ))}
             </div>
             
             <div className="mt-12 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/20 rounded-full mb-4">
                   <div className="text-4xl">🚚</div>
                </div>
                <h3 className="text-xl font-bold text-white">Item Scheduled!</h3>
                <p className="mt-2 text-slate-300 max-w-md mx-auto">
                   Your <strong>{formData.name || 'item'}</strong> is scheduled for pickup with <strong>{selectedNGO?.name}</strong>. An agent will contact you shortly.
                </p>
             </div>
         </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-8 mt-6">
      <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-400 font-outfit text-center">
        NearGive
      </h1>
      <p className="text-center text-slate-400">Give your items a second life.</p>

      {/* Stepper Header */}
      <div className="flex gap-2">
        {STEPS.map((s, i) => (
           <div key={s} className="flex-1">
             <div className={`h-2 rounded-full transition-all duration-500 ${step > i ? 'bg-gradient-to-r from-green-400 to-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-white/10'}`} />
             <p className={`mt-2 text-[10px] uppercase font-bold tracking-widest text-center ${step === i+1 ? 'text-green-400' : 'text-slate-500'}`}>{s}</p>
           </div>
        ))}
      </div>

      {/* Forms Container */}
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden min-h-[400px]">
          
          {/* Subtle decoration */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-green-500/20 rounded-full opacity-50 blur-3xl pointer-events-none"></div>
          
          {step === 1 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500 relative z-10">
              <h2 className="text-2xl font-bold text-white mb-6">Item Details</h2>
              <input 
                 className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all" 
                 placeholder="What are you donating? (e.g., Winter Coat)" 
                 value={formData.name} 
                 onChange={e => setFormData({...formData, name: e.target.value})} 
              />
              <select 
                 className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all appearance-none" 
                 value={formData.category} 
                 onChange={e => setFormData({...formData, category: e.target.value})}
              >
                 <option value="" disabled className="text-gray-500">Select Category</option>
                 <option value="clothing">Clothing & Apparel</option>
                 <option value="electronics">Electronics</option>
                 <option value="furniture">Furniture</option>
                 <option value="kitchen">Kitchenware</option>
              </select>
              <textarea 
                 className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all h-32 resize-none" 
                 placeholder="Briefly describe the condition..." 
                 value={formData.condition} 
                 onChange={e => setFormData({...formData, condition: e.target.value})} 
              />
              <button 
                 onClick={() => setStep(2)} 
                 disabled={!formData.name}
                 className="w-full py-4 mt-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-lg active:scale-[0.98]"
              >
                Next: Upload Photo
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative z-10">
               <h2 className="text-2xl font-bold text-white mb-2">Quality Check</h2>
               <p className="text-slate-400 text-sm mb-6">Our Gemini AI helps verify item condition before matching.</p>
               
               {!photo ? (
                 <label className="flex flex-col items-center justify-center w-full h-56 border-2 border-dashed border-white/20 rounded-2xl hover:border-green-500 hover:bg-green-500/5 transition-all cursor-pointer bg-black/20 group">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                       <span className="text-3xl">📸</span>
                    </div>
                    <span className="text-slate-300 font-medium">Tap to upload a clear photo</span>
                    <span className="text-slate-500 text-sm mt-2">JPEG, PNG up to 5MB</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                 </label>
               ) : (
                 <div className="p-1 border border-white/10 rounded-2xl bg-black/40">
                   <div className="relative h-48 rounded-xl overflow-hidden mb-1">
                     <img src={photo} alt="Upload thumbnail" className="w-full h-full object-cover opacity-80" />
                     {qcStatus === 'pending' && (
                        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center backdrop-blur-sm">
                           <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                           <p className="text-green-400 font-bold tracking-widest text-sm animate-pulse">GEMINI AI ANALYZING...</p>
                        </div>
                     )}
                   </div>
                   <div className="p-4 bg-black/20 rounded-b-xl border-t border-white/5">
                     {qcStatus === 'accepted' && (
                        <div className="flex items-center gap-3 text-green-400">
                           <span className="text-2xl">✅</span>
                           <div>
                             <p className="font-bold">Item Verified</p>
                             <p className="text-xs opacity-80">Good condition detected. Ready for assignment.</p>
                           </div>
                        </div>
                     )}
                   </div>
                 </div>
               )}

               <div className="flex gap-4 mt-8">
                 <button onClick={() => setStep(1)} className="px-6 py-4 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-xl transition-all">Back</button>
                 <button onClick={() => setStep(3)} disabled={qcStatus !== 'accepted'} className="flex-1 py-4 bg-gradient-to-r from-green-500 to-emerald-600 disabled:opacity-50 disabled:grayscale text-white font-bold rounded-xl transition-all shadow-lg active:scale-[0.98]">
                   Find Matching NGOs
                 </button>
               </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 relative z-10 flex flex-col h-full">
               <h2 className="text-2xl font-bold text-white">Nearby NGOs</h2>
               <p className="text-slate-400 text-sm mb-2">Select a verified organization that needs this item.</p>
               
               {/* Map Area */}
               <div className="rounded-2xl overflow-hidden border border-white/10 shadow-inner flex-1 bg-black z-0 relative z-0">
                 <NGOsMap onSelect={setSelectedNGO} selectedId={selectedNGO?.id} />
               </div>
               
               {selectedNGO && (
                 <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl flex justify-between items-center animate-in fade-in">
                   <div>
                      <p className="text-sm text-green-400/80 uppercase tracking-widest font-bold">Selected</p>
                      <p className="text-white font-semibold">{selectedNGO.name}</p>
                   </div>
                   <div className="text-right">
                      <p className="text-xl font-mono text-green-400">{selectedNGO.dist}</p>
                   </div>
                 </div>
               )}
               
               <div className="flex gap-4 pt-4 mt-auto">
                 <button onClick={() => setStep(2)} className="px-6 py-4 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-xl transition-all">Back</button>
                 <button onClick={() => setStep(4)} disabled={!selectedNGO} className="flex-1 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-lg active:scale-[0.98]">
                   Next: Schedule
                 </button>
               </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative z-10">
               <h2 className="text-2xl font-bold text-white mb-2">Schedule Pickup</h2>
               <p className="text-slate-400 text-sm mb-8">When should the representative from {selectedNGO?.name} arrive?</p>
               
               <div className="p-5 border border-white/10 rounded-2xl bg-black/40">
                 <input 
                   type="datetime-local" 
                   className="w-full bg-transparent text-lg text-white focus:outline-none appearance-none font-mono" 
                 />
               </div>
               
               <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex gap-3 text-sm text-blue-200 mt-4">
                  <span className="text-xl">ℹ️</span>
                  <p>Make sure the item is accessible at the requested time. The NGO will be notified instantly.</p>
               </div>

               <div className="flex gap-4 mt-12">
                 <button onClick={() => setStep(3)} className="px-6 py-4 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-xl transition-all">Back</button>
                 <button onClick={handleScheduleSubmit} className="flex-1 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] active:scale-[0.98]">
                   Confirm & Dispatch
                 </button>
               </div>
            </div>
          )}
      </div>
    </div>
  );
}
