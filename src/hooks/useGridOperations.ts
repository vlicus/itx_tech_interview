/**
 * useGridOperations Hook
 * Handles grid operations like save and cleanup
 */
import { useEffect, useRef } from 'react'
import { useGridStore, useUIStore } from '@/lib/store'
import { validateGrid, groupErrorsByRow } from '@/utils'
import { useSaveGrid } from '@/hooks/api'

interface UseGridOperationsReturn {
    gridRef: React.RefObject<HTMLDivElement | null>
    handleSave: () => Promise<void>
    validation: ReturnType<typeof validateGrid>
    errorsByRow: ReturnType<typeof groupErrorsByRow>
    hasUnsavedChanges: boolean
}

export function useGridOperations(
    hydrated: boolean,
    isLoading: boolean
): UseGridOperationsReturn {
    const gridRef = useRef<HTMLDivElement>(null)

    // TanStack Query mutation for saving grid
    const saveGridMutation = useSaveGrid()

    // Grid store
    const rows = useGridStore((state) => state.rows)

    // UI store
    const isSaving = useUIStore((state) => state.isSaving)
    const showValidationErrors = useUIStore(
        (state) => state.showValidationErrors
    )
    const setShowValidationErrors = useUIStore(
        (state) => state.setShowValidationErrors
    )
    const hasUnsavedChanges = useUIStore((state) => state.hasUnsavedChanges)
    const setSaving = useUIStore((state) => state.setSaving)
    const addToast = useUIStore((state) => state.addToast)
    const setHasUnsavedChanges = useUIStore(
        (state) => state.setHasUnsavedChanges
    )
    const markAsSaved = useUIStore((state) => state.markAsSaved)

    // Note: Auto-cleanup empty rows disabled to allow users to manually create empty rows
    // Empty rows will be caught by validation when trying to save
    // useEffect(() => {
    //     if (!hydrated || isLoading) return
    //     const emptyRows = rows.filter((row) => row.productIds.length === 0)
    //     if (emptyRows.length > 0) {
    //         emptyRows.forEach((row) => {
    //             removeRow(row.id)
    //         })
    //     }
    // }, [rows, hydrated, isLoading, removeRow])

    // Track unsaved changes when grid state changes
    useEffect(() => {
        if (!hydrated || isLoading) return

        // Mark as unsaved whenever rows change (after initial load)
        if (rows.length > 0) {
            setHasUnsavedChanges(true)
        }
    }, [rows, hydrated, isLoading, setHasUnsavedChanges])

    async function handleSave() {
        // Validate grid before saving
        const currentValidation = validateGrid(rows)
        if (!currentValidation.isValid) {
            // Show detailed validation errors
            const errorMessages = currentValidation.errors
                .map((err, index) => `Row ${index + 1}: ${err.message}`)
                .join(', ')

            addToast({
                type: 'error',
                message: `Cannot save grid. ${errorMessages}`,
            })
            setShowValidationErrors(true)
            return
        }

        setSaving(true)

        try {
            // POST /api/grids - Save to backend (real API call)
            const apiResponse = await saveGridMutation.mutateAsync({ rows })
            console.log('✅ [handleSave] API Response:', apiResponse)

            // Mark as saved (no unsaved changes)
            markAsSaved()

            // Show success message
            addToast({
                type: 'success',
                message: '✓ Grid saved successfully!',
            })
        } catch (error) {
            console.error('❌ [handleSave] Error saving grid:', error)
            addToast({
                type: 'error',
                message: 'Failed to save grid. Please try again.',
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
        validation,
        errorsByRow,
        hasUnsavedChanges,
    }
}
