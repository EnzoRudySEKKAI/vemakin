
import React from 'react';

import { motion, HTMLMotionProps } from 'framer-motion';

// Use React.FC to ensure the 'key' prop is recognized by TypeScript when rendering in lists
export const GlassCard: React.FC<HTMLMotionProps<"div">> = ({
 children,
 className ="",
 onClick,
 ...props
}) => (
 <motion.div
  onClick={onClick}
  className={`bg-white/80 dark:bg-[#1A1A1D]/90 backdrop-blur-xl border border-white/20 dark:border-white/5 rounded-[32px] shadow-sm ${className}`}
  {...props}
 >
  {children}
 </motion.div>
);
