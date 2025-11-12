import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { ToastContainer } from './ToastContainer'

interface Toast {
    id: string
    message: string
    type: 'success' | 'error' | 'warning' | 'info'
}

const mockToasts: Toast[] = [
    { id: 't1', message: 'Success message', type: 'success' },
    { id: 't2', message: 'Error message', type: 'error' },
    { id: 't3', message: 'Warning message', type: 'warning' },
]

const mockRemoveToast = vi.fn()
let currentToasts: Toast[] = []

vi.mock('@/lib/store', () => ({
    useUIStore: (selector: (state: any) => any) => {
        const state = {
            toasts: currentToasts,
            removeToast: mockRemoveToast,
        }
        return selector(state)
    },
}))

vi.mock('@/utils', () => ({
    cn: vi.fn((...args) => args.filter(Boolean).join(' ')),
}))

vi.mock('lucide-react', () => ({
    CheckCircleIcon: vi.fn(({ className }) => (
        <div data-testid="icon-success" className={className} />
    )),
    XCircleIcon: vi.fn(({ className }) => (
        <div data-testid="icon-error" className={className} />
    )),
    AlertTriangleIcon: vi.fn(({ className }) => (
        <div data-testid="icon-warning" className={className} />
    )),
    InfoIcon: vi.fn(({ className }) => (
        <div data-testid="icon-info" className={className} />
    )),
    XIcon: vi.fn(({ className }) => (
        <div data-testid="icon-close" className={className} />
    )),
}))

vi.mock('@heroui/react', () => ({
    Button: vi.fn(({ children, onPress, 'aria-label': ariaLabel, ...rest }) => (
        <button
            data-testid="mock-button"
            aria-label={ariaLabel}
            onClick={onPress}
            {...rest}
        >
            {children}
        </button>
    )),
}))

describe('ToastContainer', () => {
    beforeEach(() => {
        currentToasts = mockToasts
        mockRemoveToast.mockClear()
        vi.clearAllMocks()
    })

    // --- Test 1: No renderiza si no hay toasts ---
    it('renders null if the toasts array is empty', () => {
        currentToasts = []
        const { container } = render(<ToastContainer />)
        expect(container.firstChild).toBeNull()
    })

    // --- Test 2: Renderizado de múltiples toasts ---
    it('renders all toasts and their messages', () => {
        render(<ToastContainer />)

        expect(screen.getAllByText(/message/)).toHaveLength(3)
        expect(screen.getByText('Success message')).toBeInTheDocument()
        expect(screen.getByText('Error message')).toBeInTheDocument()
        expect(screen.getByText('Warning message')).toBeInTheDocument()
    })

    // --- Test 3: Mapping de íconos y clases de color por tipo ---
    it('renders correct icons and passes color classes based on toast type', () => {
        render(<ToastContainer />)

        const successToast = screen.getByText('Success message').closest('div')
        const errorToast = screen.getByText('Error message').closest('div')
        const warningToast = screen.getByText('Warning message').closest('div')

        // Verifica íconos
        expect(successToast).toContainElement(
            screen.getByTestId('icon-success')
        )
        expect(errorToast).toContainElement(screen.getByTestId('icon-error'))
        expect(warningToast).toContainElement(
            screen.getByTestId('icon-warning')
        )

        // Verifica clases de color (simuladas por cn)
        expect(successToast).toHaveClass(
            'bg-success-50 text-success-900 border-success-200'
        )
        expect(errorToast).toHaveClass(
            'bg-danger-50 text-danger-900 border-danger-200'
        )
        expect(warningToast).toHaveClass(
            'bg-warning-50 text-warning-900 border-warning-200'
        )
    })

    // --- Test 4: Manejo del tipo 'info' ---
    it('renders the correct icon and colors for info type', () => {
        currentToasts = [{ id: 't4', message: 'Info message', type: 'info' }]
        render(<ToastContainer />)

        const infoToast = screen.getByText('Info message').closest('div')

        expect(infoToast).toContainElement(screen.getByTestId('icon-info'))
        expect(infoToast).toHaveClass(
            'bg-primary-50 text-primary-900 border-primary-200'
        )
    })

    // --- Test 5: Funcionalidad de cerrar (removeToast) ---
    it('calls removeToast with the correct ID when the close button is pressed', () => {
        render(<ToastContainer />)

        const closeButtons = screen.getAllByLabelText('Close notification')

        // Simular clic en el botón de la segunda toast (t2)
        fireEvent.click(closeButtons[1])

        expect(mockRemoveToast).toHaveBeenCalledWith('t2')
        expect(mockRemoveToast).toHaveBeenCalledTimes(1)
    })

    // --- Test 6: Estructura y clases de posicionamiento ---
    it('renders the main container with fixed positioning', () => {
        render(<ToastContainer />)

        const container = screen.getByText('Success message').closest('.fixed')

        expect(container).toHaveClass(
            'fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm'
        )
    })
})
