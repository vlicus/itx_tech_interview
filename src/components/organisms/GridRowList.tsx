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
    CollisionDetection,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { GridRow } from '@/components/grid/GridRow'
import { EmptyGridMessage } from '@/components/molecules'
import type { IGridRow } from '@/types'

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
        zoomLevel,
        gridRef,
    }: GridRowListProps) => {
        // Custom collision detection that prioritizes pointer position
        // This works better with multiple rows by checking exact pointer location first
        const customCollisionDetection: CollisionDetection = (args) => {
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
                    <DragOverlay dropAnimation={null}>
                        {activeId ? (
                            <div className="opacity-100 shadow-2xl ring-4 ring-primary-500 rotate-2 scale-110 transition-all duration-200 filter-none backdrop-blur-none">
                                <div className="bg-linear-to-br from-primary-100 to-primary-200 rounded-xl px-5 py-4 border-2 border-primary-400 shadow-xl">
                                    <span className="text-base font-bold text-primary-900 flex items-center gap-2">
                                        <span className="text-xl">✋</span>
                                        <span>Dragging...</span>
                                    </span>
                                </div>
                            </div>
                        ) : null}
                    </DragOverlay>
                </DndContext>
            </div>
        )
    }
)

GridRowList.displayName = 'GridRowList'
