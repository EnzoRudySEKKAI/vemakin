
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
  {...props}
   className={`bg-white/80 dark:bg-[#16181D]/95 backdrop-blur-xl border border-white/20 dark:border-white/[0.08] rounded-[32px] shadow-sm ${className}`}
 >
  {children}
 </motion.div>
);
