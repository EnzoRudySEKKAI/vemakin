import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import { 
  ArrowRight, Check, Film, Package, Zap, StickyNote, 
  Menu, X, Play, Clock, MapPin,
  ChevronDown, Sun, Moon, Sparkles, Camera, Clapperboard,
  FilmIcon, Terminal, Cpu, Grid3X3, Command,
  ChevronLeft, ChevronRight, Layers, CheckCircle2, AlertCircle,
  Battery, Database, HardDrive, Wifi, Smartphone
} from 'lucide-react'

import { Logo } from '@/components/atoms'
import { WindowCard } from '@/components/ui/WindowCard'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/button'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

const throttle = <T extends (...args: any[]) => any>(func: T, limit: number) => {
  let inThrottle: boolean
  return function(this: ThisParameterType<T>, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

const TerminalButton = ({ 
  children, 
  onClick, 
  variant = 'primary',
  className = '' 
}: { 
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary'
  className?: string
}) => (
  <button
    onClick={onClick}
    className={`
      group relative p-2 font-mono text-sm tracking-wider 
      border transition-all duration-300
      ${variant === 'primary' 
        ? 'border-primary text-primary hover:bg-primary hover:text-primary-foreground' 
        : 'border-white/20 text-white/70 hover:border-white/40 hover:text-white'
      }
      ${className}
    `}
  >
    <span className="flex items-center gap-3">
      {children}
      
    </span>
  </button>
)

const MockShotCard = ({ title, scene, time, location, status = 'pending', active = false }: any) => (
  <div className={`p-2 md:p-3 border transition-all ${active ? 'border-primary bg-primary/5' : 'border-white/10 bg-[#0a0a0a]/40'} backdrop-blur-sm`}>
    <div className="flex flex-col gap-1 md:gap-2">
      <div className="flex items-center gap-1.5 md:gap-2">
        <span className="px-1.5 md:px-2 py-0.5 border border-white/20 text-white/80 text-[9px] md:text-[10px] font-mono">
          {scene}
        </span>
        <span className="px-1.5 md:px-2 py-0.5 border border-white/10 text-white/50 text-[9px] md:text-[10px] font-mono flex items-center gap-1">
          <Clock size={8} /> {time}
        </span>
      </div>

      <div className="my-0.5 md:my-1">
        <h3 className="text-xs md:text-sm font-medium text-white leading-tight truncate">{title}</h3>
        <div className="flex items-center gap-1 text-white/40 text-[10px] md:text-xs mt-0.5 font-mono">
          <MapPin size={9} />
          <span className="truncate">{location}</span>
        </div>
      </div>

      <div className="flex items-center justify-between mt-1 md:mt-2">
        <div className="flex items-center gap-1.5 md:gap-2">
          <div className="px-1.5 md:px-2 py-0.5 border border-white/10 text-white/50 text-[8px] md:text-[9px] font-mono">
            Gear
          </div>
          <div className="flex items-center gap-1 text-primary text-[9px] md:text-[10px] font-mono">
            <Package size={10} /> <span className="hidden md:inline">Gear:</span>4/4
          </div>
        </div>
        <div className={`w-5 h-5 md:w-6 md:h-6 flex items-center justify-center border ${status === 'done' ? 'bg-primary border-primary text-black' : 'border-white/20 text-white/40'}`}>
          <Check size={10} strokeWidth={3} />
        </div>
      </div>
    </div>
  </div>
)

const MockTimelineHeader = () => (
  <div className="px-3 py-2 flex items-center justify-between bg-[#0a0a0a]/60 border-b border-white/10">
    <div className="flex items-center gap-2">
      <span className="text-[10px] font-mono text-white/60">Mon Oct 24</span>
    </div>
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1 text-[9px] font-mono text-orange-400">
        <Sun size={9} /> 06:12
      </div>
      <div className="flex items-center gap-1 text-[9px] font-mono text-primary">
        <Moon size={9} /> 18:45
      </div>
    </div>
  </div>
)

const TimelinePreview = () => (
  <div className="relative border border-white/10 bg-[#0a0a0a]/60 backdrop-blur-sm rounded-lg overflow-hidden">
    <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 bg-white/5">
      <div className="flex items-center gap-2">
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-full bg-red-500/80" />
          <div className="w-2 h-2 rounded-full bg-yellow-500/80" />
          <div className="w-2 h-2 rounded-full bg-green-500/80" />
        </div>
        <span className="ml-2 text-[9px] font-mono text-white/40">production timeline</span>
      </div>
    </div>
    
    <div className="p-2 space-y-2">
      <MockTimelineHeader />
      <div className="space-y-2">
        <MockShotCard active title="Opening Scene" scene="12A" time="08:00" location="Grand Central" />
        
        <div className="flex items-center justify-center gap-2 py-0.5">
          <div className="h-px flex-1 bg-white/5" />
          <span className="text-[8px] font-mono text-white/30">15m</span>
          <div className="h-px flex-1 bg-white/5" />
        </div>

        <MockShotCard title="Dialogue Seq." scene="12B" time="10:30" location="Studio B" />
      </div>
    </div>
    <div className="px-3 py-1.5 border-t border-white/10 bg-white/5 flex items-center justify-between">
      <span className="text-[8px] font-mono text-white/30">2 shots</span>
    </div>
  </div>
)

const InventoryPreview = () => (
  <div className="relative border border-white/10 bg-[#0a0a0a]/60 backdrop-blur-sm rounded-lg overflow-hidden">
    <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 bg-white/5">
      <div className="flex items-center gap-2">
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-full bg-red-500/80" />
          <div className="w-2 h-2 rounded-full bg-yellow-500/80" />
          <div className="w-2 h-2 rounded-full bg-green-500/80" />
        </div>
        <span className="ml-2 text-[9px] font-mono text-white/40">equipment</span>
      </div>
    </div>
    
    <div className="p-2 space-y-1.5">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[9px] font-mono text-primary/60">CAMERAS</span>
        <div className="h-px flex-1 bg-white/10" />
        <span className="text-[8px] font-mono text-white/30">4</span>
      </div>
      
      <div className="space-y-1.5">
        <div className="p-2 border border-white/10 bg-[#0a0a0a]/40">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <Camera size={12} className="text-primary" />
              <span className="text-[10px] font-medium text-white">Sony FX6</span>
            </div>
            <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 text-[8px] font-mono">OWNED</span>
          </div>
          <div className="flex items-center gap-2 text-[8px] font-mono text-white/40">
            <span className="flex items-center gap-1"><Database size={9} /> S35</span>
            <span className="flex items-center gap-1"><HardDrive size={9} /> E</span>
          </div>
        </div>

        <div className="p-2 border border-white/10 bg-[#0a0a0a]/40">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <Camera size={12} className="text-white/60" />
              <span className="text-[10px] font-medium text-white">RED 6K</span>
            </div>
            <span className="px-1.5 py-0.5 bg-orange-500/20 text-orange-400 text-[8px] font-mono">RENT</span>
          </div>
          <div className="flex items-center gap-2 text-[8px] font-mono text-white/40">
            <span className="flex items-center gap-1"><Database size={9} /> FF</span>
            <span className="flex items-center gap-1"><HardDrive size={9} /> RF</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-3 mb-2">
        <span className="text-[9px] font-mono text-primary/60">AUDIO</span>
        <div className="h-px flex-1 bg-white/10" />
      </div>

      <div className="p-2 border border-white/10 bg-[#0a0a0a]/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Battery size={12} className="text-primary" />
            <span className="text-[10px] font-medium text-white">Sennheiser</span>
          </div>
          <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 text-[8px] font-mono">OK</span>
        </div>
      </div>
    </div>
    <div className="px-3 py-1.5 border-t border-white/10 bg-white/5 flex items-center justify-between">
      <span className="text-[8px] font-mono text-white/30">$2,450</span>
      <span className="text-[8px] font-mono text-primary">7 items</span>
    </div>
  </div>
)

const PipelinePreview = () => (
  <div className="relative border border-white/10 bg-[#0a0a0a]/60 backdrop-blur-sm rounded-lg overflow-hidden">
    <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 bg-white/5">
      <div className="flex items-center gap-2">
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-full bg-red-500/80" />
          <div className="w-2 h-2 rounded-full bg-yellow-500/80" />
          <div className="w-2 h-2 rounded-full bg-green-500/80" />
        </div>
        <span className="ml-2 text-[9px] font-mono text-white/40">pipeline</span>
      </div>
    </div>
    
    <div className="p-2 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-mono text-primary/60">VFX</span>
        <span className="text-[8px] font-mono text-white/30">2/5</span>
      </div>
      
      <div className="space-y-1.5">
        <div className="p-2 border border-white/10 bg-[#0a0a0a]/40 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 size={10} className="text-emerald-500" />
            <span className="text-[9px] text-white">Sc 12A Sky</span>
          </div>
          <span className="text-[7px] font-mono text-emerald-500/60">DONE</span>
        </div>
        <div className="p-2 border border-white/10 bg-[#0a0a0a]/40 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 size={10} className="text-emerald-500" />
            <span className="text-[9px] text-white">Sc 14 Wire</span>
          </div>
          <span className="text-[7px] font-mono text-emerald-500/60">DONE</span>
        </div>
        <div className="p-2 border border-primary/30 bg-primary/5 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <AlertCircle size={10} className="text-primary animate-pulse" />
            <span className="text-[9px] text-white">Sc 18 Matte</span>
          </div>
          <span className="text-[7px] font-mono text-primary">ACTIVE</span>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-2">
        <span className="text-[9px] font-mono text-primary/60">COLOR</span>
        <div className="h-px flex-1 bg-white/10" />
      </div>

      <div className="space-y-1.5">
        <div className="p-2 border border-white/10 bg-[#0a0a0a]/40 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Layers size={10} className="text-orange-500" />
            <span className="text-[9px] text-white">Sc 12A-D</span>
          </div>
          <span className="text-[7px] font-mono text-orange-500/60">REVIEW</span>
        </div>
      </div>
    </div>
    <div className="px-3 py-1.5 border-t border-white/10 bg-white/5 flex items-center justify-between">
      <span className="text-[8px] font-mono text-white/30">8 remaining</span>
      <span className="text-[8px] font-mono text-primary">3 members</span>
    </div>
  </div>
)

const NotesPreview = () => (
  <div className="relative border border-white/10 bg-[#0a0a0a]/60 backdrop-blur-sm rounded-lg overflow-hidden">
    <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 bg-white/5">
      <div className="flex items-center gap-2">
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-full bg-red-500/80" />
          <div className="w-2 h-2 rounded-full bg-yellow-500/80" />
          <div className="w-2 h-2 rounded-full bg-green-500/80" />
        </div>
        <span className="ml-2 text-[9px] font-mono text-white/40">notes</span>
      </div>
    </div>
    
    <div className="p-2 space-y-1.5">
      <div className="p-2 border border-white/10 bg-[#0a0a0a]/40">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="px-1.5 py-0.5 bg-primary/20 text-primary text-[8px] font-mono">12A</span>
          <span className="text-[8px] font-mono text-white/30">2 notes</span>
        </div>
        <p className="text-[9px] text-white/70 leading-relaxed mb-1.5">
          Wide shot at golden hour. Contact grip for approval.
        </p>
        <div className="flex items-center gap-1">
          <span className="px-1 py-0.5 border border-white/10 text-white/40 text-[7px] font-mono">@cinema</span>
        </div>
      </div>

      <div className="p-2 border border-white/10 bg-[#0a0a0a]/40">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="px-1.5 py-0.5 bg-orange-500/20 text-orange-400 text-[8px] font-mono">12B</span>
          <span className="text-[8px] font-mono text-white/30">1 note</span>
        </div>
        <p className="text-[9px] text-white/70 leading-relaxed mb-1.5">
          Tighten edit - cut 2 sec from middle.
        </p>
        <div className="flex items-center gap-1">
          <span className="px-1 py-0.5 border border-white/10 text-white/40 text-[7px] font-mono">@edit</span>
        </div>
      </div>

      <div className="p-2 border border-white/10 bg-[#0a0a0a]/40">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 text-[8px] font-mono">14</span>
        </div>
        <p className="text-[9px] text-white/70 leading-relaxed">
          Wardrobe confirmed - blue jacket.
        </p>
      </div>
    </div>
    <div className="px-3 py-1.5 border-t border-white/10 bg-white/5 flex items-center justify-between">
      <span className="text-[8px] font-mono text-white/30">6 notes</span>
      <span className="text-[8px] font-mono text-primary">3 scenes</span>
    </div>
  </div>
)

const Navbar = ({ scrolled, onNavigate }: { scrolled: boolean, onNavigate: (path: string) => void }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const navigate = useNavigate()

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
      setIsMobileMenuOpen(false)
    }
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 border-b ${
        scrolled ? 'bg-[#0a0a0a]/90 border-white/10 py-3 backdrop-blur-xl' : 'bg-transparent border-transparent py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Logo variant="default" size="md" />
        </div>
        
        <div className="hidden md:flex items-center gap-8">
          {['Features', 'How it Works', 'FAQ'].map((item) => (
            <button 
              key={item}
              onClick={() => scrollToSection(item.toLowerCase().replace(/\s+/g, '-'))}
              className="text-lg font-mono text-white/40 hover:text-white transition-colors tracking-widest "
            >
              {item}
            </button>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-4">
          <button 
            onClick={() => navigate('/auth')} 
            className="text-xs font-mono text-white/50 hover:text-white transition-colors  tracking-widest"
          >
            Sign In
          </button>
          <TerminalButton onClick={() => navigate('/auth')}>
            Register
          </TerminalButton>
        </div>

        <button 
          className="md:hidden p-2 text-white/60 hover:text-white" 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -20 }} 
            className="md:hidden absolute top-full left-0 right-0 bg-[#0a0a0a] border-b border-white/10 p-6"
          >
            <div className="flex flex-col gap-4">
              {['Features', 'How it Works', 'FAQ'].map((item) => (
                <button 
                  key={item} 
                  onClick={() => scrollToSection(item.toLowerCase().replace(/\s+/g, '-'))} 
                  className="text-sm font-mono text-white/60 text-left  tracking-widest hover:text-white"
                >
                  {item}
                </button>
              ))}
              <div className="h-px bg-white/10 my-2" />
              <TerminalButton onClick={() => navigate('/auth')} className="w-full">
                Login
              </TerminalButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

const HeroSection = ({ onNavigate }: { onNavigate: (path: string) => void }) => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) element.scrollIntoView({ behavior: 'smooth' })
  }

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true },
    [Autoplay({ delay: 5000, stopOnInteraction: false, stopOnMouseEnter: true })]
  )
  const [selectedIndex, setSelectedIndex] = useState(0)

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])
  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap())
    emblaApi.on('select', onSelect)
    return () => { emblaApi.off('select', onSelect) }
  }, [emblaApi])

  const examples = [
    { id: 'timeline', title: 'Production Timeline', component: TimelinePreview },
    { id: 'inventory', title: 'Equipment Inventory', component: InventoryPreview },
    { id: 'pipeline', title: 'Pipeline Tasks', component: PipelinePreview },
    { id: 'notes', title: 'Scene Notes', component: NotesPreview }
  ]

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-24">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0a0a0a]/80" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 w-full">
        <div className="grid lg:grid-cols-2 gap-6 items-center min-w-0">
          <motion.div 
            initial={{ opacity: 0, x: -30 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} 
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-4 leading-[1.1] break-words">
              Vemakin
              <br />
              <span className="font-mono text-primary">Filmmaker operating system</span>
            </h1>
            
            <div className="flex flex-row items-start gap-4">
              <TerminalButton onClick={() => onNavigate('/auth')}>
                Start
              </TerminalButton>
              
              <TerminalButton 
                variant="secondary" 
                onClick={() => scrollToSection('how-it-works')}
              >
                Documentation
              </TerminalButton>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4 sm:gap-6 text-white/30 text-[10px] font-mono  tracking-wider">
              <span className="flex items-center gap-2">
                <span className="w-1 h-1 bg-emerald-500 rounded-full" /> 
                Free version available
              </span>
              <span className="flex items-center gap-2">
                <span className="w-1 h-1 bg-emerald-500 rounded-full" /> 
                Accessible everywhere
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-full min-w-0 overflow-hidden"
          >
            <div className="relative w-full max-w-full min-w-0">
              <div className="relative">
                <div className="overflow-hidden" ref={emblaRef}>
                  <div className="flex">
                    {examples.map((example) => (
                      <div key={example.id} className="flex-[0_0_100%] min-w-0">
                        <example.component />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="hidden md:block absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-[#0a0a0a] to-transparent pointer-events-none" />
                <div className="hidden md:block absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-[#0a0a0a] to-transparent pointer-events-none" />
              </div>

              <div className="flex items-center justify-center gap-2 md:gap-4 mt-3 md:mt-4">
                <button 
                  onClick={scrollPrev}
                  className="w-7 h-7 md:w-8 md:h-8 border border-white/20 bg-[#0a0a0a]/80 backdrop-blur-sm flex items-center justify-center text-white/60 hover:text-white hover:border-primary transition-all"
                >
                  <ChevronLeft size={14} />
                </button>
                
                <div className="flex gap-1.5 md:gap-2">
                  {examples.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => scrollTo(index)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        index === selectedIndex 
                          ? 'bg-primary w-6 md:w-8' 
                          : 'bg-white/20 w-3 md:w-4 hover:bg-white/40'
                      }`}
                    />
                  ))}
                </div>

                <button 
                  onClick={scrollNext}
                  className="w-7 h-7 md:w-8 md:h-8 border border-white/20 bg-[#0a0a0a]/80 backdrop-blur-sm flex items-center justify-center text-white/60 hover:text-white hover:border-primary transition-all"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
            
            <div className="absolute -inset-1 bg-primary/10 blur-3xl -z-10 opacity-50" />
          </motion.div>
        </div>
      </div>
    </section>
  )
}

const Benefits = () => {
  const benefits = [
    {
      icon: Film,
      title: 'Automated Timeline',
      description: 'Scheduling that understands filming logic. Calculate travel times between locations and monitor sunrise/sunset windows.'
    },
    {
      icon: Package,
      title: 'Technical Inventory',
      description: 'Track equipment specs from sensor sizes to mount types. Manage owned vs rented gear with real-time price tracking.'
    },
    {
      icon: Zap,
      title: 'Multi-Stage Pipeline',
      description: 'Track post-production tasks for VFX, Color, and Sound. Set priorities and manage review cycles in one dashboard.'
    },
    {
      icon: StickyNote,
      title: 'Contextual Notes',
      description: 'Link creative notes and continuity logs directly to specific shots or post-production tasks for better visibility.'
    }
  ]

  return (
    <section id="features" className="py-2 md:py-2 px-4 sm:px-6 relative">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex items-center gap-4 mb-12">
          <Cpu size={20} className="text-primary" />
          <h2 className="text-2xl font-bold text-white">Core Modules</h2>
          <div className="flex-1 h-px bg-white/10" />
          <span className="font-mono text-xs text-white/30  tracking-widest">V.2.0</span>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {benefits.map((benefit, i) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <div className="p-6 h-full border border-white/10 bg-black/40 hover:border-primary/50 hover:bg-primary/5 transition-all group">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 border border-white/20 flex items-center justify-center shrink-0 group-hover:border-primary group-hover:bg-primary/10 transition-all">
                    <benefit.icon size={20} className="text-primary" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold text-white">{benefit.title}</h3>
                      <span className="font-mono text-[10px] text-primary/60">0{i + 1}</span>
                    </div>
                    <p className="text-sm text-white/40 leading-relaxed">{benefit.description}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

const HowItWorks = () => {
  const steps = [
    {
      number: '01',
      title: 'Initialize Production',
      description: 'Create your project, add locations, and build your shot list with automatic travel time calculations.'
    },
    {
      number: '02',
      title: 'Configure Assets',
      description: 'Catalog your equipment with technical specs, track rentals, and link gear to specific shots.'
    },
    {
      number: '03',
      title: 'Monitor Pipeline',
      description: 'Track VFX, Color, and Sound tasks through your pipeline with priority-based organization.'
    },
    {
      number: '04',
      title: 'Execute Delivery',
      description: 'Export deliverables, share notes with your team, and deliver on time, every time.'
    }
  ]

  return (
    <section id="how-it-works" className="py-24 md:py-32 px-4 sm:px-6 relative bg-[#0a0a0a]/50">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-12">
          <Command size={20} className="text-primary" />
          <h2 className="text-2xl font-bold text-white">Execution Protocol</h2>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="relative"
            >
              <div className="h-full border border-white/10 bg-black/40 p-6 hover:border-primary/50 transition-all group">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-xs text-primary/60">STEP_{step.number}</span>
                  <div className="w-6 h-6 border border-white/20 flex items-center justify-center group-hover:border-primary group-hover:bg-primary/10 transition-all">
                    <span className="font-mono text-[10px] text-white/60 group-hover:text-primary">{String(i + 1).padStart(2, '0')}</span>
                  </div>
                </div>
                <h3 className="text-sm font-semibold text-white mb-3">{step.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{step.description}</p>
              </div>
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-2 w-4 h-px bg-white/20" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

const FAQ = () => {
  const faqs = [
    {
      question: "When will Vemakin be available?",
      answer: "We're currently in private beta. Join the waitlist to get early access and be among the first to try Vemakin when we launch."
    },
    {
      question: "Will Vemakin be free to use?",
      answer: "Yes! We're committed to keeping Vemakin free for independent filmmakers. We'll also offer premium features for larger production teams in the future."
    },
    {
      question: "Can I use Vemakin offline on set?",
      answer: "Absolutely. Vemakin is designed to work in the field. Your data syncs automatically when you're back online, so you never lose progress."
    },
    {
      question: "What types of productions is Vemakin suited for?",
      answer: "Vemakin works for everything from short films and commercials to feature-length productions and TV series. Our flexible pipeline adapts to your workflow."
    },
    {
      question: "How does the gear inventory work?",
      answer: "You can catalog all your equipment with detailed technical specs, track rental periods, set maintenance reminders, and link specific gear to shots in your timeline."
    }
  ]

  return (
    <section id="faq" className="py-24 md:py-32 px-4 sm:px-6 relative">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-12">
          <Terminal size={20} className="text-primary" />
          <h2 className="text-2xl font-bold text-white">System Documentation</h2>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <Accordion type="single" collapsible className="space-y-2">
          {faqs.map((faq, i) => (
            <div key={i} className="border border-white/10 bg-black/40">
              <AccordionItem value={`item-${i}`} className="border-0">
                <AccordionTrigger className="text-sm font-medium text-white hover:no-underline px-5 py-4 hover:bg-white/5 transition-colors [&[data-state=open]]:bg-white/5 [&[data-state=open]]:border-b [&[data-state=open]]:border-white/10">
                  <span className="font-mono text-xs text-primary/60 mr-3">[{String(i + 1).padStart(2, '0')}]</span>
                  <span className="text-left">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="text-sm text-white/50 leading-relaxed px-5 pb-4 pt-2">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            </div>
          ))}
        </Accordion>
      </div>
    </section>
  )
}

const CTASection = ({ onNavigate }: { onNavigate: (path: string) => void }) => {
  return (
    <section className="py-24 md:py-32 px-4 sm:px-6 relative bg-[#0a0a0a]/50 border-y border-white/5">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} 
          whileInView={{ opacity: 1, scale: 1 }} 
          viewport={{ once: true }} 
          transition={{ duration: 0.8 }}
          className="relative w-full"
        >
          <div className="absolute -inset-20 bg-primary/10 blur-3xl -z-10 opacity-30" />
          
          <div className="font-mono text-xs text-white/20  tracking-[0.3em] mb-6">
            // READY_TO_INITIALIZE
          </div>
          
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
            Ready to optimize
            <br />
            <span className="text-primary">your workflow?</span>
          </h2>
          
          <p className="text-base text-white/40 mb-10 max-w-lg mx-auto font-mono">
            Join the waitlist today and be the first to experience production management reimagined.
          </p>
          
          <TerminalButton onClick={() => onNavigate('/auth')} className="px-8 py-4">
            Initialize Access
          </TerminalButton>
          
          <div className="mt-8 flex items-center justify-center gap-8 text-white/30 text-[10px] font-mono  tracking-wider">
            <span className="flex items-center gap-2">
              <span className="w-1 h-1 bg-emerald-500 rounded-full" /> 
              Free for Early Adopters
            </span>
            <span className="flex items-center gap-2">
              <span className="w-1 h-1 bg-emerald-500 rounded-full" /> 
              No Credit Card
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

const Footer = () => {
  const navigate = useNavigate()

  return (
    <footer className="bg-[#0a0a0a] pt-20 pb-12 px-4 sm:px-6 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 lg:grid-cols-12 gap-8 sm:gap-12 mb-16">
          <div className="col-span-2 md:col-span-4 lg:col-span-4">
            <Logo size="lg" className="mb-6" />
            <p className="text-white/30 text-sm leading-relaxed max-w-xs mb-6 font-mono">
              Production OS for modern filmmaking.
              <br />
              Built by filmmakers, for filmmakers.
            </p>
            <div className="flex gap-3">
              {[FilmIcon, Clapperboard, Camera].map((Icon, i) => (
                <a 
                  key={i} 
                  href="#" 
                  className="w-9 h-9 border border-white/10 flex items-center justify-center text-white/30 hover:text-white hover:border-white/30 transition-all"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>
          
          <div className="lg:col-start-7 lg:col-span-2">
            <h4 className="text-white font-semibold mb-6 text-xs  tracking-widest">Product</h4>
            <ul className="space-y-3 text-sm text-white/40 font-mono">
              <li><button onClick={() => navigate('/auth')} className="hover:text-white transition-colors">Timeline</button></li>
              <li><button onClick={() => navigate('/auth')} className="hover:text-white transition-colors">Inventory</button></li>
              <li><button onClick={() => navigate('/auth')} className="hover:text-white transition-colors">Pipeline</button></li>
            </ul>
          </div>
          
          <div className="lg:col-span-2">
            <h4 className="text-white font-semibold mb-6 text-xs  tracking-widest">Resources</h4>
            <ul className="space-y-3 text-sm text-white/40 font-mono">
              <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
            </ul>
          </div>
          
          <div className="lg:col-span-2">
            <h4 className="text-white font-semibold mb-6 text-xs  tracking-widest">Legal</h4>
            <ul className="space-y-3 text-sm text-white/40 font-mono">
              <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono text-white/20">
          <p>© 2026 Vemakin Inc.</p>
          <p>System Version 1.2.0</p>
        </div>
      </div>
    </footer>
  )
}

export const LandingPage = () => {
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  
  useEffect(() => {
    const handleScroll = throttle(() => setScrolled(window.scrollY > 20), 100)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-primary/30 font-sans overflow-x-hidden relative">
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none z-0" />
      
      <div className="relative z-10">
        <Navbar scrolled={scrolled} onNavigate={navigate} />
        <HeroSection onNavigate={navigate} />
        <Benefits />
        <HowItWorks />
        <FAQ />
        <CTASection onNavigate={navigate} />
        <Footer />
      </div>
    </div>
  )
}

export default LandingPage
