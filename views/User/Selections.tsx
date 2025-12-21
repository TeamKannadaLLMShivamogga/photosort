
import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Clock, CheckCircle, Download, Trash2, Send, Image as ImageIcon, Lock, MessageSquare, ThumbsUp, AlertCircle } from 'lucide-react';

const UserSelections: React.FC = () => {
  const { photos, selectedPhotos, activeEvent, togglePhotoSelection, submitSelections, addPhotoComment, updatePhotoReviewStatus } = useData();
  const [commentText, setCommentText] = useState('');
  const [activePhotoId, setActivePhotoId] = useState<string | null>(null);
  
  const currentSelectionPhotos = photos.filter(p => selectedPhotos.has(p.id));
  const isLocked = activeEvent?.selectionStatus !== 'open';
  const isReviewMode = activeEvent?.selectionStatus === 'review' || activeEvent?.selectionStatus === 'accepted';

  // Helper for timeline
  const getTimelineStatus = () => {
      const statuses = ['open', 'submitted', 'editing', 'review', 'accepted'];
      const currentIdx = statuses.indexOf(activeEvent?.selectionStatus || 'open');
      return { statuses, currentIdx };
  };
  const { statuses, currentIdx } = getTimelineStatus();

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto pb-20">
      
      {/* Workflow Timeline */}
      <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm overflow-x-auto">
          <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-4">Project Status</h3>
          <div className="flex items-center min-w-[600px] justify-between relative">
              <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-100 -translate-y-1/2 z-0" />
              {statuses.map((status, idx) => {
                  const completed = idx <= currentIdx;
                  const active = idx === currentIdx;
                  return (
                      <div key={status} className="relative z-10 flex flex-col items-center gap-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-4 transition-all ${
                              active ? 'bg-indigo-600 border-indigo-100 text-white scale-110 shadow-lg' :
                              completed ? 'bg-[#10B981] border-emerald-100 text-white' : 'bg-white border-slate-200 text-slate-300'
                          }`}>
                              {completed ? <CheckCircle className="w-4 h-4" /> : <div className="w-2 h-2 bg-current rounded-full" />}
                          </div>
                          <span className={`text-[10px] font-bold uppercase tracking-wider ${active ? 'text-indigo-600' : 'text-slate-400'}`}>
                              {status}
                          </span>
                      </div>
                  )
              })}
          </div>
          {activeEvent?.selectionStatus === 'editing' && activeEvent.timeline?.deliveryEstimate && (
              <div className="mt-4 p-3 bg-indigo-50 rounded-xl flex items-center justify-center gap-2 text-indigo-700 text-xs font-bold">
                  <Clock className="w-4 h-4" /> Expected Delivery: {new Date(activeEvent.timeline.deliveryEstimate).toLocaleDateString()}
              </div>
          )}
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">My Selections</h1>
          <p className="text-slate-500 font-medium">
              {isLocked 
                ? isReviewMode ? "Review edited photos" : "Selections locked for processing" 
                : "Manage photos you've picked for final editing"}
          </p>
        </div>
        {selectedPhotos.size > 0 && !isLocked && (
          <button 
            onClick={submitSelections}
            className="px-8 py-3 bg-[#10B981] text-white font-bold rounded-2xl shadow-lg shadow-[#10B981]/20 hover:bg-[#059669] transition-all flex items-center gap-2"
          >
            <Send className="w-4 h-4" /> Submit for Editing
          </button>
        )}
        {isLocked && !isReviewMode && (
            <div className="px-6 py-2 bg-slate-100 text-slate-500 rounded-xl font-bold flex items-center gap-2">
                <Lock className="w-4 h-4" /> Locked
            </div>
        )}
      </div>

      {currentSelectionPhotos.length > 0 ? (
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {currentSelectionPhotos.map(photo => (
              <div key={photo.id} className="space-y-3">
                  <div className="relative aspect-[4/5] rounded-[1.5rem] overflow-hidden group shadow-sm hover:shadow-xl transition-all border-4 border-white">
                    {/* Display Edited Version if available in Review Mode */}
                    <img src={isReviewMode && photo.editedUrl ? photo.editedUrl : photo.url} className="w-full h-full object-cover" alt="" />
                    
                    {!isLocked && (
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button 
                            onClick={() => togglePhotoSelection(photo.id)}
                            className="p-3 bg-red-500/90 hover:bg-red-600 text-white rounded-2xl transition-all transform hover:scale-110"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                        </div>
                    )}

                    {isReviewMode && (
                        <div className="absolute top-2 right-2 flex gap-2">
                            {photo.reviewStatus === 'approved' && <div className="bg-green-500 text-white p-1.5 rounded-full shadow-lg"><CheckCircle className="w-4 h-4" /></div>}
                            {photo.reviewStatus === 'changes_requested' && <div className="bg-amber-500 text-white p-1.5 rounded-full shadow-lg"><AlertCircle className="w-4 h-4" /></div>}
                        </div>
                    )}
                  </div>

                  {/* Review Interface */}
                  {isReviewMode && (
                      <div className="bg-slate-50 p-3 rounded-2xl space-y-3 border border-slate-100">
                          <div className="flex gap-2">
                              <button 
                                onClick={() => updatePhotoReviewStatus(photo.id, 'approved')}
                                className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors ${
                                    photo.reviewStatus === 'approved' ? 'bg-green-100 text-green-700' : 'bg-white hover:bg-green-50 text-slate-500'
                                }`}
                              >
                                  Approve
                              </button>
                              <button 
                                onClick={() => setActivePhotoId(activePhotoId === photo.id ? null : photo.id)}
                                className="flex-1 py-2 bg-white hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors"
                              >
                                  Comment
                              </button>
                          </div>
                          
                          {/* Comment Input */}
                          {activePhotoId === photo.id && (
                              <div className="flex gap-2">
                                  <input 
                                    type="text" 
                                    placeholder="Request changes..." 
                                    className="flex-1 p-2 text-xs border rounded-lg outline-none focus:border-indigo-500"
                                    value={commentText}
                                    onChange={e => setCommentText(e.target.value)}
                                  />
                                  <button 
                                    onClick={() => {
                                        if(commentText) {
                                            addPhotoComment(photo.id, commentText);
                                            updatePhotoReviewStatus(photo.id, 'changes_requested');
                                            setCommentText('');
                                            setActivePhotoId(null);
                                        }
                                    }}
                                    className="p-2 bg-slate-900 text-white rounded-lg"
                                  >
                                      <Send className="w-3 h-3" />
                                  </button>
                              </div>
                          )}

                          {/* Existing Comments */}
                          {photo.comments && photo.comments.length > 0 && (
                              <div className="space-y-1 max-h-20 overflow-y-auto custom-scrollbar">
                                  {photo.comments.map((c, i) => (
                                      <p key={i} className="text-[9px] text-slate-600 bg-white p-1.5 rounded-lg border border-slate-100">
                                          <span className="font-bold">{c.author}:</span> {c.text}
                                      </p>
                                  ))}
                              </div>
                          )}
                      </div>
                  )}
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
        </div>
      )}
    </div>
  );
};

export default UserSelections;
