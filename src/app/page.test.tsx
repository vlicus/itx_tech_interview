import { render, screen, fireEvent } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HeroUIProvider } from '@heroui/react'
import HomePage from './page'

import {
    mockRedirect,
    mockUseSavedGrids,
    mockFormatSavedGrid,
} from '../../vitest.setup'

let queryClient: QueryClient

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <QueryClientProvider client={queryClient}>
            <HeroUIProvider>{children}</HeroUIProvider>
        </QueryClientProvider>
    )
}

describe('HomePage', () => {
    vi.useFakeTimers()

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: {
                queries: {
                    retry: false,
                    staleTime: Infinity,
                },
            },
        })

        mockRedirect.mockClear()
        mockUseSavedGrids.mockClear()
        mockFormatSavedGrid.mockClear()
        vi.clearAllMocks()

        mockUseSavedGrids.mockReturnValue({
            data: { grids: [] },
            isLoading: false,
            isError: false,
        })
    })

    afterEach(() => {
        queryClient.clear()
        vi.runAllTimers()
    })

    it('should render the quick start templates and the empty grid button', () => {
        render(<HomePage />, { wrapper: TestWrapper })
        expect(
            screen.getByRole('button', {
                name: /Empezar con una Parrilla Vacía/i,
            })
        ).toBeInTheDocument()
        expect(screen.getByText('6 Products Grid')).toBeInTheDocument()
    })

    it('should navigate to /products when "Empezar con una Parrilla Vacía" is pressed', () => {
        render(<HomePage />, { wrapper: TestWrapper })
        const startButton = screen.getByRole('button', {
            name: /Empezar con una Parrilla Vacía/i,
        })
        fireEvent.click(startButton)
        expect(mockRedirect).toHaveBeenCalledWith('/products', 'push')
    })

    it('should show loading spinner when fetching saved grids', () => {
        mockUseSavedGrids.mockReturnValue({
            data: undefined,
            isLoading: true,
            isError: false,
        })
        render(<HomePage />, { wrapper: TestWrapper })

        expect(
            screen.getByLabelText('Cargando historial...')
        ).toBeInTheDocument()
    })
})
