/**
 * UndoButton - Atomic Component
 * Button for undoing actions
 */

import React from 'react'
import { Button, Tooltip } from '@heroui/react'
import { Icon } from '@iconify/react'

interface UndoButtonProps {
    onPress: () => void
    isDisabled?: boolean
    className?: string
}

export const UndoButton = React.memo(
    ({ onPress, isDisabled, className }: UndoButtonProps) => {
        return (
            <Tooltip className="bg-white rounded-full" content="Undo">
                <Button
                    variant="flat"
                    size="md"
                    onPress={onPress}
                    isDisabled={isDisabled}
                    isIconOnly
                    aria-label="Undo"
                    className=" text-black shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 rounded-full min-w-5 min-h-5 px-4 py-2 flex items-center gap-2"
                >
                    <Icon
                        icon="akar-icons:arrow-back"
                        className="min-w-full min-h-full h-5 w-5"
                    />
                </Button>
            </Tooltip>
        )
    }
)

UndoButton.displayName = 'UndoButton'
