
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  iconColor?: string; // e.g., 'blue', 'orange', 'indigo'
}

/**
 * Shared empty state component for consistent messaging across views
 * Used when lists/grids have no items to display
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  subtitle,
  action,
  iconColor = 'blue'
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-yellow-500/10 text-blue-600 dark:text-indigo-600 dark:text-blue-400 dark:text-indigo-400 shadow-blue-100 dark:shadow-indigo-900/20 dark:shadow-none border-blue-100 dark:border-yellow-500/20',
    orange: 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 shadow-orange-100 dark:shadow-none border-orange-100 dark:border-orange-500/20',
    indigo: 'bg-indigo-50 dark:bg-blue-500 dark:bg-indigo-500/10 text-blue-600 dark:text-indigo-600 dark:text-blue-400 dark:text-indigo-400 shadow-blue-100 dark:shadow-indigo-900/20 dark:shadow-none border-indigo-100 dark:border-blue-500 dark:border-indigo-500/20',
    gray: 'bg-gray-50 dark:bg-gray-500/10 text-gray-500 dark:text-gray-400 shadow-gray-100 dark:shadow-none border-gray-100 dark:border-gray-500/20'
  };

  const iconClass = colorClasses[iconColor as keyof typeof colorClasses] || colorClasses.blue;

  return (
    <div className="col-span-full py-24 text-center flex flex-col items-center animate-in zoom-in-95 duration-500">
      <div className={`w-20 h-20 rounded-[40px] shadow-xl flex items-center justify-center mb-8 border ${iconClass}`}>
        <Icon size={40} strokeWidth={1} />
      </div>
      <p className="text-sm font-semibold text-gray-900 dark:text-white">
        {title}
      </p>
      {subtitle && (
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
          {subtitle}
        </p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-8 flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-indigo-600 to-indigo-600 dark:from-yellow-400 dark:to-orange-500 text-white dark:text-gray-900 rounded-[24px] font-semibold text-[11px] shadow-[0_12px_24px_rgba(37,99,235,0.4)] dark:shadow-[0_12px_24px_rgba(250,204,21,0.2)] hover:shadow-[0_16px_32px_rgba(37,99,235,0.6)] dark:hover:shadow-[0_16px_32px_rgba(250,204,21,0.4)] active:scale-[0.98] transition-all"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};
