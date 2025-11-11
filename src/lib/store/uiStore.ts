/**
 * UI Store
 * Manages UI state including zoom, loading states, and notifications
 */

import { create } from 'zustand'
import type { IUIState, IToast, DEFAULT_ZOOM_LEVEL, MIN_ZOOM_LEVEL, MAX_ZOOM_LEVEL, ZOOM_STEP } from '@/types'

/**
 * UI actions interface
 */
interface IUIActions {
  // Zoom control
  setZoomLevel: (level: number) => void
  zoomIn: () => void
  zoomOut: () => void
  resetZoom: () => void

  // Loading states
  setLoading: (isLoading: boolean) => void
  setSaving: (isSaving: boolean) => void

  // Error handling
  setError: (error: string | null) => void
  clearError: () => void

  // Validation
  setShowValidationErrors: (show: boolean) => void

  // Unsaved changes tracking
  setHasUnsavedChanges: (hasChanges: boolean) => void
  markAsSaved: () => void

  // Toast notifications
  addToast: (toast: Omit<IToast, 'id'>) => void
  removeToast: (id: string) => void
}

/**
 * Extended UI state with toasts and unsaved changes
 */
interface IExtendedUIState extends IUIState {
  toasts: IToast[]
  hasUnsavedChanges: boolean
}

/**
 * Combined UI store type
 */
type TUIStore = IExtendedUIState & IUIActions

/**
 * Import constants
 */
const DEFAULT_ZOOM = 1.0
const MIN_ZOOM = 0.5
const MAX_ZOOM = 2.0
const ZOOM_INCREMENT = 0.1

/**
 * Initial UI state
 */
const initialState: IExtendedUIState = {
  zoomLevel: DEFAULT_ZOOM,
  isSaving: false,
  isLoading: false,
  error: null,
  showValidationErrors: false,
  toasts: [],
  hasUnsavedChanges: false,
}

/**
 * Create UI store
 */
export const useUIStore = create<TUIStore>((set, get) => ({
  ...initialState,

  // Zoom control
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

  // Loading states
  setLoading: (isLoading) =>
    set({
      isLoading,
    }),

  setSaving: (isSaving) =>
    set({
      isSaving,
    }),

  // Error handling
  setError: (error) =>
    set({
      error,
    }),

  clearError: () =>
    set({
      error: null,
    }),

  // Validation
  setShowValidationErrors: (show) =>
    set({
      showValidationErrors: show,
    }),

  // Unsaved changes tracking
  setHasUnsavedChanges: (hasChanges) =>
    set({
      hasUnsavedChanges: hasChanges,
    }),

  markAsSaved: () =>
    set({
      hasUnsavedChanges: false,
    }),

  // Toast notifications
  addToast: (toast) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const newToast: IToast = {
      ...toast,
      id,
      duration: toast.duration || 5000,
    }

    set((state) => ({
      toasts: [...state.toasts, newToast],
    }))

    // Auto-remove toast after duration
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
