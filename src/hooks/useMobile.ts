'use client'

import { useEffect, useState } from 'react'

interface UseMobile {
  isMobile: boolean
}

export const useMobile = (): UseMobile => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768)

    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  return {
    isMobile,
  }
}
