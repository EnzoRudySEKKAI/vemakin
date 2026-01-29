
import React, { useState } from 'react';
import { ArrowLeft, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard.tsx';

interface SignInViewProps {
 onBack: () => void;
 onSignIn: (name: string, email: string) => void;
}

export const SignInView: React.FC<SignInViewProps> = ({ onBack, onSignIn }) => {
 const [email, setEmail] = useState('');
 const [password, setPassword] = useState('');
 const [isLoading, setIsLoading] = useState(false);

 const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  if (!email || !password) return;

  setIsLoading(true);
  // Simulate API call
  setTimeout(() => {
   setIsLoading(false);
   // Mock user data based on email
   const name = email.split('@')[0].replace('.', ' ');
   const formattedName = name.charAt(0).toUpperCase() + name.slice(1);
   onSignIn(formattedName, email);
  }, 1000);
 };

 return (
  <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-[#F2F2F7] dark:bg-[#000000]">
   {/* Abstract Background - Matching LandingView */}
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
     <h2 className="text-4xl font-semibold text-gray-900 dark:text-white mb-3 font-display">Welcome back</h2>
     <p className="text-base font-medium text-gray-500 dark:text-gray-400">Enter your credentials to access your productions.</p>
    </div>

    <GlassCard className="p-8 bg-white/60 dark:bg-[#1A1A1D]/60 border-white/40 dark:border-white/10 shadow-2xl shadow-blue-500/5 backdrop-blur-xl">
     <form onSubmit={handleSubmit} className="space-y-6">
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
       <div className="flex justify-between ml-1 items-center">
        <label className="text-xs font-semibold text-gray-400 dark:text-gray-500">Password</label>
        <button type="button"className="text-xs font-semibold text-[#3762E3] dark:text-[#4E47DD] hover:underline transition-all">Forgot password?</button>
       </div>
       <div className="relative group">
        <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#3762E3] dark:group-focus-within:text-[#4E47DD] transition-colors"size={18} strokeWidth={2.5} />
        <input
         type="password"
         value={password}
         onChange={(e) => setPassword(e.target.value)}
         className="w-full bg-gray-50/50 dark:bg-white/5 border-none ring-1 ring-black/5 dark:ring-white/10 rounded-2xl pl-12 pr-6 py-4 text-base font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3762E3]/20 dark:focus:ring-[#4E47DD]/40 focus:bg-white dark:focus:bg-[#2C2C2E] transition-all placeholder:font-medium placeholder:text-gray-400 dark:placeholder:text-gray-600"
         placeholder="••••••••"
        />
       </div>
      </div>

      <button
       type="submit"
       disabled={isLoading || !email || !password}
       className="w-full py-4 bg-[#3762E3] dark:bg-[#4E47DD] text-white rounded-2xl font-semibold text-sm shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 mt-4"
      >
       {isLoading ? <Loader2 size={18} className="animate-spin"/> : <>Sign In <ArrowRight size={18} strokeWidth={2.5} /></>}
      </button>
     </form>
    </GlassCard>
   </div>
  </div>
 );
};
