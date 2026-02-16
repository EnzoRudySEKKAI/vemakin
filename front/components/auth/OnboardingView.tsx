import React, { useState } from 'react'
import {
  ArrowRight, Film, Package, Zap, Check, Search,
  TrendingUp, AlertCircle, StickyNote, FileText,
  Camera, Mic, Sun, Scissors, Palette, Layers,
  MapPin, Clock, Calendar, MoreVertical, Flag, Aperture,
  CheckCircle2, ListChecks, DollarSign, LayoutGrid, ChevronDown,
  Monitor, Sliders, Database, ShoppingBag, Radio, ArrowUp, ArrowUpRight
} from 'lucide-react'
import { Button } from '@/components/atoms/Button'
import { Text } from '@/components/atoms/Text'
import { SimpleCard as Card } from '@/components/ui/Card'
import { IconContainer } from '@/components/atoms/IconContainer'
import { Logo } from '@/components/atoms'


interface OnboardingViewProps {
  onComplete: () => void
}

const MockTimeline = () => (
  <div className="w-full h-full bg-[#0F1116] flex flex-col items-center pt-36 md:pt-44 relative overflow-hidden select-none cursor-default pointer-events-none">
    <div className="w-full max-w-md md:max-w-xl px-6 space-y-6 scale-100 md:scale-110 origin-top opacity-100 transition-all duration-500">
      {/* Date Header */}
      <div className="flex items-center gap-4 px-3 py-1 bg-white/5 rounded-xl mb-4">
        <div className="h-px flex-1 bg-white/5"/>
        <div className="flex items-center gap-4 md:gap-8">
          <Text variant="caption" color="muted">Oct 24, 2024</Text>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-white/30">
              <Sun size={14} className="text-orange-400/60" strokeWidth={2.5}/> 06:12
            </div>
          </div>
        </div>
        <div className="h-px flex-1 bg-white/5"/>
      </div>

      {/* Shot Card */}
      <Card className="p-6 md:p-8 flex flex-col items-center text-center border-white/5 bg-[#16181D] shadow-2xl shadow-black/50 rounded-[32px] md:rounded-[48px] overflow-hidden relative">
        <div className="flex flex-col items-center gap-1.5 mb-4 w-full relative z-10">
          <Text variant="h2" className="text-white">
            Opening Scene - Wide
          </Text>
          <div className="flex items-center gap-3 text-sm font-semibold text-white/40">
            <span>08:00 — 10:00</span>
            <div className="flex items-center gap-1.5 text-white/20">
              <Clock size={14} strokeWidth={2.5} />
              <span>2h</span>
            </div>
          </div>
        </div>

        <div className="w-full border-t border-b border-white/5 py-4 mb-4 bg-white/[0.02] rounded-2xl relative z-10">
          <div className="grid grid-cols-2 gap-x-4 max-w-lg mx-auto px-4">
            <div className="flex flex-col items-center gap-1 border-r border-white/5">
              <Text variant="label" color="muted">Location</Text>
              <span className="flex items-center gap-2 text-sm font-semibold text-white/70">
                <MapPin size={12} className="text-white shrink-0" strokeWidth={2.5} />
                Rooftop Central
              </span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Text variant="label" color="muted">Inventory</Text>
              <span className="flex items-center gap-2 text-sm font-semibold text-white/70">
                <Package size={12} className="text-white shrink-0" strokeWidth={2.5} />
                4/4 ready
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 w-full md:max-w-md relative z-10">
          <Button variant="primary" size="sm" leftIcon={<CheckCircle2 size={16} strokeWidth={2.5} />}>
            Completed
          </Button>
          <Button variant="secondary" size="sm" className="bg-white/5 border-white/5 text-white" leftIcon={<ListChecks size={16} strokeWidth={2.5} />}>
            Checklist
          </Button>
        </div>
      </Card>

      {/* Next Shot Preview */}
      <div className="opacity-40 scale-95">
        <div className="px-4 py-3.5 flex items-center justify-between rounded-[20px] bg-[#16181D] border border-white/5 shadow-sm">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <IconContainer icon={Film} size="sm" variant="accent" />
            <div className="flex-1 min-w-0 text-left">
              <Text variant="body" className="text-white">Close-up Elara</Text>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs font-semibold text-white/30 flex items-center gap-1.5">
                  <MapPin size={10} strokeWidth={2.5} /> Rooftop Central
                </span>
                <span className="text-xs font-semibold text-white/90 flex items-center gap-1.5">
                  <Clock size={10} strokeWidth={2.5} /> 10:30
                </span>
              </div>
            </div>
          </div>
          <IconContainer icon={Check} size="sm" variant="default" className="text-white/20" />
        </div>
      </div>
    </div>
  </div>
)

const MockInventory = () => (
  <div className="w-full h-full bg-[#0F1116] flex flex-col items-center pt-36 md:pt-44 relative overflow-hidden select-none cursor-default pointer-events-none">
    <div className="w-full max-w-md md:max-w-4xl lg:max-w-5xl px-6 space-y-6 scale-100 md:scale-110 origin-top opacity-100 transition-all duration-500">
      {/* Search & Filters */}
      <div className="space-y-4">
        <div className="w-full h-12 pl-12 pr-4 flex items-center bg-[#16181D] border border-white/5 rounded-2xl shadow-sm relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" size={16} strokeWidth={2.5} />
          <Text variant="caption" color="muted">Search gear...</Text>
        </div>

        <div className="flex items-center gap-1.5">
          <Button variant="primary" size="sm" leftIcon={<LayoutGrid size={14} strokeWidth={2.5} />}>
            All
          </Button>
          <Button variant="secondary" size="sm" className="bg-white/5 border-white/5 text-white" leftIcon={<Camera size={14} strokeWidth={2.5} />}>
            Camera
          </Button>
          <Button variant="secondary" size="sm" className="bg-white/5 border-white/5 text-white" leftIcon={<Sun size={14} strokeWidth={2.5} />}>
            Light
          </Button>
        </div>
      </div>

      {/* Inventory Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {/* Card 1 */}
        <Card className="p-5 flex flex-col h-full bg-[#16181D] border-white/5 shadow-sm">
          <div className="flex justify-between items-start mb-5">
            <div className="flex items-center gap-4 min-w-0 flex-1">
              <IconContainer icon={Camera} size="lg" variant="accent" />
              <div className="min-w-0">
                <Text variant="h3" className="text-white truncate">A-CAM</Text>
                <Text variant="caption" color="muted" className="mt-1.5 truncate">RED V-RAPTOR</Text>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-md text-[10px] font-bold border border-primary/20 bg-primary/10 text-primary uppercase">Owned</span>
          </div>
          <div className="mb-4 min-w-0 flex-1">
            <span className="inline-block px-2.5 py-1 rounded-md bg-white/5 text-xs font-bold text-white/40 uppercase">Camera</span>
          </div>
          <div className="mt-auto grid grid-cols-2 gap-3 bg-white/[0.02] p-4 rounded-2xl border border-white/5">
            <div className="flex flex-col"><span className="text-white/20 text-[9px] font-bold uppercase leading-none mb-1.5">Sensor</span><span className="text-white text-sm font-semibold">8K VV</span></div>
            <div className="flex flex-col"><span className="text-white/20 text-[9px] font-bold uppercase leading-none mb-1.5">Mount</span><span className="text-white text-sm font-semibold">PL</span></div>
          </div>
        </Card>

        {/* Card 2 */}
        <Card className="p-5 flex flex-col h-full bg-[#16181D] border-white/5 shadow-sm">
          <div className="flex justify-between items-start mb-5">
            <div className="flex items-center gap-4 min-w-0 flex-1">
              <IconContainer icon={Sun} size="lg" variant="accent" />
              <div className="min-w-0">
                <Text variant="h3" className="text-white truncate">M18 HMI</Text>
                <Text variant="caption" color="muted" className="mt-1.5 truncate">ARRI</Text>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-md text-[10px] font-bold border border-orange-500/20 bg-orange-500/10 text-orange-400 uppercase">Rented</span>
          </div>
          <div className="mb-4 min-w-0 flex-1">
            <span className="inline-block px-2.5 py-1 rounded-md bg-white/5 text-xs font-bold text-white/40 uppercase">Light</span>
          </div>
          <div className="mt-auto grid grid-cols-2 gap-3 bg-white/[0.02] p-4 rounded-2xl border border-white/5">
            <div className="flex flex-col"><span className="text-white/20 text-[9px] font-bold uppercase leading-none mb-1.5">Output</span><span className="text-white text-sm font-semibold">1800W</span></div>
            <div className="flex flex-col"><span className="text-white/20 text-[9px] font-bold uppercase leading-none mb-1.5">Temp</span><span className="text-white text-sm font-semibold">5600K</span></div>
          </div>
        </Card>

        {/* Card 3 */}
        <Card className="p-5 flex flex-col h-full bg-[#16181D] border-white/5 shadow-sm">
          <div className="flex justify-between items-start mb-5">
            <div className="flex items-center gap-4 min-w-0 flex-1">
              <IconContainer icon={Monitor} size="lg" variant="accent" />
              <div className="min-w-0">
                <Text variant="h3" className="text-white truncate">CINE 13</Text>
                <Text variant="caption" color="muted" className="mt-1.5 truncate">SmallHD</Text>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-md text-[10px] font-bold border border-primary/20 bg-primary/10 text-primary uppercase">Owned</span>
          </div>
          <div className="mb-4 min-w-0 flex-1">
            <span className="inline-block px-2.5 py-1 rounded-md bg-white/5 text-xs font-bold text-white/40 uppercase">Monitoring</span>
          </div>
          <div className="mt-auto grid grid-cols-2 gap-3 bg-white/[0.02] p-4 rounded-2xl border border-white/5">
            <div className="flex flex-col"><span className="text-white/20 text-[9px] font-bold uppercase leading-none mb-1.5">Screen</span><span className="text-white text-sm font-semibold">13"4K</span></div>
            <div className="flex flex-col"><span className="text-white/20 text-[9px] font-bold uppercase leading-none mb-1.5">Nits</span><span className="text-white text-sm font-semibold">1500</span></div>
          </div>
        </Card>
      </div>
    </div>
  </div>
)

const MockPipeline = () => (
  <div className="w-full h-full bg-[#0F1116] flex flex-col items-center pt-36 md:pt-44 relative overflow-hidden select-none cursor-default pointer-events-none">
    <div className="w-full max-w-md md:max-w-3xl lg:max-w-4xl px-6 space-y-6 scale-100 md:scale-110 origin-top opacity-100 transition-all duration-500">
      {/* Header Stats */}
      <div className="flex items-center justify-between px-2">
        <Text variant="label" color="muted">Production Activity</Text>
        <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 shadow-sm text-[10px] font-bold text-white/40 uppercase tracking-wider">
          5 left <span className="text-white/10">/</span> 12 total
        </span>
      </div>

      {/* Task Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Task 1 */}
        <Card className="p-6 flex flex-col justify-between bg-[#16181D] border-white/5 rounded-[24px] shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-primary/20 bg-primary/10">
                  <Scissors size={12} strokeWidth={2.5} className="text-primary"/>
                  <Text variant="label" color="accent" className="text-[10px] font-bold uppercase tracking-tight">Editing Task</Text>
                </div>
                <div className="px-2.5 py-1.5 rounded-xl border text-[10px] font-bold uppercase bg-orange-500/10 border-orange-500/20 text-orange-400">
                  High
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-white/20">
                <Calendar size={12} strokeWidth={2.5} />
                <Text variant="label" color="muted">Oct 30</Text>
              </div>
            </div>
            <div className="mb-6">
              <Text variant="h3" className="text-white mb-2">
                Rough Cut Assembly
              </Text>
              <Text variant="caption" className="text-white/40">
                First pass of the chase sequence including placeholder VFX.
              </Text>
            </div>
          </div>
          <div className="w-full py-3 px-4 rounded-xl flex items-center justify-between text-xs font-bold bg-white/5 text-white/60">
            <div className="flex items-center gap-2">
              <TrendingUp size={14} strokeWidth={2.5} />
              <span>Progress</span>
            </div>
            <ChevronDown size={14} />
          </div>
        </Card>

        {/* Task 2 */}
        <Card className="p-6 flex flex-col justify-between bg-[#16181D] border-white/5 rounded-[24px] shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-primary/20 bg-primary/10">
                  <Palette size={12} strokeWidth={2.5} className="text-primary"/>
                  <Text variant="label" color="accent" className="text-[10px] font-bold uppercase tracking-tight">Color Task</Text>
                </div>
                <div className="px-2.5 py-1.5 rounded-xl border text-[10px] font-bold uppercase bg-white/5 border-white/5 text-white/40">
                  Medium
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-white/20">
                <Calendar size={12} strokeWidth={2.5} />
                <Text variant="label" color="muted">Nov 02</Text>
              </div>
            </div>
            <div className="mb-6">
              <Text variant="h3" className="text-white mb-2">
                Neon Look Dev
              </Text>
              <Text variant="caption" className="text-white/40">
                Finalize the LUT for the night exterior scenes.
              </Text>
            </div>
          </div>
          <div className="w-full py-3 px-4 rounded-xl flex items-center justify-between text-xs font-bold bg-white/5 text-white/60">
            <div className="flex items-center gap-2">
              <AlertCircle size={14} strokeWidth={2.5} />
              <span>Todo</span>
            </div>
            <ChevronDown size={14} />
          </div>
        </Card>
      </div>
    </div>
  </div>
)

const MockNotes = () => (
  <div className="w-full h-full bg-[#0F1116] flex flex-col items-center pt-36 md:pt-44 relative overflow-hidden select-none cursor-default pointer-events-none">
    <div className="w-full max-w-md md:max-w-4xl lg:max-w-5xl px-6 space-y-6 scale-100 md:scale-110 origin-top opacity-100 transition-all duration-500">
      {/* Search Bar */}
      <div className="flex gap-3 mb-2">
        <div className="flex-1 h-12 pl-12 pr-4 flex items-center bg-[#16181D] border border-white/5 rounded-2xl shadow-sm relative">
          <Search size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" strokeWidth={2.5} />
          <Text variant="caption" color="muted">Search notes...</Text>
        </div>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-primary text-white shadow-lg shadow-primary/20">
          <ArrowUp size={18} strokeWidth={2.5} />
        </div>
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Note 1 */}
        <Card className="p-0 flex flex-col bg-[#16181D] border-white/5 overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <IconContainer icon={Film} size="sm" variant="accent" />
              <Text variant="label" color="accent" className="text-[10px] font-bold uppercase tracking-tight">Sequence 12A</Text>
            </div>
            <span className="text-[10px] font-bold text-white/20 flex items-center gap-2 uppercase">
              <Calendar size={12} strokeWidth={2.5} /> Oct 24
            </span>
          </div>
          <div className="p-7 flex-1 flex flex-col">
            <Text variant="h3" className="text-white mb-4">Lighting Change</Text>
            <Text variant="caption" className="text-white/40 mb-6">
              Director wants more contrast on the close-up shot. We need to swap the diffusion for the next take.
            </Text>
            <div className="mt-auto pt-5 border-t border-white/5">
              <div className="w-full py-3.5 rounded-xl bg-white/5 text-white/40 flex items-center justify-between px-5 text-xs font-bold uppercase tracking-wider">
                <div className="flex items-center gap-2.5">
                  <Film size={14} strokeWidth={2.5} className="text-white/20"/>
                  <span>View Scene 12A</span>
                </div>
                <ArrowRight size={14} />
              </div>
            </div>
          </div>
        </Card>

        {/* Note 2 */}
        <Card className="p-0 flex flex-col bg-[#16181D] border-white/5 overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <IconContainer icon={StickyNote} size="sm" variant="accent" />
              <Text variant="label" color="accent" className="text-[10px] font-bold uppercase tracking-tight">General Note</Text>
            </div>
            <span className="text-[10px] font-bold text-white/20 flex items-center gap-2 uppercase">
              <Calendar size={12} strokeWidth={2.5} /> Oct 22
            </span>
          </div>
          <div className="p-7 flex-1 flex flex-col">
            <Text variant="h3" className="text-white mb-4">Catering</Text>
            <Text variant="caption" className="text-white/40 mb-6">
              Confirm vegan options for Friday's night shoot. The runner needs the final count by Thursday morning.
            </Text>
            <div className="mt-auto pt-5 border-t border-white/5">
              <div className="flex justify-end">
                <span className="text-[10px] font-bold text-white/20 flex items-center gap-1 uppercase tracking-widest">View Details <ArrowUpRight size={12} /></span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  </div>
)

const SLIDES = [
  {
    component: MockInventory,
    title: "Master Your Gear",
    description: "Track every lens, camera, and light. Assign equipment to specific shots and ensure your kit is ready.",
    color: "bg-primary",
    shadow: "shadow-indigo-900/20"
  },
  {
    component: MockTimeline,
    title: "Orchestrate Your Vision",
    description: "Plan shots, manage schedules, and visualize your timeline with an intuitive cinematic interface.",
    color: "bg-primary",
    shadow: "shadow-blue-900/20"
  },
  {
    component: MockPipeline,
    title: "Track Post-production",
    description: "Manage milestones for editing, VFX, and color grading to ensure timely delivery.",
    color: "bg-orange-500",
    shadow: "shadow-orange-900/20"
  },
  {
    component: MockNotes,
    title: "Capture Every Detail",
    description: "Keep creative ideas, script changes, and feedback organized in one centralized hub.",
    color: "bg-purple-600",
    shadow: "shadow-purple-900/20"
  }
]

export const OnboardingView: React.FC<OnboardingViewProps> = ({ onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isExiting, setIsExiting] = useState(false)

  const handleNext = () => {
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide(curr => curr + 1)
    } else {
      setIsExiting(true)
      setTimeout(onComplete, 300)
    }
  }

  const handleSkip = () => {
    setIsExiting(true)
    setTimeout(onComplete, 300)
  }

  const content = SLIDES[currentSlide]

  return (
    <div className={`fixed inset-0 z-[2000] bg-[#0F1116] flex flex-col transition-opacity duration-500 ${isExiting ? 'opacity-0' : 'opacity-100'}`}>
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
      <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-[#0F1116] via-[#0F1116]/80 to-transparent z-10 pointer-events-none"/>

      {/* Bottom Fade Gradient (Expanded for text) */}
      <div className="absolute bottom-0 left-0 right-0 h-[60vh] bg-gradient-to-t from-[#0F1116] via-[#0F1116] via-70% to-transparent z-10 pointer-events-none"/>

      {/* Top Controls */}
      <div
        className="relative z-20 p-6 flex justify-between items-center"
        style={{ paddingTop: 'calc(env(safe-area-inset-top) + 24px)' }}
      >
        <div className="flex items-center gap-3">
          <Logo size="sm" />
        </div>


        <Button variant="ghost" size="sm" className="text-white/40 hover:text-white" onClick={handleSkip}>
          Skip Intro
        </Button>
      </div>

      {/* Bottom Content Area */}
      <div className="absolute bottom-0 left-0 right-0 z-30 p-8 pb-12 flex flex-col items-center text-center">
        <div className="max-w-md md:max-w-2xl mx-auto flex flex-col items-center">
          <div className="mb-8 flex gap-2">
            {SLIDES.map((slide, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-1 rounded-full transition-all duration-500 ${idx === currentSlide ? `w-12 ${slide.color}` : 'w-2 bg-white/10'}`}
              />
            ))}
          </div>

          <div key={currentSlide} className="animate-in slide-in-from-bottom-4 fade-in duration-500 flex flex-col items-center">
            <Text variant="hero" className="text-white mb-4">
              {content.title}
            </Text>
            <Text variant="body" color="muted" className="max-w-xs md:max-w-lg mx-auto mb-10 text-white/40">
              {content.description}
            </Text>
          </div>

          <Button
            variant="primary"
            size="lg"
            onClick={handleNext}
            rightIcon={currentSlide === SLIDES.length - 1 ? <Check size={16} strokeWidth={2.5} /> : <ArrowRight size={16} strokeWidth={2.5} />}
            className="h-14 px-10 text-base"
          >
            {currentSlide === SLIDES.length - 1 ? "Get Started" : "Next"}
          </Button>
        </div>
      </div>
    </div>
  )
}
