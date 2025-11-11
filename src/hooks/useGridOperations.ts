/**
 * useGridOperations Hook
 * Handles grid operations like save, undo, redo, and cleanup
 */
import { useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import * as htmlToImage from 'html-to-image'
import { useGridStore, useUIStore } from '@/lib/store'
import { validateGrid, groupErrorsByRow, createShareableURL } from '@/utils'

interface UseGridOperationsReturn {
    gridRef: React.RefObject<HTMLDivElement | null>
    handleSave: () => Promise<void>
    undo: () => void
    redo: () => void
    canUndo: boolean
    canRedo: boolean
    validation: ReturnType<typeof validateGrid>
    errorsByRow: ReturnType<typeof groupErrorsByRow>
    shareableURL: string | null
    copyShareableURL: () => Promise<boolean>
    hasUnsavedChanges: boolean
}

export function useGridOperations(
    hydrated: boolean,
    isLoading: boolean
): UseGridOperationsReturn {
    const gridRef = useRef<HTMLDivElement>(null)
    const pathname = usePathname()
    const router = useRouter()

    // State for shareable URL
    const [shareableURL, setShareableURL] = useState<string | null>(null)

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
    const hasUnsavedChanges = useUIStore((state) => state.hasUnsavedChanges)
    const setSaving = useUIStore((state) => state.setSaving)
    const addToast = useUIStore((state) => state.addToast)
    const setHasUnsavedChanges = useUIStore(
        (state) => state.setHasUnsavedChanges
    )
    const markAsSaved = useUIStore((state) => state.markAsSaved)

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
            addToast({
                type: 'error',
                message: 'Cannot save: make sure all rows have products and templates',
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
            // 1. Generate shareable URL
            const fullURL = createShareableURL(rows, pathname)
            const origin =
                typeof window !== 'undefined' ? window.location.origin : ''
            const completeURL = `${origin}${fullURL}`

            console.log('🔗 [handleSave] Generated shareable URL:', completeURL)

            // Update browser URL without reloading
            router.replace(fullURL, { scroll: false })

            // Store shareable URL for copy button
            setShareableURL(completeURL)

            // 2. Capture the grid as PNG image
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

            // 3. Mark as saved (no unsaved changes)
            markAsSaved()

            // 4. Show success with copy URL option
            addToast({
                type: 'success',
                message: 'Grid saved! Image downloaded. URL updated.',
            })
        } catch (error) {
            console.error('Error saving grid:', error)
            addToast({
                type: 'error',
                message: 'Failed to save grid',
            })
        } finally {
            setSaving(false)
        }
    }

    // Function to copy shareable URL to clipboard
    async function copyShareableURL(): Promise<boolean> {
        if (!shareableURL) {
            addToast({
                type: 'warning',
                message: 'No shareable URL available. Save the grid first.',
            })
            return false
        }

        try {
            await navigator.clipboard.writeText(shareableURL)
            addToast({
                type: 'success',
                message: 'Shareable URL copied to clipboard!',
            })
            return true
        } catch (error) {
            console.error('Error copying URL:', error)
            addToast({
                type: 'error',
                message: 'Failed to copy URL to clipboard',
            })
            return false
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
        shareableURL,
        copyShareableURL,
        hasUnsavedChanges,
    }
}
