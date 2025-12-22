
import React, { useState, useMemo } from 'react';
import { BookOpen, ChevronLeft, ChevronRight, MessageSquare, Plus, X } from 'lucide-react';
import { useData } from '../../context/DataContext';

const UserAlbum: React.FC = () => {
  const { photos, activeEvent } = useData();
  const [currentSpread, setCurrentSpread] = useState(0);
  const [showComments, setShowComments] = useState(false);

  // Group photos into spreads (2 photos per spread for demo)
  const spreads = useMemo(() => {
    const aiPicks = photos.filter(p => p.isAiPick);
    const result = [];
    for (let i = 0; i < aiPicks.length; i += 2) {
      result.push(aiPicks.slice(i, i + 2));
    }
    return result;
  }, [photos]);

  const totalSpreads = spreads.length;

  const nextSpread = () => {
      setCurrentSpread(prev => (prev + 1) % totalSpreads);
  };

  const prevSpread = () => {
      setCurrentSpread(prev => (prev - 1 + totalSpreads) % totalSpreads);
  };

  if (totalSpreads === 0) {
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8 animate-in fade-in">
            <div className="w-24 h-24 bg-slate-100 rounded-[2.5rem] flex items-center justify-center text-slate-300 mb-6">
                <BookOpen className="w-12 h-12" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Album Design Studio</h2>
            <p className="text-slate-400 font-bold uppercase tracking-widest mt-2 max-w-md">
                No highlights available yet. Your album draft will appear here once AI processing picks the best shots.
            </p>
        </div>
      );
  }

  const currentPhotos = spreads[currentSpread];

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
           <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Wedding Album Draft</h1>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Digital Proofing • Spread {currentSpread + 1} of {totalSpreads}</p>
        </div>
        <div className="flex items-center gap-3">
            <button 
                onClick={() => setShowComments(!showComments)}
                className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border flex items-center gap-2 ${showComments ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-600'}`}
            >
                <MessageSquare className="w-4 h-4" /> Comments
            </button>
        </div>
      </div>

      <div className="relative bg-[#e3e1dd] p-4 sm:p-12 rounded-[2rem] shadow-2xl border border-slate-300 overflow-hidden">
          {/* Book Spine Effect */}
          <div className="absolute top-0 bottom-0 left-1/2 w-8 -translate-x-1/2 bg-gradient-to-r from-black/5 via-black/20 to-black/5 z-20 pointer-events-none hidden md:block"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row shadow-xl bg-white aspect-[3/2] md:aspect-[2/1]">
              
              {/* Left Page */}
              <div className="flex-1 border-r border-slate-100 p-4 sm:p-8 flex items-center justify-center bg-white relative overflow-hidden group">
                  {currentPhotos[0] && (
                      <img src={currentPhotos[0].url} className="max-w-full max-h-full object-contain shadow-sm" alt="Left Page" />
                  )}
                  <div className="absolute bottom-4 left-4 text-[8px] font-bold text-slate-300">{(currentSpread * 2) + 1}</div>
              </div>

              {/* Right Page */}
              <div className="flex-1 p-4 sm:p-8 flex items-center justify-center bg-white relative overflow-hidden group">
                  {currentPhotos[1] ? (
                      <img src={currentPhotos[1].url} className="max-w-full max-h-full object-contain shadow-sm" alt="Right Page" />
                  ) : (
                      <div className="text-slate-200 text-xs font-black uppercase tracking-widest">End of Album</div>
                  )}
                  <div className="absolute bottom-4 right-4 text-[8px] font-bold text-slate-300">{(currentSpread * 2) + 2}</div>
              </div>
          </div>

          {/* Navigation Controls */}
          <button onClick={prevSpread} className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white backdrop-blur rounded-full flex items-center justify-center shadow-lg text-slate-700 hover:scale-110 transition-all z-30">
              <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={nextSpread} className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white backdrop-blur rounded-full flex items-center justify-center shadow-lg text-slate-700 hover:scale-110 transition-all z-30">
              <ChevronRight className="w-5 h-5" />
          </button>
      </div>

      {showComments && (
          <div className="fixed inset-y-0 right-0 w-80 bg-white shadow-2xl z-50 p-6 animate-in slide-in-from-right duration-300 flex flex-col">
              <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-slate-900">Spread Comments</h3>
                  <button onClick={() => setShowComments(false)}><X className="w-5 h-5 text-slate-400" /></button>
              </div>
              <div className="flex-1 border-2 border-dashed border-slate-100 rounded-2xl flex flex-col items-center justify-center text-slate-400 gap-2">
                  <MessageSquare className="w-8 h-8 opacity-20" />
                  <p className="text-xs font-bold uppercase tracking-widest">No comments yet</p>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 flex gap-2">
                  <input type="text" placeholder="Add a note..." className="flex-1 bg-slate-50 border-none rounded-xl text-xs font-medium px-3 outline-none focus:ring-2 focus:ring-indigo-500/20" />
                  <button className="p-3 bg-slate-900 text-white rounded-xl"><Plus className="w-4 h-4" /></button>
              </div>
          </div>
      )}
    </div>
  );
};

export default UserAlbum;
