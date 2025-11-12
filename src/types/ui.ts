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
