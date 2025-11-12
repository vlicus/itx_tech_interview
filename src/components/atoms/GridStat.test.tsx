import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { GridStat } from './GridStat'

vi.mock('@/utils', () => ({
    cn: (...classes: (string | undefined)[]) =>
        classes.filter(Boolean).join(' '),
}))

describe('GridStat', () => {
    it('should render the value and label correctly', () => {
        const value = 150
        const label = 'Productos'

        render(<GridStat value={value} label={label} />)

        expect(screen.getByText(String(value))).toBeInTheDocument()
        expect(screen.getByText(label)).toBeInTheDocument()

        const valueElement = screen.getByText(String(value))
        expect(valueElement).toHaveClass('font-semibold')
    })

    it('should render with primary variant classes by default', () => {
        render(<GridStat value={5} label="Items" />)
        const container = screen.getByText('Items').closest('div')

        expect(container).toHaveClass('bg-neutral-100')
        expect(container).toHaveClass('text-neutral-700')
        expect(container).toHaveClass('border-neutral-200')
    })

    it('should render with success variant classes when specified', () => {
        render(<GridStat value={5} label="Items" variant="success" />)
        const container = screen.getByText('Items').closest('div')

        expect(container).toHaveClass('bg-green-50')
        expect(container).toHaveClass('text-green-700')
        expect(container).toHaveClass('border-green-200')
    })

    it('should render with danger variant classes when specified', () => {
        render(<GridStat value={1} label="Errors" variant="danger" />)
        const container = screen.getByText('Errors').closest('div')

        expect(container).toHaveClass('bg-red-50')
        expect(container).toHaveClass('text-red-700')
        expect(container).toHaveClass('border-red-200')
    })

    it('should apply custom className to the container', () => {
        const customClass = 'mt-4 shadow-lg'
        render(<GridStat value={10} label="Total" className={customClass} />)
        const container = screen.getByText('Total').closest('div')

        expect(container).toHaveClass('mt-4')
        expect(container).toHaveClass('shadow-lg')
    })

    it('should have a displayName property for memoization', () => {
        expect(GridStat.displayName).toBe('GridStat')
    })
})
