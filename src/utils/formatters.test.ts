import { describe, it, expect } from 'vitest'
import { formatSavedGrid } from './formatters'
import type { IStoredGrid } from '@/types'

describe('formatSavedGrid', () => {
    it('should format a grid with single row and single product', () => {
        const mockGrid: IStoredGrid = {
            id: 'grid-123',
            timestamp: '2025-11-12T10:30:00.000Z',
            data: {
                rows: [
                    {
                        id: 'row-1',
                        productIds: ['product-1'],
                        templateId: 'template_right',
                        order: 0,
                    },
                ],
            },
        }

        const result = formatSavedGrid(mockGrid)

        expect(result.id).toBe('grid-123')
        expect(result.title).toContain('Parrilla')
        expect(result.description).toBe('1 fila con 1 producto')
        expect(result.icon).toBe('heroicons:archive-box-20-solid')
        expect(result.url).toBe('/products?ids=[product-1]')
        expect(result.accentColor).toBe('text-indigo-600')
    })

    it('should format a grid with multiple rows and products', () => {
        const mockGrid: IStoredGrid = {
            id: 'grid-456',
            timestamp: '2025-11-12T15:45:00.000Z',
            data: {
                rows: [
                    {
                        id: 'row-1',
                        productIds: ['product-1', 'product-2', 'product-3'],
                        templateId: 'template_center',
                        order: 0,
                    },
                    {
                        id: 'row-2',
                        productIds: ['product-4', 'product-5'],
                        templateId: 'template_left',
                        order: 1,
                    },
                ],
            },
        }

        const result = formatSavedGrid(mockGrid)

        expect(result.description).toBe('2 filas con 5 productos')
        expect(result.url).toBe('/products?ids=[product-1,product-2,product-3,product-4,product-5]')
    })

    it('should use plural form for multiple rows', () => {
        const mockGrid: IStoredGrid = {
            id: 'grid-789',
            timestamp: '2025-11-12T12:00:00.000Z',
            data: {
                rows: [
                    { id: 'row-1', productIds: ['p1'], templateId: 't1', order: 0 },
                    { id: 'row-2', productIds: ['p2'], templateId: 't2', order: 1 },
                    { id: 'row-3', productIds: ['p3'], templateId: 't3', order: 2 },
                ],
            },
        }

        const result = formatSavedGrid(mockGrid)

        expect(result.description).toContain('filas')
        expect(result.description).toContain('productos')
    })

    it('should use singular form for single product across multiple rows', () => {
        const mockGrid: IStoredGrid = {
            id: 'grid-single',
            timestamp: '2025-11-12T09:00:00.000Z',
            data: {
                rows: [
                    { id: 'row-1', productIds: ['product-1'], templateId: 't1', order: 0 },
                    { id: 'row-2', productIds: [], templateId: 't2', order: 1 },
                ],
            },
        }

        const result = formatSavedGrid(mockGrid)

        expect(result.description).toBe('2 filas con 1 producto')
    })

    it('should format timestamp in Spanish locale', () => {
        const mockGrid: IStoredGrid = {
            id: 'grid-date',
            timestamp: '2025-03-15T14:30:00.000Z',
            data: {
                rows: [
                    { id: 'row-1', productIds: ['p1'], templateId: 't1', order: 0 },
                ],
            },
        }

        const result = formatSavedGrid(mockGrid)

        expect(result.title).toMatch(/Parrilla - \d{1,2} mar\.? 2025, \d{2}:\d{2}/)
    })

    it('should handle empty rows array', () => {
        const mockGrid: IStoredGrid = {
            id: 'grid-empty',
            timestamp: '2025-11-12T10:00:00.000Z',
            data: {
                rows: [],
            },
        }

        const result = formatSavedGrid(mockGrid)

        expect(result.description).toBe('0 filas con 0 productos')
        expect(result.url).toBe('/products?ids=[]')
    })

    it('should collect all product IDs from multiple rows', () => {
        const mockGrid: IStoredGrid = {
            id: 'grid-collect',
            timestamp: '2025-11-12T11:00:00.000Z',
            data: {
                rows: [
                    { id: 'row-1', productIds: ['a', 'b'], templateId: 't1', order: 0 },
                    { id: 'row-2', productIds: ['c'], templateId: 't2', order: 1 },
                    { id: 'row-3', productIds: ['d', 'e', 'f'], templateId: 't3', order: 2 },
                ],
            },
        }

        const result = formatSavedGrid(mockGrid)

        expect(result.url).toBe('/products?ids=[a,b,c,d,e,f]')
        expect(result.description).toContain('6 productos')
    })
})
