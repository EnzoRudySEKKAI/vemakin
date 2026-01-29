
import React, { useState } from 'react';
import {
  ArrowRight, Film, Package, Zap, Check, Search,
  TrendingUp, AlertCircle, StickyNote, FileText,
  Camera, Mic, Sun, Scissors, Palette, Layers,
  MapPin, Clock, Calendar, MoreVertical, Flag, Aperture,
  CheckCircle2, ListChecks, DollarSign, LayoutGrid, ChevronDown,
  Monitor, Sliders, Database, ShoppingBag, Radio, ArrowUp, ArrowUpRight
} from 'lucide-react';
import { GlassCard } from '../ui/GlassCard.tsx';

interface OnboardingViewProps {
  onComplete: () => void;
}

// --- HIGH FIDELITY MOCK UI COMPONENTS ---

const MockTimeline = () => (
  <div className="w-full h-full bg-[#F2F2F7] flex flex-col items-center pt-36 md:pt-44 relative overflow-hidden select-none cursor-default pointer-events-none">
   <div className="w-full max-w-md md:max-w-xl px-6 space-y-6 scale-100 md:scale-110 origin-top opacity-100 transition-all duration-500">

     {/* Date Header */}
     <div className="flex items-center gap-4 px-3 py-1 bg-gray-200/20 rounded-xl mb-4">
      <div className="h-px flex-1 bg-gray-300/30"/>
      <div className="flex items-center gap-4 md:gap-8">
        <span className="text-[12px] font-semibold text-gray-400">Oct 24, 2024</span>
        <div className="flex items-center gap-4">
         <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-400/70">
           <Sun size={14} className="text-orange-400/60"/> 06:12
         </div>
        </div>
      </div>
      <div className="h-px flex-1 bg-gray-300/30"/>
     </div>

     {/* Shot Card (Current Design) */}
     <GlassCard className="p-6 md:p-8 flex flex-col items-center text-center bg-white/95 border-none shadow-sm rounded-[32px] md:rounded-[48px] overflow-hidden relative">
      <div className="flex flex-col items-center gap-1.5 mb-4 w-full relative z-10">
        <h3 className="text-2xl md:text-3xl font-semibold leading-tight text-gray-900">
         Opening scene - wide
        </h3>
        <div className="flex items-center gap-3 text-sm font-semibold text-gray-400">
         <span>08:00 — 10:00</span>
         <div className="flex items-center gap-1.5 text-gray-300">
           <Clock size={14} strokeWidth={3} />
           <span>2h</span>
         </div>
        </div>
      </div>

      <div className="w-full border-t border-b border-gray-100/50 py-4 mb-4 bg-gray-50/20 rounded-2xl relative z-10">
        <div className="grid grid-cols-2 gap-x-4 max-w-lg mx-auto px-4">
         <div className="flex flex-col items-center gap-1 border-r border-gray-200/50">
           <span className="text-[10px] font-semibold text-gray-300">Location</span>
           <span className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <MapPin size={12} className="text-gray-900 shrink-0"strokeWidth={3} />
            Rooftop Central
           </span>
         </div>
         <div className="flex flex-col items-center gap-1">
           <span className="text-[10px] font-semibold text-gray-300">Inventory</span>
           <span className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <Package size={12} className="text-gray-900 shrink-0"strokeWidth={3} />
            4/4 ready
           </span>
         </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-3 w-full md:max-w-md relative z-10">
        <div className="h-12 flex-1 px-5 rounded-2xl flex items-center justify-center gap-2.5 bg-blue-600 text-white shadow-lg shadow-blue-200 border-blue-600 border">
         <span className="font-semibold text-[11px]">Completed</span>
         <CheckCircle2 size={16} strokeWidth={3} />
        </div>

        <div className="h-12 flex-1 px-5 rounded-2xl flex items-center justify-center gap-2.5 bg-white text-gray-400 border border-gray-100 shadow-sm">
         <span className="font-semibold text-[11px]">Checklist</span>
         <ListChecks size={16} strokeWidth={3} />
        </div>
      </div>
     </GlassCard>

     {/* Next Shot Preview */}
     <div className="opacity-60 scale-95">
      <GlassCard className="px-4 py-3.5 flex items-center justify-between bg-white/90 rounded-[20px] border-l-0 shadow-sm">
        <div className="flex items-center gap-4 flex-1 min-w-0">
         <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-white text-blue-600 border border-blue-100 shadow-sm">
           <Film size={20} strokeWidth={2.5} />
         </div>
         <div className="flex-1 min-w-0 text-left">
           <h3 className="text-base font-semibold text-gray-900">Close-up elara</h3>
           <div className="flex items-center gap-3 mt-1">
            <span className="text-[10px] font-medium text-gray-400 flex items-center gap-1.5">
              <MapPin size={10} strokeWidth={2.5} /> Rooftop Central
            </span>
            <span className="text-[10px] font-medium text-gray-900 flex items-center gap-1.5">
              <Clock size={10} strokeWidth={2.5} /> 10:30
            </span>
           </div>
         </div>
        </div>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white text-gray-300 border border-gray-200">
         <Check size={18} strokeWidth={3} />
        </div>
      </GlassCard>
     </div>

   </div>
  </div>
);

const MockInventory = () => (
  <div className="w-full h-full bg-[#F2F2F7] flex flex-col items-center pt-36 md:pt-44 relative overflow-hidden select-none cursor-default pointer-events-none">
   <div className="w-full max-w-md md:max-w-4xl lg:max-w-5xl px-6 space-y-6 scale-100 md:scale-110 origin-top opacity-100 transition-all duration-500">

     {/* Search & Filters */}
     <div className="space-y-4">
      <div className="w-full bg-white rounded-2xl h-12 pl-12 pr-4 flex items-center shadow-sm shadow-blue-100 dark:shadow-indigo-900/20/50 relative">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"size={16} strokeWidth={2.5} />
        <span className="text-xs font-semibold text-gray-300">Search gear...</span>
      </div>

      <div className="flex items-center gap-1.5">
        <div className="px-5 py-3 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-200 flex items-center gap-2">
         <LayoutGrid size={14} strokeWidth={2.5} />
         <span className="text-[11px] font-semibold">All</span>
        </div>
        <div className="px-5 py-3 bg-white text-gray-400 rounded-2xl shadow-sm flex items-center gap-2">
         <Camera size={14} strokeWidth={2.5} />
         <span className="text-[11px] font-semibold">Camera</span>
        </div>
        <div className="px-5 py-3 bg-white text-gray-400 rounded-2xl shadow-sm flex items-center gap-2">
         <Sun size={14} strokeWidth={2.5} />
         <span className="text-[11px] font-semibold">Light</span>
        </div>
      </div>
     </div>

     {/* Inventory Grid */}
     <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {/* Card 1 */}
      <GlassCard className="p-5 flex flex-col h-full bg-white shadow-sm hover:shadow-md transition-all">
        <div className="flex justify-between items-start mb-5">
         <div className="flex items-center gap-4 min-w-0 flex-1">
           <div className="p-3 rounded-2xl bg-blue-50 text-blue-600 shadow-inner">
            <Camera size={24} strokeWidth={2.5} />
           </div>
           <div className="min-w-0">
            <h3 className="text-xl font-semibold leading-none text-gray-900 truncate">A-CAM</h3>
            <p className="text-sm font-medium text-gray-400 mt-1.5 truncate">RED V-RAPTOR</p>
           </div>
         </div>
         <span className="px-2.5 py-1 rounded-md text-[13px] font-semibold border bg-indigo-50 border-indigo-100 text-blue-600 dark:text-indigo-600">Owned</span>
        </div>
        <div className="mb-4 min-w-0 flex-1">
         <span className="inline-block px-2.5 py-1 rounded-md bg-gray-50 text-sm font-medium text-gray-500">Camera</span>
        </div>
        <div className="mt-auto grid grid-cols-2 gap-3 bg-gray-50/50 p-4 rounded-2xl border border-gray-100/50">
         <div className="flex flex-col"><span className="text-gray-400 text-[13px] font-medium leading-none mb-1.5">Sensor</span><span className="text-gray-900 text-sm font-semibold">8K VV</span></div>
         <div className="flex flex-col"><span className="text-gray-400 text-[13px] font-medium leading-none mb-1.5">Mount</span><span className="text-gray-900 text-sm font-semibold">PL</span></div>
        </div>
      </GlassCard>

      {/* Card 2 */}
      <GlassCard className="p-5 flex flex-col h-full bg-white shadow-sm hover:shadow-md transition-all">
        <div className="flex justify-between items-start mb-5">
         <div className="flex items-center gap-4 min-w-0 flex-1">
           <div className="p-3 rounded-2xl bg-blue-50 text-blue-600 shadow-inner">
            <Sun size={24} strokeWidth={2.5} />
           </div>
           <div className="min-w-0">
            <h3 className="text-xl font-semibold leading-none text-gray-900 truncate">M18 HMI</h3>
            <p className="text-sm font-medium text-gray-400 mt-1.5 truncate">ARRI</p>
           </div>
         </div>
         <span className="px-2.5 py-1 rounded-md text-[13px] font-semibold border bg-orange-50 border-orange-100 text-orange-600">Rented</span>
        </div>
        <div className="mb-4 min-w-0 flex-1">
         <span className="inline-block px-2.5 py-1 rounded-md bg-gray-50 text-sm font-medium text-gray-500">Light</span>
        </div>
        <div className="mt-auto grid grid-cols-2 gap-3 bg-gray-50/50 p-4 rounded-2xl border border-gray-100/50">
         <div className="flex flex-col"><span className="text-gray-400 text-[13px] font-medium leading-none mb-1.5">Output</span><span className="text-gray-900 text-sm font-semibold">1800W</span></div>
         <div className="flex flex-col"><span className="text-gray-400 text-[13px] font-medium leading-none mb-1.5">Temp</span><span className="text-gray-900 text-sm font-semibold">5600K</span></div>
        </div>
      </GlassCard>

      {/* Card 3 */}
      <GlassCard className="p-5 flex flex-col h-full bg-white shadow-sm hover:shadow-md transition-all">
        <div className="flex justify-between items-start mb-5">
         <div className="flex items-center gap-4 min-w-0 flex-1">
           <div className="p-3 rounded-2xl bg-blue-50 text-blue-600 shadow-inner">
            <Monitor size={24} strokeWidth={2.5} />
           </div>
           <div className="min-w-0">
            <h3 className="text-xl font-semibold leading-none text-gray-900 truncate">CINE 13</h3>
            <p className="text-sm font-medium text-gray-400 mt-1.5 truncate">SmallHD</p>
           </div>
         </div>
         <span className="px-2.5 py-1 rounded-md text-[13px] font-semibold border bg-indigo-50 border-indigo-100 text-blue-600 dark:text-indigo-600">Owned</span>
        </div>
        <div className="mb-4 min-w-0 flex-1">
         <span className="inline-block px-2.5 py-1 rounded-md bg-gray-50 text-sm font-medium text-gray-500">Monitoring</span>
        </div>
        <div className="mt-auto grid grid-cols-2 gap-3 bg-gray-50/50 p-4 rounded-2xl border border-gray-100/50">
         <div className="flex flex-col"><span className="text-gray-400 text-[13px] font-medium leading-none mb-1.5">Screen</span><span className="text-gray-900 text-sm font-semibold">13"4K</span></div>
         <div className="flex flex-col"><span className="text-gray-400 text-[13px] font-medium leading-none mb-1.5">Nits</span><span className="text-gray-900 text-sm font-semibold">1500</span></div>
        </div>
      </GlassCard>
     </div>
   </div>
  </div>
);

const MockPipeline = () => (
  <div className="w-full h-full bg-[#F2F2F7] flex flex-col items-center pt-36 md:pt-44 relative overflow-hidden select-none cursor-default pointer-events-none">
   <div className="w-full max-w-md md:max-w-3xl lg:max-w-4xl px-6 space-y-6 scale-100 md:scale-110 origin-top opacity-100 transition-all duration-500">

     {/* Header Stats */}
     <div className="flex items-center justify-between px-2">
      <h3 className="text-[10px] font-semibold text-gray-400">
        Production activity
      </h3>
      <span className="px-2.5 py-1 rounded-lg bg-white/60 border border-white/60 shadow-sm text-[10px] font-semibold text-gray-400 backdrop-blur-sm">
        5 left <span className="text-gray-300">/</span> 12 total
      </span>
     </div>

     {/* Task Grid */}
     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Task 1 */}
      <GlassCard className="p-6 flex flex-col justify-between !bg-white border border-gray-100 rounded-[24px] shadow-sm">
        <div>
         <div className="flex items-center justify-between mb-4">
           <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border bg-blue-50 border-blue-100">
              <Scissors size={12} strokeWidth={2.5} className="text-blue-600"/>
              <span className="text-[10px] font-semibold text-blue-600">Editing task</span>
            </div>
            <div className="px-2.5 py-1.5 rounded-xl border text-[10px] font-semibold text-orange-600 bg-orange-50 border-orange-100">
              High
            </div>
           </div>
           <div className="flex items-center gap-1.5 text-gray-300">
            <Calendar size={12} strokeWidth={2.5} />
            <span className="text-[10px] font-medium">Oct 30</span>
           </div>
         </div>
         <div className="mb-6">
           <h4 className="text-xl font-semibold text-gray-900 leading-tight mb-2">
            Rough cut assembly
           </h4>
           <p className="text-sm font-medium text-gray-500 leading-relaxed">
            First pass of the chase sequence including placeholder VFX.
           </p>
         </div>
        </div>
        <div className="w-full py-3 px-4 rounded-xl flex items-center justify-between text-[10px] font-semibold bg-blue-50 text-blue-600">
         <div className="flex items-center gap-2">
           <TrendingUp size={14} strokeWidth={2.5} />
           <span>Progress</span>
         </div>
         <ChevronDown size={14} />
        </div>
      </GlassCard>

      {/* Task 2 */}
      <GlassCard className="p-6 flex flex-col justify-between !bg-white border border-gray-100 rounded-[24px] shadow-sm">
        <div>
         <div className="flex items-center justify-between mb-4">
           <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border bg-blue-50 border-blue-100">
              <Palette size={12} strokeWidth={2.5} className="text-blue-600"/>
              <span className="text-[10px] font-semibold text-blue-600">Color task</span>
            </div>
            <div className="px-2.5 py-1.5 rounded-xl border text-[10px] font-semibold text-gray-400 bg-gray-50 border-gray-100">
              Medium
            </div>
           </div>
           <div className="flex items-center gap-1.5 text-gray-300">
            <Calendar size={12} strokeWidth={2.5} />
            <span className="text-[10px] font-medium">Nov 02</span>
           </div>
         </div>
         <div className="mb-6">
           <h4 className="text-xl font-semibold text-gray-900 leading-tight mb-2">
            Neon look dev
           </h4>
           <p className="text-sm font-medium text-gray-500 leading-relaxed">
            Finalize the LUT for the night exterior scenes.
           </p>
         </div>
        </div>
        <div className="w-full py-3 px-4 rounded-xl flex items-center justify-between text-[10px] font-semibold bg-gray-50 text-gray-500">
         <div className="flex items-center gap-2">
           <AlertCircle size={14} strokeWidth={2.5} />
           <span>Todo</span>
         </div>
         <ChevronDown size={14} />
        </div>
      </GlassCard>
     </div>
   </div>
  </div>
);

const MockNotes = () => (
  <div className="w-full h-full bg-[#F2F2F7] flex flex-col items-center pt-36 md:pt-44 relative overflow-hidden select-none cursor-default pointer-events-none">
   <div className="w-full max-w-md md:max-w-4xl lg:max-w-5xl px-6 space-y-6 scale-100 md:scale-110 origin-top opacity-100 transition-all duration-500">

     {/* Search Bar */}
     <div className="flex gap-3 mb-2">
      <div className="flex-1 bg-white rounded-2xl h-12 pl-12 pr-4 flex items-center shadow-sm shadow-blue-100 dark:shadow-indigo-900/20/50 relative">
        <Search size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"strokeWidth={2.5} />
        <span className="text-xs font-semibold text-gray-300">Search notes...</span>
      </div>
      <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
        <ArrowUp size={20} strokeWidth={2.5} />
      </div>
     </div>

     {/* Notes Grid */}
     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Note 1 */}
      <GlassCard className="p-0 flex flex-col border-white/60 overflow-hidden shadow-sm hover:shadow-lg transition-all">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-blue-50/30">
         <div className="flex items-center gap-3">
           <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
            <Film size={14} strokeWidth={2.5} />
           </div>
           <span className="text-[10px] font-semibold text-blue-600/80">Sequence 12A</span>
         </div>
         <span className="text-[10px] font-semibold text-gray-400 flex items-center gap-2">
           <Calendar size={12} strokeWidth={2.5} /> Oct 24
         </span>
        </div>
        <div className="p-7 flex-1 flex flex-col">
         <h4 className="font-semibold text-xl text-gray-900 leading-tight mb-4">Lighting change</h4>
         <p className="text-sm text-gray-500 leading-relaxed font-medium mb-6">
           Director wants more contrast on the close-up shot. We need to swap the diffusion for the next take.
         </p>
         <div className="mt-auto pt-5 border-t border-gray-50/50">
           <div className="w-full py-3.5 rounded-xl bg-gray-50 text-gray-400 flex items-center justify-between px-5">
            <div className="flex items-center gap-2.5">
              <Film size={14} strokeWidth={2.5} className="text-gray-300"/>
              <span className="text-[10px] font-semibold">View scene 12A</span>
            </div>
            <ArrowRight size={14} />
           </div>
         </div>
        </div>
      </GlassCard>

      {/* Note 2 */}
      <GlassCard className="p-0 flex flex-col border-white/60 overflow-hidden shadow-sm hover:shadow-lg transition-all">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-blue-50/30">
         <div className="flex items-center gap-3">
           <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
            <StickyNote size={14} strokeWidth={2.5} />
           </div>
           <span className="text-[10px] font-semibold text-blue-600/80">General note</span>
         </div>
         <span className="text-[10px] font-semibold text-gray-400 flex items-center gap-2">
           <Calendar size={12} strokeWidth={2.5} /> Oct 22
         </span>
        </div>
        <div className="p-7 flex-1 flex flex-col">
         <h4 className="font-semibold text-xl text-gray-900 leading-tight mb-4">Crew catering</h4>
         <p className="text-sm text-gray-500 leading-relaxed font-medium mb-6">
           Confirm vegan options for Friday's night shoot. The runner needs the final count by Thursday morning.
         </p>
         <div className="mt-auto pt-5 border-t border-gray-50/50">
           <div className="flex justify-end">
            <span className="text-[10px] font-semibold text-gray-300 flex items-center gap-1">View details <ArrowUpRight size={12} /></span>
           </div>
         </div>
        </div>
      </GlassCard>
     </div>
   </div>
  </div>
);

const SLIDES = [
  {
   component: MockInventory,
   title:"Master your gear",
   description:"Track every lens, camera, and light. Assign equipment to specific shots and ensure your kit is ready.",
   color:"bg-blue-600 dark:bg-indigo-600",
   shadow:"shadow-indigo-200"
  },
  {
   component: MockTimeline,
   title:"Orchestrate your vision",
   description:"Plan shots, manage schedules, and visualize your timeline with an intuitive cinematic interface.",
   color:"bg-blue-600",
   shadow:"shadow-blue-200"
  },
  {
   component: MockPipeline,
   title:"Track post-production",
   description:"Manage milestones for editing, VFX, and color grading to ensure timely delivery.",
   color:"bg-orange-500",
   shadow:"shadow-orange-200"
  },
  {
   component: MockNotes,
   title:"Capture every detail",
   description:"Keep creative ideas, script changes, and feedback organized in one centralized hub.",
   color:"bg-purple-600",
   shadow:"shadow-purple-200"
  }
];

export const OnboardingView: React.FC<OnboardingViewProps> = ({ onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  const handleNext = () => {
   if (currentSlide < SLIDES.length - 1) {
     setCurrentSlide(curr => curr + 1);
   } else {
     setIsExiting(true);
     setTimeout(onComplete, 300);
   }
  };

  const handleSkip = () => {
   setIsExiting(true);
   setTimeout(onComplete, 300);
  };

  const content = SLIDES[currentSlide];
  const MockComponent = content.component;

  return (
   <div className={`fixed inset-0 z-[2000] bg-[#F2F2F7] flex flex-col transition-opacity duration-500 ${isExiting ? 'opacity-0' : 'opacity-100'}`}>

     {/* Background Visual Layer */}
     <div className="absolute inset-0 z-0 overflow-hidden">
      {SLIDES.map((slide, index) => (
        <div
         key={index}
         className={`absolute inset-0 transition-all duration-700 ease-in-out transform ${index === currentSlide ? 'opacity-100 translate-y-0 scale-100' :
           index < currentSlide ? 'opacity-0 -translate-y-8 scale-95' :
            'opacity-0 translate-y-8 scale-105'
           }`}
        >
         <slide.component />
        </div>
      ))}
     </div>

     {/* Top Fade Gradient */}
     <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-[#F2F2F7] via-[#F2F2F7]/80 to-transparent z-10 pointer-events-none"/>

     {/* Bottom Fade Gradient (Expanded for text) */}
     <div className="absolute bottom-0 left-0 right-0 h-[60vh] bg-gradient-to-t from-[#F2F2F7] via-[#F2F2F7] via-70% to-transparent z-10 pointer-events-none"/>

     {/* Top Controls */}
     <div
      className="relative z-20 p-6 flex justify-between items-center"
      style={{ paddingTop: 'calc(env(safe-area-inset-top) + 24px)' }}
     >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-white rounded-[10px] shadow-sm flex items-center justify-center text-blue-600">
         <Aperture size={18} strokeWidth={2.5} />
        </div>
        <span className="text-lg font-semibold text-gray-900">Vemakin</span>
      </div>

      <button
        onClick={handleSkip}
        className="text-[10px] font-semibold text-gray-400 hover:text-gray-900 transition-colors px-4 py-2 bg-white/50 backdrop-blur-sm rounded-full"
      >
        Skip intro
      </button>
     </div>

     {/* Bottom Content Area */}
     <div className="absolute bottom-0 left-0 right-0 z-30 p-8 pb-12 flex flex-col items-center text-center">
      <div className="max-w-md md:max-w-2xl mx-auto flex flex-col items-center">
        <div className="mb-8 flex gap-2">
         {SLIDES.map((slide, idx) => (
           <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`h-1.5 rounded-full transition-all duration-500 ${idx === currentSlide ? `w-8 ${slide.color}` : 'w-1.5 bg-gray-300'}`}
           />
         ))}
        </div>

        <div key={currentSlide} className="animate-in slide-in-from-bottom-4 fade-in duration-500 flex flex-col items-center">
         <h2 className="text-3xl md:text-5xl font-semibold text-gray-900 mb-4 leading-tight">
           {content.title}
         </h2>
         <p className="text-sm md:text-lg font-medium text-gray-500 leading-relaxed max-w-xs md:max-w-lg mx-auto mb-10">
           {content.description}
         </p>
        </div>

        <button
         onClick={handleNext}
         className="w-full max-w-[280px] md:max-w-[320px] py-4 md:py-5 bg-gray-800 text-white rounded-[24px] font-semibold text-xs md:text-sm shadow-xl hover:bg-black hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
        >
         {currentSlide === SLIDES.length - 1 ?"Get started":"Next"}
         {currentSlide === SLIDES.length - 1 ? <Check size={16} strokeWidth={3} /> : <ArrowRight size={16} strokeWidth={3} />}
        </button>
      </div>
     </div>
   </div>
  );
};
