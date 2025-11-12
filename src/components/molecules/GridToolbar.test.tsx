import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { GridToolbar } from './GridToolbar'
import { mockRedirect } from '../../../vitest.setup'

vi.mock('./GridStats')
vi.mock('@/components/ui/ZoomControls')

vi.mock('@heroui/react', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@heroui/react')>()
    return {
        ...actual,
        Tooltip: ({ children }: { children: React.ReactNode }) => (
            <>{children}</>
        ),
    }
})

describe('GridToolbar', () => {
    const mockOnSave = vi.fn()

    const defaultProps = {
        rowCount: 5,
        productCount: 10,
        onSave: mockOnSave,
        isSaving: false,
        isValid: true,
        hasUnsavedChanges: false,
        className: 'test-class',
    }

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should apply custom className to the root element', () => {
        const { container } = render(<GridToolbar {...defaultProps} />)
        expect(container.firstChild).toHaveClass('test-class')
    })

    it('should call redirect when the Home button is clicked', () => {
        render(<GridToolbar {...defaultProps} />)

        const homeButton = screen.getByRole('button', { name: '' })

        fireEvent.click(homeButton)
        expect(mockRedirect).toHaveBeenCalledWith('/', 'push')
    })

    it('should NOT display the "Unsaved changes" chip when hasUnsavedChanges is false', () => {
        render(<GridToolbar {...defaultProps} hasUnsavedChanges={false} />)
        expect(screen.queryByText('Unsaved changes')).not.toBeInTheDocument()
    })

    it('should display the "Unsaved changes" chip when hasUnsavedChanges is true', () => {
        render(<GridToolbar {...defaultProps} hasUnsavedChanges={true} />)

        expect(screen.getByText('Unsaved changes')).toBeInTheDocument()
        expect(screen.getByText('Unsaved')).toBeInTheDocument()
    })

    it('should enable the Save button when isValid is true and not saving', () => {
        render(
            <GridToolbar {...defaultProps} isValid={true} isSaving={false} />
        )

        const saveButtons = screen.getAllByRole('button', { name: /Save/i })

        expect(saveButtons[0]).toBeEnabled()
        expect(saveButtons[1]).toBeEnabled()
    })

    it('should disable the Save button when isValid is false', () => {
        render(<GridToolbar {...defaultProps} isValid={false} />)

        const saveButtons = screen.getAllByRole('button', { name: /Save/i })

        expect(saveButtons[0]).toBeDisabled()
        expect(saveButtons[1]).toBeDisabled()
    })

    it('should disable the Save button when isSaving is true', () => {
        render(<GridToolbar {...defaultProps} isSaving={true} />)

        const saveButtons = screen.getAllByRole('button', { name: /Save/i })

        expect(saveButtons[0]).toBeDisabled()
        expect(saveButtons[1]).toBeDisabled()
    })

    it('should call onSave when the (valid) Save button is clicked', () => {
        render(<GridToolbar {...defaultProps} isValid={true} />)

        const saveButtons = screen.getAllByRole('button', { name: /Save/i })
        fireEvent.click(saveButtons[0])

        expect(mockOnSave).toHaveBeenCalledTimes(1)
    })

    it('should NOT call onSave when the (invalid) Save button is clicked', () => {
        render(<GridToolbar {...defaultProps} isValid={false} />)

        const saveButtons = screen.getAllByRole('button', { name: /Save/i })
        fireEvent.click(saveButtons[0])

        expect(mockOnSave).not.toHaveBeenCalled()
    })
})
