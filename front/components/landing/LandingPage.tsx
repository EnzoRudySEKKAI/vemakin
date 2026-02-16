import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowRight, Check, Film, Package, Zap, StickyNote, 
  Menu, X, ChevronRight, Play, Layers, Smartphone, 
  Users, Globe, Lock, Clock, Calendar, MapPin, FileText,
  ChevronDown, Sun, Moon, Scissors, Palette, Music
} from 'lucide-react'

import { Button, Logo, Text, IconContainer } from '@/components/atoms'
import { WindowCard } from '@/components/ui/WindowCard'
import { GlassCard } from '@/components/ui/GlassCard'

const MockShotCard = ({ title, scene, time, location, status = 'pending', active = false }: any) => (
  <div className={`p-5 rounded-[28px] bg-white/80 dark:bg-[#16181D]/80 backdrop-blur-xl border border-white/20 dark:border-white/5 shadow-sm transition-all ${active ? 'ring-1 ring-primary/50 shadow-xl' : 'opacity-60'}`}>
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
  <div className="p-5 flex flex-col h-full rounded-[28px] bg-white/80 dark:bg-[#16181D]/80 backdrop-blur-xl border border-white/20 dark:border-white/5 shadow-xl ring-1 ring-primary/20">
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

const FeatureCard = ({ icon: Icon, title, description, delay = 0 }: { icon: any, title: string, description: string, delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
  >
    <GlassCard className="p-8 h-full hover:border-white/20 transition-all group">
      <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center mb-6 group-hover:bg-primary/10 group-hover:border-primary/20 transition-all">
        <Icon size={24} className="text-white/60 group-hover:text-primary transition-colors" strokeWidth={1.5} />
      </div>
      <h3 className="text-xl font-semibold text-white mb-3">{title}</h3>
      <p className="text-base text-white/50 leading-relaxed">{description}</p>
    </GlassCard>
  </motion.div>
)

export const LandingPage = () => {
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
      setIsMobileMenuOpen(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0F1116] text-white selection:bg-primary/30 font-sans overflow-x-hidden">
      
      {/* --- NAVIGATION --- */}
      <nav 
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
          scrolled ? 'bg-[#0F1116]/80 backdrop-blur-xl border-b border-white/5 py-3' : 'py-6 bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Logo variant="default" size="md" />
          
          <div className="hidden md:flex items-center gap-10">
            {['Features', 'Timeline', 'Equipment'].map((item) => (
              <button 
                key={item}
                onClick={() => scrollToSection(item.toLowerCase())}
                className="text-sm font-semibold text-white/50 hover:text-white transition-colors tracking-tight"
              >
                {item}
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-6">
            <button onClick={() => navigate('/auth')} className="text-sm font-semibold text-white/70 hover:text-white transition-colors">Sign In</button>
            <Button size="md" variant="primary" onClick={() => navigate('/auth')} className="shadow-2xl shadow-primary/20 px-6">Get Started</Button>
          </div>

          <button className="md:hidden p-2 text-white/60 hover:text-white" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="md:hidden absolute top-full left-0 right-0 bg-[#16181D] border-b border-white/10 shadow-2xl overflow-hidden px-6 py-10 flex flex-col gap-8">
              {['Features', 'Timeline', 'Equipment'].map((item) => (
                <button key={item} onClick={() => scrollToSection(item.toLowerCase())} className="text-xl font-bold text-white/80 text-left">{item}</button>
              ))}
              <div className="h-px bg-white/5 w-full" />
              <div className="flex flex-col gap-4">
                <Button size="lg" variant="secondary" onClick={() => navigate('/auth')}>Sign In</Button>
                <Button size="lg" variant="primary" onClick={() => navigate('/auth')}>Get Started Free</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-40 pb-20 md:pt-60 md:pb-40 px-6">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none -z-10">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[150px] opacity-40 mix-blend-screen" />
          <div className="absolute top-20 right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[130px] opacity-30 mix-blend-screen" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-10 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_12px_rgba(78,71,221,0.8)]" />
              <span className="text-xs font-bold text-white/70 uppercase tracking-widest">Cinema-Grade OS</span>
            </div>
            
            <h1 className="text-6xl md:text-8xl lg:text-[110px] font-bold tracking-tight text-white mb-8 leading-[0.95]">
              The Production <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/20">Operating System.</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-white/40 mb-14 max-w-3xl mx-auto leading-relaxed">
              Plan your timeline with automated travel calculations, manage technical gear specs, and bridge the gap between set and post-production.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
              <Button size="lg" variant="primary" rightIcon={<ArrowRight size={20} />} onClick={() => navigate('/auth')} className="h-16 px-10 text-lg shadow-[0_20px_40px_rgba(78,71,221,0.3)] w-full sm:w-auto">Get Started</Button>
              <Button size="lg" variant="secondary" leftIcon={<Play size={20} fill="currentColor" />} onClick={() => scrollToSection('features')} className="h-16 px-10 text-lg bg-white/5 border-white/10 w-full sm:w-auto">View Workflow</Button>
            </div>
          </motion.div>

          {/* Real App Preview Mock */}
          <motion.div 
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="mt-24 md:mt-32 relative max-w-5xl mx-auto"
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
            <div className="absolute -inset-20 bg-primary/20 blur-[150px] -z-10 opacity-50" />
          </motion.div>
        </div>
      </section>

      {/* --- FEATURES GRID --- */}
      <section id="features" className="py-32 px-6 border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tighter">Everything you need to ship.</h2>
            <p className="text-xl text-white/40 max-w-2xl mx-auto">Built by filmmakers to solve the fragmentation of modern production management.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={Film}
              title="Automated Timeline" 
              description="Scheduling that understands filming logic. Calculate travel times between locations and monitor sunrise/sunset windows."
            />
            <FeatureCard 
              icon={Package}
              title="Technical Inventory" 
              description="Track equipment specs from sensor sizes to mount types. Manage owned vs rented gear with real-time price tracking."
            />
            <FeatureCard 
              icon={Zap}
              title="Multi-Stage Pipeline" 
              description="Track post-production tasks for VFX, Color, and Sound. Set priorities and manage review cycles in one dashboard."
            />
            <FeatureCard 
              icon={StickyNote}
              title="Contextual Notes" 
              description="Link creative notes and continuity logs directly to specific shots or post-production tasks for better visibility."
            />
            <FeatureCard 
              icon={Users}
              title="Crew & Locations" 
              description="Centralize location data and crew contacts. Map shots to locations and assign technical units to gear sets."
            />
            <FeatureCard 
              icon={Smartphone}
              title="Production App" 
              description="A native-grade experience designed for the field. Access your checklists and schedules offline on set."
            />
          </div>
        </div>
      </section>

      {/* --- EQUIPMENT SECTION (REAL UI) --- */}
      <section id="equipment" className="py-32 md:py-60 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
          <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest mb-8">
              Inventory Engine
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 tracking-tighter leading-none">
              Master your kit <br /> with precision.
            </h2>
            <p className="text-xl text-white/40 mb-12 leading-relaxed">
              Stop guessing if your gear is ready. Vemakin's inventory engine tracks maintenance, 
              rental returns, and shot-specific gear checklists automatically.
            </p>
            <div className="space-y-6">
              {[
                { title: 'Tech Specs Tracking', desc: 'Detailed tracking for focal lengths, sensors, and power needs.' },
                { title: 'Rental Management', desc: 'Track frequency and pricing for rented items to stay on budget.' },
                { title: 'Shot-Linked Checklists', desc: 'Ensure every lens and cable is prepared for its specific scene.' }
              ].map((b, i) => (
                <div key={i} className="flex gap-5">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Check size={20} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1 leading-tight">{b.title}</h3>
                    <p className="text-base text-white/40 leading-relaxed">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="relative lg:pl-10">
            <div className="relative z-10 transform lg:rotate-3">
              <MockInventoryCard />
              {/* Floating Status Detail */}
              <GlassCard className="absolute -bottom-8 -left-8 p-4 border-white/10 shadow-2xl w-48">
                 <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center"><Check size={14} className="text-emerald-500"/></div>
                    <span className="text-[10px] font-bold uppercase tracking-wider">Unit Ready</span>
                 </div>
                 <div className="h-1 w-full bg-white/5 rounded-full"><div className="h-full w-full bg-emerald-500 rounded-full" /></div>
              </GlassCard>
            </div>
            <div className="absolute inset-0 bg-primary/20 blur-[120px] -z-10 opacity-30" />
          </motion.div>
        </div>
      </section>

      {/* --- PIPELINE SECTION --- */}
      <section id="pipeline" className="py-32 md:py-48 px-6 bg-[#090A0D]">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
            <h2 className="text-5xl md:text-7xl font-bold text-white mb-10 tracking-tighter leading-[1.1]">
              Elevate your <br /> production value.
            </h2>
            <p className="text-xl md:text-2xl text-white/40 mb-16 leading-relaxed max-w-2xl mx-auto">
              Join the new generation of filmmakers who are running their sets with the precision of a high-performance OS.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Button size="lg" variant="primary" className="h-18 px-12 text-xl shadow-2xl shadow-primary/30 w-full sm:w-auto font-bold" onClick={() => navigate('/auth')}>
                Start Creating Free
              </Button>
              <Button size="lg" variant="secondary" className="h-18 px-12 text-xl bg-[#16181D] border-white/10 w-full sm:w-auto font-bold" onClick={() => navigate('/auth')}>
                Contact Sales
              </Button>
            </div>
            <div className="mt-12 flex items-center justify-center gap-8 text-white/20 text-xs font-bold uppercase tracking-[0.2em]">
              <span>No Credit Card</span>
              <span>Free for Indies</span>
              <span>Cloud Sync</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-[#090A0D] pt-32 pb-16 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-12 gap-16 mb-24">
            <div className="col-span-2 md:col-span-4 lg:col-span-4">
              <Logo size="lg" className="mb-10" />
              <p className="text-white/30 text-lg leading-relaxed max-w-xs mb-10">
                The high-performance operating system for modern film production. Built by filmmakers, for filmmakers.
              </p>
              <div className="flex gap-5">
                {[Globe, Lock, Smartphone].map((Icon, i) => (
                  <a key={i} href="#" className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/30 hover:text-white hover:bg-white/10 transition-all border border-white/5">
                    <Icon size={20} />
                  </a>
                ))}
              </div>
            </div>
            
            <div className="lg:col-start-7 lg:col-span-2">
              <h4 className="text-white font-bold mb-8 text-xs uppercase tracking-[0.2em] opacity-40">Software</h4>
              <ul className="space-y-5 text-sm font-semibold text-white/40">
                <li><a href="#" className="hover:text-white transition-colors">Timeline Engine</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Gear Database</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Post Pipeline</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Mobile OS</a></li>
              </ul>
            </div>
            
            <div className="lg:col-span-2">
              <h4 className="text-white font-bold mb-8 text-xs uppercase tracking-[0.2em] opacity-40">Resources</h4>
              <ul className="space-y-5 text-sm font-semibold text-white/40">
                <li><a href="#" className="hover:text-white transition-colors">Dailies</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Technical Docs</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Production Hub</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Beta Support</a></li>
              </ul>
            </div>
            
            <div className="lg:col-span-2">
              <h4 className="text-white font-bold mb-8 text-xs uppercase tracking-[0.2em] opacity-40">Company</h4>
              <ul className="space-y-5 text-sm font-semibold text-white/40">
                <li><a href="#" className="hover:text-white transition-colors">Mission</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 text-[10px] font-bold uppercase tracking-[0.2em] text-white/20">
            <p>© 2026 Vemakin Inc. All rights reserved.</p>
            <div className="flex gap-10">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
