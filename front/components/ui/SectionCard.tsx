
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface SectionCardProps {
  children: React.ReactNode;
  icon: LucideIcon;
  title: string;
  color?: 'blue' | 'indigo' | 'emerald' | 'orange' | 'gray';
  className?: string;
  /** Optional element to render at the end of the header */
  headerAction?: React.ReactNode;
}

const colorStyles = {
  blue: 'bg-blue-50 dark:bg-blue-500 dark:bg-indigo-500/10 text-blue-600 dark:text-indigo-600 dark:text-blue-400 dark:text-indigo-400',
  indigo: 'bg-indigo-50 dark:bg-blue-500 dark:bg-indigo-500/10 text-blue-600 dark:text-indigo-600 dark:text-blue-400 dark:text-indigo-400',
  emerald: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  orange: 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400',
  gray: 'bg-gray-50 dark:bg-gray-500/10 text-gray-600 dark:text-gray-400'
};

/**
 * Shared section card component for consistent form sections
 * Primarily used in ActionSuite and drawer components
 */
export const SectionCard: React.FC<SectionCardProps> = ({
  children,
  icon: Icon,
  title,
  color = 'blue',
  className = '',
  headerAction
}) => {
  return (
    <div className={`rounded-[24px] p-5 bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/40 dark:border-white/10 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-xl ${colorStyles[color]}`}>
            <Icon size={16} />
          </div>
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
            {title}
          </span>
        </div>
        {headerAction}
      </div>
      {children}
    </div>
  );
};
