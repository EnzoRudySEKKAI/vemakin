
import React from 'react';
import { ChevronDown } from 'lucide-react';

interface TimeSelectorProps {
 label?: string;
 value: string;
 onChange: (val: string) => void;
}

export const TimeSelector: React.FC<TimeSelectorProps> = ({ label, value, onChange }) => {
 const [h, m] = value.split(':');

 const setHours = (newH: string) => onChange(`${newH}:${m}`);
 const setMinutes = (newM: string) => onChange(`${h}:${newM}`);

 return (
  <div>
   {label && <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1 mb-2 block">{label}</label>}
   <div className="flex items-center gap-1.5 bg-white/70 dark:bg-white/5 border border-white/60 dark:border-white/10 rounded-2xl p-1.5">
    <div className="relative flex-1 group">
     <select
      value={h}
      onChange={(e) => setHours(e.target.value)}
      className="w-full appearance-none bg-gray-50 dark:bg-[#3C3C40] border border-transparent rounded-2xl py-3 pl-4 pr-8 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:bg-blue-50 dark:focus:bg-yellow-500/10 focus:text-blue-600 dark:text-indigo-600 dark:focus:text-yellow-400 cursor-pointer transition-all"
     >
      {Array.from({ length: 24 }).map((_, i) => {
       const val = String(i).padStart(2, '0');
       return <option key={val} value={val}>{val}</option>;
      })}
     </select>
     <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-500 pointer-events-none group-hover:text-blue-500 dark:text-indigo-500 dark:group-hover:text-yellow-400 transition-colors"/>
    </div>
    <span className="text-gray-300 dark:text-gray-500 font-semibold mb-0.5 text-xs">:</span>
    <div className="relative flex-1 group">
     <select
      value={m}
      onChange={(e) => setMinutes(e.target.value)}
      className="w-full appearance-none bg-gray-50 dark:bg-[#3C3C40] border border-transparent rounded-2xl py-3 pl-4 pr-8 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:bg-blue-50 dark:focus:bg-yellow-500/10 focus:text-blue-600 dark:text-indigo-600 dark:focus:text-yellow-400 cursor-pointer transition-all"
     >
      {Array.from({ length: 12 }).map((_, i) => {
       const val = String(i * 5).padStart(2, '0');
       return <option key={val} value={val}>{val}</option>;
      })}
     </select>
     <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-500 pointer-events-none group-hover:text-blue-500 dark:text-indigo-500 dark:group-hover:text-yellow-400 transition-colors"/>
    </div>
   </div>
  </div>
 );
};
