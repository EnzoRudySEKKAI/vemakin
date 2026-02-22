import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowRight, Check, Film, Package, Zap, StickyNote, 
  Menu, X, Play, Clock, MapPin,
  ChevronDown, Sun, Moon, Sparkles, Camera, Clapperboard,
  FilmIcon
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

// --- MOCK UI COMPONENTS ---

const MockShotCard = ({ title, scene, time, location, status = 'pending', active = false }: any) => (
  <div className={`p-5 rounded-[28px] bg-white/95 dark:bg-[#16181D]/95 border border-white/20 dark:border-white/5 shadow-sm transition-all ${active ? 'ring-1 ring-primary/50 shadow-xl' : 'opacity-60'}`}>
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className="px-2.5 py-1 bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white text-[10px] font-bold rounded-lg border border-gray-200 dark:border-white/10">
          Scene {scene}
        </span>
        <span className="px-2.5 py-1 rounded-lg bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400 border border-transparent flex items-center gap-1.5 text-[10px] font-bold">
          <Clock size={10} strokeWidth={2.5} /> {time}
        </span>
      </div>

      <div className="my-1">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">{title}</h3>
        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 font-medium text-sm mt-1">
          <MapPin size={12} strokeWidth={2.5} />
          <span className="truncate">{location}</span>
        </div>
      </div>

      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-2">
          <div className="h-8 px-3 rounded-lg flex items-center gap-1.5 text-[10px] font-bold border bg-white/50 dark:bg-white/5 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-white/10">
            Checklist <ChevronDown size={12} />
          </div>
          <div className="flex items-center gap-1.5 text-primary text-[10px] font-bold">
            <Package size={14} strokeWidth={2.5} /> <span>Gear 4/4</span>
          </div>
        </div>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${status === 'done' ? 'bg-primary text-white border-transparent' : 'bg-white/50 dark:bg-white/5 border-gray-200 dark:border-white/10'}`}>
          <Check size={14} strokeWidth={3} />
        </div>
      </div>
    </div>
  </div>
)

const MockInventoryCard = () => (
  <div className="p-5 flex flex-col h-full rounded-[28px] bg-white/95 dark:bg-[#16181D]/95 border border-white/20 dark:border-white/5 shadow-xl ring-1 ring-primary/20">
    <div className="flex justify-between items-start mb-4 gap-2">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
          <Film size={18} className="text-primary" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white leading-tight uppercase tracking-tight">RED V-RAPTOR</h3>
          <p className="text-[10px] text-white/40 font-medium mt-0.5 tracking-wider uppercase">A-CAM Unit</p>
        </div>
      </div>
      <div className="text-right">
        <div className="text-sm font-bold text-white leading-none">$1,200</div>
        <div className="text-[10px] text-white/40 font-bold mt-1 uppercase tracking-widest">/ Day</div>
      </div>
    </div>

    <div className="flex gap-2 mb-5">
      <span className="px-2 py-1 rounded-md text-[9px] font-bold bg-white/5 text-white/50 uppercase tracking-widest border border-white/5">Camera</span>
      <span className="px-2 py-1 rounded-md text-[9px] font-bold bg-primary/10 text-primary uppercase tracking-widest border border-primary/20">Owned</span>
    </div>

    <div className="mt-auto grid grid-cols-2 gap-2 bg-white/5 p-3 rounded-xl border border-white/10">
      <div className="flex flex-col">
        <span className="text-white/20 text-[9px] font-bold uppercase tracking-widest leading-none mb-1.5">Sensor</span>
        <span className="text-white text-xs font-semibold">8K VV</span>
      </div>
      <div className="flex flex-col">
        <span className="text-white/20 text-[9px] font-bold uppercase tracking-widest leading-none mb-1.5">Mount</span>
        <span className="text-white text-xs font-semibold">PL Mount</span>
      </div>
    </div>
  </div>
)

const MockTimelineHeader = () => (
  <div className="px-6 py-4 flex items-center justify-between bg-[#16181D] border-b border-white/[0.05]">
    <div className="text-sm font-bold text-white tracking-tight uppercase">Monday, Oct 24</div>
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-1.5 text-[10px] font-bold text-orange-400/80">
        <Sun size={12} strokeWidth={2.5} /> 06:12
      </div>
      <div className="flex items-center gap-1.5 text-[10px] font-bold text-primary/80">
        <Moon size={12} strokeWidth={2.5} /> 18:45
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
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
        scrolled ? 'bg-[#0F1116]/95 backdrop-blur-xl border-b border-white/5 py-3' : 'py-6 bg-transparent'
      }`}
      style={{ willChange: 'background-color, padding' }}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Logo variant="default" size="md" />
        
        <div className="hidden md:flex items-center gap-10">
          {['Features', 'How it Works', 'FAQ'].map((item) => (
            <button 
              key={item}
              onClick={() => scrollToSection(item.toLowerCase().replace(/\s+/g, '-'))}
              className="text-sm font-semibold text-white/50 hover:text-white transition-colors tracking-tight"
            >
              {item}
            </button>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-6">
          <button onClick={() => navigate('/auth')} className="text-sm font-semibold text-white/70 hover:text-white transition-colors">Sign In</button>
          <Button size="default" onClick={() => navigate('/auth')} className="shadow-2xl shadow-primary/20 px-6">
            Get Started
          </Button>
        </div>

        <button className="md:hidden p-2 text-white/60 hover:text-white" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -20 }} 
            style={{ willChange: 'transform, opacity' }} 
            className="md:hidden absolute top-full left-0 right-0 bg-[#16181D] border-b border-white/10 shadow-2xl overflow-hidden px-6 py-10 flex flex-col gap-8"
          >
            {['Features', 'How it Works', 'FAQ'].map((item) => (
              <button key={item} onClick={() => scrollToSection(item.toLowerCase().replace(/\s+/g, '-'))} className="text-xl font-bold text-white/80 text-left">{item}</button>
            ))}
            <div className="h-px bg-white/5 w-full" />
            <div className="flex flex-col gap-4">
              <Button variant="outline" onClick={() => navigate('/auth')}>Sign In</Button>
              <Button onClick={() => navigate('/auth')}>Get Started Free</Button>
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
    <section className="relative pt-40 pb-20 md:pt-56 md:pb-32 px-6 overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none -z-10">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[80px] opacity-40 mix-blend-screen" />
        <div className="absolute top-20 right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[60px] opacity-30 mix-blend-screen" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} 
          style={{ willChange: 'transform, opacity' }}
          className="text-center"
        >
          {/* Pre-headline */}
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8">
            <Sparkles size={14} className="text-primary" />
            <span className="text-xs font-bold text-white/70 uppercase tracking-widest">Coming Soon</span>
          </div>
          
          {/* Headline */}
          <h1 className="text-5xl md:text-7xl lg:text-[100px] font-bold tracking-tight text-white mb-6 leading-[0.95]">
            The Production <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/20">Operating System.</span>
          </h1>
          
          {/* Sub-headline */}
          <p className="text-lg md:text-xl text-white/40 mb-12 max-w-2xl mx-auto leading-relaxed">
            Plan your timeline with automated travel calculations, manage technical gear specs, 
            and bridge the gap between set and post-production.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              size="lg" 
              onClick={() => onNavigate('/auth')} 
              className="h-14 px-10 text-lg shadow-[0_20px_40px_rgba(78,71,221,0.3)] w-full sm:w-auto"
            >
              Join the Waitlist
              <ArrowRight size={20} className="ml-2" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => scrollToSection('how-it-works')} 
              className="h-14 px-10 text-lg bg-white/5 border-white/10 w-full sm:w-auto hover:bg-white/10"
            >
              <Play size={20} fill="currentColor" className="mr-2" />
              See How It Works
            </Button>
          </div>

          {/* Trust badges */}
          <div className="mt-8 flex items-center justify-center gap-8 text-white/30 text-xs font-bold uppercase tracking-[0.2em]">
            <span className="flex items-center gap-2"><Check size={14} className="text-emerald-500" /> Free for Early Adopters</span>
            <span className="flex items-center gap-2"><Check size={14} className="text-emerald-500" /> No Credit Card Required</span>
          </div>
        </motion.div>

        {/* Hero Visual / Video Placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          style={{ willChange: 'transform, opacity' }}
          className="mt-16 md:mt-24 relative max-w-5xl mx-auto"
        >
          <div className="relative z-10 rounded-[32px] p-2 bg-gradient-to-b from-white/10 to-transparent border border-white/10 shadow-2xl overflow-hidden">
            <WindowCard 
              showTrafficLights={true}
              className="shadow-2xl border-white/5 rounded-[24px]"
              contentClassName="bg-[#0F1116] overflow-hidden"
            >
              <MockTimelineHeader />
              <div className="p-8 space-y-4">
                <MockShotCard active title="Opening Scene - Wide Rooftop" scene="12A" time="08:00" location="Grand Central Roof" />
                
                {/* Travel Indicator Mock */}
                <div className="flex items-center justify-center gap-4 py-2 opacity-40">
                  <div className="h-px flex-1 bg-white/10" />
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/50">
                    <MapPin size={10} /> 15m Travel Time
                  </div>
                  <div className="h-px flex-1 bg-white/10" />
                </div>

                <MockShotCard title="Dialogue Sequence - Interior" scene="12B" time="10:30" location="Studio B" />
              </div>
            </WindowCard>
          </div>
          <div className="absolute -inset-20 bg-primary/20 blur-[60px] -z-10 opacity-50" />
        </motion.div>
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
    <section id="features" className="py-24 md:py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tighter">Everything you need to ship.</h2>
          <p className="text-lg text-white/40 max-w-2xl mx-auto">Built by filmmakers to solve the fragmentation of modern production management.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {benefits.map((benefit, i) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              style={{ willChange: 'transform, opacity' }}
            >
              <GlassCard className="p-8 h-full hover:border-white/20 transition-all group">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center mb-6 group-hover:bg-primary/10 group-hover:border-primary/20 transition-all">
                  <benefit.icon size={24} className="text-white/60 group-hover:text-primary transition-colors" strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{benefit.title}</h3>
                <p className="text-base text-white/50 leading-relaxed">{benefit.description}</p>
              </GlassCard>
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
      title: 'Plan Your Production',
      description: 'Create your project, add locations, and build your shot list with automatic travel time calculations.'
    },
    {
      number: '02',
      title: 'Manage Your Gear',
      description: 'Catalog your equipment with technical specs, track rentals, and link gear to specific shots.'
    },
    {
      number: '03',
      title: 'Track Post-Production',
      description: 'Monitor VFX, Color, and Sound tasks through your pipeline with priority-based organization.'
    },
    {
      number: '04',
      title: 'Ship Your Film',
      description: 'Export deliverables, share notes with your team, and deliver on time, every time.'
    }
  ]

  return (
    <section id="how-it-works" className="py-24 md:py-32 px-6 bg-[#090A0D]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tighter">How it works?</h2>
          <p className="text-lg text-white/40 max-w-2xl mx-auto">Get started in minutes and transform your production workflow.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="relative"
            >
              <div className="text-6xl font-bold text-white/5 mb-4">{step.number}</div>
              <h3 className="text-xl font-semibold text-white mb-3">{step.title}</h3>
              <p className="text-white/40 leading-relaxed">{step.description}</p>
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 right-0 w-full h-px bg-gradient-to-r from-white/10 to-transparent" />
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
    <section id="faq" className="py-24 md:py-32 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tighter">FAQ</h2>
          <p className="text-lg text-white/40">Got questions? We've got answers.</p>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, i) => (
            <GlassCard key={i} className="border-0">
              <AccordionItem value={`item-${i}`} className="border-0">
                <AccordionTrigger className="text-lg font-semibold text-white hover:no-underline px-6 py-6">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-white/50 leading-relaxed px-6 pb-6">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            </GlassCard>
          ))}
        </Accordion>
      </div>
    </section>
  )
}

const CTASection = ({ onNavigate }: { onNavigate: (path: string) => void }) => {
  return (
    <section className="py-24 md:py-32 px-6 bg-[#090A0D]">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} 
          whileInView={{ opacity: 1, scale: 1 }} 
          viewport={{ once: true }} 
          transition={{ duration: 0.8 }}
          style={{ willChange: 'transform, opacity' }}
          className="relative"
        >
          <div className="absolute -inset-20 bg-primary/20 blur-[80px] -z-10 opacity-50" />
          
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tighter leading-tight">
            Ready to transform your production workflow?
          </h2>
          <p className="text-xl text-white/40 mb-10 leading-relaxed max-w-2xl mx-auto">
            Join the waitlist today and be the first to experience the future of production management.
          </p>
          
          <Button 
            size="lg" 
            className="h-16 px-12 text-lg shadow-2xl shadow-primary/30 w-full sm:w-auto font-bold"
            onClick={() => onNavigate('/auth')}
          >
            Join the Waitlist
            <ArrowRight size={20} className="ml-2" />
          </Button>
          
          <div className="mt-8 flex items-center justify-center gap-8 text-white/30 text-xs font-bold uppercase tracking-[0.2em]">
            <span className="flex items-center gap-2"><Check size={14} className="text-emerald-500" /> Free for Early Adopters</span>
            <span className="flex items-center gap-2"><Check size={14} className="text-emerald-500" /> No Credit Card</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

const Footer = () => {
  const navigate = useNavigate()

  return (
    <footer className="bg-[#0F1116] pt-20 pb-12 px-6 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-12 gap-12 mb-16">
          <div className="col-span-2 md:col-span-4 lg:col-span-4">
            <Logo size="lg" className="mb-6" />
            <p className="text-white/30 text-base leading-relaxed max-w-xs mb-6">
              The high-performance operating system for modern film production. Built by filmmakers, for filmmakers.
            </p>
            <div className="flex gap-4">
              {[FilmIcon, Clapperboard, Camera].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/30 hover:text-white hover:bg-white/10 transition-all border border-white/5">
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>
          
          <div className="lg:col-start-7 lg:col-span-2">
            <h4 className="text-white font-bold mb-6 text-xs uppercase tracking-[0.2em] opacity-40">Product</h4>
            <ul className="space-y-4 text-sm font-semibold text-white/40">
              <li><button onClick={() => navigate('/auth')} className="hover:text-white transition-colors">Timeline Engine</button></li>
              <li><button onClick={() => navigate('/auth')} className="hover:text-white transition-colors">Gear Database</button></li>
              <li><button onClick={() => navigate('/auth')} className="hover:text-white transition-colors">Post Pipeline</button></li>
              <li><button onClick={() => navigate('/auth')} className="hover:text-white transition-colors">Mobile OS</button></li>
            </ul>
          </div>
          
          <div className="lg:col-span-2">
            <h4 className="text-white font-bold mb-6 text-xs uppercase tracking-[0.2em] opacity-40">Resources</h4>
            <ul className="space-y-4 text-sm font-semibold text-white/40">
              <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-white transition-colors">API Reference</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Tutorials</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
            </ul>
          </div>
          
          <div className="lg:col-span-2">
            <h4 className="text-white font-bold mb-6 text-xs uppercase tracking-[0.2em] opacity-40">Company</h4>
            <ul className="space-y-4 text-sm font-semibold text-white/40">
              <li><a href="#" className="hover:text-white transition-colors">About</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-bold uppercase tracking-[0.2em] text-white/20">
          <p>© 2026 Vemakin Inc. All rights reserved.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
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
    <div className="min-h-screen bg-[#0F1116] text-white selection:bg-primary/30 font-sans overflow-x-hidden">
      <Navbar scrolled={scrolled} onNavigate={navigate} />
      <HeroSection onNavigate={navigate} />
      <Benefits />
      <HowItWorks />
      <FAQ />
      <CTASection onNavigate={navigate} />
      <Footer />
    </div>
  )
}

export default LandingPage
