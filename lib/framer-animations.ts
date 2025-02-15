import type { Variants, Target, Transition } from "framer-motion"

export const transitions = {
  default: {
    duration: 0.3,
    ease: [0.43, 0.13, 0.23, 0.96]
  },
  slow: {
    duration: 0.6,
    ease: [0.43, 0.13, 0.23, 0.96]
  },
  spring: {
    type: "spring",
    stiffness: 100,
    damping: 15,
    mass: 1
  }
} as const

type AnimationVariant = {
  initial: Record<string, any>
  animate: Record<string, any>
  exit: Record<string, any>
  transition?: Transition
}

// Common animation variants
export const fadeInOut: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
} as const

export const slideInFromBottom: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
} as const

export const slideInFromRight: Variants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 }
} as const

export const scaleInOut: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 }
} as const

export const popIn: Variants = {
  initial: { opacity: 0, scale: 0.9, y: 10 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.9, y: 10 }
} as const

// Layout animations for lists
export const listItem: Variants = {
  initial: {
    opacity: 0,
    y: 20
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: transitions.default
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: transitions.default
  }
} as const

// Staggered children animations
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  }
} as const

// Modal/Dialog animations
export const modalBackdrop: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
} as const

export const modalContent: Variants = {
  initial: { opacity: 0, scale: 0.95, y: 10 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: 10 }
} as const

// Toast/Notification animations
export const toastSlide: Variants = {
  initial: { opacity: 0, x: 100 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 100 }
} as const

// Hover animations
export const hoverScale = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.98 }
} as const

// Page transitions
export const pageTransition: Variants = {
  initial: {
    opacity: 0,
    y: 20
  },
  animate: {
    opacity: 1,
    y: 0
  },
  exit: {
    opacity: 0,
    y: -20
  }
} as const

export const fadeIn: Variants = {
  initial: {
    opacity: 0
  },
  animate: {
    opacity: 1,
    transition: transitions.default
  },
  exit: {
    opacity: 0,
    transition: transitions.default
  }
}

export const slideUp: Variants = {
  initial: {
    opacity: 0,
    y: 20
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: transitions.default
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: transitions.default
  }
}

export const slideDown: Variants = {
  initial: {
    opacity: 0,
    y: -20
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: transitions.default
  },
  exit: {
    opacity: 0,
    y: 20,
    transition: transitions.default
  }
}

export const slideLeft: Variants = {
  initial: {
    opacity: 0,
    x: 20
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: transitions.default
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: transitions.default
  }
}

export const slideRight: Variants = {
  initial: {
    opacity: 0,
    x: -20
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: transitions.default
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: transitions.default
  }
}

export const scale: Variants = {
  initial: {
    opacity: 0,
    scale: 0.9
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: transitions.spring
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: transitions.default
  }
}

export const rotate: Variants = {
  initial: {
    opacity: 0,
    rotate: -180
  },
  animate: {
    opacity: 1,
    rotate: 0,
    transition: transitions.spring
  },
  exit: {
    opacity: 0,
    rotate: 180,
    transition: transitions.default
  }
}