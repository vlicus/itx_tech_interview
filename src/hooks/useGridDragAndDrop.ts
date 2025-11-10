/**
 * useGridDragAndDrop Hook
 * Handles all drag-and-drop logic for rows and products
 */
import { useState } from 'react'
import { useSensors, useSensor, PointerSensor, KeyboardSensor } from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { useGridStore } from '@/lib/store'
import type { DragStartEvent, DragEndEvent, DragOverEvent } from '@dnd-kit/core'
import type { TDragData } from '@/types'

interface UseGridDragAndDropReturn {
    activeId: string | null
    sensors: ReturnType<typeof useSensors>
    handleDragStart: (event: DragStartEvent) => void
    handleDragOver: (event: DragOverEvent) => void
    handleDragEnd: (event: DragEndEvent) => void
    handleDragCancel: () => void
}

export function useGridDragAndDrop(): UseGridDragAndDropReturn {
    const [activeId, setActiveId] = useState<string | null>(null)

    // Grid store
    const rows = useGridStore((state) => state.rows)
    const moveRow = useGridStore((state) => state.moveRow)
    const moveProductBetweenRows = useGridStore(
        (state) => state.moveProductBetweenRows
    )
    const moveProductWithinRow = useGridStore(
        (state) => state.moveProductWithinRow
    )

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
        console.log('🔵 [DRAG] handleDragStart:', {
            activeId: event.active.id,
            data: event.active.data.current,
        })
        setActiveId(event.active.id as string)
    }

    function handleDragOver(event: DragOverEvent) {
        // Handle drag over logic if needed
    }

    function handleDragEnd(event: DragEndEvent) {
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
                const overData = over?.data.current as any
                if (overData?.sourceRowId) {
                    targetRowId = overData.sourceRowId

                    // Find target row to get the index
                    const targetRow = rows.find((r) => r.id === targetRowId)
                    if (targetRow && overData?.productId) {
                        targetIndex = targetRow.productIds.indexOf(overData.productId)
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
                        targetIndex = targetRow.productIds.indexOf(overProductId)
                    }
                    console.log('🟡 [DRAG] Dropped on product (parsed from ID):', {
                        rowId,
                        overProductId,
                        targetIndex,
                    })
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
            // Different row - move between rows (with overflow handling)
            else {
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
    }

    function handleDragCancel() {
        setActiveId(null)
    }

    return {
        activeId,
        sensors,
        handleDragStart,
        handleDragOver,
        handleDragEnd,
        handleDragCancel,
    }
}
