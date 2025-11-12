import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { ZoomControls } from './ZoomControls'

const mockZoomIn = vi.fn()
const mockZoomOut = vi.fn()
const mockResetZoom = vi.fn()
let currentZoomLevel = 1.0

vi.mock('@/lib/store', () => ({
    useUIStore: (selector: (state: any) => any) => {
        const state = {
            zoomLevel: currentZoomLevel,
            zoomIn: mockZoomIn,
            zoomOut: mockZoomOut,
            resetZoom: mockResetZoom,
        }
        return selector(state)
    },
}))

vi.mock('@heroui/react', () => ({
    Button: vi.fn(
        ({
            children,
            onPress,
            isDisabled,
            'aria-label': ariaLabel,
            ...rest
        }) => (
            <button
                data-testid={`mock-button-${ariaLabel
                    ?.toLowerCase()
                    .replace(/\s/g, '-')}`}
                onClick={isDisabled ? undefined : onPress}
                disabled={isDisabled}
                aria-label={ariaLabel}
                {...rest}
            >
                {children}
            </button>
        )
    ),
    Tooltip: vi.fn(({ children, content }) => (
        <div data-testid={`mock-tooltip`} data-content={content}>
            {children}
        </div>
    )),
}))

vi.mock('@iconify/react', () => ({
    Icon: vi.fn(({ icon }) => <div data-testid={`mock-icon-${icon}`} />),
}))

describe('ZoomControls', () => {
    beforeEach(() => {
        currentZoomLevel = 1.0
        mockZoomIn.mockClear()
        mockZoomOut.mockClear()
        mockResetZoom.mockClear()
        vi.clearAllMocks()
    })

    it('renders with the current zoom level percentage', () => {
        currentZoomLevel = 1.5
        render(<ZoomControls />)
        expect(screen.getByText('150%')).toBeInTheDocument()
    })

    it('calls zoomOut when the zoom out button is clicked', () => {
        render(<ZoomControls />)
        fireEvent.click(screen.getByLabelText('Zoom out'))
        expect(mockZoomOut).toHaveBeenCalledTimes(1)
    })

    it('calls resetZoom when the percentage button is clicked', () => {
        render(<ZoomControls />)
        fireEvent.click(screen.getByLabelText('Reset zoom'))
        expect(mockResetZoom).toHaveBeenCalledTimes(1)
    })

    it('calls zoomIn when the zoom in button is clicked', () => {
        render(<ZoomControls />)
        fireEvent.click(screen.getByLabelText('Zoom in'))
        expect(mockZoomIn).toHaveBeenCalledTimes(1)
    })

    it('disables zoom out button when zoomLevel is 0.5 or less', () => {
        currentZoomLevel = 0.5
        render(<ZoomControls />)
        const zoomOutButton = screen.getByLabelText('Zoom out')
        expect(zoomOutButton).toBeDisabled()

        fireEvent.click(zoomOutButton)
        expect(mockZoomOut).not.toHaveBeenCalled()
    })

    it('enables zoom out button when zoomLevel is above 0.5', () => {
        currentZoomLevel = 0.6
        render(<ZoomControls />)
        expect(screen.getByLabelText('Zoom out')).not.toBeDisabled()
    })

    it('disables zoom in button when zoomLevel is 2.0 or more', () => {
        currentZoomLevel = 2.0
        render(<ZoomControls />)
        const zoomInButton = screen.getByLabelText('Zoom in')
        expect(zoomInButton).toBeDisabled()

        fireEvent.click(zoomInButton)
        expect(mockZoomIn).not.toHaveBeenCalled()
    })

    it('enables zoom in button when zoomLevel is below 2.0', () => {
        currentZoomLevel = 1.99
        render(<ZoomControls />)
        expect(screen.getByLabelText('Zoom in')).not.toBeDisabled()
    })

    describe('Keyboard Shortcuts', () => {
        it('calls zoomIn on Ctrl/Meta + =', () => {
            render(<ZoomControls />)
            fireEvent.keyDown(window, { key: '=', ctrlKey: true })
            fireEvent.keyDown(window, { key: '=', metaKey: true })
            expect(mockZoomIn).toHaveBeenCalledTimes(2)
        })

        it('calls zoomOut on Ctrl/Meta + -', () => {
            render(<ZoomControls />)
            fireEvent.keyDown(window, { key: '-', ctrlKey: true })
            fireEvent.keyDown(window, { key: '-', metaKey: true })
            expect(mockZoomOut).toHaveBeenCalledTimes(2)
        })

        it('calls resetZoom on Ctrl/Meta + 0', () => {
            render(<ZoomControls />)
            fireEvent.keyDown(window, { key: '0', ctrlKey: true })
            fireEvent.keyDown(window, { key: '0', metaKey: true })
            expect(mockResetZoom).toHaveBeenCalledTimes(2)
        })

        it('removes the event listener on unmount', () => {
            const map = {} as any
            vi.spyOn(window, 'addEventListener').mockImplementation(
                (event, cb) => {
                    map[event] = cb
                }
            )
            vi.spyOn(window, 'removeEventListener').mockImplementation(
                (event) => {
                    delete map[event]
                }
            )

            const { unmount } = render(<ZoomControls />)
            expect(window.addEventListener).toHaveBeenCalledWith(
                'keydown',
                expect.any(Function)
            )

            unmount()
            expect(window.removeEventListener).toHaveBeenCalledWith(
                'keydown',
                expect.any(Function)
            )
        })
    })
})
