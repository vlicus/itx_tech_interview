/**
 * useGridDragAndDrop Hook
 * Handles all drag-and-drop logic for rows and products
 */
import { useState, useCallback, useRef } from 'react'
import {
    useSensors,
    useSensor,
    PointerSensor,
    KeyboardSensor,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { useGridStore, useUIStore } from '@/lib/store'
import type { DragStartEvent, DragEndEvent, DragOverEvent } from '@dnd-kit/core'
import type { TDragData, IProduct } from '@/types'

// Maximum products allowed per row
const MAX_PRODUCTS_PER_ROW = 3

/**
 * Active drag item data
 */
interface ActiveDragItem {
    id: string
    type: 'PRODUCT' | 'ROW'
    product?: IProduct
    rowId?: string
    // For ROW type
    rowData?: {
        row: any
        products: IProduct[]
        index: number
    }
}

interface UseGridDragAndDropReturn {
    activeId: string | null
    activeItem: ActiveDragItem | null
    overId: string | null // Current element being hovered over
    sensors: ReturnType<typeof useSensors>
    handleDragStart: (event: DragStartEvent) => void
    handleDragOver: (event: DragOverEvent) => void
    handleDragEnd: (event: DragEndEvent) => void
    handleDragCancel: () => void
}

export function useGridDragAndDrop(): UseGridDragAndDropReturn {
    const [activeId, setActiveId] = useState<string | null>(null)
    const [activeItem, setActiveItem] = useState<ActiveDragItem | null>(null)
    const [overId, setOverId] = useState<string | null>(null) // Track what we're hovering over
    const dragOverTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    // Grid store
    const rows = useGridStore((state) => state.rows)
    const products = useGridStore((state) => state.products)
    const moveRow = useGridStore((state) => state.moveRow)
    const moveProductBetweenRows = useGridStore(
        (state) => state.moveProductBetweenRows
    )
    const moveProductWithinRow = useGridStore(
        (state) => state.moveProductWithinRow
    )

    // UI store for toasts
    const addToast = useUIStore((state) => state.addToast)

    // Drag and drop sensors
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    function handleDragStart(event: DragStartEvent) {
        const activeData = event.active.data.current as TDragData

        console.log('🔵 [DRAG] handleDragStart:', {
            activeId: event.active.id,
            data: activeData,
        })

        setActiveId(event.active.id as string)

        // Capture active item data for DragOverlay
        if (activeData.type === 'PRODUCT') {
            const product = products[activeData.productId]
            setActiveItem({
                id: event.active.id as string,
                type: 'PRODUCT',
                product,
                rowId: activeData.sourceRowId,
            })
        } else if (activeData.type === 'ROW') {
            // Capture complete row data including all products
            const row = rows.find((r) => r.id === activeData.rowId)
            if (row) {
                const rowProducts = row.productIds
                    .map((productId) => products[productId])
                    .filter(Boolean) as IProduct[]

                setActiveItem({
                    id: event.active.id as string,
                    type: 'ROW',
                    rowData: {
                        row,
                        products: rowProducts,
                        index: activeData.sourceIndex || 0,
                    },
                })
            } else {
                setActiveItem({
                    id: event.active.id as string,
                    type: 'ROW',
                })
            }
        }
    }

    function handleDragOver(event: DragOverEvent): void {
        const { over } = event

        // Track what element we're hovering over (including disabled droppables)
        if (over) {
            setOverId(over.id as string)
        } else {
            setOverId(null)
        }
    }

    function handleDragEnd(event: DragEndEvent): void {
        const { active, over } = event

        console.log('🟢 [DRAG] handleDragEnd:', {
            activeId: active.id,
            overId: over?.id,
            activeData: active.data.current,
            overData: over?.data.current,
        })

        if (!over) {
            console.log('🔴 [DRAG] No over target, cancelling')
            setActiveId(null)
            return
        }

        const activeData = active.data.current as TDragData
        const overId = over.id as string

        // Handle ROW dragging
        if (activeData.type === 'ROW') {
            const oldIndex = rows.findIndex((r) => r.id === active.id)
            const newIndex = rows.findIndex((r) => r.id === over.id)

            if (oldIndex !== newIndex) {
                moveRow(oldIndex, newIndex)
            }
        }

        // Handle PRODUCT dragging
        if (activeData.type === 'PRODUCT') {
            const { productId, sourceRowId } = activeData

            console.log('🟡 [DRAG] Handling PRODUCT drag:', {
                productId,
                sourceRowId,
                overId,
                overData: over?.data.current,
            })

            // Determine target row and position
            let targetRowId = sourceRowId
            let targetIndex = -1 // -1 means "add to end"

            // Check if dropped on the droppable area (empty space in row)
            if (overId.startsWith('droppable-')) {
                targetRowId = overId.replace('droppable-', '')
                console.log('🟡 [DRAG] Dropped on droppable area:', targetRowId)
                // Will add to end of target row
            }
            // Check if dropped on another product (format: "rowId-productId")
            else {
                // Try to get rowId from over.data first (more reliable)
                const overData = over?.data.current as TDragData | undefined
                if (
                    overData &&
                    overData.type === 'PRODUCT' &&
                    overData.sourceRowId
                ) {
                    targetRowId = overData.sourceRowId

                    // Find target row to get the index
                    const targetRow = rows.find((r) => r.id === targetRowId)
                    if (targetRow && overData.productId) {
                        targetIndex = targetRow.productIds.indexOf(
                            overData.productId
                        )
                    }

                    console.log('🟡 [DRAG] Dropped on product (using data):', {
                        targetRowId,
                        overProductId: overData.productId,
                        targetIndex,
                    })
                }
                // Fallback: Parse from overId if data is not available
                else if (overId.includes('-')) {
                    // Use lastIndexOf to handle rowIds that contain hyphens
                    const lastHyphenIndex = overId.lastIndexOf('-')
                    const rowId = overId.substring(0, lastHyphenIndex)
                    const overProductId = overId.substring(lastHyphenIndex + 1)

                    targetRowId = rowId

                    // Find target row to get the index
                    const targetRow = rows.find((r) => r.id === targetRowId)
                    if (targetRow) {
                        targetIndex =
                            targetRow.productIds.indexOf(overProductId)
                    }
                    console.log(
                        '🟡 [DRAG] Dropped on product (parsed from ID):',
                        {
                            rowId,
                            overProductId,
                            targetIndex,
                        }
                    )
                }
            }

            const sourceRow = rows.find((r) => r.id === sourceRowId)
            const targetRow = rows.find((r) => r.id === targetRowId)

            console.log('🟡 [DRAG] Rows found:', {
                sourceRow: !!sourceRow,
                targetRow: !!targetRow,
            })

            if (!sourceRow || !targetRow) {
                console.log('🔴 [DRAG] Source or target row not found')
                setActiveId(null)
                return
            }

            // Same row - reorder products
            if (sourceRowId === targetRowId) {
                const oldIndex = sourceRow.productIds.indexOf(productId)

                // If targetIndex is -1, move to end of row
                let finalTargetIndex = targetIndex
                if (targetIndex === -1) {
                    finalTargetIndex = sourceRow.productIds.length - 1
                    console.log(
                        '🟡 [DRAG] Dropped in empty area of same row, moving to end:',
                        finalTargetIndex
                    )
                }

                console.log('🟡 [DRAG] Same row reorder:', {
                    oldIndex,
                    targetIndex,
                    finalTargetIndex,
                })

                // Only reorder if indices are different
                if (oldIndex !== finalTargetIndex && oldIndex !== -1) {
                    console.log('✅ [DRAG] Calling moveProductWithinRow')
                    moveProductWithinRow(
                        sourceRowId,
                        oldIndex,
                        finalTargetIndex
                    )
                } else {
                    console.log('🔴 [DRAG] Indices are the same, no action')
                }
            }
            // Different row - move between rows
            else {
                // ✅ STRICT DROP BLOCKING: Check if target row is full
                const isTargetRowFull = targetRow.productIds.length >= MAX_PRODUCTS_PER_ROW

                if (isTargetRowFull) {
                    console.log('🚫 [DRAG] Target row is full, DROP BLOCKED')
                    addToast({
                        type: 'error',
                        message: 'Cannot drop! Row is full (3 products max).',
                    })
                    setActiveId(null)
                    setActiveItem(null)
                    return // 🛑 Block the operation
                }

                // If targetIndex is -1, add to end
                if (targetIndex === -1) {
                    targetIndex = targetRow.productIds.length
                }

                console.log('✅ [DRAG] Calling moveProductBetweenRows:', {
                    productId,
                    sourceRowId,
                    targetRowId,
                    targetIndex,
                })
                moveProductBetweenRows(
                    productId,
                    sourceRowId,
                    targetRowId,
                    targetIndex
                )
            }
        }

        setActiveId(null)
        setActiveItem(null)
        setOverId(null) // Clear hover state

        // Clear drag over timeout
        if (dragOverTimeoutRef.current) {
            clearTimeout(dragOverTimeoutRef.current)
        }
    }

    function handleDragCancel(): void {
        setActiveId(null)
        setActiveItem(null)
        setOverId(null) // Clear hover state

        // Clear drag over timeout
        if (dragOverTimeoutRef.current) {
            clearTimeout(dragOverTimeoutRef.current)
        }
    }

    return {
        activeId,
        activeItem,
        overId, // Expose overId to GridEditor
        sensors,
        handleDragStart,
        handleDragOver,
        handleDragEnd,
        handleDragCancel,
    }
}
