/**
 * GridToolbar - Molecular Component
 * Main toolbar with stats, undo/redo controls, and actions
 */

import React from 'react'
import { Button, Tooltip } from '@heroui/react'
import { SaveIcon } from 'lucide-react'
import { GridStats } from './GridStats'
import { UndoRedoControls } from './UndoRedoControls'
import { ZoomControls } from '@/components/ui/ZoomControls'
import { Icon } from '@iconify/react'

interface GridToolbarProps {
    rowCount: number
    productCount: number
    onUndo: () => void
    onRedo: () => void
    canUndo: boolean
    canRedo: boolean
    onSave: () => void
    isSaving: boolean
    isValid: boolean
    className?: string
}

export const GridToolbar = React.memo(
    ({
        rowCount,
        productCount,
        onUndo,
        onRedo,
        canUndo,
        canRedo,
        onSave,
        isSaving,
        isValid,
        className,
    }: GridToolbarProps) => {
        return (
            <div className={className}>
                <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-neutral-200 shadow-sm">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
                        {/* Desktop Layout */}
                        <div className="hidden lg:flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <GridStats
                                    rowCount={rowCount}
                                    productCount={productCount}
                                />

                                <div className="h-8 w-px bg-linear-to-b from-transparent via-neutral-300 to-transparent" />

                                <UndoRedoControls
                                    onUndo={onUndo}
                                    onRedo={onRedo}
                                    canUndo={canUndo}
                                    canRedo={canRedo}
                                />
                            </div>

                            <div className="flex items-center gap-5">
                                <ZoomControls />
                                <Tooltip
                                    className="bg-white rounded-full"
                                    content={
                                        !isValid
                                            ? 'Grid must be valid to save'
                                            : 'Save'
                                    }
                                >
                                    <Button
                                        onPress={onSave}
                                        isLoading={isSaving}
                                        className=" text-black shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 rounded-full min-w-4 min-h-10 px-4 py-2 flex items-center gap-2"
                                        startContent={
                                            !isSaving && (
                                                <Icon icon="akar-icons:save" />
                                            )
                                        }
                                    ></Button>
                                </Tooltip>
                            </div>
                        </div>

                        {/* Mobile Layout */}
                        <div className="flex lg:hidden flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <GridStats
                                    rowCount={rowCount}
                                    productCount={productCount}
                                />
                                <UndoRedoControls
                                    onUndo={onUndo}
                                    onRedo={onRedo}
                                    canUndo={canUndo}
                                    canRedo={canRedo}
                                />
                            </div>
                            <div className="flex items-center justify-between gap-2">
                                <ZoomControls />
                                <Tooltip
                                    className="bg-white rounded-full"
                                    content={
                                        !isValid
                                            ? 'Grid must be valid to save'
                                            : 'Save'
                                    }
                                >
                                    <Button
                                        onPress={onSave}
                                        isLoading={isSaving}
                                        className=" text-black shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 rounded-full min-w-4 min-h-10 px-4 py-2 flex items-center gap-2"
                                        startContent={
                                            !isSaving && (
                                                <Icon icon="akar-icons:save" />
                                            )
                                        }
                                    ></Button>
                                </Tooltip>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
)

GridToolbar.displayName = 'GridToolbar'
