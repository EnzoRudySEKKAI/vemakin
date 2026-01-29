export const pageVariants = {
  initial: {
    opacity: 0,
    y: 8,
    scale: 0.98,
    filter: 'blur(4px)'
  },
  enter: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      duration: 0.4,
      ease: [0.25, 0.4, 0.25, 1], // easeOutQuad-ish but smoother
      staggerChildren: 0.1
    }
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    filter: 'blur(4px)',
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 1, 1] // easeIn expo
    }
  }
};
