
import React from 'react';
import { BookOpen } from 'lucide-react';

const UserAlbum: React.FC = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8">
      <div className="w-24 h-24 bg-slate-100 rounded-[2.5rem] flex items-center justify-center text-slate-300 mb-6 animate-pulse">
        <BookOpen className="w-12 h-12" />
      </div>
      <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Album Design Studio</h2>
      <p className="text-slate-400 font-bold uppercase tracking-widest mt-2 max-w-md">
        Your photographer has enabled the album workflow. The design interface is initializing...
      </p>
    </div>
  );
};

export default UserAlbum;
