import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { EmptyGridMessage } from './EmptyGridMessage'

describe('EmptyGridMessage', () => {
    it('should render the main "No products loaded" message', () => {
        render(<EmptyGridMessage />)

        expect(screen.getByText('No products loaded')).toBeInTheDocument()
    })

    it('should render the instructions for adding product IDs', () => {
        render(<EmptyGridMessage />)

        expect(
            screen.getByText(/Add product IDs to the URL/i)
        ).toBeInTheDocument()

        expect(screen.getByText(/ids=\[id1,id2,...\]/i)).toBeInTheDocument()
    })

    it('should apply the provided className to the root element', () => {
        const customClass = 'my-custom-class-1 my-custom-class-2'
        render(<EmptyGridMessage className={customClass} />)

        const textElement = screen.getByText('No products loaded')
        const rootElement = textElement.closest('.flex')?.parentElement

        expect(rootElement).toBeInTheDocument()
        expect(rootElement).toHaveClass(customClass)
    })

    it('should have the correct displayName for React.memo', () => {
        expect(EmptyGridMessage.displayName).toBe('EmptyGridMessage')
    })
})
