import { describe, it, expect } from 'vitest'
import {
    serializeGridToURL,
    extractProductIds,
    createShareableURL,
    parseGridFromURL,
    validateGridConfig,
} from './gridUrlSerializer'
import type { IGridRow } from '@/types'

describe('serializeGridToURL', () => {
    it('should serialize a single row with products', () => {
        const rows: IGridRow[] = [
            {
                id: 'row-1',
                productIds: ['p1', 'p2'],
                templateId: 'template_left',
                order: 0,
            },
        ]

        const result = serializeGridToURL(rows)

        expect(result).toBe('r1:p1,p2:template_left')
    })

    it('should serialize multiple rows', () => {
        const rows: IGridRow[] = [
            {
                id: 'row-1',
                productIds: ['p1', 'p2', 'p3'],
                templateId: 'template_center',
                order: 0,
            },
            {
                id: 'row-2',
                productIds: ['p4'],
                templateId: 'template_right',
                order: 1,
            },
        ]

        const result = serializeGridToURL(rows)

        expect(result).toBe('r1:p1,p2,p3:template_center|r2:p4:template_right')
    })

    it('should use default template when templateId is null', () => {
        const rows: IGridRow[] = [
            {
                id: 'row-1',
                productIds: ['p1'],
                templateId: null,
                order: 0,
            },
        ]

        const result = serializeGridToURL(rows)

        expect(result).toBe('r1:p1:template_right')
    })

    it('should return empty string for empty rows array', () => {
        const result = serializeGridToURL([])

        expect(result).toBe('')
    })

    it('should return empty string for null/undefined rows', () => {
        expect(serializeGridToURL(null as any)).toBe('')
        expect(serializeGridToURL(undefined as any)).toBe('')
    })
})

describe('extractProductIds', () => {
    it('should extract all unique product IDs', () => {
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

        const result = extractProductIds(rows)

        expect(result).toEqual(['p1', 'p2', 'p3'])
    })

    it('should handle duplicate product IDs', () => {
        const rows: IGridRow[] = [
            { id: 'row-1', productIds: ['p1', 'p2'], templateId: 't1', order: 0 },
            { id: 'row-2', productIds: ['p2', 'p3'], templateId: 't2', order: 1 },
        ]

        const result = extractProductIds(rows)

        expect(result).toHaveLength(3)
        expect(result).toContain('p1')
        expect(result).toContain('p2')
        expect(result).toContain('p3')
    })

    it('should return empty array for empty rows', () => {
        const result = extractProductIds([])

        expect(result).toEqual([])
    })
})

describe('createShareableURL', () => {
    it('should create a complete URL with grid and ids parameters', () => {
        const rows: IGridRow[] = [
            {
                id: 'row-1',
                productIds: ['p1', 'p2'],
                templateId: 'template_left',
                order: 0,
            },
        ]

        const result = createShareableURL(rows, '/products')

        expect(result).toContain('/products?')
        expect(result).toContain('grid=r1%3Ap1%2Cp2%3Atemplate_left')
        expect(result).toContain('ids=%5Bp1%2Cp2%5D')
    })

    it('should handle multiple rows in URL', () => {
        const rows: IGridRow[] = [
            { id: 'row-1', productIds: ['p1'], templateId: 't1', order: 0 },
            { id: 'row-2', productIds: ['p2'], templateId: 't2', order: 1 },
        ]

        const result = createShareableURL(rows, '/products')

        expect(result).toContain('grid=r1%3Ap1%3At1%7Cr2%3Ap2%3At2')
        expect(result).toContain('ids=%5Bp1%2Cp2%5D')
    })

    it('should return URL without params for empty rows', () => {
        const result = createShareableURL([], '/products')

        expect(result).toBe('/products?')
    })
})

describe('parseGridFromURL', () => {
    it('should return null when no parameters provided', () => {
        const params = new URLSearchParams('')

        const result = parseGridFromURL(params)

        expect(result).toBeNull()
    })

    it('should parse simple format with only IDs', () => {
        const params = new URLSearchParams('ids=[p1,p2,p3]')

        const result = parseGridFromURL(params)

        expect(result).toEqual({
            type: 'simple',
            productIds: ['p1', 'p2', 'p3'],
        })
    })

    it('should parse full grid configuration', () => {
        const params = new URLSearchParams(
            'ids=[p1,p2,p3]&grid=r1:p1,p2:template_left|r2:p3:template_right'
        )

        const result = parseGridFromURL(params)

        expect(result).toEqual({
            type: 'full',
            productIds: ['p1', 'p2', 'p3'],
            rows: [
                { productIds: ['p1', 'p2'], templateId: 'template_left' },
                { productIds: ['p3'], templateId: 'template_right' },
            ],
        })
    })

    it('should handle IDs with square brackets', () => {
        const params = new URLSearchParams('ids=[product_1,product_2]')

        const result = parseGridFromURL(params)

        expect(result?.productIds).toEqual(['product_1', 'product_2'])
    })

    it('should handle IDs without square brackets', () => {
        const params = new URLSearchParams('ids=p1,p2,p3')

        const result = parseGridFromURL(params)

        expect(result?.productIds).toEqual(['p1', 'p2', 'p3'])
    })

    it('should trim whitespace from product IDs', () => {
        const params = new URLSearchParams('ids=[p1 , p2 , p3]')

        const result = parseGridFromURL(params)

        expect(result?.productIds).toEqual(['p1', 'p2', 'p3'])
    })

    it('should fallback to simple format on invalid grid param', () => {
        const params = new URLSearchParams('ids=[p1,p2]&grid=invalid-format')

        const result = parseGridFromURL(params)

        expect(result?.type).toBe('simple')
        expect(result?.productIds).toEqual(['p1', 'p2'])
    })

    it('should handle empty product IDs in rows', () => {
        const params = new URLSearchParams('ids=[p1]&grid=r1::template_right')

        const result = parseGridFromURL(params)

        expect(result?.type).toBe('full')
        expect(result?.rows?.[0].productIds).toEqual([])
    })
})

describe('validateGridConfig', () => {
    it('should validate a valid simple config', () => {
        const config = {
            type: 'simple' as const,
            productIds: ['p1', 'p2', 'p3'],
        }

        const result = validateGridConfig(config)

        expect(result).toBe(true)
    })

    it('should validate a valid full config', () => {
        const config = {
            type: 'full' as const,
            productIds: ['p1', 'p2', 'p3'],
            rows: [
                { productIds: ['p1', 'p2'], templateId: 'template_left' },
                { productIds: ['p3'], templateId: 'template_right' },
            ],
        }

        const result = validateGridConfig(config)

        expect(result).toBe(true)
    })

    it('should reject null config', () => {
        const result = validateGridConfig(null as any)

        expect(result).toBe(false)
    })

    it('should reject config with empty productIds', () => {
        const config = {
            type: 'simple' as const,
            productIds: [],
        }

        const result = validateGridConfig(config)

        expect(result).toBe(false)
    })

    it('should reject config with no productIds', () => {
        const config = {
            type: 'simple' as const,
        } as any

        const result = validateGridConfig(config)

        expect(result).toBe(false)
    })

    it('should reject full config with product not in main list', () => {
        const config = {
            type: 'full' as const,
            productIds: ['p1', 'p2'],
            rows: [{ productIds: ['p1', 'p3'], templateId: 't1' }],
        }

        const result = validateGridConfig(config)

        expect(result).toBe(false)
    })

    it('should reject rows with less than 1 product', () => {
        const config = {
            type: 'full' as const,
            productIds: ['p1'],
            rows: [{ productIds: [], templateId: 't1' }],
        }

        const result = validateGridConfig(config)

        expect(result).toBe(false)
    })

    it('should reject rows with more than 3 products', () => {
        const config = {
            type: 'full' as const,
            productIds: ['p1', 'p2', 'p3', 'p4'],
            rows: [{ productIds: ['p1', 'p2', 'p3', 'p4'], templateId: 't1' }],
        }

        const result = validateGridConfig(config)

        expect(result).toBe(false)
    })

    it('should accept rows with exactly 3 products', () => {
        const config = {
            type: 'full' as const,
            productIds: ['p1', 'p2', 'p3'],
            rows: [{ productIds: ['p1', 'p2', 'p3'], templateId: 't1' }],
        }

        const result = validateGridConfig(config)

        expect(result).toBe(true)
    })
})
