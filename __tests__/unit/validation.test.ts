/**
 * Validation Utilities Tests
 * Unit tests for validation functions
 */

import { describe, it, expect } from 'vitest'
import {
    validateRow,
    validateGrid,
    canRowAcceptProduct,
    groupErrorsByRow,
} from '@/utils/validation'
import type { IGridRow } from '@/types'

describe('Validation Utilities', () => {
    describe('validateRow', () => {
        it('should return no errors for a valid row', () => {
            const validRow: IGridRow = {
                id: 'row_1',
                productIds: ['product_1', 'product_2'],
                templateId: 'template_1',
                order: 0,
            }

            const errors = validateRow(validRow)
            expect(errors).toHaveLength(0)
        })

        it('should return error when row has no products', () => {
            const emptyRow: IGridRow = {
                id: 'row_1',
                productIds: [],
                templateId: 'template_1',
                order: 0,
            }

            const errors = validateRow(emptyRow)
            expect(errors).toHaveLength(1)
            expect(errors[0].type).toBe('MISSING_PRODUCTS')
        })

        it('should return error when row has no template', () => {
            const noTemplateRow: IGridRow = {
                id: 'row_1',
                productIds: ['product_1'],
                templateId: null,
                order: 0,
            }

            const errors = validateRow(noTemplateRow)
            expect(errors).toHaveLength(1)
            expect(errors[0].type).toBe('MISSING_TEMPLATE')
        })

        it('should return error when row has too many products', () => {
            const tooManyProductsRow: IGridRow = {
                id: 'row_1',
                productIds: [
                    'product_1',
                    'product_2',
                    'product_3',
                    'product_4',
                ],
                templateId: 'template_1',
                order: 0,
            }

            const errors = validateRow(tooManyProductsRow)
            expect(errors).toHaveLength(1)
            expect(errors[0].type).toBe('TOO_MANY_PRODUCTS')
        })

        it('should return multiple errors for invalid row', () => {
            const invalidRow: IGridRow = {
                id: 'row_1',
                productIds: [],
                templateId: null,
                order: 0,
            }

            const errors = validateRow(invalidRow)
            expect(errors).toHaveLength(2)
        })
    })

    describe('validateGrid', () => {
        it('should return valid for a grid with valid rows', () => {
            const rows: IGridRow[] = [
                {
                    id: 'row_1',
                    productIds: ['product_1'],
                    templateId: 'template_1',
                    order: 0,
                },
                {
                    id: 'row_2',
                    productIds: ['product_2', 'product_3'],
                    templateId: 'template_2',
                    order: 1,
                },
            ]

            const result = validateGrid(rows)
            expect(result.isValid).toBe(true)
            expect(result.errors).toHaveLength(0)
        })

        it('should return invalid for a grid with invalid rows', () => {
            const rows: IGridRow[] = [
                {
                    id: 'row_1',
                    productIds: [],
                    templateId: null,
                    order: 0,
                },
            ]

            const result = validateGrid(rows)
            expect(result.isValid).toBe(false)
            expect(result.errors.length).toBeGreaterThan(0)
        })
    })

    describe('canRowAcceptProduct', () => {
        it('should return true when row has less than 3 products', () => {
            const row: IGridRow = {
                id: 'row_1',
                productIds: ['product_1', 'product_2'],
                templateId: 'template_1',
                order: 0,
            }

            expect(canRowAcceptProduct(row)).toBe(true)
        })

        it('should return false when row has 3 products', () => {
            const row: IGridRow = {
                id: 'row_1',
                productIds: ['product_1', 'product_2', 'product_3'],
                templateId: 'template_1',
                order: 0,
            }

            expect(canRowAcceptProduct(row)).toBe(false)
        })
    })

    describe('groupErrorsByRow', () => {
        it('should group errors by row ID', () => {
            const errors = [
                {
                    rowId: 'row_1',
                    message: 'Error 1',
                    type: 'MISSING_PRODUCTS' as const,
                },
                {
                    rowId: 'row_1',
                    message: 'Error 2',
                    type: 'MISSING_TEMPLATE' as const,
                },
                {
                    rowId: 'row_2',
                    message: 'Error 3',
                    type: 'MISSING_PRODUCTS' as const,
                },
            ]

            const grouped = groupErrorsByRow(errors)
            expect(Object.keys(grouped)).toHaveLength(2)
            expect(grouped['row_1']).toHaveLength(2)
            expect(grouped['row_2']).toHaveLength(1)
        })
    })
})
