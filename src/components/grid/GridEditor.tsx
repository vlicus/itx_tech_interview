'use client'

import { useMemo } from 'react'
import { Spinner } from '@heroui/react'
import { useGridStore, useUIStore } from '@/lib/store'
import { useHydration } from '@/hooks/useHydration'
import { useGridDragAndDrop, useGridOperations, useGridData } from '@/hooks'
import { useProducts } from '@/hooks/api/useProducts'
import { GridToolbar } from '@/components/molecules'
import { GridRowList } from '@/components/organisms'
import type { IGridRow } from '@/types'

const EMPTY_ROWS: IGridRow[] = []

export function GridEditor() {
    const isHydrated = useHydration()

    useGridData(isHydrated)

    const storeRows = useGridStore((state) => state.rows)
    const gridRows = storeRows || EMPTY_ROWS
    const selectedRowId = useGridStore((state) => state.selectedRowId)
    const selectRow = useGridStore((state) => state.selectRow)

    // Extract all unique product IDs from rows
    const allProductIds = useMemo(() => {
        const ids = new Set<string>()
        gridRows.forEach((row) => {
            row.productIds.forEach((id) => ids.add(id))
        })
        return Array.from(ids)
    }, [gridRows])

    // Fetch products using TanStack Query
    const { data: productsData } = useProducts(allProductIds)
    const productCount = productsData?.products?.length || 0

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
                productCount={productCount}
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
