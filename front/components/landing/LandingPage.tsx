import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowRight, Check, Film, Package, Zap, StickyNote, 
  Menu, X, Play, Clock, MapPin,
  ChevronDown, Sun, Moon, Sparkles, Camera, Clapperboard,
  FilmIcon, Terminal, Cpu, Grid3X3, Command
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

// Throttle utility for Safari scroll performance
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

// --- TERMINAL STYLE COMPONENTS ---

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
      group relative px-6 py-3 font-mono text-sm tracking-wider uppercase
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
      <span className="opacity-0 group-hover:opacity-100 transition-opacity">{'>>'}</span>
    </span>
  </button>
)

const StatusBadge = ({ text }: { text: string }) => (
  <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-primary/30 bg-primary/5">
    <span className="w-1.5 h-1.5 bg-primary animate-pulse rounded-full" />
    <span className="font-mono text-[10px] text-primary tracking-widest uppercase">{text}</span>
  </div>
)

// --- MOCK UI COMPONENTS ---

const MockShotCard = ({ title, scene, time, location, status = 'pending', active = false }: any) => (
  <div className={`p-4 border transition-all ${active ? 'border-primary bg-primary/5' : 'border-white/10 bg-[#0a0a0a]/40'} backdrop-blur-sm`}>
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className="px-2 py-0.5 border border-white/20 text-white/80 text-[10px] font-mono uppercase tracking-wider">
          Scene_{scene}
        </span>
        <span className="px-2 py-0.5 border border-white/10 text-white/50 text-[10px] font-mono flex items-center gap-1.5">
          <Clock size={9} /> {time}
        </span>
      </div>

      <div className="my-1">
        <h3 className="text-base font-medium text-white leading-tight">{title}</h3>
        <div className="flex items-center gap-2 text-white/40 text-xs mt-1 font-mono">
          <MapPin size={10} />
          <span className="truncate">{location}</span>
        </div>
      </div>

      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-2">
          <div className="px-2 py-1 border border-white/10 text-white/50 text-[9px] font-mono uppercase">
            Checklist
          </div>
          <div className="flex items-center gap-1.5 text-primary text-[10px] font-mono">
            <Package size={12} /> <span>Gear:4/4</span>
          </div>
        </div>
        <div className={`w-6 h-6 flex items-center justify-center border ${status === 'done' ? 'bg-primary border-primary text-black' : 'border-white/20 text-white/40'}`}>
          <Check size={12} strokeWidth={3} />
        </div>
      </div>
    </div>
  </div>
)

const MockTimelineHeader = () => (
  <div className="px-4 py-3 flex items-center justify-between bg-[#0a0a0a]/60 border-b border-white/10">
    <div className="flex items-center gap-2">
      <Terminal size={12} className="text-primary" />
      <span className="text-xs font-mono text-white/60 uppercase tracking-wider">Monday_Oct_24</span>
    </div>
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1.5 text-[10px] font-mono text-orange-400">
        <Sun size={10} /> 06:12
      </div>
      <div className="flex items-center gap-1.5 text-[10px] font-mono text-primary">
        <Moon size={10} /> 18:45
      </div>
    </div>
  </div>
)

// --- SECTION COMPONENTS ---

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
              className="text-xs font-mono text-white/40 hover:text-white transition-colors tracking-widest uppercase"
            >
              {item}
            </button>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-4">
          <button 
            onClick={() => navigate('/auth')} 
            className="text-xs font-mono text-white/50 hover:text-white transition-colors uppercase tracking-widest"
          >
            Sign In
          </button>
          <TerminalButton onClick={() => navigate('/auth')}>
            Initialize
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
                  className="text-sm font-mono text-white/60 text-left uppercase tracking-widest hover:text-white"
                >
                  {item}
                </button>
              ))}
              <div className="h-px bg-white/10 my-2" />
              <TerminalButton onClick={() => navigate('/auth')} className="w-full">
                Initialize
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

  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0a0a0a]/80" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left - Content */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} 
          >
            {/* Status Line */}
            <div className="mb-6">
              <StatusBadge text="System Online" />
            </div>
            
            {/* Pre-headline */}
            <div className="font-mono text-[10px] text-white/30 uppercase tracking-[0.3em] mb-4">
              // VEMAKIN_FEED_ACTIVE — PRODUCTION_OS: READY
            </div>
            
            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-4 leading-[1.1] break-words">
              Production
              <br />
              <span className="font-mono text-primary">[Operating_System]</span>
            </h1>
            
            {/* Sub-headline */}
            <p className="text-base md:text-lg text-white/40 mb-8 max-w-md leading-relaxed font-mono">
              Automated timeline intelligence, gear tracking, and predictive analytics.
              <br />
              Engineered for those who move.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <TerminalButton onClick={() => onNavigate('/auth')}>
                Initialize Production
              </TerminalButton>
              
              <TerminalButton 
                variant="secondary" 
                onClick={() => scrollToSection('how-it-works')}
              >
                View Documentation
              </TerminalButton>
            </div>

            {/* Trust badges */}
            <div className="mt-8 flex flex-wrap items-center gap-4 sm:gap-6 text-white/30 text-[10px] font-mono uppercase tracking-wider">
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

          {/* Right - Terminal Preview */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full"
          >
            <div className="relative border border-white/10 bg-[#0a0a0a]/60 backdrop-blur-sm">
              {/* Terminal Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/5">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                  </div>
                  <span className="ml-3 text-[10px] font-mono text-white/40">production_timeline.exe</span>
                </div>
                <Grid3X3 size={12} className="text-white/20" />
              </div>
              
              {/* Terminal Content */}
              <div className="p-6 space-y-3">
                <MockTimelineHeader />
                <div className="space-y-2">
                  <MockShotCard active title="Opening Scene - Wide Rooftop" scene="12A" time="08:00" location="Grand Central Roof" />
                  
                  <div className="flex items-center justify-center gap-4 py-1">
                    <div className="h-px flex-1 bg-white/5" />
                    <span className="text-[9px] font-mono text-white/30 uppercase tracking-widest">15m_travel_time</span>
                    <div className="h-px flex-1 bg-white/5" />
                  </div>

                  <MockShotCard title="Dialogue Sequence - Interior" scene="12B" time="10:30" location="Studio B" />
                </div>
              </div>
              
              {/* Terminal Footer */}
              <div className="px-4 py-2 border-t border-white/10 bg-white/5 flex items-center justify-between">
                <span className="text-[9px] font-mono text-white/30">2 shots scheduled</span>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                  <span className="text-[9px] font-mono text-primary">LIVE</span>
                </div>
              </div>
            </div>
            
            {/* Glow effect */}
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
    <section id="features" className="py-24 md:py-32 px-4 sm:px-6 relative">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex items-center gap-4 mb-12">
          <Cpu size={20} className="text-primary" />
          <h2 className="text-2xl font-bold text-white">Core Modules</h2>
          <div className="flex-1 h-px bg-white/10" />
          <span className="font-mono text-xs text-white/30 uppercase tracking-widest">V.2.0</span>
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
          
          <div className="font-mono text-xs text-white/20 uppercase tracking-[0.3em] mb-6">
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
          
          <div className="mt-8 flex items-center justify-center gap-8 text-white/30 text-[10px] font-mono uppercase tracking-wider">
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
            <h4 className="text-white font-semibold mb-6 text-xs uppercase tracking-widest">Product</h4>
            <ul className="space-y-3 text-sm text-white/40 font-mono">
              <li><button onClick={() => navigate('/auth')} className="hover:text-white transition-colors">Timeline</button></li>
              <li><button onClick={() => navigate('/auth')} className="hover:text-white transition-colors">Inventory</button></li>
              <li><button onClick={() => navigate('/auth')} className="hover:text-white transition-colors">Pipeline</button></li>
            </ul>
          </div>
          
          <div className="lg:col-span-2">
            <h4 className="text-white font-semibold mb-6 text-xs uppercase tracking-widest">Resources</h4>
            <ul className="space-y-3 text-sm text-white/40 font-mono">
              <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
            </ul>
          </div>
          
          <div className="lg:col-span-2">
            <h4 className="text-white font-semibold mb-6 text-xs uppercase tracking-widest">Legal</h4>
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

// --- MAIN LANDING PAGE COMPONENT ---

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
      {/* Global Grid Background */}
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
