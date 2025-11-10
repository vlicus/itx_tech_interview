/**
 * UndoRedoControls - Molecular Component
 * Groups undo and redo buttons together
 */

import React from 'react'
import { UndoButton, RedoButton } from '@/components/atoms'

interface UndoRedoControlsProps {
    onUndo: () => void
    onRedo: () => void
    canUndo: boolean
    canRedo: boolean
    className?: string
}

export const UndoRedoControls = React.memo(({
    onUndo,
    onRedo,
    canUndo,
    canRedo,
    className,
}: UndoRedoControlsProps) => {
    return (
        <div className={className}>
            <div className="flex items-center gap-2">
                <UndoButton onPress={onUndo} isDisabled={!canUndo} />
                <RedoButton onPress={onRedo} isDisabled={!canRedo} />
            </div>
        </div>
    )
})

UndoRedoControls.displayName = 'UndoRedoControls'
