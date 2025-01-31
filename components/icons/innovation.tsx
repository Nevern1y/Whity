export function InnovationIcon() {
  return (
    <svg 
      className="w-full h-auto"
      viewBox="0 0 400 400" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Фоновый градиент */}
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" className="text-primary" style={{stopColor: 'currentColor', stopOpacity: 0.1}} />
          <stop offset="100%" className="text-primary" style={{stopColor: 'currentColor', stopOpacity: 0.05}} />
        </linearGradient>
      </defs>

      {/* Фоновый круг */}
      <circle 
        cx="200" 
        cy="200" 
        r="180" 
        fill="url(#grad1)"
        className="animate-pulse-slow" 
      />

      {/* Орбиты */}
      <g className="animate-spin-slower" style={{transformOrigin: '200px 200px'}}>
        <circle 
          cx="200" 
          cy="200" 
          r="140" 
          fill="none" 
          className="stroke-primary/20" 
          strokeWidth="1" 
          strokeDasharray="4 4"
        />
        <circle 
          cx="200" 
          cy="200" 
          r="100" 
          fill="none" 
          className="stroke-primary/30" 
          strokeWidth="1" 
          strokeDasharray="8 8"
        />
      </g>

      {/* Плавающие элементы */}
      {[0, 72, 144, 216, 288].map((angle, i) => (
        <g key={angle} className="animate-float-gentle" style={{animationDelay: `${i * 0.5}s`}}>
          <circle
            cx={200 + 120 * Math.cos((angle * Math.PI) / 180)}
            cy={200 + 120 * Math.sin((angle * Math.PI) / 180)}
            r="8"
            className="fill-primary/40"
          />
          <circle
            cx={200 + 120 * Math.cos((angle * Math.PI) / 180)}
            cy={200 + 120 * Math.sin((angle * Math.PI) / 180)}
            r="4"
            className="fill-primary"
          />
        </g>
      ))}

      {/* Центральный элемент */}
      <g className="animate-spin-slow" style={{transformOrigin: '200px 200px'}}>
        <path
          d="M200 140 L260 200 L200 260 L140 200 Z"
          className="fill-primary/20 stroke-primary"
          strokeWidth="2"
        />
      </g>
    </svg>
  )
} 