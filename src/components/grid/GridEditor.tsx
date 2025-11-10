'use client'

/**
 * GridEditor Component (Refactored with Atomic Design)
 * Main component for the product grid editor with drag-and-drop
 * Now uses custom hooks and atomic components for better maintainability
 */

import { Spinner } from '@heroui/react'
import { useGridStore, useUIStore } from '@/lib/store'
import { useHydration } from '@/hooks/useHydration'
import { useGridData, useGridDragAndDrop, useGridOperations } from '@/hooks'
import { GridToolbar } from '@/components/molecules'
import { GridRowList } from '@/components/organisms'
import type { IGridRow, IProduct } from '@/types'

// Stable empty defaults outside component to avoid re-creation
const EMPTY_ROWS: IGridRow[] = []
const EMPTY_PRODUCTS: Record<string, IProduct> = {}

export function GridEditor() {
    const hydrated = useHydration()

    // Grid store with stable defaults
    const storeRows = useGridStore((state) => state.rows)
    const storeProducts = useGridStore((state) => state.products)
    const rows = storeRows || EMPTY_ROWS
    const products = storeProducts || EMPTY_PRODUCTS
    const selectedRowId = useGridStore((state) => state.selectedRowId)
    const selectRow = useGridStore((state) => state.selectRow)

    // UI store
    const zoomLevel = useUIStore((state) => state.zoomLevel)
    const isLoading = useUIStore((state) => state.isLoading)
    const isSaving = useUIStore((state) => state.isSaving)
    const showValidationErrors = useUIStore(
        (state) => state.showValidationErrors
    )

    // Custom hooks for data loading and URL sync
    const { isInitialLoad } = useGridData(hydrated)

    // Custom hook for drag and drop functionality
    const {
        activeId,
        sensors,
        handleDragStart,
        handleDragOver,
        handleDragEnd,
        handleDragCancel,
    } = useGridDragAndDrop()

    // Custom hook for grid operations (save, undo, redo, validation)
    const {
        gridRef,
        handleSave,
        undo,
        redo,
        canUndo,
        canRedo,
        validation,
        errorsByRow,
    } = useGridOperations(hydrated, isLoading)

    // Show loading while hydrating or loading data
    if (!hydrated || isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Spinner size="lg" label="Loading editor..." />
            </div>
        )
    }

    return (
        <div className="w-full min-h-screen bg-linear-to-br from-default-50 via-white to-default-100">
            {/* Toolbar - Now using atomic component */}
            <GridToolbar
                rowCount={rows.length}
                productCount={Object.keys(products).length}
                onUndo={undo}
                onRedo={redo}
                canUndo={canUndo}
                canRedo={canRedo}
                onSave={handleSave}
                isSaving={isSaving}
                isValid={validation.isValid}
            />

            {/* Grid Area - Now using organism component */}
            <GridRowList
                rows={rows}
                sensors={sensors}
                selectedRowId={selectedRowId}
                onSelectRow={selectRow}
                errorsByRow={errorsByRow}
                showValidationErrors={showValidationErrors}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
                onDragCancel={handleDragCancel}
                activeId={activeId}
                zoomLevel={zoomLevel}
                gridRef={gridRef}
            />
        </div>
    )
}
