import React from 'react';
import { motion } from 'framer-motion';

export const LoadingScreen = () => {
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#F2F2F7] dark:bg-[#141417]">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center gap-6"
            >
                {/* Logo / Brand Mark */}
                <div className="relative w-16 h-16 flex items-center justify-center">
                    <motion.div
                        className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 dark:from-indigo-500 dark:to-purple-600"
                        animate={{
                            rotate: [0, 180, 360],
                            borderRadius: ["30%", "50%", "30%"],
                        }}
                        transition={{
                            duration: 3,
                            ease: "easeInOut",
                            repeat: Infinity,
                        }}
                        style={{ opacity: 0.2, filter: 'blur(20px)' }}
                    />
                    <motion.div
                        className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-700 dark:from-indigo-400 dark:to-purple-500 shadow-xl flex items-center justify-center text-white"
                        animate={{
                            scale: [1, 1.05, 1],
                        }}
                        transition={{
                            duration: 2,
                            ease: "easeInOut",
                            repeat: Infinity,
                        }}
                    >
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="w-6 h-6"
                        >
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                        </svg>
                    </motion.div>
                </div>

                {/* Text */}
                <div className="flex flex-col items-center gap-2">
                    <h1 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 dark:from-white dark:via-gray-400 dark:to-white">
                        Vemakin
                    </h1>
                    <div className="flex items-center gap-1">
                        <span className="text-xs font-medium text-gray-400 dark:text-gray-600 uppercase tracking-widest">
                            Loading Studio
                        </span>
                        <motion.span
                            animate={{ opacity: [0, 1, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="text-xs text-gray-400 dark:text-gray-600"
                        >
                            ...
                        </motion.span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
