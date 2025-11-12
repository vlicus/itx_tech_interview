import { describe, it, expect } from 'vitest'
import {
    validateRow,
    validateGrid,
    canRowAcceptProduct,
    getValidationErrorMessage,
    groupErrorsByRow,
} from './validation'
import type { IGridRow, IValidationError } from '@/types'

describe('validateRow', () => {
    it('should pass validation for a valid row', () => {
        const row: IGridRow = {
            id: 'row-1',
            productIds: ['p1', 'p2'],
            templateId: 'template_left',
            order: 0,
        }

        const errors = validateRow(row)

        expect(errors).toHaveLength(0)
    })

    it('should fail validation for row with no products', () => {
        const row: IGridRow = {
            id: 'row-empty',
            productIds: [],
            templateId: 'template_left',
            order: 0,
        }

        const errors = validateRow(row)

        expect(errors).toHaveLength(1)
        expect(errors[0].type).toBe('MISSING_PRODUCTS')
        expect(errors[0].message).toBe('Row must have at least one product')
        expect(errors[0].rowId).toBe('row-empty')
    })

    it('should fail validation for row with more than 3 products', () => {
        const row: IGridRow = {
            id: 'row-too-many',
            productIds: ['p1', 'p2', 'p3', 'p4'],
            templateId: 'template_center',
            order: 0,
        }

        const errors = validateRow(row)

        expect(errors).toHaveLength(1)
        expect(errors[0].type).toBe('TOO_MANY_PRODUCTS')
        expect(errors[0].message).toContain('cannot have more than 3 products')
    })

    it('should fail validation for row with null templateId', () => {
        const row: IGridRow = {
            id: 'row-no-template',
            productIds: ['p1'],
            templateId: null,
            order: 0,
        }

        const errors = validateRow(row)

        expect(errors).toHaveLength(1)
        expect(errors[0].type).toBe('MISSING_TEMPLATE')
        expect(errors[0].message).toContain('must have a valid template')
    })

    it('should fail validation for row with template_none', () => {
        const row: IGridRow = {
            id: 'row-template-none',
            productIds: ['p1'],
            templateId: 'template_none',
            order: 0,
        }

        const errors = validateRow(row)

        expect(errors).toHaveLength(1)
        expect(errors[0].type).toBe('MISSING_TEMPLATE')
    })

    it('should return multiple errors for row with multiple issues', () => {
        const row: IGridRow = {
            id: 'row-invalid',
            productIds: [],
            templateId: null,
            order: 0,
        }

        const errors = validateRow(row)

        expect(errors).toHaveLength(2)
        expect(errors.map((e) => e.type)).toContain('MISSING_PRODUCTS')
        expect(errors.map((e) => e.type)).toContain('MISSING_TEMPLATE')
    })

    it('should accept row with exactly 3 products', () => {
        const row: IGridRow = {
            id: 'row-max',
            productIds: ['p1', 'p2', 'p3'],
            templateId: 'template_center',
            order: 0,
        }

        const errors = validateRow(row)

        expect(errors).toHaveLength(0)
    })

    it('should accept row with exactly 1 product', () => {
        const row: IGridRow = {
            id: 'row-min',
            productIds: ['p1'],
            templateId: 'template_right',
            order: 0,
        }

        const errors = validateRow(row)

        expect(errors).toHaveLength(0)
    })
})

describe('validateGrid', () => {
    it('should validate an empty grid as valid', () => {
        const result = validateGrid([])

        expect(result.isValid).toBe(true)
        expect(result.errors).toHaveLength(0)
    })

    it('should validate a grid with all valid rows', () => {
        const rows: IGridRow[] = [
            {
                id: 'row-1',
                productIds: ['p1', 'p2'],
                templateId: 'template_left',
                order: 0,
            },
            {
                id: 'row-2',
                productIds: ['p3'],
                templateId: 'template_right',
                order: 1,
            },
        ]

        const result = validateGrid(rows)

        expect(result.isValid).toBe(true)
        expect(result.errors).toHaveLength(0)
    })

    it('should collect errors from multiple invalid rows', () => {
        const rows: IGridRow[] = [
            {
                id: 'row-1',
                productIds: [],
                templateId: 'template_left',
                order: 0,
            },
            {
                id: 'row-2',
                productIds: ['p1'],
                templateId: null,
                order: 1,
            },
        ]

        const result = validateGrid(rows)

        expect(result.isValid).toBe(false)
        expect(result.errors).toHaveLength(2)
        expect(result.errors.map((e) => e.rowId)).toContain('row-1')
        expect(result.errors.map((e) => e.rowId)).toContain('row-2')
    })

    it('should handle null/undefined rows gracefully', () => {
        const result = validateGrid(null as any)

        expect(result.isValid).toBe(true)
        expect(result.errors).toHaveLength(0)
    })

    it('should collect multiple errors from same row', () => {
        const rows: IGridRow[] = [
            {
                id: 'row-bad',
                productIds: ['p1', 'p2', 'p3', 'p4'],
                templateId: null,
                order: 0,
            },
        ]

        const result = validateGrid(rows)

        expect(result.isValid).toBe(false)
        expect(result.errors).toHaveLength(2)
        expect(result.errors.every((e) => e.rowId === 'row-bad')).toBe(true)
    })
})

describe('canRowAcceptProduct', () => {
    it('should return true for row with less than 3 products', () => {
        const row: IGridRow = {
            id: 'row-1',
            productIds: ['p1'],
            templateId: 'template_left',
            order: 0,
        }

        const result = canRowAcceptProduct(row)

        expect(result).toBe(true)
    })

    it('should return true for row with 2 products', () => {
        const row: IGridRow = {
            id: 'row-2',
            productIds: ['p1', 'p2'],
            templateId: 'template_center',
            order: 0,
        }

        const result = canRowAcceptProduct(row)

        expect(result).toBe(true)
    })

    it('should return false for row with exactly 3 products', () => {
        const row: IGridRow = {
            id: 'row-full',
            productIds: ['p1', 'p2', 'p3'],
            templateId: 'template_center',
            order: 0,
        }

        const result = canRowAcceptProduct(row)

        expect(result).toBe(false)
    })

    it('should return true for empty row', () => {
        const row: IGridRow = {
            id: 'row-empty',
            productIds: [],
            templateId: 'template_left',
            order: 0,
        }

        const result = canRowAcceptProduct(row)

        expect(result).toBe(true)
    })
})

describe('getValidationErrorMessage', () => {
    it('should return the error message', () => {
        const error: IValidationError = {
            rowId: 'row-1',
            message: 'Test error message',
            type: 'MISSING_PRODUCTS',
        }

        const result = getValidationErrorMessage(error)

        expect(result).toBe('Test error message')
    })

    it('should handle different error types', () => {
        const missingProductsError: IValidationError = {
            rowId: 'row-1',
            message: 'Row must have at least one product',
            type: 'MISSING_PRODUCTS',
        }

        expect(getValidationErrorMessage(missingProductsError)).toBe(
            'Row must have at least one product'
        )

        const missingTemplateError: IValidationError = {
            rowId: 'row-2',
            message: 'Row must have a valid template assigned',
            type: 'MISSING_TEMPLATE',
        }

        expect(getValidationErrorMessage(missingTemplateError)).toBe(
            'Row must have a valid template assigned'
        )
    })
})

describe('groupErrorsByRow', () => {
    it('should group errors by row ID', () => {
        const errors: IValidationError[] = [
            { rowId: 'row-1', message: 'Error 1', type: 'MISSING_PRODUCTS' },
            { rowId: 'row-2', message: 'Error 2', type: 'MISSING_TEMPLATE' },
            { rowId: 'row-1', message: 'Error 3', type: 'TOO_MANY_PRODUCTS' },
        ]

        const result = groupErrorsByRow(errors)

        expect(Object.keys(result)).toHaveLength(2)
        expect(result['row-1']).toHaveLength(2)
        expect(result['row-2']).toHaveLength(1)
    })

    it('should return empty object for empty errors array', () => {
        const result = groupErrorsByRow([])

        expect(result).toEqual({})
    })

    it('should handle single error', () => {
        const errors: IValidationError[] = [
            { rowId: 'row-1', message: 'Error', type: 'MISSING_PRODUCTS' },
        ]

        const result = groupErrorsByRow(errors)

        expect(result).toEqual({
            'row-1': [
                { rowId: 'row-1', message: 'Error', type: 'MISSING_PRODUCTS' },
            ],
        })
    })

    it('should maintain error order within groups', () => {
        const errors: IValidationError[] = [
            {
                rowId: 'row-1',
                message: 'First error',
                type: 'MISSING_PRODUCTS',
            },
            {
                rowId: 'row-1',
                message: 'Second error',
                type: 'MISSING_TEMPLATE',
            },
        ]

        const result = groupErrorsByRow(errors)

        expect(result['row-1'][0].message).toBe('First error')
        expect(result['row-1'][1].message).toBe('Second error')
    })
})
