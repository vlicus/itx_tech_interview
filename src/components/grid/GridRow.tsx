'use client'

/**
 * GridRow Component
 * Represents a row in the product grid with drag-and-drop support
 */

import { useMemo, useRef, useCallback, useEffect } from 'react'
import { useSortable, SortableContext } from '@dnd-kit/sortable'
import { useDroppable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { Button, Card, CardBody, CardHeader, Chip } from '@heroui/react'
import { ProductCard } from '@/components/product/ProductCard'
import { TemplateSelector } from '@/components/ui/TemplateSelector'
import { useGridStore, useTemplateStore } from '@/lib/store'
import { cn } from '@/utils'
import type { IGridRow, IProduct } from '@/types'
import { Icon } from '@iconify/react'

interface GridRowProps {
    row: IGridRow
    index: number
    isSelected: boolean
    onSelect: () => void
    validationErrors?: string[]
}

export function GridRow({
    row,
    index,
    isSelected,
    onSelect,
    validationErrors = [],
}: GridRowProps) {
    const products = useGridStore((state) => state.products)
    const assignTemplateToRow = useGridStore(
        (state) => state.assignTemplateToRow
    )
    const removeRow = useGridStore((state) => state.removeRow)
    const getTemplateById = useTemplateStore((state) => state.getTemplateById)

    const template = row.templateId ? getTemplateById(row.templateId) : null

    // Refs for throttling drag over events
    const dragOverTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const lastDragOverTimeRef = useRef<number>(0)

    // Memoized check for row capacity (prevents blink on re-renders)
    const rowProductCount = useMemo(
        () => row.productIds.length,
        [row.productIds.length]
    )

    // Stable canDrop logic - always allow drop (LIFO handles overflow)
    const canAcceptDrop = useMemo(() => true, [])

    // Throttled drag over handler - prevents excessive re-renders
    const handleDragOverThrottled = useCallback((event: React.DragEvent) => {
        const now = Date.now()
        const timeSinceLastCall = now - lastDragOverTimeRef.current

        // Throttle to 50ms intervals
        if (timeSinceLastCall >= 50) {
            lastDragOverTimeRef.current = now
            event.preventDefault()
        } else {
            // Clear existing timeout
            if (dragOverTimeoutRef.current) {
                clearTimeout(dragOverTimeoutRef.current)
            }

            // Schedule for next interval
            dragOverTimeoutRef.current = setTimeout(() => {
                lastDragOverTimeRef.current = Date.now()
                event.preventDefault()
            }, 50 - timeSinceLastCall)
        }
    }, [])

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (dragOverTimeoutRef.current) {
                clearTimeout(dragOverTimeoutRef.current)
            }
        }
    }, [])

    // Sortable for the entire row
    const {
        attributes: rowAttributes,
        listeners: rowListeners,
        setNodeRef: setRowRef,
        transform: rowTransform,
        transition: rowTransition,
        isDragging: isRowDragging,
    } = useSortable({
        id: row.id,
        data: {
            type: 'ROW',
            rowId: row.id,
            sourceIndex: index,
        },
    })

    // Droppable for products with stable data object
    const dropData = useMemo(
        () => ({
            rowId: row.id,
            accepts: 'PRODUCT',
            canAcceptDrop,
            currentCount: rowProductCount,
        }),
        [row.id, canAcceptDrop, rowProductCount]
    )

    const { setNodeRef: setDropRef, isOver } = useDroppable({
        id: `droppable-${row.id}`,
        data: dropData,
    })

    const rowStyle = {
        transform: CSS.Transform.toString(rowTransform),
        transition: rowTransition,
    }

    const rowProducts = row.productIds
        .map((productId) => products[productId])
        .filter(Boolean) as IProduct[]

    // Create sortable IDs for products (must match ProductCard's useSortable id)
    const productSortableIds = row.productIds.map(
        (productId) => `${row.id}-${productId}`
    )

    const hasErrors = validationErrors.length > 0

    // Memoized hover state calculation (prevents blink on full rows)
    const isHovered = useMemo(() => isOver, [isOver])

    // Calculate alignment class based on template (memoized)
    const alignmentClass = useMemo(() => {
        const alignmentMap: Record<string, string> = {
            LEFT: 'justify-start',
            CENTER: 'justify-center',
            RIGHT: 'justify-end',
        }
        return template
            ? alignmentMap[template.alignment as string] ?? 'justify-start'
            : 'justify-end' // Default: Derecha (RIGHT) when no template initially
    }, [template])

    return (
        <div
            ref={setRowRef}
            style={rowStyle}
            className={cn(
                'w-full transition-all duration-200',
                isRowDragging && 'opacity-40 scale-95'
            )}
        >
            <Card
                className={cn(
                    'w-full transition-all duration-200 shadow-lg hover:shadow-xl',
                    isSelected && 'ring-2 ring-primary shadow-primary/20',
                    hasErrors && 'ring-2 ring-danger shadow-danger/20',
                    isHovered &&
                        'ring-4 ring-success-500 shadow-success/30 scale-[1.01] bg-success-50/30'
                )}
            >
                <CardHeader
                    className={cn(
                        'flex flex-row items-center justify-between gap-2 px-6 py-4 border-b transition-all duration-200',
                        isHovered
                            ? 'bg-linear-to-r from-success-100 to-success-50 border-success-300'
                            : 'bg-linear-to-r from-default-50 to-default-100/50 border-default-200'
                    )}
                >
                    <div className="flex items-center gap-3">
                        {/* Drag handle */}
                        <button
                            {...rowAttributes}
                            {...rowListeners}
                            className="touch-none cursor-grab active:cursor-grabbing p-1 hover:bg-default-100 rounded"
                            aria-label="Drag row"
                        >
                            <Icon
                                icon="akar-icons:drag-vertical"
                                className="w-5 h-5 text-default-400"
                            />
                        </button>

                        <Chip size="sm" variant="flat">
                            Row {index + 1}
                        </Chip>
                    </div>

                    <div className="flex items-center gap-2">
                        <TemplateSelector
                            selectedTemplateId={row.templateId}
                            onTemplateChange={(templateId) =>
                                assignTemplateToRow(row.id, templateId)
                            }
                        />

                        <Button
                            isIconOnly
                            size="sm"
                            color="danger"
                            variant="bordered"
                            onPress={() => removeRow(row.id)}
                            aria-label="Delete row"
                        >
                            <Icon
                                color="danger"
                                icon="akar-icons:trash-can"
                                className="w-4 h-4"
                            />
                        </Button>
                    </div>
                </CardHeader>

                <div
                    ref={setDropRef}
                    onDragOver={handleDragOverThrottled}
                >
                    <CardBody
                        className={cn(
                            'min-h-80 p-6 transition-all duration-200',
                            isHovered &&
                                'bg-success-100/40 backdrop-blur-sm border-2 border-success-400 border-dashed rounded-lg'
                        )}
                        onClick={onSelect}
                    >
                        {/* Product grid with template alignment */}
                        <SortableContext items={productSortableIds}>
                            <div
                                className={cn(
                                    'flex flex-wrap gap-4 w-full ',
                                    alignmentClass
                                )}
                            >
                                {rowProducts.map((product, productIndex) => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        rowId={row.id}
                                        index={productIndex}
                                    />
                                ))}
                            </div>
                        </SortableContext>

                        {/* Empty state */}
                        {rowProducts.length === 0 && (
                            <div className="flex items-center justify-center h-full text-default-400">
                                <p>Drag products here</p>
                            </div>
                        )}

                        {/* Validation errors */}
                        {hasErrors && (
                            <div className="mt-4 p-3 bg-danger-50 rounded-lg">
                                <p className="text-sm text-danger font-medium">
                                    Validation Errors:
                                </p>
                                <ul className="mt-1 text-sm text-danger list-disc list-inside">
                                    {validationErrors.map((error, idx) => (
                                        <li key={idx}>{error}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </CardBody>
                </div>
            </Card>
        </div>
    )
}
