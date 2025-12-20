
import React from 'react';
import { useData } from '../../context/DataContext';
// Added Image as ImageIcon to the lucide-react imports
import { Clock, CheckCircle, Download, Trash2, Send, Image as ImageIcon } from 'lucide-react';

const UserSelections: React.FC = () => {
  const { photos, selectedPhotos, activeEvent, togglePhotoSelection, submitSelections } = useData();
  
  const currentSelectionPhotos = photos.filter(p => selectedPhotos.has(p.id));

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">My Selections</h1>
          <p className="text-slate-500 font-medium">Manage photos you've picked for final editing</p>
        </div>
        {selectedPhotos.size > 0 && (
          <button 
            onClick={submitSelections}
            className="px-8 py-3 bg-[#10B981] text-white font-bold rounded-2xl shadow-lg shadow-[#10B981]/20 hover:bg-[#059669] transition-all flex items-center gap-2"
          >
            <Send className="w-4 h-4" /> Submit for Editing
          </button>
        )}
      </div>

      {currentSelectionPhotos.length > 0 ? (
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
          <div className="flex items-center gap-2 text-indigo-600">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg">Selection Draft ({currentSelectionPhotos.length} photos)</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
            {currentSelectionPhotos.map(photo => (
              <div key={photo.id} className="relative aspect-square rounded-[1.5rem] overflow-hidden group shadow-sm hover:shadow-xl transition-all">
                <img src={photo.url} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button 
                    onClick={() => togglePhotoSelection(photo.id)}
                    className="p-3 bg-red-500/90 hover:bg-red-600 text-white rounded-2xl transition-all transform hover:scale-110"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                <div className="absolute top-3 left-3 px-2 py-1 bg-white/90 backdrop-blur-md rounded-lg text-[8px] font-black uppercase tracking-widest text-slate-900 shadow-sm">
                  {photo.category}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white p-20 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center gap-6">
          <div className="w-24 h-24 bg-slate-50 text-slate-300 rounded-[2rem] flex items-center justify-center">
            <CheckCircle className="w-12 h-12" />
          </div>
          <div className="space-y-2">
            <h4 className="text-xl font-bold text-slate-900">Your selection is empty</h4>
            <p className="text-slate-500 max-w-xs mx-auto font-medium leading-relaxed">Head over to the gallery to pick the most beautiful moments from your event.</p>
          </div>
          <button className="bg-slate-900 text-white px-10 py-4 rounded-3xl font-bold hover:bg-black transition-all">
            Browse Gallery
          </button>
        </div>
      )}

      <div className="bg-[#111827] text-white p-10 rounded-[3rem] relative overflow-hidden group">
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h3 className="text-3xl font-black tracking-tight leading-none">Workflow after submission</h3>
            <p className="text-slate-400 font-medium">Once you click submit, the following automated process begins:</p>
            <ul className="space-y-4">
              {[
                { step: 1, text: "Photographer receives instant notification with Lightroom XMP links." },
                { step: 2, text: "Advanced retouching and color grading starts on chosen frames." },
                { step: 3, text: "Final high-resolution download portal is generated and sent to you." },
              ].map((item, i) => (
                <li key={i} className="flex gap-4 items-start group">
                  <div className="w-7 h-7 bg-[#10B981] rounded-lg flex items-center justify-center text-xs text-white font-black shrink-0 transition-transform group-hover:rotate-12">
                    {item.step}
                  </div>
                  <span className="text-slate-300 font-medium leading-snug">{item.text}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex justify-center">
             <div className="w-48 h-48 bg-slate-800/50 rounded-[2.5rem] flex items-center justify-center animate-bounce-slow">
                <Download className="w-20 h-20 text-[#10B981]" />
             </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none">
          <ImageIcon className="w-96 h-96" />
        </div>
      </div>
    </div>
  );
};

export default UserSelections;
