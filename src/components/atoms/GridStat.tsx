import React from 'react'
import { cn } from '@/utils'

interface GridStatProps {
    value: number
    label: string
    variant?: 'primary' | 'success' | 'warning' | 'danger'
    className?: string
}

export const GridStat = React.memo(
    ({ value, label, variant = 'primary', className }: GridStatProps) => {
        const variantClasses = {
            primary:
                'bg-neutral-100 text-neutral-700 border border-neutral-200',
            success: 'bg-green-50 text-green-700 border border-green-200',
            warning: 'bg-amber-50 text-amber-700 border border-amber-200',
            danger: 'bg-red-50 text-red-700 border border-red-200',
        }

        return (
            <div
                className={cn(
                    'px-3 py-1.5 rounded-xl text-sm font-medium transition-colors duration-200',
                    variantClasses[variant],
                    className
                )}
            >
                <span className="font-semibold">{value}</span>{' '}
                <span className="text-neutral-500">{label}</span>
            </div>
        )
    }
)

GridStat.displayName = 'GridStat'
