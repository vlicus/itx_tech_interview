import { render } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { GridStats } from './GridStats'
import { GridStat } from '@/components/atoms'

vi.mock('@/components/atoms', () => ({
    GridStat: vi.fn(),
}))

describe('GridStats', () => {
    beforeEach(() => {
        vi.mocked(GridStat).mockClear()
    })

    it('should pass plural "rows" label when rowCount is not 1', () => {
        render(<GridStats rowCount={5} productCount={10} />)

        expect(GridStat).toHaveBeenCalledWith(
            expect.objectContaining({
                value: 5,
                label: 'rows',
                variant: 'success',
            }),
            undefined
        )

        expect(GridStat).toHaveBeenCalledWith(
            expect.objectContaining({
                value: 10,
                label: 'products',
                variant: 'success',
            }),
            undefined
        )

        expect(GridStat).toHaveBeenCalledTimes(2)
    })

    it('should pass singular "row" label when rowCount is exactly 1', () => {
        render(<GridStats rowCount={1} productCount={3} />)

        expect(GridStat).toHaveBeenCalledWith(
            expect.objectContaining({
                value: 1,
                label: 'row',
                variant: 'success',
            }),
            undefined
        )

        expect(GridStat).toHaveBeenCalledWith(
            expect.objectContaining({
                value: 3,
                label: 'products',
                variant: 'success',
            }),
            undefined
        )
    })

    it('should pass plural "rows" label when rowCount is 0', () => {
        render(<GridStats rowCount={0} productCount={0} />)

        expect(GridStat).toHaveBeenCalledWith(
            expect.objectContaining({
                value: 0,
                label: 'rows',
                variant: 'success',
            }),
            undefined
        )

        expect(GridStat).toHaveBeenCalledWith(
            expect.objectContaining({
                value: 0,
                label: 'products',
                variant: 'success',
            }),
            undefined
        )
    })

    it('should apply custom className to the root element', () => {
        const customClass = 'mt-10 p-4'
        const { container } = render(
            <GridStats rowCount={1} productCount={1} className={customClass} />
        )
        expect(container.firstChild).toHaveClass(customClass)
    })

    it('should have the correct displayName for React.memo', () => {
        expect(GridStats.displayName).toBe('GridStats')
    })
})
