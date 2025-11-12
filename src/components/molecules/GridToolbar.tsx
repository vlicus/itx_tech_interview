import React from 'react'
import { Button, Tooltip, Chip } from '@heroui/react'
import { GridStats } from './GridStats'
import { ZoomControls } from '@/components/ui/ZoomControls'
import { Icon } from '@iconify/react'
import { redirect, RedirectType } from 'next/navigation'

interface GridToolbarProps {
    rowCount: number
    productCount: number
    onSave: () => void
    isSaving: boolean
    isValid: boolean
    hasUnsavedChanges: boolean
    className?: string
}

export const GridToolbar = React.memo(
    ({
        rowCount,
        productCount,
        onSave,
        isSaving,
        isValid,
        hasUnsavedChanges,
        className,
    }: GridToolbarProps) => {
        return (
            <div className={className}>
                <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-neutral-200 shadow-sm">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
                        <div className="hidden lg:flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <Button
                                    isIconOnly
                                    variant="flat"
                                    color="default"
                                    onPress={() =>
                                        redirect('/', RedirectType.push)
                                    }
                                >
                                    <Icon icon="akar-icons:home" />
                                </Button>
                                <GridStats
                                    rowCount={rowCount}
                                    productCount={productCount}
                                />
                                <ZoomControls />
                            </div>

                            <div className="flex items-center gap-3">
                                {hasUnsavedChanges && (
                                    <Chip
                                        size="md"
                                        color="warning"
                                        variant="bordered"
                                        className="animate-pulse"
                                    >
                                        Unsaved changes
                                    </Chip>
                                )}
                                <Tooltip
                                    className="bg-white rounded-full"
                                    content={
                                        !isValid
                                            ? 'Grid must be valid to save'
                                            : 'Save grid'
                                    }
                                >
                                    <Button
                                        onPress={onSave}
                                        isLoading={isSaving}
                                        isDisabled={!isValid}
                                        variant="bordered"
                                        color="default"
                                        className="text-black transition-all duration-200 hover:scale-105 rounded-full min-w-4 min-h-10 px-4 py-2 flex items-center gap-2"
                                        startContent={
                                            !isSaving && (
                                                <Icon icon="akar-icons:save" />
                                            )
                                        }
                                    >
                                        Save
                                    </Button>
                                </Tooltip>
                            </div>
                        </div>

                        <div className="flex lg:hidden flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <GridStats
                                        rowCount={rowCount}
                                        productCount={productCount}
                                    />
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
                                        isDisabled={!isValid}
                                        className="text-black shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 rounded-full min-w-4 min-h-10 px-4 py-2 flex items-center gap-2"
                                        startContent={
                                            !isSaving && (
                                                <Icon icon="akar-icons:save" />
                                            )
                                        }
                                    >
                                        Save
                                    </Button>
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
