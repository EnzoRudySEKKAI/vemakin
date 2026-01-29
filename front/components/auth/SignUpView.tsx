
import React, { useState } from 'react';
import { ArrowLeft, Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard.tsx';

interface SignUpViewProps {
 onBack: () => void;
 onSignUp: (name: string, email: string) => void;
}

export const SignUpView: React.FC<SignUpViewProps> = ({ onBack, onSignUp }) => {
 const [name, setName] = useState('');
 const [email, setEmail] = useState('');
 const [password, setPassword] = useState('');
 const [isLoading, setIsLoading] = useState(false);

 const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  if (!name || !email || !password) return;

  setIsLoading(true);
  // Simulate API call
  setTimeout(() => {
   setIsLoading(false);
   onSignUp(name, email);
  }, 1000);
 };

 return (
  <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-[#F2F2F7] dark:bg-[#000000]">
   {/* Abstract Background - Matching SignInView */}
   <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-300/30 dark:bg-blue-600/20 rounded-full blur-[120px] animate-float pointer-events-none"/>
   <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-indigo-300/30 dark:bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none"/>

   <div className="w-full max-w-md relative z-10 animate-in slide-in-from-bottom-8 duration-700 fade-in">

    {/* Back Button */}
    <button
     onClick={onBack}
     className="group absolute top-[-80px] left-0 p-3 bg-white/60 dark:bg-[#1C1C1E]/60 backdrop-blur-md border border-white/40 dark:border-white/10 rounded-2xl text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all shadow-sm hover:scale-105 active:scale-95"
    >
     <ArrowLeft size={20} strokeWidth={2.5} className="group-hover:-translate-x-0.5 transition-transform"/>
    </button>

    <div className="mb-10 text-center">
     <h2 className="text-4xl font-semibold text-gray-900 dark:text-white mb-3 font-display">Create account</h2>
     <p className="text-base font-medium text-gray-500 dark:text-gray-400">Join Vemakin to manage your productions.</p>
    </div>

    <GlassCard className="p-8 bg-white/60 dark:bg-[#1A1A1D]/60 border-white/40 dark:border-white/10 shadow-2xl shadow-blue-500/5 backdrop-blur-xl">
     <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
       <label className="text-xs font-semibold text-gray-400 dark:text-gray-500 ml-1 block">Full name</label>
       <div className="relative group">
        <User className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#3762E3] dark:group-focus-within:text-[#4E47DD] transition-colors"size={18} strokeWidth={2.5} />
        <input
         type="text"
         value={name}
         onChange={(e) => setName(e.target.value)}
         className="w-full bg-gray-50/50 dark:bg-white/5 border-none ring-1 ring-black/5 dark:ring-white/10 rounded-2xl pl-12 pr-6 py-4 text-base font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3762E3]/20 dark:focus:ring-[#4E47DD]/40 focus:bg-white dark:focus:bg-[#2C2C2E] transition-all placeholder:font-medium placeholder:text-gray-400 dark:placeholder:text-gray-600"
         placeholder="Director Name"
        />
       </div>
      </div>

      <div className="space-y-2">
       <label className="text-xs font-semibold text-gray-400 dark:text-gray-500 ml-1 block">Email address</label>
       <div className="relative group">
        <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#3762E3] dark:group-focus-within:text-[#4E47DD] transition-colors"size={18} strokeWidth={2.5} />
        <input
         type="email"
         value={email}
         onChange={(e) => setEmail(e.target.value)}
         className="w-full bg-gray-50/50 dark:bg-white/5 border-none ring-1 ring-black/5 dark:ring-white/10 rounded-2xl pl-12 pr-6 py-4 text-base font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3762E3]/20 dark:focus:ring-[#4E47DD]/40 focus:bg-white dark:focus:bg-[#2C2C2E] transition-all placeholder:font-medium placeholder:text-gray-400 dark:placeholder:text-gray-600"
         placeholder="name@studio.com"
        />
       </div>
      </div>

      <div className="space-y-2">
       <label className="text-xs font-semibold text-gray-400 dark:text-gray-500 ml-1 block">Password</label>
       <div className="relative group">
        <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#3762E3] dark:group-focus-within:text-[#4E47DD] transition-colors"size={18} strokeWidth={2.5} />
        <input
         type="password"
         value={password}
         onChange={(e) => setPassword(e.target.value)}
         className="w-full bg-gray-50/50 dark:bg-white/5 border-none ring-1 ring-black/5 dark:ring-white/10 rounded-2xl pl-12 pr-6 py-4 text-base font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3762E3]/20 dark:focus:ring-[#4E47DD]/40 focus:bg-white dark:focus:bg-[#2C2C2E] transition-all placeholder:font-medium placeholder:text-gray-400 dark:placeholder:text-gray-600"
         placeholder="Create a strong password"
        />
       </div>
      </div>

      <button
       type="submit"
       disabled={isLoading || !name || !email || !password}
       className="w-full py-4 bg-[#3762E3] dark:bg-[#4E47DD] text-white rounded-2xl font-semibold text-sm shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 mt-4"
      >
       {isLoading ? <Loader2 size={18} className="animate-spin"/> : <>Create Account <ArrowRight size={18} strokeWidth={2.5} /></>}
      </button>
     </form>
    </GlassCard>
   </div>
  </div>
 );
};
