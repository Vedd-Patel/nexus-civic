'use client';
import { useEffect, useState } from 'react';
import useSWR from 'swr';
import { fetcher, SERVICE_URLS } from '@/lib/api';

const MOCK_POSTS = [
  { id: '1', text: 'Huge pothole on 5th Ave causing traffic jam! Someone needs to fix this ASAP.', urgency: 8, factCheck: 'none' },
  { id: '2', text: 'Rumors of a fire at the chemical plant—can someone confirm? Smoke seen from miles away.', urgency: 10, factCheck: 'FALSE' },
  { id: '3', text: 'Water pipe burst near Central High School. Flooding the whole street.', urgency: 7, factCheck: 'TRUE' },
  { id: '4', text: 'Power outage in Sector 4 is expected to last 3 days according to latest news.', urgency: 6, factCheck: 'MISLEADING' },
];

export default function CivicPulseFeed() {
  const { data: rawPosts } = useSWR(`${SERVICE_URLS.civicPulse}/api/posts?limit=10&sort=urgency`, fetcher, { refreshInterval: 20000 });
  const [posts, setPosts] = useState<any[]>(MOCK_POSTS);
  const [modal, setModal] = useState<any>(null);

  useEffect(() => {
    if (Array.isArray(rawPosts)) {
      setPosts(rawPosts);
      return;
    }

    if (rawPosts && typeof rawPosts === 'object') {
      const candidate = (rawPosts as any).posts || (rawPosts as any).items || (rawPosts as any).results;
      if (Array.isArray(candidate)) {
        setPosts(candidate);
        return;
      }
    }

    setPosts(MOCK_POSTS);
  }, [rawPosts]);

  const getBadgeStyle = (fc: string) => {
    switch(fc) {
      case 'TRUE': return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
      case 'FALSE': return 'bg-red-100 text-red-700 border border-red-200';
      case 'MISLEADING': return 'bg-amber-100 text-amber-700 border border-amber-200';
      case 'CHECKING': return 'bg-blue-100 text-blue-700 border border-blue-200 animate-pulse';
      default: return 'bg-slate-100 text-slate-500 border border-slate-200';
    }
  };

  const normalizeFactCheck = (factCheck: unknown): { verdict: string; explanation?: string } => {
    if (typeof factCheck === 'string') {
      return { verdict: factCheck };
    }

    if (factCheck && typeof factCheck === 'object') {
      const candidate = factCheck as { verdict?: unknown; explanation?: unknown };
      return {
        verdict: typeof candidate.verdict === 'string' ? candidate.verdict : 'none',
        explanation: typeof candidate.explanation === 'string' ? candidate.explanation : undefined,
      };
    }

    return { verdict: 'none' };
  };

  const handleFactCheck = async (id: string, text: string) => {
    setPosts((prev) => prev.map((p: any) => p.id === id ? { ...p, factCheck: 'CHECKING' } : p));
    try {
      const response = await fetch(`${SERVICE_URLS.civicPulse}/api/factcheck/${id}`, { method: 'POST' });
      const { data } = await response.json();
      setPosts((prev) => prev.map((p: any) => p.id === id ? { ...p, factCheck: data } : p));
      setModal({ text, verdict: data.verdict, explanation: data.explanation });
    } catch (error) {
      setPosts((prev) => prev.map((p: any) => p.id === id ? { ...p, factCheck: 'none' } : p));
      setModal({ text, verdict: 'ERROR', explanation: 'Failed to complete AI fact check.' });
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-[400px] flex flex-col relative overflow-hidden">
      <h2 className="text-xl font-bold font-outfit text-slate-800 mb-4 flex items-center gap-2">
        <span className="text-blue-500">📡</span> Civic Pulse Feed
      </h2>
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {posts.map((post: any, idx: number) => {
          if (!post || typeof post !== 'object') return null;
          const factCheck = normalizeFactCheck(post?.factCheck);
          const verdict = factCheck.verdict;

          return (
          <div key={String(post?.id ?? idx)} className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex flex-col gap-2 relative overflow-hidden hover:bg-slate-100 transition-colors">
            <div className="absolute top-0 left-0 w-1 h-full rounded-l" style={{ backgroundColor: Number(post?.urgency) > 7 ? '#EF4444' : Number(post?.urgency) > 4 ? '#F59E0B' : '#10B981' }}/>
            <p className="text-sm text-slate-600 italic pl-3 leading-relaxed">"{String(post?.text || '').length > 120 ? String(post?.text || '').slice(0, 120) + '...' : String(post?.text || '')}"</p>
            <div className="flex justify-between items-center mt-2 pl-3">
              <span className={`text-[10px] uppercase px-2 py-0.5 rounded-md font-bold ${getBadgeStyle(verdict || 'none')}`}>
                {verdict === 'none' ? 'UNCHECKED' : (verdict || 'UNCHECKED')}
              </span>
              <button 
                onClick={() => handleFactCheck(String(post?.id), String(post?.text || ''))}
                disabled={verdict !== 'none'}
                className={`text-[11px] ml-auto transition-colors ${verdict === 'none' ? 'text-indigo-600 hover:text-indigo-800 font-medium' : 'text-slate-400 cursor-not-allowed'}`}
              >
                {verdict === 'none' ? 'Fact Check' : 'Verified'}
              </button>
            </div>
          </div>
        )})}
      </div>

      {modal && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center p-4 z-20 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-xl border border-slate-200 w-full max-w-sm shadow-lg">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Fact-Check Result</h3>
            <div className={`inline-block px-2 py-1 text-xs font-bold rounded-md mb-3 ${getBadgeStyle(String(modal.verdict || 'none'))}`}>{String(modal.verdict || 'UNCHECKED')}</div>
            <p className="text-sm text-slate-600 mb-4">{typeof modal.explanation === 'string' ? modal.explanation : 'No additional explanation available.'}</p>
            <button onClick={() => setModal(null)} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg py-2 text-sm transition-colors shadow-sm">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
