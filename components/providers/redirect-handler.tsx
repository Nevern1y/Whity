"use client"

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export function RedirectHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  useEffect(() => {
    if (!searchParams) return
    
    const redirectTo = searchParams.get('redirectTo')
    if (redirectTo) {
      router.push(redirectTo)
    }
  }, [searchParams, router])

  return null
} 