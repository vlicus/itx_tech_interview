/**
 * useGridOperations Hook
 * Handles grid operations like save, undo, redo, and cleanup
 */
import { useEffect, useRef } from 'react'
import * as htmlToImage from 'html-to-image'
import { useGridStore, useUIStore } from '@/lib/store'
import { validateGrid, groupErrorsByRow } from '@/utils'

interface UseGridOperationsReturn {
    gridRef: React.RefObject<HTMLDivElement | null>
    handleSave: () => Promise<void>
    undo: () => void
    redo: () => void
    canUndo: boolean
    canRedo: boolean
    validation: ReturnType<typeof validateGrid>
    errorsByRow: ReturnType<typeof groupErrorsByRow>
}

export function useGridOperations(
    hydrated: boolean,
    isLoading: boolean
): UseGridOperationsReturn {
    const gridRef = useRef<HTMLDivElement>(null)

    // Grid store
    const rows = useGridStore((state) => state.rows)
    const removeRow = useGridStore((state) => state.removeRow)
    const canUndo = useGridStore((state) => state.canUndo)
    const canRedo = useGridStore((state) => state.canRedo)
    const undo = useGridStore((state) => state.undo)
    const redo = useGridStore((state) => state.redo)

    // UI store
    const isSaving = useUIStore((state) => state.isSaving)
    const showValidationErrors = useUIStore(
        (state) => state.showValidationErrors
    )
    const setSaving = useUIStore((state) => state.setSaving)
    const addToast = useUIStore((state) => state.addToast)

    // Auto-cleanup empty rows
    useEffect(() => {
        if (!hydrated || isLoading) return
        const emptyRows = rows.filter((row) => row.productIds.length === 0)
        if (emptyRows.length > 0) {
            emptyRows.forEach((row) => {
                removeRow(row.id)
            })
        }
    }, [rows, hydrated, isLoading, removeRow])

    async function handleSave() {
        // Validate grid before saving
        const currentValidation = validateGrid(rows)
        if (!currentValidation.isValid) {
            addToast({
                type: 'error',
                message: 'Cannot save: make sure all files have assigned grids',
            })
            return
        }

        if (!gridRef.current) {
            addToast({
                type: 'error',
                message: 'Grid not ready for capture',
            })
            return
        }

        setSaving(true)

        try {
            // Capture the grid as PNG image
            const dataUrl = await htmlToImage.toPng(gridRef.current, {
                quality: 1,
                pixelRatio: 2, // Higher quality for retina displays
                backgroundColor: '#ffffff',
            })

            // Create download link
            const link = document.createElement('a')
            link.download = `product-grid-${Date.now()}.png`
            link.href = dataUrl
            link.click()

            addToast({
                type: 'success',
                message: 'Grid image downloaded successfully!',
            })
        } catch (error) {
            console.error('Error capturing grid:', error)
            addToast({
                type: 'error',
                message: 'Failed to capture grid image',
            })
        } finally {
            setSaving(false)
        }
    }

    // Validation errors
    const validation = validateGrid(rows)
    const errorsByRow = groupErrorsByRow(validation.errors)

    return {
        gridRef,
        handleSave,
        undo,
        redo,
        canUndo,
        canRedo,
        validation,
        errorsByRow,
    }
}
