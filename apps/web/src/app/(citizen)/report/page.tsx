'use client';

import { useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { 
  AlertTriangle, Car, Droplets, Flame, Lightbulb, 
  MapPin, Mic, MoreHorizontal, ShieldAlert, SkipBack, 
  SkipForward, Sprout, Trash2, Upload, Volume2, TreePine,
  CheckCircle2, Loader2, ArrowLeft, ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import axios from 'axios';

const ReportMap = dynamic(() => import('@/components/ReportMap'), { ssr: false, loading: () => <div className="h-[300px] w-full bg-purple-900/20 rounded-xl animate-pulse flex items-center justify-center text-purple-400">Loading Map...</div> });

const CATEGORIES = [
  { id: 'pothole', icon: Car, label: 'Pothole' },
  { id: 'water', icon: Droplets, label: 'Water Leak' },
  { id: 'waste', icon: Trash2, label: 'Waste' },
  { id: 'light', icon: Lightbulb, label: 'Streetlight' },
  { id: 'park', icon: TreePine, label: 'Parks' },
  { id: 'noise', icon: Volume2, label: 'Noise' },
  { id: 'fire', icon: Flame, label: 'Fire Hazard' },
  { id: 'safety', icon: ShieldAlert, label: 'Safety' },
  { id: 'nature', icon: Sprout, label: 'Environment' },
  { id: 'other', icon: MoreHorizontal, label: 'Other' },
];

export default function ReportWizardPage() {
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [address, setAddress] = useState('');
  
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoStatus, setPhotoStatus] = useState<'pending' | 'accepted' | 'rejected' | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticketId, setTicketId] = useState<string | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = async () => {
          const base64 = reader.result;
          // Mock sending to auraAssist/api/voice/transcribe
          try {
            // Using a mock timeout to pretend transcription
            const mockTranscription = "I observed a severe pothole causing traffic slowdowns and potential car damage.";
            setTimeout(() => setDescription(prev => prev + (prev ? ' ' : '') + mockTranscription), 1500);
          } catch (e) {
            console.error("Transcription failed", e);
          }
        };
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Could not start recording", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setAddress("Location acquired via GPS");
      }, (err) => alert("Could not fetch location"));
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        setPhoto(event.target?.result as string);
        setPhotoStatus('pending');
        
        // Mock sending to pulseReport/api/grievances/:id/media for quality check
        setTimeout(() => {
          setPhotoStatus('accepted');
        }, 2000);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Mock POST pulseReport/api/grievances
      await new Promise(resolve => setTimeout(resolve, 1500));
      const generatedId = "TKT-" + Math.floor(Math.random() * 1000000);
      setTicketId(generatedId);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (err) {
      alert("Submission failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => setStep(prev => Math.min(prev + 1, 5));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  if (ticketId) {
    return (
      <div className="min-h-screen bg-[#0D021F] text-white flex flex-col items-center justify-center p-6 text-center">
        <CheckCircle2 className="w-24 h-24 text-green-400 mb-6" />
        <h1 className="text-3xl font-bold mb-4">Report Submitted!</h1>
        <p className="text-purple-200 mb-2">Your ticket ID is</p>
        <div className="text-5xl font-black text-yellow-400 mb-8 py-4 px-8 bg-black/30 rounded-2xl border border-yellow-400/20">
          {ticketId}
        </div>
        <button className="text-lg font-semibold text-purple-300 hover:text-white transition-colors bg-purple-900/30 px-8 py-4 rounded-full">
          Track your complaint
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D021F] text-white flex flex-col max-w-md mx-auto md:max-w-2xl">
      {/* Header & Progress */}
      <header className="p-6 pb-2">
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevStep} disabled={step === 1} className="p-2 disabled:opacity-30">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <span className="font-medium text-purple-200">Step {step} of 5</span>
          <div className="w-10"></div>
        </div>
        <div className="w-full bg-purple-900/40 rounded-full h-2.5">
          <div 
            className="bg-indigo-500 h-2.5 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${(step / 5) * 100}%` }}
          ></div>
        </div>
      </header>

      <main className="flex-1 p-6 overflow-y-auto pb-32">
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">What are you reporting?</h2>
              <p className="text-purple-300">Select a category that best fits your issue.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all active:scale-95 ${
                    category === cat.id 
                      ? 'border-indigo-400 bg-indigo-500/20 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]' 
                      : 'border-purple-800/50 bg-black/20 text-purple-300 hover:border-purple-500/50 hover:bg-purple-900/20'
                  }`}
                >
                  <cat.icon className="w-10 h-10 mb-3" />
                  <span className="font-semibold">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">Describe the issue</h2>
              <p className="text-purple-300">Provide details to help us understand.</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">Title</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="E.g. Large pothole on Main St"
                  className="w-full bg-black/40 border border-purple-800 rounded-xl px-4 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">Description</label>
                <div className="relative">
                  <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide detailed description..."
                    rows={5}
                    className="w-full bg-black/40 border border-purple-800 rounded-xl px-4 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none pb-16"
                  />
                  <button 
                    onPointerDown={startRecording}
                    onPointerUp={stopRecording}
                    onPointerLeave={stopRecording}
                    className={`absolute bottom-3 right-3 p-3 rounded-full flex items-center justify-center transition-colors ${
                      isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-purple-700 text-white'
                    }`}
                  >
                    <Mic className="w-6 h-6" />
                  </button>
                </div>
                {isRecording && <p className="text-sm text-red-400 mt-2 text-center animate-pulse">Recording... release to stop</p>}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">Where is it?</h2>
              <p className="text-purple-300">Tap the map to set a pin or use your location.</p>
            </div>

            <button 
              onClick={getUserLocation}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold text-lg transition-colors active:scale-95"
            >
              <MapPin className="w-6 h-6" /> Use My Location
            </button>

            <div className="rounded-xl overflow-hidden border border-purple-800 shadow-lg">
              <ReportMap 
                userLocation={location} 
                onLocationSelect={(lat, lng) => {
                  setLocation({lat, lng});
                  setAddress(`Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`);
                }} 
              />
            </div>

            {address && (
              <div className="bg-black/30 p-4 rounded-xl border border-purple-800/50 text-center text-purple-200">
                {address}
              </div>
            )}
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">Upload a Photo</h2>
              <p className="text-purple-300">Visual proof helps us resolve issues faster.</p>
            </div>

            {!photo ? (
              <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-purple-600 rounded-2xl bg-black/20 cursor-pointer hover:bg-purple-900/20 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-12 h-12 text-purple-400 mb-4" />
                  <p className="text-lg text-purple-300 font-semibold mb-1">Tap to select photo</p>
                  <p className="text-sm text-purple-500">PNG, JPG, HEIC up to 10MB</p>
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
              </label>
            ) : (
              <div className="space-y-4">
                <div className="relative rounded-2xl overflow-hidden border-2 border-purple-800 h-64">
                  <img src={photo} alt="Preview" className="w-full h-full object-cover" />
                  <button 
                    onClick={() => { setPhoto(null); setPhotoStatus(null); }}
                    className="absolute top-3 right-3 p-2 bg-black/60 rounded-full text-white backdrop-blur-sm"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <div className={`p-4 rounded-xl flex items-center gap-3 ${
                  photoStatus === 'pending' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                  photoStatus === 'accepted' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                  'bg-red-500/20 text-red-300 border border-red-500/30'
                }`}>
                  {photoStatus === 'pending' && <Loader2 className="w-6 h-6 animate-spin" />}
                  {photoStatus === 'accepted' && <CheckCircle2 className="w-6 h-6" />}
                  {photoStatus === 'rejected' && <AlertTriangle className="w-6 h-6" />}
                  
                  <span className="font-medium text-lg">
                    {photoStatus === 'pending' ? 'Checking image quality...' : 
                     photoStatus === 'accepted' ? 'Quality check passed' : 
                     'Image too blurry, please retake'}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 5 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">Review & Submit</h2>
              <p className="text-purple-300">Confirm details before sending your report.</p>
            </div>

            <div className="space-y-4 bg-black/30 p-6 rounded-2xl border border-purple-800/50">
              <div>
                <h3 className="text-sm text-purple-400 uppercase tracking-wider mb-1">Category</h3>
                <p className="text-lg font-medium">{CATEGORIES.find(c => c.id === category)?.label || 'None'}</p>
              </div>
              
              <div className="h-px bg-purple-900/50"></div>

              <div>
                <h3 className="text-sm text-purple-400 uppercase tracking-wider mb-1">Title</h3>
                <p className="text-lg font-medium">{title || 'None'}</p>
              </div>

              <div className="h-px bg-purple-900/50"></div>

              <div>
                <h3 className="text-sm text-purple-400 uppercase tracking-wider mb-1">Location</h3>
                <p className="text-lg font-medium">{address || 'Location not set'}</p>
              </div>

              {photo && (
                <>
                  <div className="h-px bg-purple-900/50"></div>
                  <div>
                    <h3 className="text-sm text-purple-400 uppercase tracking-wider mb-3">Photo</h3>
                    <img src={photo} alt="Thumbnail" className="w-24 h-24 rounded-lg object-cover border border-purple-800" />
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Sticky Footer */}
      <footer className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#0D021F] via-[#0D021F] to-transparent pointer-events-none flex justify-center max-w-md mx-auto md:max-w-2xl">
        <div className="w-full flex pointer-events-auto mt-8">
          {step < 5 ? (
            <button 
              onClick={nextStep}
              disabled={
                (step === 1 && !category) || 
                (step === 2 && !title) || 
                (step === 3 && !location) || 
                (step === 4 && photoStatus === 'pending')
              }
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:bg-purple-900 text-white py-4 rounded-2xl font-bold text-xl transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 active:scale-95"
            >
              Continue <ArrowRight className="w-6 h-6" />
            </button>
          ) : (
            <button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white py-4 rounded-2xl font-black text-xl transition-all shadow-[0_0_30px_rgba(99,102,241,0.4)] flex items-center justify-center gap-3 active:scale-95"
            >
              {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <Upload className="w-6 h-6" />}
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}
