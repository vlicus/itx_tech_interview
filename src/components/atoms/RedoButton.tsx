/**
 * RedoButton - Atomic Component
 * Button for redoing actions
 */

import React from 'react'
import { Button, Tooltip } from '@heroui/react'
import { Icon } from '@iconify/react'

interface RedoButtonProps {
    onPress: () => void
    isDisabled?: boolean
}

export const RedoButton = React.memo(
    ({ onPress, isDisabled }: RedoButtonProps) => {
        return (
            <Tooltip className="bg-white rounded-full" content="Redo">
                <Button
                    variant="flat"
                    size="md"
                    onPress={onPress}
                    isDisabled={isDisabled}
                    isIconOnly
                    aria-label="Redo"
                    className=" text-black shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 rounded-full min-w-5 min-h-5 px-4 py-2 flex items-center gap-2"
                >
                    <Icon
                        icon="akar-icons:arrow-forward"
                        className="min-w-full min-h-full h-5 w-5"
                    />
                </Button>
            </Tooltip>
        )
    }
)

RedoButton.displayName = 'RedoButton'
