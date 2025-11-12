export const MIN_ZOOM_LEVEL = 0.5
export const MAX_ZOOM_LEVEL = 2.0
export const ZOOM_STEP = 0.1
export const DEFAULT_ZOOM_LEVEL = 1.0

export interface IUIState {
    zoomLevel: number
    isSaving: boolean
    isLoading: boolean
    error: string | null
    showValidationErrors: boolean
}

export type TToastType = 'success' | 'error' | 'warning' | 'info'

export interface IToast {
    id: string
    type: TToastType
    message: string
    duration?: number
}

export type TDeviceType = 'mobile' | 'tablet' | 'desktop'

export const BREAKPOINTS = {
    mobile: 640,
    tablet: 1024,
} as const
