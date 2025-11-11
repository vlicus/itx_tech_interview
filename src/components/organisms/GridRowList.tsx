/**
 * GridRowList - Organism Component
 * Renders the list of grid rows with drag-and-drop support
 */

import React from 'react'
import {
    DndContext,
    DragOverlay,
    closestCorners,
    pointerWithin,
    rectIntersection,
    DragStartEvent,
    DragEndEvent,
    DragOverEvent,
    SensorDescriptor,
    SensorOptions,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { GridRow } from '@/components/grid/GridRow'
import { ProductCard } from '@/components/product/ProductCard'
import { EmptyGridMessage } from '@/components/molecules'
import { Card, CardBody, CardHeader, Chip } from '@heroui/react'
import { cn } from '@/utils'
import type { IGridRow, IProduct } from '@/types'

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
        row: IGridRow
        products: IProduct[]
        index: number
    }
}

/**
 * RowDragGhost - Visual representation of a row being dragged
 */
const RowDragGhost = React.memo(
    ({ row, products, index }: { row: IGridRow; products: IProduct[]; index: number }) => {
        return (
            <div className="w-full max-w-7xl opacity-100">
                <Card className="w-full shadow-2xl ring-4 ring-primary-500">
                    <CardHeader className="flex flex-row items-center justify-between gap-2 px-6 py-4 border-b bg-linear-to-r from-primary-100 to-primary-50 border-primary-300">
                        <div className="flex items-center gap-3">
                            <Chip size="sm" variant="flat" color="primary">
                                Row {index + 1} - Moving...
                            </Chip>
                            <span className="text-sm text-default-600">
                                {products.length} {products.length === 1 ? 'product' : 'products'}
                            </span>
                        </div>
                    </CardHeader>
                    <CardBody className="p-6 bg-white/95 backdrop-blur-sm">
                        <div className="flex flex-wrap gap-4 justify-center">
                            {products.map((product) => (
                                <div
                                    key={product.id}
                                    className="w-[200px] opacity-90"
                                >
                                    <Card className="w-full shadow-md">
                                        <CardBody className="p-0">
                                            <img
                                                src={product.imageUrl}
                                                alt={product.name}
                                                className="w-full object-cover aspect-[2/3]"
                                            />
                                        </CardBody>
                                        <div className="p-3 flex flex-col gap-1">
                                            <h3 className="text-sm font-medium line-clamp-1">
                                                {product.name}
                                            </h3>
                                            <p className="text-sm font-semibold text-primary">
                                                {product.price}
                                            </p>
                                        </div>
                                    </Card>
                                </div>
                            ))}
                        </div>
                    </CardBody>
                </Card>
            </div>
        )
    }
)

RowDragGhost.displayName = 'RowDragGhost'

interface GridRowListProps {
    rows: IGridRow[]
    sensors: SensorDescriptor<SensorOptions>[]
    selectedRowId: string | null
    onSelectRow: (rowId: string) => void
    errorsByRow: Record<string, { message: string }[]>
    showValidationErrors: boolean
    onDragStart: (event: DragStartEvent) => void
    onDragOver: (event: DragOverEvent) => void
    onDragEnd: (event: DragEndEvent) => void
    onDragCancel: () => void
    activeId: string | null
    activeItem: ActiveDragItem | null
    zoomLevel: number
    gridRef: React.RefObject<HTMLDivElement | null>
}

export const GridRowList = React.memo(
    ({
        rows,
        sensors,
        selectedRowId,
        onSelectRow,
        errorsByRow,
        showValidationErrors,
        onDragStart,
        onDragOver,
        onDragEnd,
        onDragCancel,
        activeId,
        activeItem,
        zoomLevel,
        gridRef,
    }: GridRowListProps) => {
        // Custom collision detection that prioritizes pointer position
        // This works better with multiple rows by checking exact pointer location first
        const customCollisionDetection = (args: any) => {
            // First try pointerWithin - most accurate for user intent
            const pointerCollisions = pointerWithin(args)
            if (pointerCollisions.length > 0) {
                return pointerCollisions
            }

            // Fallback to rectIntersection for dragging
            const rectCollisions = rectIntersection(args)
            if (rectCollisions.length > 0) {
                return rectCollisions
            }

            // Final fallback to closestCorners (better than closestCenter for grids)
            return closestCorners(args)
        }

        return (
            <div className="container mx-auto px-4 py-8">
                <DndContext
                    sensors={sensors}
                    collisionDetection={customCollisionDetection}
                    onDragStart={onDragStart}
                    onDragOver={onDragOver}
                    onDragEnd={onDragEnd}
                    onDragCancel={onDragCancel}
                >
                    {/* Grid content with blur effect when dragging */}
                    <div
                        ref={gridRef}
                        style={{
                            transform: `scale(${zoomLevel})`,
                            transformOrigin: 'top center',
                        }}
                        className="transition-transform duration-200"
                    >
                        <SortableContext
                            items={rows.map((r) => r.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            <div
                                className={`space-y-4 transition-all duration-300 ${
                                    activeId
                                        ? 'blur-[2px] brightness-95'
                                        : 'blur-0 brightness-100'
                                }`}
                            >
                                {rows.map((row, index) => (
                                    <GridRow
                                        key={row.id}
                                        row={row}
                                        index={index}
                                        isSelected={selectedRowId === row.id}
                                        onSelect={() => onSelectRow(row.id)}
                                        validationErrors={
                                            showValidationErrors &&
                                            errorsByRow[row.id]
                                                ? errorsByRow[row.id].map(
                                                      (e) => e.message
                                                  )
                                                : []
                                        }
                                    />
                                ))}
                            </div>
                        </SortableContext>

                        {/* Empty state */}
                        {rows.length === 0 && <EmptyGridMessage />}
                    </div>

                    {/* DragOverlay - Outside blur effect, always crisp */}
                    <DragOverlay
                        dropAnimation={{
                            duration: 200,
                            easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
                        }}
                    >
                        {activeItem && activeItem.type === 'PRODUCT' && activeItem.product ? (
                            <div className="opacity-100 shadow-2xl rotate-3 scale-110 transition-all duration-200 filter-none backdrop-blur-none cursor-grabbing">
                                <ProductCard
                                    product={activeItem.product}
                                    rowId={activeItem.rowId || 'overlay'}
                                    index={-1}
                                    isDragging={true}
                                />
                            </div>
                        ) : activeItem && activeItem.type === 'ROW' && activeItem.rowData ? (
                            <div className="opacity-100 scale-105 transition-all duration-200 filter-none backdrop-blur-none cursor-grabbing">
                                <RowDragGhost
                                    row={activeItem.rowData.row}
                                    products={activeItem.rowData.products}
                                    index={activeItem.rowData.index}
                                />
                            </div>
                        ) : null}
                    </DragOverlay>
                </DndContext>
            </div>
        )
    }
)

GridRowList.displayName = 'GridRowList'
