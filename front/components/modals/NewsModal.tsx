
import React from 'react';
import { X } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard.tsx';

interface NewsModalProps {
  onClose: () => void;
}

export const NewsModal: React.FC<NewsModalProps> = ({ onClose }) => {
  const updates = [
    {
      version: '1.2.0',
      date: 'Today',
      title: 'Major Design Overhaul',
      description: 'Experience the new glassmorphism interface with improved navigation and smoother animations.',
      type: 'Major'
    },
    {
      version: '1.1.5',
      date: '2 days ago',
      title: 'Post-Production Pipeline',
      description: 'Track editing, VFX, and sound tasks with the new Kanban-style board.',
      type: 'Feature'
    },
    {
      version: '1.1.0',
      date: 'Last week',
      title: 'Inventory Tracking',
      description: 'Complete gear management system with check-in/check-out status.',
      type: 'Feature'
    }
  ];

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={onClose}>
      <GlassCard className="w-full max-w-md bg-white/90 p-0 overflow-hidden shadow-2xl border-white/60" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white/50">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-gray-900">Latest news</h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mt-1">Vemakin updates</p>
          </div>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto p-6 space-y-6">
          {updates.map((update, idx) => (
            <div key={idx} className="relative pl-6 border-l-2 border-gray-100 last:border-0 pb-2">
              <div className={`absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full ring-4 ring-white ${idx === 0 ? 'bg-blue-600 dark:bg-indigo-600' : 'bg-gray-300'}`} />
              <div className="flex justify-between items-start mb-1">
                <span className={`text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md ${idx === 0 ? 'bg-blue-100 text-blue-600 dark:text-indigo-600' : 'bg-gray-100 text-gray-500'}`}>
                  v{update.version}
                </span>
                <span className="text-[9px] font-bold text-gray-400">{update.date}</span>
              </div>
              <h3 className="text-sm font-bold text-gray-900 mt-2 mb-1">{update.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed font-medium">{update.description}</p>
            </div>
          ))}
        </div>
        <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
          <p className="text-[10px] font-bold text-gray-400">Stay tuned for more updates!</p>
        </div>
      </GlassCard>
    </div>
  );
};
