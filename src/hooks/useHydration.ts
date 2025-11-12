/**
 * Ensures Zustand store has hydrated from localStorage before rendering
 */

import { useEffect, useState } from 'react'

export function useHydration() {
    const [hydrated, setHydrated] = useState(false)

    useEffect(() => {
        setHydrated(true)
    }, [])

    return hydrated
}
