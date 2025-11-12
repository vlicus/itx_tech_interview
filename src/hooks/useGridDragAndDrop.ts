import { useState, useRef, useMemo } from 'react'
import {
    useSensors,
    useSensor,
    PointerSensor,
    KeyboardSensor,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { useGridStore, useUIStore } from '@/lib/store'
import { useProducts } from './api/useProducts'
import type { DragStartEvent, DragEndEvent, DragOverEvent } from '@dnd-kit/core'
import type { TDragData, IProduct } from '@/types'

const MAX_PRODUCTS_PER_ROW = Number(
    process.env.NEXT_PUBLIC_MAX_PRODUCTS_PER_ROW
)

interface ActiveDragItem {
    id: string
    type: 'PRODUCT' | 'ROW'
    product?: IProduct
    rowId?: string
    rowData?: {
        row: any
        products: IProduct[]
        index: number
    }
}

interface UseGridDragAndDropReturn {
    activeId: string | null
    activeItem: ActiveDragItem | null
    overId: string | null
    sensors: ReturnType<typeof useSensors>
    handleDragStart: (event: DragStartEvent) => void
    handleDragOver: (event: DragOverEvent) => void
    handleDragEnd: (event: DragEndEvent) => void
    handleDragCancel: () => void
}

export function useGridDragAndDrop(): UseGridDragAndDropReturn {
    const [activeId, setActiveId] = useState<string | null>(null)
    const [activeItem, setActiveItem] = useState<ActiveDragItem | null>(null)
    const [overId, setOverId] = useState<string | null>(null)
    const dragOverTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    const rows = useGridStore((state) => state.rows)
    const moveRow = useGridStore((state) => state.moveRow)
    const moveProductBetweenRows = useGridStore(
        (state) => state.moveProductBetweenRows
    )
    const moveProductWithinRow = useGridStore(
        (state) => state.moveProductWithinRow
    )

    const addToast = useUIStore((state) => state.addToast)

    const allProductIds = useMemo(() => {
        const ids = new Set<string>()
        rows.forEach((row) => {
            row.productIds.forEach((id) => ids.add(id))
        })
        return Array.from(ids)
    }, [rows])

    const { data: productsData } = useProducts(allProductIds)

    const productsMap = useMemo(() => {
        const map = new Map<string, IProduct>()
        if (productsData?.products) {
            productsData.products.forEach((product) => {
                map.set(product.id, product)
            })
        }
        return map
    }, [productsData])

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

        setActiveId(event.active.id as string)

        if (activeData.type === 'PRODUCT') {
            const product = productsMap.get(activeData.productId)
            setActiveItem({
                id: event.active.id as string,
                type: 'PRODUCT',
                product,
                rowId: activeData.sourceRowId,
            })
        } else if (activeData.type === 'ROW') {
            const row = rows.find((r) => r.id === activeData.rowId)
            if (row) {
                const rowProducts = row.productIds
                    .map((productId) => productsMap.get(productId))
                    .filter((p): p is IProduct => p !== undefined)

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

        if (over) {
            setOverId(over.id as string)
        } else {
            setOverId(null)
        }
    }

    function handleDragEnd(event: DragEndEvent): void {
        const { active, over } = event

        if (!over) {
            setActiveId(null)
            return
        }

        const activeData = active.data.current as TDragData
        const overId = over.id as string

        if (activeData.type === 'ROW') {
            const oldIndex = rows.findIndex((r) => r.id === active.id)
            const newIndex = rows.findIndex((r) => r.id === over.id)

            if (oldIndex !== newIndex) {
                moveRow(oldIndex, newIndex)
            }
        }

        if (activeData.type === 'PRODUCT') {
            const { productId, sourceRowId } = activeData

            let targetRowId = sourceRowId
            let targetIndex = -1

            if (overId.startsWith('droppable-')) {
                targetRowId = overId.replace('droppable-', '')
            } else {
                const overData = over?.data.current as TDragData | undefined
                if (
                    overData &&
                    overData.type === 'PRODUCT' &&
                    overData.sourceRowId
                ) {
                    targetRowId = overData.sourceRowId

                    const targetRow = rows.find((r) => r.id === targetRowId)
                    if (targetRow && overData.productId) {
                        targetIndex = targetRow.productIds.indexOf(
                            overData.productId
                        )
                    }
                } else if (overId.includes('-')) {
                    const lastHyphenIndex = overId.lastIndexOf('-')
                    const rowId = overId.substring(0, lastHyphenIndex)
                    const overProductId = overId.substring(lastHyphenIndex + 1)

                    targetRowId = rowId

                    const targetRow = rows.find((r) => r.id === targetRowId)
                    if (targetRow) {
                        targetIndex =
                            targetRow.productIds.indexOf(overProductId)
                    }
                }
            }

            const sourceRow = rows.find((r) => r.id === sourceRowId)
            const targetRow = rows.find((r) => r.id === targetRowId)

            if (!sourceRow || !targetRow) {
                setActiveId(null)
                return
            }

            if (sourceRowId === targetRowId) {
                const oldIndex = sourceRow.productIds.indexOf(productId)

                let finalTargetIndex = targetIndex
                if (targetIndex === -1) {
                    finalTargetIndex = sourceRow.productIds.length - 1
                }

                if (oldIndex !== finalTargetIndex && oldIndex !== -1) {
                    moveProductWithinRow(
                        sourceRowId,
                        oldIndex,
                        finalTargetIndex
                    )
                }
            } else {
                const isTargetRowFull =
                    targetRow.productIds.length >= MAX_PRODUCTS_PER_ROW

                if (isTargetRowFull) {
                    addToast({
                        type: 'error',
                        message: 'Cannot drop! Row is full (3 products max).',
                    })
                    setActiveId(null)
                    setActiveItem(null)
                    return
                }

                if (targetIndex === -1) {
                    targetIndex = targetRow.productIds.length
                }

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
        setOverId(null)

        if (dragOverTimeoutRef.current) {
            clearTimeout(dragOverTimeoutRef.current)
        }
    }

    function handleDragCancel(): void {
        setActiveId(null)
        setActiveItem(null)
        setOverId(null)

        if (dragOverTimeoutRef.current) {
            clearTimeout(dragOverTimeoutRef.current)
        }
    }

    return {
        activeId,
        activeItem,
        overId,
        sensors,
        handleDragStart,
        handleDragOver,
        handleDragEnd,
        handleDragCancel,
    }
}
