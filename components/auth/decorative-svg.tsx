export function DecorativeSVG() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Верхний правый угол */}
      <svg
        className="absolute top-0 right-0 w-32 h-32 text-primary/10"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <path
          fill="currentColor"
          d="M100 0v100H0C0 44.8 44.8 0 100 0z"
        />
      </svg>

      {/* Нижний левый угол */}
      <svg
        className="absolute bottom-0 left-0 w-48 h-48 text-primary/10"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="currentColor"
          fillOpacity="0.2"
        />
        <circle
          cx="50"
          cy="50"
          r="30"
          fill="currentColor"
          fillOpacity="0.3"
        />
      </svg>

      {/* Декоративные элементы */}
      <svg
        className="absolute top-1/4 left-1/4 w-24 h-24 text-primary/20 animate-float"
        viewBox="0 0 100 100"
      >
        <path
          fill="currentColor"
          d="M50 0l12.5 37.5H100L67.5 62.5 80 100 50 75 20 100l12.5-37.5L0 37.5h37.5z"
        />
      </svg>
    </div>
  )
} 