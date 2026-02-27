import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Check, Film, Package, Zap, StickyNote, 
  Menu, X, Clock, MapPin,
  Sun, Moon,
  Instagram,
  TwitterIcon
} from 'lucide-react'

import { Logo } from '@/components/atoms'
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
      group relative p-2 font-mono text-sm tracking-wider 
      border transition-all duration-300 cursor-pointer
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

// --- MOCK UI COMPONENTS ---

const MockShotCard = ({ title, scene, time, location, status = 'pending', active = false }: any) => (
  <div className={`p-4 border transition-all ${active ? 'border-primary bg-primary/5' : 'border-white/10 bg-black/60'}`}>
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className="px-2 py-0.5 border border-white/20 text-white/80 text-[10px] font-mono  tracking-wider">
          Scene {scene}
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
          <div className="px-2 py-1 border border-white/10 text-white/50 text-[9px] font-mono ">
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
      <span className="text-xs font-mono text-white/60  tracking-wider">Monday Oct 24</span>
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
        scrolled ? 'bg-[#0a0a0a]/95 border-white/10 py-3' : 'bg-transparent border-transparent py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Logo variant="default" size="md" />
        </div>
        
        <div className="hidden md:flex items-center gap-8">
          {['Features', 'How it works', 'FAQ'].map((item) => (
            <button 
              key={item}
              onClick={() => scrollToSection(item.toLowerCase().replace(/\s+/g, '-'))}
              className="cursor-pointer text-lg font-mono text-white/40 hover:text-white transition-colors tracking-widest "
            >
              {item}
            </button>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-4">
          <button 
            onClick={() => navigate('/auth')} 
            className="cursor-pointer text-xs font-mono text-white/50 hover:text-white transition-colors  tracking-widest"
          >
            Sign In
          </button>
          <TerminalButton onClick={() => navigate('/auth')}>
            Register
          </TerminalButton>
        </div>

        <button 
          className="md:hidden p-2 text-white/60 hover:text-white cursor-pointer" 
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
              {['Features', 'How it works', 'FAQ'].map((item) => (
                <button 
                  key={item} 
                  onClick={() => scrollToSection(item.toLowerCase().replace(/\s+/g, '-'))} 
                  className="cursor-pointer text-sm font-mono text-white/60 text-left  tracking-widest hover:text-white"
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

  return (
    <section className="relative min-h-svh flex items-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0a0a0a]/80" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 w-full">
        <div className="grid lg:grid-cols-2 gap-6 items-center">
          {/* Left - Content */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} 
          > 
            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-4 leading-[1.1] break-words">
              Vemakin
              <br />
              <span className="font-mono text-primary">Filmmaker operating system</span>
            </h1>
            
            {/* CTA Buttons centered */}
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

            {/* Trust badges */}
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

          {/* Right - Terminal Preview */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full"
          >
            <div className="relative border border-white/10 bg-[#0a0a0a]/80">
              {/* Terminal Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/5">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                  </div>
                  <span className="ml-3 text-[10px] font-mono text-white/40">production timeline</span>
                </div>
              </div>
              
              {/* Terminal Content */}
              <div className="p-2 space-y-3">
                <MockTimelineHeader />
                <div className="space-y-2">
                  <MockShotCard active title="Opening Scene - Wide Rooftop" scene="12A" time="08:00" location="Grand Central Roof" />
                  
                  <div className="flex items-center justify-center gap-4 py-1">
                    <div className="h-px flex-1 bg-white/5" />
                    <span className="text-[9px] font-mono text-white/30  tracking-widest">15m travel time</span>
                    <div className="h-px flex-1 bg-white/5" />
                  </div>

                  <MockShotCard title="Dialogue Sequence - Interior" scene="12B" time="10:30" location="Studio B" />
                </div>
              </div>
              {/* Terminal Footer */}
              <div className="px-4 py-2 border-t border-white/10 bg-white/5 flex items-center justify-between">
                <span className="text-[9px] font-mono text-white/30">2 shots scheduled</span>
                <div className="flex items-center gap-1">

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
      icon: Package,
      title: 'Inventory',
      description: 'Manage all range of equipments, see their specs directly filled by our database, their ownership (set price if rented), and link them to specific shots for better tracking and organization.'
    },
    {
      icon: Film,
      title: 'Timeline',
      description: 'Scheduling your shots, monitor sunrise/sunset windows, calculate travel times between shots and know which gear to change between shots.'
    },
    {
      icon: Zap,
      title: 'Pipeline',
      description: 'Track post-production tasks for VFX, Editing, Color, Script and Sound. Set priorities and due date.'
    },
    {
      icon: StickyNote,
      title: 'Notes',
      description: 'Manage your notes, link them directly to specific shots or post-production tasks for better visibility and accessibility.'
    }
  ]

  return (
    <section id="features" className="py-2 md:py-2 px-4 sm:px-6 relative">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex items-center gap-4 mb-12">
          <h2 className="text-2xl font-bold text-white">Features</h2>
          <div className="flex-1 h-px bg-white/10" />
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
      title: 'Create project',
      description: 'Create your project, add locations, and build your shot list with automatic travel time calculations.'
    },
    {
      number: '02',
      title: 'Populate your inventory',
      description: 'Add your equipment with technical specs, track rentals, and link gear to specific shots.'
    },
    {
      number: '03',
      title: 'Monitor your tasks',
      description: 'Track VFX, Editing, Color, Script and Sound tasks through your pipeline with priority-based organization.'
    },
    {
      number: '04',
      title: 'Annotate',
      description: 'Add notes and observations, link them to specific shots or tasks, and keep all your insights organized and accessible.'
    }
  ]

  return (
    <section id="how-it-works" className="py-24 md:py-32 px-4 sm:px-6 relative bg-[#0a0a0a]/50">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-12">
          <h2 className="text-2xl font-bold text-white">How it works</h2>
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
                  <span className="font-mono text-xs text-primary/60">Step {step.number}</span>
                </div>
                <h3 className="text-sm font-semibold text-white mb-3">{step.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{step.description}</p>
              </div>
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 w-4 h-px bg-white/20" />
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
      question: "Why choosing this design ?",
      answer: "Simplicity is our ally. We wanted to create a unique, simple and engaging experience that resonates with filmmakers. The terminal-inspired design reflects the behind-the-scenes nature of production management, while the dark theme provides a cinematic feel. It’s not just about aesthetics – it’s about creating an environment that feels intuitive, simple and inspiring for our users."
    },
    {
      question: "Is Vemakin free ?",
      answer: "Vemakin will always have a free tier with core features to support independent filmmakers and small productions. Offering unlimited inventory and 1 project. We believe in democratizing access to powerful production management tools, so you can focus on your creativity without worrying about costs."
    },
    {
      question: "Can I use Vemakin offline ?",
      answer: "No, but we are working on a IOS app to make everything available offline throught your phone."
    },
    {
      question: "What types of productions is Vemakin suited for?",
      answer: "At this moment Vemakin is suited for indie filmmakers, small productions and student projects. We are working on features to support larger productions with more complex needs, but our initial focus is on providing a powerful yet accessible tool for smaller teams."
    },
    {
      question: "How does the gear inventory work?",
      answer: "You can catalog all your equipment with detailed technical specs, track rental periods, set maintenance reminders, and link specific gear to shots in your timeline."
    },
    {
      question: "Can I collaborate with my team on Vemakin?",
      answer: "Not yet, but we are planning to add collaboration features in the future to allow teams to work together seamlessly on projects, share updates, and manage tasks in real-time."
    },
    {
      question: "What language is supported ?",
      answer: "At the moment, Vemakin is only available in English. However, we have plans to support multiple languages in the future to make our platform more accessible to filmmakers around the world."
    },
    {
      question: "What is our plan for the future ?",
      answer: "We have a clear roadmap for Vemakin, with plans to introduce advanced collaboration features, mobile apps for on-the-go access, news about cinema and gear and AI to assist you for your inventory, shots, tasks and notes. Our goal is to continuously evolve Vemakin based on user feedback and the changing needs of filmmakers, ensuring it remains an indispensable tool in the production process."
    },
  ]

  return (
    <section id="faq" className="pb-24 md:pb-32 px-4 sm:px-6 relative">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-12">
          
          <h2 className="text-2xl font-bold text-white">FAQ</h2>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <Accordion type="single" collapsible className="space-y-2">
          {faqs.map((faq, i) => (
            <div key={i} className="border border-white/10 bg-black/40">
              <AccordionItem value={`item-${i}`} className="border-0">
                <AccordionTrigger className="cursor-pointer text-sm font-medium text-white hover:no-underline px-5 py-4 hover:bg-white/5 transition-colors [&[data-state=open]]:bg-white/5 [&[data-state=open]]:border-b [&[data-state=open]]:border-white/10">
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

const Footer = () => {
  const navigate = useNavigate()

  return (
    <footer className="bg-[#0a0a0a] px-10 py-6 sm:px-6 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 lg:grid-cols-12 gap-8 sm:gap-12 mb-4">
          <div className="col-span-2 md:col-span-4 lg:col-span-4">
            <Logo size="lg" className="mb-6" />
            <p className="text-white/30 text-sm leading-relaxed max-w-xs mb-6 font-mono">
              Production operating for modern filmmaking.
              <br />
              Built by filmmakers, for filmmakers.
            </p>
            <div className="flex gap-3">
              {[Instagram, TwitterIcon].map((Icon, i) => (
                <a 
                  key={i} 
                  href="#" 
                  className="w-9 h-9 border border-white/10 flex items-center justify-center text-white/30 hover:text-white hover:border-white/30 transition-all cursor-pointer"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>
          
          <div className="lg:col-start-7 lg:col-span-2">
            <h4 className="text-white font-semibold mb-6 text-sm  tracking-widest">Product</h4>
            <ul className="space-y-3 text-sm text-white/40 font-mono">
              <li><button onClick={() => navigate('/auth')} className="cursor-pointer hover:text-white transition-colors">Timeline</button></li>
              <li><button onClick={() => navigate('/auth')} className="cursor-pointer hover:text-white transition-colors">Inventory</button></li>
              <li><button onClick={() => navigate('/auth')} className="cursor-pointer hover:text-white transition-colors">Pipeline</button></li>
              <li><button onClick={() => navigate('/auth')} className="cursor-pointer hover:text-white transition-colors">Notes</button></li>
            </ul>
          </div>
          
          <div className="lg:col-span-2">
            <h4 className="text-white font-semibold mb-6 text-sm  tracking-widest">Resources</h4>
            <ul className="space-y-3 text-sm text-white/40 font-mono">
              <li><a href="#" className="cursor-pointer hover:text-white transition-colors">Documentation</a></li>
              <li><a href="#" className="cursor-pointer hover:text-white transition-colors">Support</a></li>
            </ul>
          </div>
          
          <div className="lg:col-span-2">
            <h4 className="text-white font-semibold mb-6 text-sm  tracking-widest">Legal</h4>
            <ul className="space-y-3 text-sm text-white/40 font-mono">
              <li><a href="#" className="cursor-pointer hover:text-white transition-colors">Privacy</a></li>
              <li><a href="#" className="cursor-pointer hover:text-white transition-colors">Terms</a></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-4 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono text-white/20">
          <p>© 2026 Vemakin Inc.</p>
          <p>System Version 1.0.0</p>
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
        <Footer />
      </div>
    </div>
  )
}

export default LandingPage
