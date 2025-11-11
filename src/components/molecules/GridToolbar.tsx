/**
 * GridToolbar - Molecular Component
 * Main toolbar with stats, undo/redo controls, and actions
 */

import React from 'react'
import { Button, Tooltip, Chip } from '@heroui/react'
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
    shareableURL: string | null
    onCopyURL: () => Promise<boolean>
    hasUnsavedChanges: boolean
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
        shareableURL,
        onCopyURL,
        hasUnsavedChanges,
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

                                {/* Unsaved changes indicator */}
                                {hasUnsavedChanges && (
                                    <Chip
                                        size="sm"
                                        color="warning"
                                        variant="flat"
                                        className="animate-pulse"
                                    >
                                        Unsaved changes
                                    </Chip>
                                )}

                                <div className="h-8 w-px bg-linear-to-b from-transparent via-neutral-300 to-transparent" />

                                <UndoRedoControls
                                    onUndo={onUndo}
                                    onRedo={onRedo}
                                    canUndo={canUndo}
                                    canRedo={canRedo}
                                />
                            </div>

                            <div className="flex items-center gap-3">
                                <ZoomControls />

                                <div className="flex items-center gap-2">
                                    {/* Copy URL Button - shown after saving */}
                                    {shareableURL && (
                                        <Tooltip
                                            className="bg-white rounded-full"
                                            content="Copy shareable URL"
                                        >
                                            <Button
                                                onPress={onCopyURL}
                                                isIconOnly
                                                className="text-indigo-600 border-indigo-200 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 rounded-full min-w-10 min-h-10"
                                                variant="bordered"
                                            >
                                                <Icon
                                                    icon="akar-icons:link-chain"
                                                    className="w-5 h-5"
                                                />
                                            </Button>
                                        </Tooltip>
                                    )}

                                    {/* Save Button */}
                                    <Tooltip
                                        className="bg-white rounded-full"
                                        content={
                                            !isValid
                                                ? 'Grid must be valid to save'
                                                : 'Save grid and generate shareable URL'
                                        }
                                    >
                                        <Button
                                            onPress={onSave}
                                            isLoading={isSaving}
                                            isDisabled={!isValid}
                                            className="text-black shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 rounded-full min-w-4 min-h-10 px-4 py-2 flex items-center gap-2"
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

                        {/* Mobile Layout */}
                        <div className="flex lg:hidden flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <GridStats
                                        rowCount={rowCount}
                                        productCount={productCount}
                                    />
                                    {/* Unsaved changes indicator */}
                                    {hasUnsavedChanges && (
                                        <Chip
                                            size="sm"
                                            color="warning"
                                            variant="flat"
                                            className="animate-pulse"
                                        >
                                            Unsaved
                                        </Chip>
                                    )}
                                </div>
                                <UndoRedoControls
                                    onUndo={onUndo}
                                    onRedo={onRedo}
                                    canUndo={canUndo}
                                    canRedo={canRedo}
                                />
                            </div>
                            <div className="flex items-center justify-between gap-2">
                                <ZoomControls />

                                <div className="flex items-center gap-2">
                                    {/* Copy URL Button - shown after saving */}
                                    {shareableURL && (
                                        <Tooltip
                                            className="bg-white rounded-full"
                                            content="Copy URL"
                                        >
                                            <Button
                                                onPress={onCopyURL}
                                                isIconOnly
                                                className="text-indigo-600 border-indigo-200 shadow-md hover:shadow-lg transition-all duration-200 rounded-full min-w-10 min-h-10"
                                                variant="bordered"
                                                size="sm"
                                            >
                                                <Icon
                                                    icon="akar-icons:link-chain"
                                                    className="w-4 h-4"
                                                />
                                            </Button>
                                        </Tooltip>
                                    )}

                                    {/* Save Button */}
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
                                            isDisabled={!isValid}
                                            className="text-black shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 rounded-full min-w-4 min-h-10 px-4 py-2 flex items-center gap-2"
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
            </div>
        )
    }
)

GridToolbar.displayName = 'GridToolbar'
