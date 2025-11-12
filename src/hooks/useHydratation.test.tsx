import { renderHook, act } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useHydration } from './useHydration'

describe('useHydration', () => {
    it('should return true after mounting and running the effect', () => {
        const { result } = renderHook(() => useHydration())

        act(() => {})

        expect(result.current).toBe(true)
    })
})
