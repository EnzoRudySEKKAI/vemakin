import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface WindowCardProps extends HTMLMotionProps<"div"> {
  title?: string;
  showTrafficLights?: boolean;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  variant?: 'default' | 'clean';
}

// Traffic Light Dot Component
const TrafficLight: React.FC<{ color: string }> = ({ color }) => (
  <div 
    className="w-3 h-3 rounded-full"
    style={{ backgroundColor: color }}
  />
);

export const WindowCard: React.FC<WindowCardProps> = ({
  title,
  showTrafficLights = true,
  headerRight,
  children,
  className = "",
  contentClassName = "",
  ...props
}) => {
  return (
    <motion.div
      className={`bg-[#16181D] border border-white/[0.08] rounded-2xl overflow-hidden ${className}`}
      {...props}
    >
      {/* Header with Traffic Lights */}
      {(showTrafficLights || title || headerRight) && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.08] bg-[#16181D]">
          {/* Left: Traffic Lights */}
          {showTrafficLights && (
            <div className="flex items-center gap-1.5">
              <TrafficLight color="#FF5F56" />
              <TrafficLight color="#FFBD2E" />
              <TrafficLight color="#27CA40" />
            </div>
          )}

          {/* Center: Title */}
          {title && (
            <span className="text-xs font-medium text-white/40 uppercase tracking-wider">
              {title}
            </span>
          )}

          {/* Right: Custom Content */}
          {headerRight && (
            <div className="flex items-center">
              {headerRight}
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className={`bg-[#0F1116] ${contentClassName}`}>
        {children}
      </div>
    </motion.div>
  );
};

export default WindowCard;
