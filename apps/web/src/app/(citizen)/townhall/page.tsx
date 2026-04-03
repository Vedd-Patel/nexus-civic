"use client";
import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

export default function TownhallPage() {
  const [session, setSession] = useState<any>(null); // null means no active session
  const [issues, setIssues] = useState<any[]>([
    { id: '1', text: 'Expand public park hours to midnight during summer months', votes: 142 },
    { id: '2', text: 'Install smart street lighting on 5th Ave to improve safety', votes: 89 },
    { id: '3', text: 'Increase budget allocation for downtown sanitation', votes: 45 },
  ]);
  const [participants, setParticipants] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  
  const [isRecording, setIsRecording] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [issueText, setIssueText] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  useEffect(() => {
    // Attempt socket connection
    const socket = io('http://localhost:3008', { transports: ['websocket'] });
    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));
    socket.on('session-update', (data) => {
       if (data.participants) setParticipants(data.participants);
    });

    // Simulate an active session immediately for the demo
    setTimeout(() => {
        setSession({ id: 'sess-abc', title: 'City Council Q3 Assembly', active: true });
        setParticipants(Math.floor(Math.random() * 50) + 120);
    }, 1000);

    return () => { socket.disconnect(); };
  }, []);

  const handleVote = (id: string, type: 'up' | 'down') => {
    const voted = localStorage.getItem(`voted_${session?.id}_${id}`);
    if (voted) {
      alert("You have already voted on this issue during this session.");
      return;
    }
    
    setIssues(curr => curr.map(i => i.id === id ? { ...i, votes: i.votes + (type === 'up' ? 1 : -1) } : i));
    localStorage.setItem(`voted_${session?.id}_${id}`, 'true');
  };

  const startRecording = async () => {
     try {
       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
       const mr = new MediaRecorder(stream);
       mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
       mr.onstop = () => {
         const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
         setAudioBlob(blob);
         setAudioUrl(URL.createObjectURL(blob));
         chunksRef.current = [];
       };
       mr.start();
       mediaRecorderRef.current = mr;
       setIsRecording(true);
     } catch (err) {
       alert("Microphone access denied or not supported.");
     }
  };

  const stopRecording = () => {
     if(mediaRecorderRef.current && isRecording) {
         mediaRecorderRef.current.stop();
         setIsRecording(false);
         // Stop all tracks to release mic
         mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
     }
  }

  const submitIssue = () => {
     if (!issueText && !audioBlob) return;
     
     // Mock submitting to backend
     // const reader = new FileReader();
     // reader.readAsDataURL(audioBlob); ...

     setIssues([{ id: Date.now().toString(), text: issueText || "Voice Note Submitted", votes: 1 }, ...issues]);
     setShowModal(false);
     setIssueText("");
     setAudioBlob(null);
     setAudioUrl(null);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8 mt-6 pb-20">
      
      {!session ? (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-16 text-center shadow-2xl animate-in fade-in zoom-in duration-500">
           <div className="text-6xl mb-6 animate-pulse">🏛️</div>
           <h2 className="text-3xl font-bold mb-4 font-outfit text-white">No Active Town Hall</h2>
           <p className="text-slate-400 mb-8 max-w-md mx-auto text-lg leading-relaxed">
             There are no live assemblies right now. The next session is scheduled for Friday at 10:00 AM.
           </p>
           <button className="px-8 py-4 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-full font-bold tracking-wide transition-all border border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.15)]">
             View Upcoming Schedule
           </button>
        </div>
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-8">
            
          {/* Header Banner */}
          <div className="flex flex-col md:flex-row justify-between items-center bg-gradient-to-r from-purple-900/60 to-pink-900/40 backdrop-blur-xl border border-purple-500/30 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
             
             {/* Background glow & decoration */}
             <div className="absolute -top-10 -right-10 w-40 h-40 bg-pink-500/20 rounded-full blur-3xl group-hover:bg-pink-500/30 transition-colors"></div>
             <div className="absolute top-1/2 left-4 text-[120px] opacity-5 -translate-y-1/2 pointer-events-none">🏛️</div>
             
             <div className="relative z-10 text-center md:text-left mb-6 md:mb-0">
                <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 mb-2">
                   <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-pink-300 font-outfit">
                     {session.title}
                   </h1>
                   <div className="flex items-center gap-2 bg-red-500/20 px-3 py-1 rounded-md text-xs text-red-400 font-bold tracking-widest border border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.3)]">
                     <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span> 
                     LIVE
                   </div>
                </div>
                <div className="flex items-center justify-center md:justify-start gap-2 text-slate-300/80 text-sm font-medium">
                   <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                   {isConnected ? 'Connected to VoiceAssembly Server' : 'Connecting to Server...'}
                </div>
             </div>
             
             <div className="relative z-10 bg-black/40 backdrop-blur-md border border-white/10 px-8 py-4 rounded-2xl text-center shadow-inner">
                <div className="text-4xl font-bold text-white font-mono">{participants}</div>
                <div className="text-xs text-purple-300 font-bold uppercase tracking-widest mt-1">Citizens Live</div>
             </div>
          </div>

          {/* Section Header */}
          <div className="flex justify-between items-end border-b border-white/10 pb-4">
            <div>
               <h3 className="text-2xl font-bold text-white font-outfit">Issue Feed</h3>
               <p className="text-slate-400 text-sm">Vote on propositions in real-time.</p>
            </div>
            <button 
               onClick={() => setShowModal(true)} 
               className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)] flex items-center gap-3 active:scale-95 group"
            >
              <span className="text-xl group-hover:scale-110 transition-transform">🎤</span> 
              Raise Issue
            </button>
          </div>

          {/* Feed List */}
          <div className="space-y-4">
            {issues.map(iss => (
              <div key={iss.id} className="bg-white/5 backdrop-blur-md border border-white/10 hover:border-purple-500/30 rounded-2xl p-5 flex items-start gap-5 transition-all group shadow-lg">
                 
                 {/* Voting Column */}
                 <div className="flex flex-col items-center gap-2 bg-black/30 p-2 rounded-xl border border-white/5 min-w-[60px]">
                   <button 
                     onClick={() => handleVote(iss.id, 'up')} 
                     className="text-gray-500 hover:text-green-400 hover:bg-green-500/10 p-2 rounded-lg transition-all active:scale-90"
                   >
                     <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
                   </button>
                   <span className="font-bold font-mono text-lg text-white">{iss.votes}</span>
                   <button 
                     onClick={() => handleVote(iss.id, 'down')} 
                     className="text-gray-500 hover:text-red-400 hover:bg-red-500/10 p-2 rounded-lg transition-all active:scale-90"
                   >
                     <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                   </button>
                 </div>
                 
                 {/* Text Column */}
                 <div className="flex-1 mt-1">
                   <p className="text-lg text-slate-200 font-medium leading-relaxed">{iss.text}</p>
                   <p className="text-xs text-slate-500 mt-2">Citizen • Just now</p>
                 </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Raise Issue Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#1a112a] border border-purple-500/30 rounded-3xl p-8 w-full max-w-lg shadow-[0_0_50px_rgba(168,85,247,0.15)] relative animate-in zoom-in-95 duration-200">
             
             <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 w-8 h-8 rounded-full flex items-center justify-center transition-colors">
               ✕
             </button>
             
             <h3 className="text-3xl font-bold mb-2 font-outfit bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">Raise an Issue</h3>
             <p className="text-slate-400 text-sm mb-6">Your voice matters. Speak directly to the assembly or type your proposition.</p>
             
             <div className="space-y-6">
                 <textarea 
                   value={issueText} 
                   onChange={e => setIssueText(e.target.value)} 
                   className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-white resize-none h-32 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all placeholder:text-slate-600"
                   placeholder="Describe your issue or proposition clearly..." 
                 />
                 
                 <div className={`relative overflow-hidden flex flex-col items-center justify-center gap-4 bg-black/30 p-6 rounded-2xl border transition-colors ${isRecording ? 'border-red-500/50 bg-red-950/20' : 'border-white/5'}`}>
                    
                    {isRecording && <div className="absolute inset-0 bg-red-500/5 animate-pulse"></div>}

                    <button 
                      onMouseDown={startRecording} 
                      onMouseUp={stopRecording}
                      onMouseLeave={stopRecording}
                      onTouchStart={startRecording}
                      onTouchEnd={stopRecording}
                      className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center text-4xl transition-all shadow-xl select-none ${isRecording ? 'bg-red-500 scale-110 shadow-[0_0_30px_rgba(239,68,68,0.6)]' : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-purple-500/50'}`}
                    >
                      🎙️
                    </button>
                    
                    <div className="text-center relative z-10">
                       <p className={`font-bold tracking-wide ${isRecording ? 'text-red-400 animate-pulse' : 'text-slate-300'}`}>
                         {isRecording ? "Recording... Release to stop" : "Hold to add a voice note"}
                       </p>
                       <p className="text-xs text-slate-500 mt-1">Our AI will automatically transcribe your audio.</p>
                    </div>

                    {audioUrl && !isRecording && (
                       <audio src={audioUrl} controls className="w-full h-10 mt-2 rounded-full" />
                    )}
                 </div>

                 <div className="flex gap-4 pt-2">
                   <button onClick={() => setShowModal(false)} className="px-6 py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold w-1/3 transition-colors">Cancel</button>
                   <button 
                      onClick={submitIssue} 
                      disabled={!issueText && !audioBlob} 
                      className="px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 disabled:opacity-50 disabled:grayscale hover:from-purple-400 hover:to-pink-400 text-white rounded-xl font-bold w-2/3 shadow-lg active:scale-[0.98] transition-all"
                   >
                      Submit Proposition
                   </button>
                 </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
