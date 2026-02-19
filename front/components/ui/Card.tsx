import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface CardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  title?: React.ReactNode;
  headerRight?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = "",
  title,
  headerRight,
  ...props
}) => {
  return (
    <motion.div
      className={`bg-white dark:bg-[#16181D] border border-gray-200 dark:border-white/[0.05] rounded-2xl overflow-hidden flex flex-col ${className}`}
      {...props}
    >
      {(title || headerRight) && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-white/[0.05] shrink-0">
          {title && (
            <span className="text-xs font-medium text-gray-500 dark:text-white/40 tracking-wider">
              {title}
            </span>
          )}
          {headerRight && (
            <div className="flex items-center">
              {headerRight}
            </div>
          )}
        </div>
      )}
      <div className="bg-gray-50 dark:bg-[#0F1116] flex-1">
        {children}
      </div>
    </motion.div>
  );
};

// SimpleCard - even cleaner, no header
export const SimpleCard: React.FC<CardProps> = ({
  children,
  className = "",
  ...props
}) => {
  return (
    <motion.div
      className={`bg-white dark:bg-[#16181D] border border-gray-200 dark:border-white/[0.05] rounded-xl p-4 ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// ListItem - for lists
export const ListItem: React.FC<CardProps> = ({
  children,
  className = "",
  ...props
}) => {
  return (
    <motion.div
      className={`bg-white dark:bg-[#16181D] border border-gray-200 dark:border-white/[0.05] rounded-xl p-3 hover:border-gray-300 dark:hover:border-white/[0.1] transition-colors cursor-pointer ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default Card;
