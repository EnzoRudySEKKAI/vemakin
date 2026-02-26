import React, { useState } from 'react';
import { Package, Film, ChevronRight } from 'lucide-react';

interface OnboardingPageProps {
  onContinueWithoutProject: () => void;
  onCreateProject: () => void;
}

export const OnboardingPage: React.FC<OnboardingPageProps> = ({
  onContinueWithoutProject,
  onCreateProject
}) => {
  const [focusedSide, setFocusedSide] = useState<'left' | 'right' | null>(null);

  const getSideOpacity = (side: 'left' | 'right') => {
    if (focusedSide === null) return 'opacity-100';
    return focusedSide === side ? 'opacity-100' : 'opacity-40';
  };

  const getSideStyles = (side: 'left' | 'right') => {
    const isFocused = focusedSide === side;
    const isOtherFocused = focusedSide !== null && focusedSide !== side;
    
    if (side === 'left') {
      return {
        wrapper: `
          ${isFocused ? 'bg-white dark:bg-[#16181D]' : 'bg-white dark:bg-[#16181D]'}
          ${isOtherFocused ? '' : ''}
          transition-all duration-300
        `,
        iconBox: `
          ${isFocused ? 'bg-primary/5 dark:bg-primary/10' : 'bg-gray-50 dark:bg-white/5'}
          ${isOtherFocused ? 'bg-gray-50/50 dark:bg-white/[0.02]' : ''}
          transition-all duration-300
        `,
        icon: `
          ${isFocused ? 'text-primary' : 'text-gray-500 dark:text-white/50'}
          ${isOtherFocused ? 'text-gray-300 dark:text-white/20' : ''}
          transition-all duration-300
        `,
        title: `
          ${isFocused ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-white/70'}
          ${isOtherFocused ? 'text-gray-400 dark:text-white/30' : ''}
          transition-all duration-300
        `,
        description: `
          ${isFocused ? 'text-gray-600 dark:text-white/60' : 'text-gray-500 dark:text-white/40'}
          ${isOtherFocused ? 'text-gray-300 dark:text-white/20' : ''}
          transition-all duration-300
        `,
        feature: `
          ${isFocused ? 'text-gray-500 dark:text-white/50' : 'text-gray-400 dark:text-white/30'}
          ${isOtherFocused ? 'text-gray-300 dark:text-white/15' : ''}
          transition-all duration-300
        `,
        dot: `
          ${isFocused ? 'bg-primary' : 'bg-gray-300 dark:bg-white/20'}
          ${isOtherFocused ? 'bg-gray-200 dark:bg-white/10' : ''}
          transition-all duration-300
        `,
        cta: `
          ${isFocused ? 'border-primary text-primary gap-2 lg:gap-3' : 'border-gray-300 dark:border-white/20 text-gray-500 dark:text-white/50 gap-1.5 lg:gap-2'}
          ${isOtherFocused ? 'border-gray-200 dark:border-white/10 text-gray-300 dark:text-white/20' : ''}
          transition-all duration-300
        `
      };
    } else {
      return {
        wrapper: `
          ${isFocused ? 'bg-white dark:bg-[#16181D]' : 'bg-white dark:bg-[#16181D]'}
          ${isOtherFocused ? '' : ''}
          transition-all duration-300
        `,
        iconBox: `
          ${isFocused ? 'bg-primary/5 dark:bg-primary/10' : 'bg-gray-50 dark:bg-white/5'}
          ${isOtherFocused ? 'bg-gray-50/50 dark:bg-white/[0.02]' : ''}
          transition-all duration-300
        `,
        icon: `
          ${isFocused ? 'text-primary' : 'text-gray-500 dark:text-white/50'}
          ${isOtherFocused ? 'text-gray-300 dark:text-white/20' : ''}
          transition-all duration-300
        `,
        title: `
          ${isFocused ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-white/70'}
          ${isOtherFocused ? 'text-gray-400 dark:text-white/30' : ''}
          transition-all duration-300
        `,
        description: `
          ${isFocused ? 'text-gray-600 dark:text-white/60' : 'text-gray-500 dark:text-white/40'}
          ${isOtherFocused ? 'text-gray-300 dark:text-white/20' : ''}
          transition-all duration-300
        `,
        feature: `
          ${isFocused ? 'text-gray-500 dark:text-white/50' : 'text-gray-400 dark:text-white/30'}
          ${isOtherFocused ? 'text-gray-300 dark:text-white/15' : ''}
          transition-all duration-300
        `,
        dot: `
          ${isFocused ? 'bg-primary' : 'bg-gray-300 dark:bg-white/20'}
          ${isOtherFocused ? 'bg-gray-200 dark:bg-white/10' : ''}
          transition-all duration-300
        `,
        cta: `
          ${isFocused ? 'border-primary text-primary gap-2 lg:gap-3' : 'border-gray-300 dark:border-white/20 text-gray-500 dark:text-white/50 gap-1.5 lg:gap-2'}
          ${isOtherFocused ? 'border-gray-200 dark:border-white/10 text-gray-300 dark:text-white/20' : ''}
          transition-all duration-300
        `
      };
    }
  };

  const leftStyles = getSideStyles('left');
  const rightStyles = getSideStyles('right');

  return (
    <div className="h-[100dvh] w-screen overflow-hidden bg-[#F2F2F7] dark:bg-[#0F1116] flex flex-col lg:flex-row">
      {/* Left Side - Continue without project */}
      <div
        onMouseEnter={() => setFocusedSide('left')}
        onMouseLeave={() => setFocusedSide(null)}
        className={`
          h-[50dvh] lg:h-full lg:flex-1 relative overflow-hidden
          ${leftStyles.wrapper}
          ${getSideOpacity('left')}
          text-left
          cursor-default
        `}
      >
        {/* Top gradient fade */}
        <div className="absolute inset-x-0 top-0 h-8 lg:h-12 bg-gradient-to-b from-[#F2F2F7] dark:from-[#0F1116] to-transparent lg:hidden pointer-events-none z-10" />
        
        <div className="h-full flex flex-col p-5 lg:p-12 xl:p-16 pb-[max(1.25rem,env(safe-area-inset-bottom))] lg:pb-12">
          <div className="flex-1 flex flex-col">
            {/* Icon */}
            <div className={`w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center mb-4 lg:mb-8 ${leftStyles.iconBox}`}>
              <Package className={`w-5 h-5 lg:w-6 lg:h-6 ${leftStyles.icon}`} />
            </div>

            {/* Title */}
            <h2 className={`text-xl lg:text-3xl xl:text-4xl font-mono font-semibold tracking-tight mb-2 lg:mb-4 ${leftStyles.title}`}>
              Start with the inventory only
            </h2>

            {/* Description - shorter on mobile */}
            <p className={`font-mono text-sm lg:text-base leading-relaxed mb-4 lg:mb-8 max-w-md ${leftStyles.description}`}>
              <span className="hidden lg:inline">Use the app without a project. Access your equipment inventory, track gear, and organize your kit. Create a project later when you're ready to shoot.</span>
              <span className="lg:hidden">Access equipment inventory and track gear without a project.</span>
            </p>

            {/* Features list - vertical on all screens */}
            <div className="space-y-1 lg:space-y-3 mb-4 lg:mb-8">
              {[
                'Manage equipment inventory',
                'Track gear status & location',
                'Organize by categories',
                'Check availability status'
              ].map((feature, index) => (
                <div key={index} className={`flex items-center gap-2 lg:gap-3 font-mono text-xs lg:text-sm ${leftStyles.feature}`}>
                  <span className={`text-primary ${focusedSide === 'right' ? 'opacity-30' : focusedSide === 'left' ? 'opacity-100' : 'opacity-70'}`}>{'>'}</span>
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* CTA */}
            <button
              onClick={onContinueWithoutProject}
              className={`
                flex items-center font-mono text-sm lg:text-base font-medium w-fit
                border rounded px-3 py-1.5
                ${leftStyles.cta}
              `}
            >
              <span className="tracking-wide">Continue to Inventory</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Right Side - Create project */}
      <div
        onMouseEnter={() => setFocusedSide('right')}
        onMouseLeave={() => setFocusedSide(null)}
        className={`
          h-[50dvh] lg:h-full lg:flex-1 relative overflow-hidden
          ${rightStyles.wrapper}
          ${getSideOpacity('right')}
          text-left
          cursor-default
        `}
        >
        <div className="h-full flex flex-col p-5 lg:p-12 xl:p-16 pb-[max(1.25rem,env(safe-area-inset-bottom))] lg:pb-12">
          <div className="flex-1 flex flex-col">
            {/* Icon */}
            <div className={`w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center mb-4 lg:mb-8 ${rightStyles.iconBox}`}>
              <Film className={`w-5 h-5 lg:w-6 lg:h-6 ${rightStyles.icon}`} />
            </div>

            {/* Title */}
            <h2 className={`text-xl lg:text-3xl xl:text-4xl font-mono font-semibold tracking-tight mb-2 lg:mb-4 ${rightStyles.title}`}>
              Create a Project
            </h2>

            {/* Description - shorter on mobile */}
            <p className={`font-mono text-sm lg:text-base leading-relaxed mb-4 lg:mb-8 max-w-md ${rightStyles.description}`}>
              <span className="hidden lg:inline">Unlock 100% of Vemakin's features. Create shots, manage tasks, organize notes, and track your entire production workflow in one place.</span>
              <span className="lg:hidden">Create shots, manage tasks, and track your production workflow.</span>
            </p>

            {/* Features list - vertical on all screens */}
            <div className="space-y-1 lg:space-y-3 mb-4 lg:mb-8">
              {[
                'Plan shots & scenes',
                'Manage production tasks',
                'Organize project notes',
                'Full timeline view'
              ].map((feature, index) => (
                <div key={index} className={`flex items-center gap-2 lg:gap-3 font-mono text-xs lg:text-sm ${rightStyles.feature}`}>
                  <span className={`text-primary ${focusedSide === 'left' ? 'opacity-30' : focusedSide === 'right' ? 'opacity-100' : 'opacity-70'}`}>{'>'}</span>
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* CTA */}
            <button
              onClick={onCreateProject}
              className={`
                flex items-center font-mono text-sm lg:text-base font-medium w-fit
                border rounded px-3 py-1.5
                ${rightStyles.cta}
              `}
            >
              <span className="tracking-wide">Create Your First Project</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        {/* Bottom gradient fade */}
        <div className="absolute inset-x-0 bottom-0 h-8 lg:h-12 bg-gradient-to-t from-[#F2F2F7] dark:from-[#0F1116] to-transparent lg:hidden pointer-events-none z-10" />
      </div>
    </div>
  );
};

export default OnboardingPage;
