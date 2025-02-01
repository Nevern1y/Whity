export function AuthBackground() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      <svg
        className="absolute h-full w-full stroke-primary/20"
        viewBox="0 0 1000 1000"
        aria-hidden="true"
      >
        <defs>
          <pattern
            id="grid"
            x="50"
            y="50"
            width="100"
            height="100"
            patternUnits="userSpaceOnUse"
          >
            <path d="M0 100h100v-100" fill="none" strokeWidth="1.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" strokeWidth="0" fill="url(#grid)" />
        <circle 
          cx="500" 
          cy="500" 
          r="300" 
          className="animate-pulse-slow" 
          fill="none" 
          strokeWidth="3"
          strokeDasharray="10 20"
        />
      </svg>
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-background via-background/80 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background via-background/80 to-transparent" />
    </div>
  )
} 