import React from 'react';
import { motion } from 'framer-motion';
import { Package, Film, ChevronRight } from 'lucide-react';
import { Logo } from '@/components/atoms';

interface OnboardingPageProps {
  onContinueWithoutProject: () => void;
  onCreateProject: () => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

export const OnboardingPage: React.FC<OnboardingPageProps> = ({
  onContinueWithoutProject,
  onCreateProject
}) => {
  return (
    <div className="min-h-screen bg-[#F2F2F7] dark:bg-[#0F1116] flex flex-col">
      {/* Header with Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="pt-8 pb-4 px-6 flex justify-center"
      >
        <Logo size="lg" className="opacity-90" />
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row px-4 sm:px-6 lg:px-8 xl:px-12 gap-4 lg:gap-6 pb-8">
        {/* Left Side - Continue without project */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="flex-1"
        >
          <button
            onClick={onContinueWithoutProject}
            className="w-full h-full min-h-[320px] lg:min-h-0 group relative overflow-hidden rounded-3xl bg-white dark:bg-[#16181D] border border-gray-200 dark:border-white/[0.08] hover:border-gray-300 dark:hover:border-white/[0.15] transition-all duration-300 text-left"
          >
            {/* Background gradient on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-blue-500/0 to-blue-500/5 dark:from-blue-500/0 dark:via-blue-500/0 dark:to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            {/* Content */}
            <div className="relative h-full flex flex-col p-8 lg:p-10">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="flex-1 flex flex-col"
              >
                {/* Icon */}
                <motion.div
                  variants={itemVariants}
                  className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/[0.08] flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-blue-50 dark:group-hover:bg-blue-500/10 group-hover:border-blue-200 dark:group-hover:border-blue-500/20 transition-all duration-300"
                >
                  <Package className="w-7 h-7 text-gray-600 dark:text-white/60 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300" />
                </motion.div>

                {/* Title */}
                <motion.h2
                  variants={itemVariants}
                  className="text-2xl lg:text-3xl font-semibold text-gray-900 dark:text-white mb-3"
                >
                  Start with Inventory
                </motion.h2>

                {/* Description */}
                <motion.p
                  variants={itemVariants}
                  className="text-gray-500 dark:text-white/50 text-base lg:text-lg leading-relaxed mb-6"
                >
                  Use the app without a project. Access your equipment inventory, track gear, and organize your kit. Create a project later when you're ready to shoot.
                </motion.p>

                {/* Features list */}
                <motion.div
                  variants={itemVariants}
                  className="space-y-2 mb-8"
                >
                  {[
                    'Manage equipment inventory',
                    'Track gear status & location',
                    'Organize by categories'
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-gray-400 dark:text-white/40">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-white/20" />
                      {feature}
                    </div>
                  ))}
                </motion.div>

                {/* Spacer */}
                <div className="flex-1" />

                {/* CTA */}
                <motion.div
                  variants={itemVariants}
                  className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium group-hover:gap-3 transition-all duration-300"
                >
                  <span>Continue to Inventory</span>
                  <ChevronRight className="w-5 h-5" />
                </motion.div>
              </motion.div>
            </div>
          </button>
        </motion.div>

        {/* Right Side - Create project */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.1 }}
          className="flex-1"
        >
          <button
            onClick={onCreateProject}
            className="w-full h-full min-h-[320px] lg:min-h-0 group relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-600 dark:to-blue-800 text-left"
          >
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            
            {/* Glow effect */}
            <div className="absolute inset-0 bg-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl" />
            
            {/* Content */}
            <div className="relative h-full flex flex-col p-8 lg:p-10">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="flex-1 flex flex-col"
              >
                {/* Icon */}
                <motion.div
                  variants={itemVariants}
                  className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-white/20 transition-all duration-300"
                >
                  <Film className="w-7 h-7 text-white" />
                </motion.div>

                {/* Title */}
                <motion.h2
                  variants={itemVariants}
                  className="text-2xl lg:text-3xl font-semibold text-white mb-3"
                >
                  Create a Project
                </motion.h2>

                {/* Description */}
                <motion.p
                  variants={itemVariants}
                  className="text-blue-100 text-base lg:text-lg leading-relaxed mb-6"
                >
                  Unlock 100% of Vemakin's features. Create shots, manage tasks, organize notes, and track your entire production workflow in one place.
                </motion.p>

                {/* Features list */}
                <motion.div
                  variants={itemVariants}
                  className="space-y-2 mb-8"
                >
                  {[
                    'Plan shots & scenes',
                    'Manage production tasks',
                    'Organize project notes',
                    'Full timeline view'
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-blue-200/80">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-300" />
                      {feature}
                    </div>
                  ))}
                </motion.div>

                {/* Spacer */}
                <div className="flex-1" />

                {/* CTA */}
                <motion.div
                  variants={itemVariants}
                  className="flex items-center gap-2 text-white font-medium group-hover:gap-3 transition-all duration-300"
                >
                  <span>Create Your First Project</span>
                  <ChevronRight className="w-5 h-5" />
                </motion.div>
              </motion.div>
            </div>
          </button>
        </motion.div>
      </div>

      {/* Footer hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="pb-6 text-center"
      >
        <p className="text-sm text-gray-400 dark:text-white/30">
          You can always create a project later from the menu
        </p>
      </motion.div>
    </div>
  );
};

export default OnboardingPage;
