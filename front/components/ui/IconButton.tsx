
import React from 'react';

export const IconButton = ({
  icon: Icon,
  active,
  onClick,
  className =""
}: {
  icon: any,
  active?: boolean,
  onClick?: React.MouseEventHandler<HTMLButtonElement>,
  className?: string
}) => (
  <button
    onClick={onClick}
    className={`p-3.5 rounded-2xl transition-all duration-300 ${active ? 'bg-blue-600 dark:bg-blue-600 dark:bg-indigo-600 text-white dark:text-white shadow-lg shadow-blue-200 dark:shadow-indigo-900/40' : 'bg-gray-100/80 dark:bg-white/10 text-gray-400 dark:text-gray-500 hover:bg-gray-200 dark:hover:bg-white/20'} ${className}`}
  >
    <Icon size={20} />
  </button>
);
