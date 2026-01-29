
import React, { useState } from 'react';
import {
 X, BookOpen, Film, Package, Zap, StickyNote,
 ChevronDown, Search, LayoutGrid, Calendar,
 CheckCircle2, Sliders, Briefcase, Plus,
 MapPin, Clock, Filter, ArrowRight
} from 'lucide-react';
import { GlassCard } from '../ui/GlassCard.tsx';

interface TutorialModalProps {
 onClose: () => void;
}

const GUIDES = [
 {
  id: 'essentials',
  title: 'Essentials',
  icon: BookOpen,
  color: 'text-gray-600',
  bg: 'bg-gray-100',
  items: [
   {
    question: 'Creating your first project',
    answer: 'Navigate to the project selector in the top left and click"New Project". You can define the production title, dates, and default location. This creates a fresh workspace for your shots and tasks.'
   },
   {
    question: 'Switching between views',
    answer: 'Use the bottom navigation bar (on mobile) or the floating dock to switch between Inventory (Gear), Timeline (Shots), Pipeline (Post), and Notes. The header adapts to show relevant controls for each view.'
   }
  ]
 },
 {
  id: 'inventory',
  title: 'Inventory & Gear',
  icon: Package,
  color: 'text-blue-600 dark:text-indigo-600',
  bg: 'bg-indigo-50',
  items: [
   {
    question: 'Adding equipment',
    answer: 'Go to the Inventory view and click the + button to register new gear. You can specify if it is owned or rented, set daily rates, and add technical specs like sensor size or mount type.'
   },
   {
    question: 'Assigning gear to scenes',
    answer: 'Open a Shot card from the Timeline. In the"Gear Checklist"section, you can toggle items from your global inventory. This helps track what equipment is needed for specific days.'
   },
   {
    question: 'Global vs. Project Inventory',
    answer: 'The Inventory view shows all your assets. When you assign an item to a shot, it automatically becomes part of the"Project Inventory", which filters the view to show only relevant gear for the current production.'
   }
  ]
 },
 {
  id: 'timeline',
  title: 'Timeline & Scheduling',
  icon: Film,
  color: 'text-blue-600 dark:text-indigo-600',
  bg: 'bg-blue-50',
  items: [
   {
    question: 'Scheduling shots',
    answer: 'In the Timeline view, click the + button to add a scene. Vemakin automatically checks for time conflicts. You can switch between"Timeline"(visual) and"List"(compact) layouts using the header toggle.'
   },
   {
    question: 'Travel time calculation',
    answer: 'If you have consecutive shots in different locations, Vemakin automatically calculates travel time and warns you if the transit time exceeds the gap between shots.'
   },
   {
    question: 'Managing scene status',
    answer: 'Click the circle icon on any shot card to toggle its status between"Pending"and"Completed". The progress bar in the header updates automatically.'
   }
  ]
 },
 {
  id: 'pipeline',
  title: 'Post-Production',
  icon: Zap,
  color: 'text-orange-600',
  bg: 'bg-orange-50',
  items: [
   {
    question: 'Tracking tasks',
    answer: 'The Pipeline view uses a Kanban-style system. You can filter tasks by category (Editing, VFX, Color, Sound) using the header pills. Click on a task to update its status or add detailed metadata.'
   },
   {
    question: 'Technical metadata',
    answer: 'When creating a task, you can add specific technical requirements depending on the category, such as"Aspect Ratio"for Editing tasks or"Color Space"for Color Grading tasks.'
   }
  ]
 }
];

export const TutorialModal: React.FC<TutorialModalProps> = ({ onClose }) => {
 const [searchQuery, setSearchQuery] = useState('');
 const [expandedItems, setExpandedItems] = useState<string[]>([]);

 const toggleItem = (id: string) => {
  setExpandedItems(prev =>
   prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
  );
 };

 const filteredGuides = GUIDES.map(section => ({
  ...section,
  items: section.items.filter(item =>
   item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
   item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  )
 })).filter(section => section.items.length > 0);

 return (
  <div className="fixed inset-0 z-[2000] bg-[#F2F2F7] flex flex-col animate-in fade-in duration-300">

   {/* Header */}
   <div className="bg-white border-b border-gray-100 px-6 py-5 flex items-center justify-between shrink-0 shadow-sm z-10">
    <div className="flex items-center gap-4">
     <div className="p-3 bg-blue-600 dark:bg-indigo-600 text-white rounded-2xl shadow-lg shadow-blue-200">
      <BookOpen size={24} strokeWidth={2.5} />
     </div>
     <div>
      <h2 className="text-xl font-semibold text-gray-900 leading-none">Help center</h2>
      <p className="text-[11px] font-semibold text-gray-400 mt-1">Guides & documentation</p>
     </div>
    </div>
    <button
     onClick={onClose}
     className="p-2.5 bg-gray-50 text-gray-400 rounded-xl hover:bg-gray-100 hover:text-gray-900 transition-all active:scale-95"
    >
     <X size={20} strokeWidth={2.5} />
    </button>
   </div>

   {/* Content */}
   <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8">
    <div className="max-w-3xl mx-auto space-y-8">

     {/* Search Hero */}
     <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 text-center space-y-6">
      <h3 className="text-2xl font-semibold text-gray-900">How can we help you?</h3>
      <div className="relative max-w-lg mx-auto">
       <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"size={18} strokeWidth={2.5} />
       <input
        type="text"
        placeholder="Search for guides, features, tips..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full bg-gray-50 border-none rounded-2xl pl-12 pr-4 py-4 text-sm font-semibold text-gray-900 focus:outline-none focus:ring-4 focus:ring-blue-500 dark:ring-indigo-500/10 transition-all placeholder-gray-400"
       />
      </div>
     </div>

     {/* Guides List */}
     <div className="space-y-6">
      {filteredGuides.map(section => (
       <div key={section.id} className="animate-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center gap-3 mb-4 px-2">
         <div className={`p-2 rounded-xl ${section.bg} ${section.color}`}>
          <section.icon size={16} strokeWidth={2.5} />
         </div>
         <h4 className="text-xs font-semibold text-gray-500">{section.title}</h4>
        </div>

        <div className="space-y-3">
         {section.items.map((item, idx) => {
          const itemId = `${section.id}-${idx}`;
          const isExpanded = expandedItems.includes(itemId);

          return (
           <GlassCard
            key={itemId}
            onClick={() => toggleItem(itemId)}
            className={`p-0 bg-white border-none shadow-sm cursor-pointer group transition-all duration-300 ${isExpanded ? 'ring-2 ring-blue-500 dark:ring-indigo-500/10' : 'hover:bg-gray-50'}`}
           >
            <div className="flex items-center justify-between p-5">
             <span className="font-semibold text-sm text-gray-900 group-hover:text-blue-600 dark:text-indigo-600 transition-colors">
              {item.question}
             </span>
             <div className={`transition-transform duration-300 text-gray-400 ${isExpanded ? 'rotate-180 text-blue-500 dark:text-indigo-500' : ''}`}>
              <ChevronDown size={18} />
             </div>
            </div>

            {isExpanded && (
             <div className="px-5 pb-6 animate-in slide-in-from-top-2 duration-300">
              <p className="text-sm font-medium text-gray-500 leading-relaxed border-t border-gray-100 pt-4">
               {item.answer}
              </p>
             </div>
            )}
           </GlassCard>
          );
         })}
        </div>
       </div>
      ))}

      {filteredGuides.length === 0 && (
       <div className="text-center py-20 opacity-50">
        <BookOpen size={48} className="mx-auto mb-4 text-gray-300"strokeWidth={1.5} />
        <p className="text-sm font-semibold text-gray-400">No guides found matching"{searchQuery}"</p>
       </div>
      )}
     </div>

     {/* Footer */}
     <div className="text-center pt-8 pb-4">
      <p className="text-[10px] font-semibold text-gray-300">CineFlow documentation</p>
     </div>
    </div>
   </div>
  </div>
 );
};
