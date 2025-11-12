'use client'

import { useMemo, useRef, useCallback, useEffect } from 'react'
import { useSortable, SortableContext } from '@dnd-kit/sortable'
import { useDroppable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { Button, Card, CardBody, CardHeader, Chip } from '@heroui/react'
import { ProductCard } from '@/components/product/ProductCard'
import { TemplateSelector } from '@/components/ui/TemplateSelector'
import { useGridStore } from '@/lib/store'
import { useProducts } from '@/hooks/api/useProducts'
import { useTemplates } from '@/hooks/api/useTemplates'
import { getTemplateById } from '@/utils'
import { cn } from '@/utils'
import type { IGridRow, IProduct } from '@/types'
import { Icon } from '@iconify/react'
import { DRAG_THROTTLE_MS } from '@/lib/constants'

interface GridRowProps {
    row: IGridRow
    index: number
    isSelected: boolean
    onSelect: () => void
    overId: string | null
    validationErrors?: string[]
}

export function GridRow({
    row,
    index,
    isSelected,
    onSelect,
    overId,
    validationErrors = [],
}: GridRowProps) {
    const { data: productsData } = useProducts(row.productIds)

    const { data: templatesData } = useTemplates()
    const templates = templatesData?.templates || []

    const assignTemplateToRow = useGridStore(
        (state) => state.assignTemplateToRow
    )
    const removeRow = useGridStore((state) => state.removeRow)

    const template = row.templateId
        ? getTemplateById(templates, row.templateId)
        : null

    const dragOverTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const lastDragOverTimeRef = useRef<number>(0)

    const rowProductCount = useMemo(
        () => row.productIds.length,
        [row.productIds.length]
    )

    const canAcceptDrop = useMemo(() => rowProductCount < 3, [rowProductCount])

    const isRowFull = useMemo(() => rowProductCount >= 3, [rowProductCount])

    const handleDragOverThrottled = useCallback((event: React.DragEvent) => {
        const now = Date.now()
        const timeSinceLastCall = now - lastDragOverTimeRef.current

        if (timeSinceLastCall >= DRAG_THROTTLE_MS) {
            lastDragOverTimeRef.current = now
            event.preventDefault()
        } else {
            if (dragOverTimeoutRef.current) {
                clearTimeout(dragOverTimeoutRef.current)
            }

            dragOverTimeoutRef.current = setTimeout(() => {
                lastDragOverTimeRef.current = Date.now()
                event.preventDefault()
            }, DRAG_THROTTLE_MS - timeSinceLastCall)
        }
    }, [])

    useEffect(() => {
        return () => {
            if (dragOverTimeoutRef.current) {
                clearTimeout(dragOverTimeoutRef.current)
            }
        }
    }, [])

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
        disabled: !canAcceptDrop,
    })

    const rowStyle = {
        transform: CSS.Transform.toString(rowTransform),
        transition: rowTransition,
    }

    const rowProducts = useMemo(() => {
        if (!productsData?.products) return []
        const productsMap = new Map(productsData.products.map((p) => [p.id, p]))
        return row.productIds
            .map((id) => productsMap.get(id))
            .filter((p): p is IProduct => p !== undefined)
    }, [productsData, row.productIds])

    const productSortableIds = row.productIds.map(
        (productId) => `${row.id}-${productId}`
    )

    const hasErrors = validationErrors.length > 0

    const isHoveringThisRow = useMemo(() => {
        if (!overId) return false
        return overId === `droppable-${row.id}`
    }, [overId, row.id])

    const isHovered = useMemo(
        () => isOver || isHoveringThisRow,
        [isOver, isHoveringThisRow]
    )

    const isBlockedHover = useMemo(
        () => isHoveringThisRow && isRowFull,
        [isHoveringThisRow, isRowFull]
    )

    const isValidHover = useMemo(
        () => isHoveringThisRow && !isRowFull,
        [isHoveringThisRow, isRowFull]
    )

    const alignmentClass = useMemo(() => {
        const alignmentMap: Record<string, string> = {
            LEFT: 'justify-start',
            CENTER: 'justify-center',
            RIGHT: 'justify-end',
        }
        return template
            ? alignmentMap[template.alignment as string] ?? 'justify-start'
            : 'justify-end'
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
                    isValidHover &&
                        'ring-4 ring-success-500 shadow-success/30 scale-[1.01] bg-success-50/30',
                    isBlockedHover &&
                        'ring-4 ring-danger-500 shadow-danger/30 bg-danger-50/20 cursor-not-allowed'
                )}
            >
                <CardHeader
                    className={cn(
                        'flex flex-row items-center justify-between gap-2 px-6 py-4 border-b transition-all duration-200',
                        isValidHover &&
                            'bg-linear-to-r from-success-100 to-success-50 border-success-300',
                        isBlockedHover &&
                            'bg-linear-to-r from-danger-100 to-danger-50 border-danger-300',
                        !isHovered &&
                            'bg-linear-to-r from-default-50 to-default-100/50 border-default-200'
                    )}
                >
                    <div className="flex items-center gap-3">
                        <Button
                            {...rowAttributes}
                            {...rowListeners}
                            variant="bordered"
                            color="default"
                            isIconOnly
                            className="touch-none cursor-grab  active:cursor-grabbing p-1 hover:bg-default-100 rounded-md"
                            aria-label="Drag row"
                        >
                            <Icon
                                icon="akar-icons:drag-vertical"
                                className="w-4 h-4 text-default-400"
                            />
                        </Button>

                        <Chip size="md" variant="bordered" color="default">
                            Row {index + 1}
                        </Chip>

                        <Chip
                            size="md"
                            variant="bordered"
                            color={rowProductCount >= 3 ? 'warning' : 'success'}
                            className={cn(
                                'transition-all duration-200',
                                rowProductCount >= 3 && 'animate-pulse'
                            )}
                        >
                            {rowProductCount}/3 products
                        </Chip>

                        {rowProductCount >= 3 && (
                            <Chip
                                startContent={
                                    <Icon
                                        icon="akar-icons:info-fill"
                                        className="w-4 h-4 mr-1"
                                    />
                                }
                                size="md"
                                variant="bordered"
                                color="warning"
                            >
                                Full
                            </Chip>
                        )}
                        {rowProductCount === 0 && (
                            <Chip
                                startContent={
                                    <Icon
                                        icon="akar-icons:info-fill"
                                        className="w-4 h-4 mr-1"
                                    />
                                }
                                size="md"
                                variant="bordered"
                                color="danger"
                            >
                                File can not be empty
                            </Chip>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {row.templateId === 'template_none' && (
                            <Chip size="md" variant="flat" color="danger">
                                No template assigned
                            </Chip>
                        )}
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

                <div ref={setDropRef} onDragOver={handleDragOverThrottled}>
                    <CardBody
                        className={cn(
                            'min-h-80 p-6 transition-all duration-200',

                            isValidHover &&
                                'bg-success-100/40 backdrop-blur-sm border-2 border-success-400 border-dashed rounded-lg',

                            isBlockedHover &&
                                'bg-danger-100/30 backdrop-blur-sm border-2 border-danger-400 border-dashed rounded-lg'
                        )}
                        onClick={onSelect}
                    >
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

                        {rowProducts.length === 0 && (
                            <div className="flex items-center justify-center h-full text-default-400">
                                <p>Drag products here</p>
                            </div>
                        )}

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
