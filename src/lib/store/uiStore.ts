import { create } from 'zustand'
import type { IUIState, IToast } from '@/types'

import { TOAST_DURATION_MS, ZOOM } from '../../lib/constants'

const { DEFAULT_ZOOM, MAX_ZOOM, MIN_ZOOM, ZOOM_INCREMENT } = ZOOM

interface IUIActions {
    setZoomLevel: (level: number) => void
    zoomIn: () => void
    zoomOut: () => void
    resetZoom: () => void

    setLoading: (isLoading: boolean) => void
    setSaving: (isSaving: boolean) => void

    setError: (error: string | null) => void
    clearError: () => void

    setShowValidationErrors: (show: boolean) => void

    setHasUnsavedChanges: (hasChanges: boolean) => void
    markAsSaved: () => void

    addToast: (toast: Omit<IToast, 'id'>) => void
    removeToast: (id: string) => void
}

interface IExtendedUIState extends IUIState {
    toasts: IToast[]
    hasUnsavedChanges: boolean
}

type TUIStore = IExtendedUIState & IUIActions

const initialState: IExtendedUIState = {
    zoomLevel: DEFAULT_ZOOM,
    isSaving: false,
    isLoading: false,
    error: null,
    showValidationErrors: false,
    toasts: [],
    hasUnsavedChanges: false,
}

export const useUIStore = create<TUIStore>((set, get) => ({
    ...initialState,

    setZoomLevel: (level) =>
        set({
            zoomLevel: Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, level)),
        }),

    zoomIn: () => {
        const { zoomLevel } = get()
        const newZoom = Math.min(MAX_ZOOM, zoomLevel + ZOOM_INCREMENT)
        set({ zoomLevel: newZoom })
    },

    zoomOut: () => {
        const { zoomLevel } = get()
        const newZoom = Math.max(MIN_ZOOM, zoomLevel - ZOOM_INCREMENT)
        set({ zoomLevel: newZoom })
    },

    resetZoom: () =>
        set({
            zoomLevel: DEFAULT_ZOOM,
        }),

    setLoading: (isLoading) =>
        set({
            isLoading,
        }),

    setSaving: (isSaving) =>
        set({
            isSaving,
        }),

    setError: (error) =>
        set({
            error,
        }),

    clearError: () =>
        set({
            error: null,
        }),

    setShowValidationErrors: (show) =>
        set({
            showValidationErrors: show,
        }),

    setHasUnsavedChanges: (hasChanges) =>
        set({
            hasUnsavedChanges: hasChanges,
        }),

    markAsSaved: () =>
        set({
            hasUnsavedChanges: false,
        }),

    addToast: (toast) => {
        const id = `toast_${Date.now()}_${Math.random()
            .toString(36)
            .slice(2, 11)}`
        const newToast: IToast = {
            ...toast,
            id,
            duration: toast.duration || TOAST_DURATION_MS,
        }

        set((state) => ({
            toasts: [...state.toasts, newToast],
        }))

        if (newToast.duration) {
            setTimeout(() => {
                get().removeToast(id)
            }, newToast.duration)
        }
    },

    removeToast: (id) =>
        set((state) => ({
            toasts: state.toasts.filter((toast) => toast.id !== id),
        })),
}))
