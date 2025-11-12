import { renderHook, act } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { useResponsive } from './useResponsive'
import type { TDeviceType } from '@/types'

vi.mock('@/types', () => {
    // Definimos los BREAKPOINTS DENTRO del mock para evitar el error de hoisting
    const BREAKPOINTS = {
        mobile: 768,
        tablet: 1024,
        desktop: 1025,
    }
    return {
        BREAKPOINTS: BREAKPOINTS,
    }
})

// Accedemos a los breakpoints mockeados para usarlos en el test,
// o simplemente los redefinimos localmente para la lógica de testing si es necesario.
// Como Vitest no permite importar directamente la variable mockeada, redefinimos los valores
// para la lógica del test y la función mockResize.
const BREAKPOINTS_TEST = {
    mobile: 768,
    tablet: 1024,
    desktop: 1025,
}

const mockResize = (width: number) => {
    Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: width,
    })
    window.dispatchEvent(new Event('resize'))
}

describe('useResponsive', () => {
    beforeEach(() => {
        mockResize(BREAKPOINTS_TEST.desktop + 100)
        vi.clearAllMocks()
    })

    it('should initialize with the correct device type based on initial width', () => {
        mockResize(BREAKPOINTS_TEST.mobile - 1)

        const { result } = renderHook(() => useResponsive())

        expect(result.current.deviceType).toBe('mobile')
        expect(result.current.isMobile).toBe(true)
        expect(result.current.width).toBe(BREAKPOINTS_TEST.mobile - 1)
    })

    it('should correctly identify desktop device type', () => {
        mockResize(BREAKPOINTS_TEST.tablet + 50)

        const { result } = renderHook(() => useResponsive())

        expect(result.current.deviceType).toBe('desktop')
        expect(result.current.isDesktop).toBe(true)
        expect(result.current.isTablet).toBe(false)
        expect(result.current.isMobile).toBe(false)
    })

    it('should correctly identify tablet device type', () => {
        mockResize(BREAKPOINTS_TEST.tablet - 1)

        const { result } = renderHook(() => useResponsive())

        expect(result.current.deviceType).toBe('tablet')
        expect(result.current.isTablet).toBe(true)
        expect(result.current.isDesktop).toBe(false)
        expect(result.current.isMobile).toBe(false)
    })

    it('should correctly identify mobile device type', () => {
        mockResize(BREAKPOINTS_TEST.mobile - 100)

        const { result } = renderHook(() => useResponsive())

        expect(result.current.deviceType).toBe('mobile')
        expect(result.current.isMobile).toBe(true)
    })

    it('should update device type and width on window resize event', () => {
        const { result } = renderHook(() => useResponsive())

        expect(result.current.deviceType).toBe('desktop')

        act(() => {
            mockResize(BREAKPOINTS_TEST.mobile)
        })
        expect(result.current.deviceType).toBe('tablet')
        expect(result.current.width).toBe(BREAKPOINTS_TEST.mobile)

        act(() => {
            mockResize(BREAKPOINTS_TEST.mobile - 1)
        })
        expect(result.current.deviceType).toBe('mobile')
        expect(result.current.width).toBe(BREAKPOINTS_TEST.mobile - 1)

        act(() => {
            mockResize(BREAKPOINTS_TEST.tablet)
        })
        expect(result.current.deviceType).toBe('desktop')
        expect(result.current.width).toBe(BREAKPOINTS_TEST.tablet)
    })
})
