/**
 * useResponsive Hook
 * Detects device type and screen size for responsive behavior
 */

import { useState, useEffect } from 'react'
import type { TDeviceType } from '@/types'
import { BREAKPOINTS } from '@/types'

export function useResponsive() {
  const [deviceType, setDeviceType] = useState<TDeviceType>('desktop')
  const [width, setWidth] = useState<number>(0)

  useEffect(() => {
    function handleResize() {
      const newWidth = window.innerWidth
      setWidth(newWidth)

      if (newWidth < BREAKPOINTS.mobile) {
        setDeviceType('mobile')
      } else if (newWidth < BREAKPOINTS.tablet) {
        setDeviceType('tablet')
      } else {
        setDeviceType('desktop')
      }
    }

    // Initial call
    handleResize()

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return {
    deviceType,
    width,
    isMobile: deviceType === 'mobile',
    isTablet: deviceType === 'tablet',
    isDesktop: deviceType === 'desktop',
  }
}
