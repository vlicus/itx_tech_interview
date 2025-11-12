import { describe, it, expect, beforeEach } from 'vitest'
import { useGridStore } from './gridStore'

describe('gridStore', () => {
    beforeEach(() => {
        useGridStore.getState().resetGrid()
    })

    describe('Row Management', () => {
        it('should add an empty row with default template', () => {
            useGridStore.getState().addRow()

            const rows = useGridStore.getState().rows

            expect(rows).toHaveLength(1)
            expect(rows[0].productIds).toHaveLength(0)
            expect(rows[0].templateId).toBe('template_right')
            expect(rows[0].order).toBe(0)
            expect(rows[0].id).toMatch(/^row_/)
        })

        it('should add multiple empty rows with correct order', () => {
            useGridStore.getState().addRow()
            useGridStore.getState().addRow()
            useGridStore.getState().addRow()

            const rows = useGridStore.getState().rows

            expect(rows).toHaveLength(3)
            expect(rows[0].order).toBe(0)
            expect(rows[1].order).toBe(1)
            expect(rows[2].order).toBe(2)
        })

        it('should add row with products using dynamic template (1 product)', () => {
            useGridStore.getState().addRowWithProducts(['p1'])

            const rows = useGridStore.getState().rows

            expect(rows).toHaveLength(1)
            expect(rows[0].productIds).toEqual(['p1'])
            expect(rows[0].templateId).toBe('template_right')
        })

        it('should add row with products using dynamic template (2 products)', () => {
            useGridStore.getState().addRowWithProducts(['p1', 'p2'])

            const rows = useGridStore.getState().rows

            expect(rows).toHaveLength(1)
            expect(rows[0].productIds).toEqual(['p1', 'p2'])
            expect(rows[0].templateId).toBe('template_left')
        })

        it('should add row with products using dynamic template (3 products)', () => {
            useGridStore.getState().addRowWithProducts(['p1', 'p2', 'p3'])

            const rows = useGridStore.getState().rows

            expect(rows).toHaveLength(1)
            expect(rows[0].productIds).toEqual(['p1', 'p2', 'p3'])
            expect(rows[0].templateId).toBe('template_center')
        })

        it('should enforce max 3 products when adding row', () => {
            useGridStore.getState().addRowWithProducts([
                'p1',
                'p2',
                'p3',
                'p4',
                'p5',
            ])

            const rows = useGridStore.getState().rows

            expect(rows[0].productIds).toHaveLength(3)
            expect(rows[0].productIds).toEqual(['p1', 'p2', 'p3'])
        })

        it('should remove row by id', () => {
            useGridStore.getState().addRow()
            useGridStore.getState().addRow()

            const rows = useGridStore.getState().rows
            const firstRowId = rows[0].id

            useGridStore.getState().removeRow(firstRowId)

            const updatedRows = useGridStore.getState().rows

            expect(updatedRows).toHaveLength(1)
            expect(updatedRows[0].id).not.toBe(firstRowId)
        })

        it('should update order when removing row', () => {
            useGridStore.getState().addRow()
            useGridStore.getState().addRow()
            useGridStore.getState().addRow()

            const rows = useGridStore.getState().rows
            const middleRowId = rows[1].id

            useGridStore.getState().removeRow(middleRowId)

            const updatedRows = useGridStore.getState().rows

            expect(updatedRows).toHaveLength(2)
            expect(updatedRows[0].order).toBe(0)
            expect(updatedRows[1].order).toBe(1)
        })

        it('should clear selected row when removing it', () => {
            useGridStore.getState().addRow()

            const rows = useGridStore.getState().rows
            const rowId = rows[0].id

            useGridStore.getState().selectRow(rowId)
            expect(useGridStore.getState().selectedRowId).toBe(rowId)

            useGridStore.getState().removeRow(rowId)

            expect(useGridStore.getState().selectedRowId).toBeNull()
        })

        it('should move row to new position', () => {
            useGridStore.getState().addRowWithProducts(['p1'])
            useGridStore.getState().addRowWithProducts(['p2'])
            useGridStore.getState().addRowWithProducts(['p3'])

            const rows = useGridStore.getState().rows
            const firstRowId = rows[0].id

            useGridStore.getState().moveRow(0, 2)

            const updatedRows = useGridStore.getState().rows

            expect(updatedRows[2].id).toBe(firstRowId)
            expect(updatedRows[0].order).toBe(0)
            expect(updatedRows[1].order).toBe(1)
            expect(updatedRows[2].order).toBe(2)
        })
    })

    describe('Product-Row Operations', () => {
        it('should add product to row', () => {
            useGridStore.getState().addRow()

            const rows = useGridStore.getState().rows
            const rowId = rows[0].id

            useGridStore.getState().addProductToRow('p1', rowId)

            const updatedRows = useGridStore.getState().rows

            expect(updatedRows[0].productIds).toEqual(['p1'])
        })

        it('should not add product to row if already at max capacity', () => {
            useGridStore.getState().addRowWithProducts(['p1', 'p2', 'p3'])

            const rows = useGridStore.getState().rows
            const rowId = rows[0].id

            useGridStore.getState().addProductToRow('p4', rowId)

            const updatedRows = useGridStore.getState().rows

            expect(updatedRows[0].productIds).toHaveLength(3)
            expect(updatedRows[0].productIds).not.toContain('p4')
        })

        it('should remove product from row', () => {
            useGridStore.getState().addRowWithProducts(['p1', 'p2', 'p3'])

            const rows = useGridStore.getState().rows
            const rowId = rows[0].id

            useGridStore.getState().removeProductFromRow('p2', rowId)

            const updatedRows = useGridStore.getState().rows

            expect(updatedRows[0].productIds).toEqual(['p1', 'p3'])
        })

        it('should move product within row', () => {
            useGridStore.getState().addRowWithProducts(['p1', 'p2', 'p3'])

            const rows = useGridStore.getState().rows
            const rowId = rows[0].id

            useGridStore.getState().moveProductWithinRow(rowId, 0, 2)

            const updatedRows = useGridStore.getState().rows

            expect(updatedRows[0].productIds).toEqual(['p2', 'p3', 'p1'])
        })

        it('should move product between rows', () => {
            useGridStore.getState().addRowWithProducts(['p1', 'p2'])
            useGridStore.getState().addRowWithProducts(['p3'])

            const rows = useGridStore.getState().rows
            const sourceRowId = rows[0].id
            const targetRowId = rows[1].id

            useGridStore
                .getState()
                .moveProductBetweenRows('p2', sourceRowId, targetRowId, 0)

            const updatedRows = useGridStore.getState().rows

            expect(updatedRows[0].productIds).toEqual(['p1'])
            expect(updatedRows[1].productIds).toEqual(['p2', 'p3'])
        })

        it('should not move product between rows if target row is full', () => {
            useGridStore.getState().addRowWithProducts(['p1', 'p2'])
            useGridStore.getState().addRowWithProducts(['p3', 'p4', 'p5'])

            const rows = useGridStore.getState().rows
            const sourceRowId = rows[0].id
            const targetRowId = rows[1].id

            useGridStore
                .getState()
                .moveProductBetweenRows('p2', sourceRowId, targetRowId, 0)

            const updatedRows = useGridStore.getState().rows

            expect(updatedRows[0].productIds).toEqual(['p1', 'p2'])
            expect(updatedRows[1].productIds).toEqual(['p3', 'p4', 'p5'])
        })

        it('should insert product at specified index in target row', () => {
            useGridStore.getState().addRowWithProducts(['p1'])
            useGridStore.getState().addRowWithProducts(['p2', 'p3'])

            const rows = useGridStore.getState().rows
            const sourceRowId = rows[0].id
            const targetRowId = rows[1].id

            useGridStore
                .getState()
                .moveProductBetweenRows('p1', sourceRowId, targetRowId, 1)

            const updatedRows = useGridStore.getState().rows

            expect(updatedRows[0].productIds).toEqual([])
            expect(updatedRows[1].productIds).toEqual(['p2', 'p1', 'p3'])
        })
    })

    describe('Template Assignment', () => {
        it('should assign template to row', () => {
            useGridStore.getState().addRow()

            const rows = useGridStore.getState().rows
            const rowId = rows[0].id

            useGridStore.getState().assignTemplateToRow(rowId, 'template_center')

            const updatedRows = useGridStore.getState().rows

            expect(updatedRows[0].templateId).toBe('template_center')
        })

        it('should unassign template from row', () => {
            useGridStore.getState().addRowWithProducts(['p1', 'p2'])

            const rows = useGridStore.getState().rows
            const rowId = rows[0].id

            expect(rows[0].templateId).toBe('template_left')

            useGridStore.getState().unassignTemplateFromRow(rowId)

            const updatedRows = useGridStore.getState().rows

            expect(updatedRows[0].templateId).toBeNull()
        })

        it('should override dynamic template with manual assignment', () => {
            useGridStore.getState().addRowWithProducts(['p1'])

            const rows = useGridStore.getState().rows
            const rowId = rows[0].id

            expect(rows[0].templateId).toBe('template_right')

            useGridStore.getState().assignTemplateToRow(rowId, 'template_center')

            const updatedRows = useGridStore.getState().rows

            expect(updatedRows[0].templateId).toBe('template_center')
        })
    })

    describe('Row Selection', () => {
        it('should select a row', () => {
            useGridStore.getState().addRow()

            const rows = useGridStore.getState().rows
            const rowId = rows[0].id

            useGridStore.getState().selectRow(rowId)

            expect(useGridStore.getState().selectedRowId).toBe(rowId)
        })

        it('should deselect row by passing null', () => {
            useGridStore.getState().addRow()

            const rows = useGridStore.getState().rows
            const rowId = rows[0].id

            useGridStore.getState().selectRow(rowId)
            expect(useGridStore.getState().selectedRowId).toBe(rowId)

            useGridStore.getState().selectRow(null)
            expect(useGridStore.getState().selectedRowId).toBeNull()
        })
    })

    describe('Grid Reset', () => {
        it('should reset grid to initial state', () => {
            useGridStore.getState().addRowWithProducts(['p1', 'p2'])
            useGridStore.getState().addRow()

            const rows = useGridStore.getState().rows
            useGridStore.getState().selectRow(rows[0].id)

            useGridStore.getState().resetGrid()

            const state = useGridStore.getState()

            expect(state.rows).toHaveLength(0)
            expect(state.selectedRowId).toBeNull()
        })

        it('should allow adding rows after reset', () => {
            useGridStore.getState().addRow()
            useGridStore.getState().resetGrid()
            useGridStore.getState().addRow()

            const rows = useGridStore.getState().rows

            expect(rows).toHaveLength(1)
        })
    })
})
