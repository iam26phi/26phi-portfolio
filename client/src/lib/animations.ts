/**
 * Global animation configurations for consistent animations across the entire website
 * Uses framer-motion for smooth, performant animations
 */

import { Variants } from "framer-motion";

/**
 * Photo grid item animation variants
 * Used for masonry/grid layouts of photos
 */
export const photoItemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: {
      duration: 0.3,
    },
  },
};

/**
 * Photo grid container with stagger animation
 * Used for animating photo grids with sequential fade-in effect
 */
export const photoGridContainerVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

/**
 * Photo grid item with optimized fade-in animation
 * Uses GPU-accelerated properties (opacity, transform) for smooth performance
 */
export const photoGridItemVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: {
      duration: 0.3,
    },
  },
};

/**
 * Container animation variants
 * Used for parent containers that animate their children
 */
export const containerVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

/**
 * Fade in animation variants
 * Simple fade in effect for text and elements
 */
export const fadeInVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: "easeOut",
    },
  },
};

/**
 * Slide up animation variants
 * Elements slide up while fading in
 */
export const slideUpVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 50,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut",
    },
  },
};

/**
 * Scale animation variants
 * Elements scale up while fading in
 */
export const scaleVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    transition: {
      duration: 0.3,
    },
  },
};

/**
 * Common transition configurations
 */
export const transitions = {
  default: {
    duration: 0.5,
    ease: "easeOut",
  },
  fast: {
    duration: 0.3,
    ease: "easeOut",
  },
  slow: {
    duration: 0.8,
    ease: "easeOut",
  },
  spring: {
    type: "spring" as const,
    stiffness: 300,
    damping: 30,
  },
};

/**
 * Hover animation configurations
 */
export const hoverAnimations = {
  scale: {
    scale: 1.05,
    transition: transitions.fast,
  },
  lift: {
    y: -5,
    transition: transitions.fast,
  },
  glow: {
    boxShadow: "0 0 20px rgba(255, 255, 255, 0.3)",
    transition: transitions.fast,
  },
};

/**
 * Layout animation configuration
 * Used with motion.div layout prop for smooth layout transitions
 */
export const layoutTransition = {
  layout: true,
  transition: transitions.default,
};
