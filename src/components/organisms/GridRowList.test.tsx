import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import React from 'react'
import { GridRowList } from './GridRowList'
import { GridRow } from '@/components/grid/GridRow'
import { EmptyGridMessage } from '@/components/molecules'

import { IGridRow } from '@/types'

const mockAddRow = vi.fn()
vi.mock('@/lib/store', () => ({
    useGridStore: (selector: (state: any) => any) => {
        if (selector.toString().includes('addRow')) {
            return mockAddRow
        }
        return {}
    },
}))

vi.mock('@/components/grid/GridRow', () => ({
    GridRow: vi.fn(() => <div data-testid="mock-grid-row" />),
}))
vi.mock('@/components/molecules', () => ({
    EmptyGridMessage: vi.fn(() => <div data-testid="mock-empty-message" />),
}))

vi.mock('@dnd-kit/core', () => ({
    DndContext: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="mock-dnd-context">{children}</div>
    ),
    DragOverlay: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="mock-drag-overlay">{children}</div>
    ),
    closestCorners: vi.fn(),
    pointerWithin: vi.fn(),
    rectIntersection: vi.fn(),
    DragStartEvent: {},
    DragEndEvent: {},
    DragOverEvent: {},
}))

vi.mock('@dnd-kit/sortable', () => ({
    SortableContext: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="mock-sortable-context">{children}</div>
    ),
    verticalListSortingStrategy: vi.fn(),
}))

vi.mock('@heroui/react', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@heroui/react')>()
    return {
        ...actual,
        Card: ({
            children,
            className,
        }: {
            children: React.ReactNode
            className: string
        }) => (
            <div data-testid="mock-card" className={className}>
                {children}
            </div>
        ),
        CardHeader: ({ children }: { children: React.ReactNode }) => (
            <header data-testid="mock-card-header">{children}</header>
        ),
        CardBody: ({ children }: { children: React.ReactNode }) => (
            <section data-testid="mock-card-body">{children}</section>
        ),
        Chip: ({ children }: { children: React.ReactNode }) => (
            <span data-testid="mock-chip">{children}</span>
        ),
        Button: ({
            children,
            onPress,
            ...rest
        }: {
            children: React.ReactNode
            onPress: () => void
        }) => (
            <button data-testid="mock-button" onClick={onPress} {...rest}>
                {children}
            </button>
        ),
    }
})

const MockGridRow = vi.mocked(GridRow)
const MockEmptyGridMessage = vi.mocked(EmptyGridMessage)

const mockRow1 = {
    id: 'r1',
    productIds: ['p1'],
    templateId: 't1',
    order: 1,
} as IGridRow
const mockRow2 = {
    id: 'r2',
    productIds: ['p2', 'p3'],
    templateId: 't2',
    order: 2,
} as IGridRow

const mockRows = [mockRow1, mockRow2] as IGridRow[]

const defaultProps = {
    rows: mockRows,
    sensors: [],
    selectedRowId: null,
    onSelectRow: vi.fn(),
    errorsByRow: {
        r1: [{ message: 'Error in R1' }],
    },
    showValidationErrors: true,
    onDragStart: vi.fn(),
    onDragOver: vi.fn(),
    onDragEnd: vi.fn(),
    onDragCancel: vi.fn(),
    activeId: null,
    activeItem: null,
    overId: null,
    zoomLevel: 1.0,
    gridRef: React.createRef<HTMLDivElement | null>(),
}

describe('GridRowList', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should render DndContext, SortableContext, and GridRows', () => {
        render(<GridRowList {...defaultProps} />)

        expect(screen.getByTestId('mock-dnd-context')).toBeInTheDocument()
        expect(screen.getByTestId('mock-sortable-context')).toBeInTheDocument()

        expect(screen.getAllByTestId('mock-grid-row')).toHaveLength(
            mockRows.length
        )

        expect(MockGridRow).toHaveBeenCalledWith(
            expect.objectContaining({
                row: mockRow1,
                index: 0,
                isSelected: false,
            }),
            undefined
        )
        expect(MockGridRow).toHaveBeenCalledWith(
            expect.objectContaining({
                row: mockRow2,
                index: 1,
                isSelected: false,
            }),
            undefined
        )
    })

    it('should pass validation errors to GridRow when showValidationErrors is true', () => {
        render(<GridRowList {...defaultProps} showValidationErrors={true} />)

        expect(MockGridRow).toHaveBeenCalledWith(
            expect.objectContaining({
                row: mockRow1,
                validationErrors: ['Error in R1'],
            }),
            undefined
        )
        expect(MockGridRow).toHaveBeenCalledWith(
            expect.objectContaining({
                row: mockRow2,
                validationErrors: [],
            }),
            undefined
        )
    })

    it('should call onSelectRow when a row is clicked', () => {
        render(<GridRowList {...defaultProps} />)

        MockGridRow.mock.calls[0][0].onSelect()

        expect(defaultProps.onSelectRow).toHaveBeenCalledWith('r1')
    })

    it('should call addRow when the "Add Empty Row" button is pressed', () => {
        render(<GridRowList {...defaultProps} />)

        const addButton = screen.getByText('Add Empty Row')
        fireEvent.click(addButton)

        expect(mockAddRow).toHaveBeenCalled()
    })

    it('should NOT render EmptyGridMessage when rows exist', () => {
        render(<GridRowList {...defaultProps} />)
        expect(MockEmptyGridMessage).not.toHaveBeenCalled()
    })

    it('should render EmptyGridMessage when there are no rows', () => {
        render(<GridRowList {...defaultProps} rows={[]} />)
        expect(MockEmptyGridMessage).toHaveBeenCalled()
    })
})
