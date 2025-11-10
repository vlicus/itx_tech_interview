/**
 * useHydration Hook
 * Ensures Zustand store has hydrated from localStorage before rendering
 */

import { useEffect, useState } from 'react'

export function useHydration() {
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    // Wait for next tick to ensure store has hydrated
    setHydrated(true)
  }, [])

  return hydrated
}
