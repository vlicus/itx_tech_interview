import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
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
    const queryClient = useQueryClient()

    const saveGridMutation = useSaveGrid()

    const rows = useGridStore((state) => state.rows)

    const isSaving = useUIStore((state) => state.isSaving)
    const showValidationErrors = useUIStore((state) => state.showValidationErrors)
    const setShowValidationErrors = useUIStore((state) => state.setShowValidationErrors)
    const hasUnsavedChanges = useUIStore((state) => state.hasUnsavedChanges)
    const setSaving = useUIStore((state) => state.setSaving)
    const addToast = useUIStore((state) => state.addToast)
    const setHasUnsavedChanges = useUIStore((state) => state.setHasUnsavedChanges)
    const markAsSaved = useUIStore((state) => state.markAsSaved)

    useEffect(() => {
        if (!hydrated || isLoading) return

        if (rows.length > 0) {
            setHasUnsavedChanges(true)
        }
    }, [rows, hydrated, isLoading, setHasUnsavedChanges])

    async function handleSave() {
        const currentValidation = validateGrid(rows)

        if (!currentValidation.isValid) {
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
            await saveGridMutation.mutateAsync({ rows })
            queryClient.invalidateQueries({ queryKey: ['savedGrids'] })
            markAsSaved()

            addToast({
                type: 'success',
                message: 'Grid saved successfully! Also added to your history on the Home page.',
            })
        } catch (error) {
            addToast({
                type: 'error',
                message: 'Failed to save grid. Please try again.',
            })
        } finally {
            setSaving(false)
        }
    }

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
