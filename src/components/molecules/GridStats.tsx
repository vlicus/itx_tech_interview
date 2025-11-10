/**
 * GridStats - Molecular Component
 * Displays grid statistics (rows and products count)
 */

import React from 'react'
import { GridStat } from '@/components/atoms'

interface GridStatsProps {
    rowCount: number
    productCount: number
    className?: string
}

export const GridStats = React.memo(
    ({ rowCount, productCount, className }: GridStatsProps) => {
        return (
            <div className={className}>
                <div className="flex items-center gap-2">
                    <GridStat
                        value={rowCount}
                        label={rowCount === 1 ? 'row' : 'rows'}
                        variant="success"
                    />
                    <GridStat
                        value={productCount}
                        label="products"
                        variant="success"
                    />
                </div>
            </div>
        )
    }
)

GridStats.displayName = 'GridStats'
