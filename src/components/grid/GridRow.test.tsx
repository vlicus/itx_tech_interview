import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { GridRow } from './GridRow'

import {
    mockSortable,
    mockDroppable,
    mockUseProducts,
    mockUseTemplates,
    mockAssignTemplateToRow,
    mockRemoveRow,
    mockGetTemplateById,
} from '../../../vitest.setup'

vi.mock('@dnd-kit/utilities', () => ({
    CSS: { Transform: { toString: vi.fn(() => 'translate3d(0, 0, 0)') } },
}))
vi.mock('@/components/product/ProductCard', () => ({
    ProductCard: ({ product }: any) => <div>ProductCard {product.id}</div>,
}))
vi.mock('@/components/ui/TemplateSelector', () => ({
    TemplateSelector: ({ onTemplateChange }: any) => (
        <button onClick={() => onTemplateChange('new-temp-id')}>
            TemplateSelector
        </button>
    ),
}))

const MOCK_ROW = {
    id: 'r1',
    productIds: ['p1', 'p2'],
    templateId: 'tempA',
    rowType: 'default',
    order: 1,
}

const MOCK_PRODUCTS_DATA = {
    products: [
        { id: 'p1', name: 'Product 1', price: 10 },
        { id: 'p2', name: 'Product 2', price: 20 },
        { id: 'p3', name: 'Product 3', price: 30 },
    ],
}

const MOCK_TEMPLATES_DATA = {
    templates: [
        { id: 'tempA', name: 'Template A', alignment: 'LEFT' },
        { id: 'tempB', name: 'Template B', alignment: 'CENTER' },
    ],
}

const MOCK_TEMPLATE_A = MOCK_TEMPLATES_DATA.templates[0]

let queryClient: QueryClient

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

beforeEach(() => {
    queryClient = new QueryClient()

    mockSortable.mockReturnValue({
        attributes: {},
        listeners: { onDrag: vi.fn() },
        setNodeRef: vi.fn(),
        transform: null,
        transition: null,
        isDragging: false,
    })

    mockDroppable.mockReturnValue({
        setNodeRef: vi.fn(),
        isOver: false,
    })

    mockUseProducts.mockReturnValue({ data: MOCK_PRODUCTS_DATA })
    mockUseTemplates.mockReturnValue({ data: MOCK_TEMPLATES_DATA })

    mockGetTemplateById.mockReturnValue(MOCK_TEMPLATE_A)

    mockAssignTemplateToRow.mockClear()
    mockRemoveRow.mockClear()
})

afterEach(() => {
    queryClient.clear()
    cleanup()
})

describe('GridRow', () => {
    const defaultProps = {
        row: MOCK_ROW,
        index: 0,
        isSelected: false,
        onSelect: vi.fn(),
        overId: null,
        validationErrors: [],
    }

    it('should render the row index, product count, and ProductCards', () => {
        render(<GridRow {...defaultProps} />, { wrapper: TestWrapper })
        expect(screen.getByText('Row 1')).toBeInTheDocument()
        expect(screen.getByText('2/3 products')).toBeInTheDocument()
        expect(screen.getByText('ProductCard p1')).toBeInTheDocument()
        expect(screen.getByText('ProductCard p2')).toBeInTheDocument()
    })

    it('should calculate the correct product count (0/3)', () => {
        const emptyRow = { ...MOCK_ROW, productIds: [] }
        render(<GridRow {...defaultProps} row={emptyRow} />, {
            wrapper: TestWrapper,
        })
        expect(screen.getByText('0/3 products')).toBeInTheDocument()
        expect(screen.getByText('File can not be empty')).toBeInTheDocument()
        expect(screen.getByText('Drag products here')).toBeInTheDocument()
    })

    it('should call removeRow when the delete button is pressed', () => {
        render(<GridRow {...defaultProps} />, { wrapper: TestWrapper })
        fireEvent.click(screen.getByRole('button', { name: /Delete row/i }))
        expect(mockRemoveRow).toHaveBeenCalledWith(MOCK_ROW.id)
    })

    it('should call assignTemplateToRow when a template is selected', () => {
        render(<GridRow {...defaultProps} />, { wrapper: TestWrapper })
        fireEvent.click(
            screen.getByRole('button', { name: /TemplateSelector/i })
        )
        expect(mockAssignTemplateToRow).toHaveBeenCalledWith(
            MOCK_ROW.id,
            'new-temp-id'
        )
    })
})
