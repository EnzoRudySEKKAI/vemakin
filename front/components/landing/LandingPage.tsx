import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Aperture, 
  Menu, 
  X, 
  ArrowRight, 
  Film, 
  Package, 
  StickyNote,
  Zap,
  Mail,
  Github,
  Twitter
} from 'lucide-react'
// Fake Screenshot Components
const TimelineScreenshot = () => (
  <div className="w-full h-full bg-[#0D0D0F] rounded-[16px] p-3 overflow-hidden">
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
        <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
      </div>
      <div className="text-[10px] text-white/30 font-mono">Timeline</div>
    </div>
    <div className="space-y-2">
      {[
        { time: '09:00', title: 'Opening Scene', status: 'done', duration: '3min' },
        { time: '09:15', title: 'Character Intro', status: 'current', duration: '5min' },
        { time: '09:25', title: 'Action Sequence', status: 'pending', duration: '8min' },
        { time: '09:40', title: 'Dialogue Scene', status: 'pending', duration: '4min' },
      ].map((shot, i) => (
        <div key={i} className={`flex items-center gap-2 p-2 rounded-lg ${shot.status === 'current' ? 'bg-[#4E47DD]/20 border border-[#4E47DD]/30' : 'bg-white/[0.03]'}`}>
          <div className={`w-1 h-8 rounded-full ${shot.status === 'done' ? 'bg-green-500' : shot.status === 'current' ? 'bg-[#4E47DD]' : 'bg-white/20'}`} />
          <div className="text-[10px] text-white/40 font-mono w-8">{shot.time}</div>
          <div className="flex-1">
            <div className="text-[11px] text-white/80 font-medium leading-tight">{shot.title}</div>
            <div className="text-[9px] text-white/30">{shot.duration}</div>
          </div>
          {shot.status === 'done' && <div className="w-4 h-4 rounded-full bg-green-500/20 flex items-center justify-center"><div className="w-2 h-2 bg-green-500 rounded-full" /></div>}
        </div>
      ))}
    </div>
  </div>
)

const InventoryScreenshot = () => (
  <div className="w-full h-full bg-[#0D0D0F] rounded-[16px] p-3 overflow-hidden">
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
        <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
      </div>
      <div className="text-[10px] text-white/30 font-mono">Equipment</div>
    </div>
    <div className="grid grid-cols-2 gap-2">
      {[
        { name: 'Sony A7S III', type: 'Camera', status: 'available' },
        { name: '24-70mm GM', type: 'Lens', status: 'rented' },
        { name: 'Aputure 600D', type: 'Light', status: 'available' },
        { name: 'DJI RS3 Pro', type: 'Gimbal', status: 'maintenance' },
      ].map((item, i) => (
        <div key={i} className="p-2 rounded-lg bg-white/[0.03] border border-white/5">
          <div className="flex items-center gap-1.5 mb-1">
            <div className={`w-1.5 h-1.5 rounded-full ${item.status === 'available' ? 'bg-green-500' : item.status === 'rented' ? 'bg-yellow-500' : 'bg-red-500'}`} />
            <span className="text-[8px] text-white/40 uppercase">{item.type}</span>
          </div>
          <div className="text-[10px] text-white/70 font-medium leading-tight truncate">{item.name}</div>
          <div className={`text-[8px] mt-0.5 ${item.status === 'available' ? 'text-green-500/70' : item.status === 'rented' ? 'text-yellow-500/70' : 'text-red-500/70'}`}>
            {item.status}
          </div>
        </div>
      ))}
    </div>
  </div>
)

const TasksScreenshot = () => (
  <div className="w-full h-full bg-[#0D0D0F] rounded-[16px] p-3 overflow-hidden">
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
        <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
      </div>
      <div className="text-[10px] text-white/30 font-mono">Tasks</div>
    </div>
    <div className="space-y-2">
      {[
        { title: 'Color Grading', category: 'Color', status: 'progress', priority: 'high' },
        { title: 'Sound Mixing', category: 'Audio', status: 'todo', priority: 'medium' },
        { title: 'VFX Compositing', category: 'VFX', status: 'done', priority: 'high' },
        { title: 'Final Export', category: 'Delivery', status: 'todo', priority: 'low' },
      ].map((task, i) => (
        <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.03]">
          <div className={`w-4 h-4 rounded border ${task.status === 'done' ? 'bg-green-500/20 border-green-500/50' : 'border-white/20'} flex items-center justify-center`}>
            {task.status === 'done' && <div className="w-2 h-2 bg-green-500 rounded-sm" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className={`text-[10px] leading-tight truncate ${task.status === 'done' ? 'text-white/40 line-through' : 'text-white/80'}`}>{task.title}</div>
            <div className="text-[8px] text-white/30">{task.category}</div>
          </div>
          <div className={`text-[8px] px-1.5 py-0.5 rounded ${task.priority === 'high' ? 'bg-red-500/20 text-red-400' : task.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-blue-500/20 text-blue-400'}`}>
            {task.priority}
          </div>
        </div>
      ))}
    </div>
  </div>
)

const NotesScreenshot = () => (
  <div className="w-full h-full bg-[#0D0D0F] rounded-[16px] p-3 overflow-hidden">
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
        <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
      </div>
      <div className="text-[10px] text-white/30 font-mono">Notes</div>
    </div>
    <div className="space-y-2">
      {[
        { title: 'Shot List Notes', preview: 'Need to reschedule Scene 5 due to weather conditions...', date: '2h ago', hasImage: true },
        { title: 'Equipment Ideas', preview: 'Consider renting anamorphic lenses for the dream sequence...', date: '5h ago', hasImage: false },
        { title: 'Casting Notes', preview: 'Lead actor availability confirmed for next week...', date: '1d ago', hasImage: true },
      ].map((note, i) => (
        <div key={i} className="p-2.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.05] transition-colors">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="text-[11px] text-white/80 font-medium leading-tight">{note.title}</div>
            <div className="text-[8px] text-white/30 whitespace-nowrap">{note.date}</div>
          </div>
          <div className="text-[9px] text-white/40 leading-relaxed line-clamp-2">{note.preview}</div>
          {note.hasImage && (
            <div className="flex items-center gap-1 mt-1.5">
              <div className="w-6 h-6 rounded bg-white/10" />
              <div className="w-6 h-6 rounded bg-white/10" />
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
)

// Feature Card Component
interface FeatureCardProps {
  icon: React.ElementType
  title: string
  description: string
  screenshot: React.ReactNode
  delay?: number
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon: Icon, title, description, screenshot, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.7, delay, ease: [0.25, 0.1, 0.25, 1] }}
    className="group"
  >
    <div className="h-full overflow-hidden hover:scale-[1.02] transition-transform duration-500 bg-[#1C1C1E]/80 backdrop-blur-xl border border-white/10 rounded-[32px] shadow-sm">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-[#4E47DD]/20 flex items-center justify-center">
            <Icon size={24} className="text-[#4E47DD]" />
          </div>
          <h3 className="text-xl font-semibold text-white">{title}</h3>
        </div>
        <p className="text-white/60 text-sm leading-relaxed mb-6">{description}</p>
      </div>
      <div className="px-6 pb-6">
        <div className="aspect-[4/3] rounded-[20px] overflow-hidden shadow-2xl shadow-black/50 border border-white/5">
          {screenshot}
        </div>
      </div>
    </div>
  </motion.div>
)

export const LandingPage: React.FC = () => {
  const navigate = useNavigate()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
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

  // Fix overscroll background color
  useEffect(() => {
    document.documentElement.classList.add('dark')
    document.body.style.backgroundColor = '#141417'
    return () => {
      document.documentElement.classList.remove('dark')
      document.body.style.backgroundColor = ''
    }
  }, [])

  return (
    <div className="min-h-screen bg-[#141417] text-white overflow-x-hidden">
      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-[#141417]/80 backdrop-blur-xl border-b border-white/5' : ''
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#4E47DD] flex items-center justify-center">
                <Aperture size={24} className="text-white" />
              </div>
              <span className="text-xl font-semibold tracking-tight">Vemakin</span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              <button 
                onClick={() => scrollToSection('features')} 
                className="text-sm text-white/60 hover:text-white transition-colors"
              >
                Features
              </button>
              <button 
                onClick={() => scrollToSection('benefits')} 
                className="text-sm text-white/60 hover:text-white transition-colors"
              >
                Why Us
              </button>
              <button 
                onClick={() => scrollToSection('contact')} 
                className="text-sm text-white/60 hover:text-white transition-colors"
              >
                Contact
              </button>
            </div>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={() => navigate('/auth')}
                className="px-4 py-2 text-sm font-medium text-white/80 hover:text-white transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/auth')}
                className="px-5 py-2.5 text-sm font-semibold bg-[#4E47DD] hover:bg-[#3F39D1] rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
              >
                Get Started
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-white/5 bg-[#141417]/95 backdrop-blur-xl"
            >
              <div className="px-6 py-4 space-y-4">
                <button 
                  onClick={() => scrollToSection('features')} 
                  className="block w-full text-left text-white/80 py-2"
                >
                  Features
                </button>
                <button 
                  onClick={() => scrollToSection('benefits')} 
                  className="block w-full text-left text-white/80 py-2"
                >
                  Why Us
                </button>
                <button 
                  onClick={() => scrollToSection('contact')} 
                  className="block w-full text-left text-white/80 py-2"
                >
                  Contact
                </button>
                <hr className="border-white/10" />
                <button
                  onClick={() => navigate('/auth')}
                  className="block w-full text-left text-white/80 py-2"
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate('/auth')}
                  className="w-full py-3 text-center font-semibold bg-[#4E47DD] rounded-xl"
                >
                  Get Started
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20">
        {/* Background Effects */}
        <div className="absolute -inset-[100px] overflow-visible">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-[#4E47DD]/20 rounded-full blur-[150px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/5 rounded-full blur-[200px]" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8"
            >
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-sm text-white/60">Now in Public Beta</span>
            </motion.div>

            {/* Main Headline */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6 leading-[1.1]">
              <span className="bg-gradient-to-b from-white via-white to-white/60 bg-clip-text text-transparent">
                Production OS
              </span>
              <br />
              <span className="text-white/40">for Filmmakers</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
              The all-in-one platform for managing your film productions. 
              From shot lists to equipment tracking, streamline your workflow.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/auth')}
                className="group flex items-center gap-2 px-8 py-4 bg-[#4E47DD] hover:bg-[#3F39D1] rounded-2xl font-semibold text-lg transition-all duration-200"
              >
                Start Creating
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => scrollToSection('features')}
                className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-semibold text-lg transition-all duration-200"
              >
                Learn More
              </motion.button>
            </div>
          </motion.div>


        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 rounded-full border-2 border-white/20 flex justify-center pt-2">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full bg-white/40"
            />
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 relative">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Everything You Need
            </h2>
            <p className="text-white/50 text-lg max-w-2xl mx-auto">
              Powerful tools designed specifically for the unique challenges of film production management.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 gap-4 md:gap-6 max-w-5xl mx-auto">
            <FeatureCard
              icon={Film}
              title="Shot Timeline"
              description="Organize your scenes with an intuitive timeline. Track shot status, timing, and equipment needs all in one place."
              screenshot={<TimelineScreenshot />}
              delay={0}
            />
            <FeatureCard
              icon={Package}
              title="Equipment Inventory"
              description="Manage your gear with detailed specs, rental tracking, and availability status. Never lose track of an asset again."
              screenshot={<InventoryScreenshot />}
              delay={0.1}
            />
            <FeatureCard
              icon={Zap}
              title="Post Production"
              description="Track editing, sound, VFX, and color grading tasks. Manage deadlines and collaborate with your post team."
              screenshot={<TasksScreenshot />}
              delay={0.2}
            />
            <FeatureCard
              icon={StickyNote}
              title="Production Notes"
              description="Keep all your ideas, references, and documentation organized. Link notes to specific shots or equipment."
              screenshot={<NotesScreenshot />}
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-32 relative">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Built for Modern
              <br />
              <span className="text-[#4E47DD]">Filmmaking</span>
            </h2>
            <p className="text-white/50 text-lg max-w-2xl mx-auto">
              We understand the chaos of production. Vemakin brings order to your workflow 
              so you can focus on what matters most—creating great stories.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="border-t border-white/5 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#4E47DD] flex items-center justify-center">
                  <Aperture size={24} className="text-white" />
                </div>
                <span className="text-xl font-semibold">Vemakin</span>
              </div>
              <p className="text-white/40 text-sm max-w-sm leading-relaxed mb-6">
                The modern production operating system for filmmakers. 
                Plan, track, and execute your vision with precision.
              </p>
              <div className="flex items-center gap-4">
                <a href="#" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                  <Twitter size={18} className="text-white/60" />
                </a>
                <a href="#" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                  <Github size={18} className="text-white/60" />
                </a>
                <a href="#" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                  <Mail size={18} className="text-white/60" />
                </a>
              </div>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-3">
                <li><button onClick={() => scrollToSection('features')} className="text-sm text-white/40 hover:text-white transition-colors">Features</button></li>
                <li><button onClick={() => scrollToSection('benefits')} className="text-sm text-white/40 hover:text-white transition-colors">Why Vemakin</button></li>
                <li><span className="text-sm text-white/40">Pricing</span></li>
                <li><span className="text-sm text-white/40">Changelog</span></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-sm text-white/40">
                  <Mail size={14} />
                  hello@vemakin.com
                </li>
                <li className="text-sm text-white/40">San Francisco, CA</li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-white/30">
              2026 Vemakin. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <span className="text-sm text-white/30 hover:text-white/50 cursor-pointer transition-colors">Privacy Policy</span>
              <span className="text-sm text-white/30 hover:text-white/50 cursor-pointer transition-colors">Terms of Service</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
