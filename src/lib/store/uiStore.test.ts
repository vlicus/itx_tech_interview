import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { useUIStore } from './uiStore'

describe('uiStore', () => {
    beforeEach(() => {
        const store = useUIStore.getState()
        store.setZoomLevel(1.0)
        store.setLoading(false)
        store.setSaving(false)
        store.clearError()
        store.setShowValidationErrors(false)
        store.markAsSaved()
        useUIStore.setState({ toasts: [] })
    })

    afterEach(() => {
        vi.clearAllTimers()
        vi.useRealTimers()
    })

    describe('Zoom Control', () => {
        it('should set zoom level within bounds', () => {
            useUIStore.getState().setZoomLevel(1.5)

            expect(useUIStore.getState().zoomLevel).toBe(1.5)
        })

        it('should clamp zoom level to minimum', () => {
            useUIStore.getState().setZoomLevel(0.2)

            expect(useUIStore.getState().zoomLevel).toBe(0.5)
        })

        it('should clamp zoom level to maximum', () => {
            useUIStore.getState().setZoomLevel(3.0)

            expect(useUIStore.getState().zoomLevel).toBe(2.0)
        })

        it('should zoom in by 0.1', () => {
            useUIStore.getState().setZoomLevel(1.0)
            useUIStore.getState().zoomIn()

            expect(useUIStore.getState().zoomLevel).toBeCloseTo(1.1)
        })

        it('should not zoom in beyond maximum', () => {
            useUIStore.getState().setZoomLevel(2.0)
            useUIStore.getState().zoomIn()

            expect(useUIStore.getState().zoomLevel).toBe(2.0)
        })

        it('should zoom out by 0.1', () => {
            useUIStore.getState().setZoomLevel(1.0)
            useUIStore.getState().zoomOut()

            expect(useUIStore.getState().zoomLevel).toBeCloseTo(0.9)
        })

        it('should not zoom out beyond minimum', () => {
            useUIStore.getState().setZoomLevel(0.5)
            useUIStore.getState().zoomOut()

            expect(useUIStore.getState().zoomLevel).toBe(0.5)
        })

        it('should reset zoom to default', () => {
            useUIStore.getState().setZoomLevel(1.5)
            useUIStore.getState().resetZoom()

            expect(useUIStore.getState().zoomLevel).toBe(1.0)
        })

        it('should allow multiple zoom operations', () => {
            useUIStore.getState().setZoomLevel(1.0)
            useUIStore.getState().zoomIn()
            useUIStore.getState().zoomIn()
            useUIStore.getState().zoomOut()

            expect(useUIStore.getState().zoomLevel).toBeCloseTo(1.1)
        })
    })

    describe('Loading States', () => {
        it('should set loading state to true', () => {
            useUIStore.getState().setLoading(true)

            expect(useUIStore.getState().isLoading).toBe(true)
        })

        it('should set loading state to false', () => {
            useUIStore.getState().setLoading(true)
            useUIStore.getState().setLoading(false)

            expect(useUIStore.getState().isLoading).toBe(false)
        })

        it('should set saving state to true', () => {
            useUIStore.getState().setSaving(true)

            expect(useUIStore.getState().isSaving).toBe(true)
        })

        it('should set saving state to false', () => {
            useUIStore.getState().setSaving(true)
            useUIStore.getState().setSaving(false)

            expect(useUIStore.getState().isSaving).toBe(false)
        })

        it('should allow independent loading and saving states', () => {
            useUIStore.getState().setLoading(true)
            useUIStore.getState().setSaving(true)

            expect(useUIStore.getState().isLoading).toBe(true)
            expect(useUIStore.getState().isSaving).toBe(true)
        })
    })

    describe('Error Handling', () => {
        it('should set error message', () => {
            useUIStore.getState().setError('Something went wrong')

            expect(useUIStore.getState().error).toBe('Something went wrong')
        })

        it('should clear error', () => {
            useUIStore.getState().setError('Error message')
            useUIStore.getState().clearError()

            expect(useUIStore.getState().error).toBeNull()
        })

        it('should allow setting error to null directly', () => {
            useUIStore.getState().setError('Error')
            useUIStore.getState().setError(null)

            expect(useUIStore.getState().error).toBeNull()
        })

        it('should overwrite previous error', () => {
            useUIStore.getState().setError('First error')
            useUIStore.getState().setError('Second error')

            expect(useUIStore.getState().error).toBe('Second error')
        })
    })

    describe('Validation', () => {
        it('should show validation errors', () => {
            useUIStore.getState().setShowValidationErrors(true)

            expect(useUIStore.getState().showValidationErrors).toBe(true)
        })

        it('should hide validation errors', () => {
            useUIStore.getState().setShowValidationErrors(true)
            useUIStore.getState().setShowValidationErrors(false)

            expect(useUIStore.getState().showValidationErrors).toBe(false)
        })
    })

    describe('Unsaved Changes Tracking', () => {
        it('should mark as having unsaved changes', () => {
            useUIStore.getState().setHasUnsavedChanges(true)

            expect(useUIStore.getState().hasUnsavedChanges).toBe(true)
        })

        it('should mark as saved', () => {
            useUIStore.getState().setHasUnsavedChanges(true)
            useUIStore.getState().markAsSaved()

            expect(useUIStore.getState().hasUnsavedChanges).toBe(false)
        })

        it('should allow toggling unsaved changes state', () => {
            useUIStore.getState().setHasUnsavedChanges(true)
            expect(useUIStore.getState().hasUnsavedChanges).toBe(true)

            useUIStore.getState().setHasUnsavedChanges(false)
            expect(useUIStore.getState().hasUnsavedChanges).toBe(false)
        })
    })

    describe('Toast Notifications', () => {
        it('should add a toast with auto-generated id', () => {
            useUIStore.getState().addToast({
                type: 'success',
                message: 'Operation successful',
            })

            const toasts = useUIStore.getState().toasts

            expect(toasts).toHaveLength(1)
            expect(toasts[0].message).toBe('Operation successful')
            expect(toasts[0].type).toBe('success')
            expect(toasts[0].id).toMatch(/^toast_/)
        })

        it('should add toast with default duration', () => {
            useUIStore.getState().addToast({
                type: 'info',
                message: 'Info message',
            })

            const toasts = useUIStore.getState().toasts

            expect(toasts[0].duration).toBe(5000)
        })

        it('should add toast with custom duration', () => {
            useUIStore.getState().addToast({
                type: 'warning',
                message: 'Warning message',
                duration: 3000,
            })

            const toasts = useUIStore.getState().toasts

            expect(toasts[0].duration).toBe(3000)
        })

        it('should add multiple toasts', () => {
            useUIStore.getState().addToast({
                type: 'success',
                message: 'First message',
            })
            useUIStore.getState().addToast({
                type: 'error',
                message: 'Second message',
            })

            const toasts = useUIStore.getState().toasts

            expect(toasts).toHaveLength(2)
            expect(toasts[0].message).toBe('First message')
            expect(toasts[1].message).toBe('Second message')
        })

        it('should remove toast by id', () => {
            useUIStore.getState().addToast({
                type: 'success',
                message: 'Test message',
            })

            const toasts = useUIStore.getState().toasts
            const toastId = toasts[0].id

            useUIStore.getState().removeToast(toastId)

            const updatedToasts = useUIStore.getState().toasts

            expect(updatedToasts).toHaveLength(0)
        })

        it('should remove specific toast from multiple toasts', () => {
            useUIStore.getState().addToast({
                type: 'success',
                message: 'First',
            })
            useUIStore.getState().addToast({
                type: 'error',
                message: 'Second',
            })
            useUIStore.getState().addToast({
                type: 'info',
                message: 'Third',
            })

            const toasts = useUIStore.getState().toasts
            const middleToastId = toasts[1].id

            useUIStore.getState().removeToast(middleToastId)

            const updatedToasts = useUIStore.getState().toasts

            expect(updatedToasts).toHaveLength(2)
            expect(updatedToasts[0].message).toBe('First')
            expect(updatedToasts[1].message).toBe('Third')
        })

        it('should auto-remove toast after duration', () => {
            vi.useFakeTimers()

            useUIStore.getState().addToast({
                type: 'success',
                message: 'Auto-remove test',
                duration: 3000,
            })

            expect(useUIStore.getState().toasts).toHaveLength(1)

            vi.advanceTimersByTime(3000)

            expect(useUIStore.getState().toasts).toHaveLength(0)
        })

        it('should handle different toast types', () => {
            const types = ['success', 'error', 'warning', 'info'] as const

            types.forEach((type) => {
                useUIStore.getState().addToast({
                    type,
                    message: `${type} message`,
                })
            })

            const toasts = useUIStore.getState().toasts

            expect(toasts).toHaveLength(4)
            types.forEach((type, index) => {
                expect(toasts[index].type).toBe(type)
            })
        })

        it('should generate unique IDs for concurrent toasts', () => {
            useUIStore.getState().addToast({
                type: 'info',
                message: 'First',
            })
            useUIStore.getState().addToast({
                type: 'info',
                message: 'Second',
            })

            const toasts = useUIStore.getState().toasts

            expect(toasts[0].id).not.toBe(toasts[1].id)
        })
    })

    describe('Initial State', () => {
        it('should have correct initial state', () => {
            const initialStateStore = useUIStore.getState()

            expect(initialStateStore.zoomLevel).toBe(1.0)
            expect(initialStateStore.isLoading).toBe(false)
            expect(initialStateStore.isSaving).toBe(false)
            expect(initialStateStore.error).toBeNull()
            expect(initialStateStore.showValidationErrors).toBe(false)
            expect(initialStateStore.hasUnsavedChanges).toBe(false)
        })
    })
})
