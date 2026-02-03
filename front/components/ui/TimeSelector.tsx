
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
    <div className="w-full">
     {label && <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 block">{label}</label>}
     <div className="flex items-center gap-1">
      <div className="relative flex-1 min-w-0">
       <select
        value={h}
        onChange={(e) => setHours(e.target.value)}
        className="w-full appearance-none bg-transparent border-b border-gray-200 dark:border-white/10 py-1.5 text-base font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-[#3762E3] dark:focus:border-[#4E47DD] cursor-pointer"
       >
        {Array.from({ length: 24 }).map((_, i) => {
         const val = String(i).padStart(2, '0');
         return <option key={val} value={val}>{val}</option>;
        })}
       </select>
       <ChevronDown size={14} className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none"/>
      </div>
      <span className="text-gray-400 dark:text-gray-500 font-semibold text-lg leading-none pb-1">:</span>
      <div className="relative flex-1 min-w-0">
       <select
        value={m}
        onChange={(e) => setMinutes(e.target.value)}
        className="w-full appearance-none bg-transparent border-b border-gray-200 dark:border-white/10 py-1.5 text-base font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-[#3762E3] dark:focus:border-[#4E47DD] cursor-pointer"
       >
        {Array.from({ length: 12 }).map((_, i) => {
         const val = String(i * 5).padStart(2, '0');
         return <option key={val} value={val}>{val}</option>;
        })}
       </select>
       <ChevronDown size={14} className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none"/>
      </div>
     </div>
    </div>
   );
};
