/**
 * EmptyGridMessage - Molecular Component
 * Displays a message when the grid is empty
 */

import React from 'react'

interface EmptyGridMessageProps {
    className?: string
}

export const EmptyGridMessage = React.memo(({ className }: EmptyGridMessageProps) => {
    return (
        <div className={className}>
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <p className="text-lg text-default-400 mb-4">
                    No products loaded
                </p>
                <p className="text-sm text-default-500">
                    Add product IDs to the URL: ?ids=[id1,id2,...]
                </p>
            </div>
        </div>
    )
})

EmptyGridMessage.displayName = 'EmptyGridMessage'
