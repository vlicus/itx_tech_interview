'use client'

import { Spinner } from '@heroui/react'
import { useGridStore, useUIStore } from '@/lib/store'
import { useHydration } from '@/hooks/useHydration'
import { useGridDragAndDrop, useGridOperations, useGridData } from '@/hooks'
import { GridToolbar } from '@/components/molecules'
import { GridRowList } from '@/components/organisms'
import type { IGridRow, IProduct } from '@/types'

const EMPTY_ROWS: IGridRow[] = []
const EMPTY_PRODUCTS: Record<string, IProduct> = {}

export function GridEditor() {
    const isHydrated = useHydration()

    useGridData(isHydrated)

    const storeRows = useGridStore((state) => state.rows)
    const storeProducts = useGridStore((state) => state.products)
    const gridRows = storeRows || EMPTY_ROWS
    const gridProducts = storeProducts || EMPTY_PRODUCTS
    const selectedRowId = useGridStore((state) => state.selectedRowId)
    const selectRow = useGridStore((state) => state.selectRow)

    const zoomLevel = useUIStore((state) => state.zoomLevel)
    const isLoading = useUIStore((state) => state.isLoading)
    const isSaving = useUIStore((state) => state.isSaving)
    const showValidationErrors = useUIStore((state) => state.showValidationErrors)

    const {
        activeId,
        activeItem,
        overId,
        sensors,
        handleDragStart,
        handleDragOver,
        handleDragEnd,
        handleDragCancel,
    } = useGridDragAndDrop()

    const { gridRef, handleSave, validation, errorsByRow, hasUnsavedChanges } =
        useGridOperations(isHydrated, isLoading)

    const showLoadingSpinner = !isHydrated || isLoading

    if (showLoadingSpinner) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Spinner size="lg" label="Loading editor..." />
            </div>
        )
    }

    return (
        <div className="w-full min-h-screen bg-linear-to-br from-default-50 via-white to-default-100">
            <GridToolbar
                rowCount={gridRows.length}
                productCount={Object.keys(gridProducts).length}
                onSave={handleSave}
                isSaving={isSaving}
                isValid={validation.isValid}
                hasUnsavedChanges={hasUnsavedChanges}
            />

            <GridRowList
                rows={gridRows}
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
                activeItem={activeItem}
                overId={overId}
                zoomLevel={zoomLevel}
                gridRef={gridRef}
            />
        </div>
    )
}
