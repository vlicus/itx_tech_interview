/**
 * UI State Type Definitions
 * Types for UI-specific state and interactions
 */

/**
 * Zoom level constraints
 */
export const MIN_ZOOM_LEVEL = 0.5
export const MAX_ZOOM_LEVEL = 2.0
export const ZOOM_STEP = 0.1
export const DEFAULT_ZOOM_LEVEL = 1.0

/**
 * UI state for the grid editor
 */
export interface IUIState {
  zoomLevel: number
  isSaving: boolean
  isLoading: boolean
  error: string | null
  showValidationErrors: boolean
}

/**
 * Toast notification types
 */
export type TToastType = 'success' | 'error' | 'warning' | 'info'

/**
 * Toast notification interface
 */
export interface IToast {
  id: string
  type: TToastType
  message: string
  duration?: number
}

/**
 * Device type for responsive design
 */
export type TDeviceType = 'mobile' | 'tablet' | 'desktop'

/**
 * Breakpoints for responsive design (in pixels)
 */
export const BREAKPOINTS = {
  mobile: 640,
  tablet: 1024,
} as const
