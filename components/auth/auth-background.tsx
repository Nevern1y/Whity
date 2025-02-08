"use client"

import React from 'react'

export function AuthBackground() {
  return (
    <div className="fixed inset-0 -z-10 h-full w-full overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50/10 via-background to-orange-50/5 dark:from-orange-500/5 dark:via-background dark:to-orange-500/[0.02]" />
      <svg
        className="absolute inset-0 h-full w-full opacity-[0.15] dark:opacity-[0.08]"
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid slice"
        viewBox="0 0 1920 1080"
      >
        <path
          className="fill-orange-500/10 dark:fill-orange-400/10"
          d="M1920 0v1080H0V0h1920z"
        />
        <path
          className="fill-orange-500/20 dark:fill-orange-400/20"
          d="M1082.86 505.62c-27.44 158.52-183.03 265.23-347.22 238.3-164.19-26.93-274.66-179.32-247.22-337.84 27.44-158.52 183.03-265.23 347.22-238.3 164.19 26.93 274.66 179.32 247.22 337.84z"
        />
        <path
          className="fill-orange-500/30 dark:fill-orange-400/30"
          d="M1396.09 757.39c-87.06 95.35-234.03 102.45-327.81 15.84-93.78-86.61-99.31-233.44-12.25-328.79 87.06-95.35 234.03-102.45 327.81-15.84 93.78 86.61 99.31 233.44 12.25 328.79z"
        />
      </svg>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:14px_14px]" />
    </div>
  )
} 