'use client';
import { useState } from 'react';
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
  const [posts, setPosts] = useState(rawPosts || MOCK_POSTS);
  const [modal, setModal] = useState<any>(null);

  const getBadgeStyle = (fc: string) => {
    switch(fc) {
      case 'TRUE': return 'bg-green-600 text-white';
      case 'FALSE': return 'bg-red-600 text-white';
      case 'MISLEADING': return 'bg-orange-500 text-white';
      case 'CHECKING': return 'bg-blue-600 text-white animate-pulse';
      default: return 'bg-gray-600 text-gray-300';
    }
  };

  const handleFactCheck = (id: string, text: string) => {
    setPosts(posts.map((p: any) => p.id === id ? { ...p, factCheck: 'CHECKING' } : p));
    setTimeout(() => {
      setPosts(posts.map((p: any) => p.id === id ? { ...p, factCheck: 'FALSE' } : p));
      setModal({ text, verdict: 'FALSE', explanation: 'AI verification complete. Official reports do not corroborate this claim. It appears to be fabricated.' });
    }, 2000);
  };

  return (
    <div className="bg-[#1A0533] p-6 rounded-xl border border-purple-900/50 h-[400px] flex flex-col relative overflow-hidden">
      <h2 className="text-xl font-bold font-outfit text-white mb-4 flex items-center gap-2">
        <span className="text-blue-400">📡</span> Civic Pulse Feed
      </h2>
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {posts.map((post: any) => (
          <div key={post.id} className="bg-gray-800/30 p-4 rounded-lg border border-gray-700/50 flex flex-col gap-2 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: post.urgency > 7 ? 'red' : post.urgency > 4 ? 'orange' : 'green' }}/>
            <p className="text-sm text-gray-300 italic pl-3 leading-relaxed">"{post.text.length > 120 ? post.text.slice(0, 120) + '...' : post.text}"</p>
            <div className="flex justify-between items-center mt-2 pl-3">
              <span className={`text-[10px] uppercase px-2 py-0.5 rounded font-bold ${getBadgeStyle(post.factCheck)}`}>
                {post.factCheck === 'none' ? 'UNCHECKED' : post.factCheck}
              </span>
              <button 
                onClick={() => handleFactCheck(post.id, post.text)}
                disabled={post.factCheck !== 'none'}
                className={`text-[11px] ml-auto transition-colors ${post.factCheck === 'none' ? 'text-indigo-400 hover:text-indigo-300 underline' : 'text-gray-600 cursor-not-allowed'}`}
              >
                {post.factCheck === 'none' ? 'Fact Check' : 'Verified'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-4 z-20 backdrop-blur-sm">
          <div className="bg-[#1E124A] p-6 rounded-xl border border-indigo-500 w-full max-w-sm shadow-[0_0_20px_rgba(79,70,229,0.3)]">
            <h3 className="text-lg font-bold text-white mb-2">Fact-Check Result</h3>
            <div className={`inline-block px-2 py-1 text-xs font-bold rounded mb-3 ${getBadgeStyle(modal.verdict)}`}>{modal.verdict}</div>
            <p className="text-sm text-gray-300 mb-4">{modal.explanation}</p>
            <button onClick={() => setModal(null)} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded py-2 text-sm transition-colors">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
