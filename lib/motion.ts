import { motion, type HTMLMotionProps } from "framer-motion"
import type { ComponentProps } from "react"

export type MotionComponent<T extends keyof typeof motion> = ComponentProps<typeof motion[T]>

// Export m components directly to preserve tree shaking
export { motion }

// Create type-safe motion components
export const m = {
  div: motion.div,
  span: motion.span,
  button: motion.button,
  a: motion.a,
  ul: motion.ul,
  li: motion.li,
  nav: motion.nav,
  header: motion.header,
  footer: motion.footer,
  main: motion.main,
  section: motion.section,
  article: motion.article,
  aside: motion.aside,
  form: motion.form,
  input: motion.input,
  textarea: motion.textarea,
  select: motion.select,
  label: motion.label,
  p: motion.p,
  h1: motion.h1,
  h2: motion.h2,
  h3: motion.h3,
  h4: motion.h4,
  h5: motion.h5,
  h6: motion.h6,
  img: motion.img,
  svg: motion.svg,
  path: motion.path,
  circle: motion.circle,
  rect: motion.rect,
  line: motion.line,
  polyline: motion.polyline,
  polygon: motion.polygon,
} as const

// Export types for consumers
export type { HTMLMotionProps } 