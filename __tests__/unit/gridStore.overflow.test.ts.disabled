/**
 * Grid Store Overflow Tests
 * Unit tests for the overflow/displacement logic when moving products between rows
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { useGridStore } from '@/lib/store'
import type { IProduct, IGridRow } from '@/types'

describe('Grid Store - Overflow and Displacement Logic', () => {
    // Reset store before each test
    beforeEach(() => {
        const { resetGrid } = useGridStore.getState()
        resetGrid()
    })

    describe('Basic product movement', () => {
        it('should add product to a row with space (less than 3 products)', () => {
            const { setProducts, addRowWithProducts, moveProductBetweenRows } =
                useGridStore.getState()

            // Setup: Create products
            const products: IProduct[] = [
                {
                    id: 'p1',
                    name: 'Product 1',
                    imageUrl: 'url1',
                    price: '$10',
                },
                {
                    id: 'p2',
                    name: 'Product 2',
                    imageUrl: 'url2',
                    price: '$20',
                },
                {
                    id: 'p3',
                    name: 'Product 3',
                    imageUrl: 'url3',
                    price: '$30',
                },
                {
                    id: 'p4',
                    name: 'Product 4',
                    imageUrl: 'url4',
                    price: '$40',
                },
            ]
            setProducts(products)

            // Create two rows: one with 1 product, one with 2 products
            addRowWithProducts(['p1'])
            addRowWithProducts(['p2', 'p3'])

            const stateBeforeMove = useGridStore.getState()
            const row1Before = stateBeforeMove.rows[0]
            const row2Before = stateBeforeMove.rows[1]

            expect(row1Before.productIds).toEqual(['p1'])
            expect(row2Before.productIds).toEqual(['p2', 'p3'])

            // Move p1 to row 2 (which has space for 1 more)
            moveProductBetweenRows('p1', row1Before.id, row2Before.id, 2)

            const stateAfterMove = useGridStore.getState()
            const row1After = stateAfterMove.rows.find(
                (r) => r.id === row1Before.id
            )!
            const row2After = stateAfterMove.rows.find(
                (r) => r.id === row2Before.id
            )!

            // Row 1 should be empty
            expect(row1After.productIds).toEqual([])

            // Row 2 should have 3 products now
            expect(row2After.productIds).toEqual(['p2', 'p3', 'p1'])
        })

        it('should reorder products within the same row', () => {
            const { setProducts, addRowWithProducts, moveProductWithinRow } =
                useGridStore.getState()

            const products: IProduct[] = [
                {
                    id: 'p1',
                    name: 'Product 1',
                    imageUrl: 'url1',
                    price: '$10',
                },
                {
                    id: 'p2',
                    name: 'Product 2',
                    imageUrl: 'url2',
                    price: '$20',
                },
                {
                    id: 'p3',
                    name: 'Product 3',
                    imageUrl: 'url3',
                    price: '$30',
                },
            ]
            setProducts(products)

            addRowWithProducts(['p1', 'p2', 'p3'])

            const stateBefore = useGridStore.getState()
            const rowBefore = stateBefore.rows[0]

            expect(rowBefore.productIds).toEqual(['p1', 'p2', 'p3'])

            // Move p1 from index 0 to index 2
            moveProductWithinRow(rowBefore.id, 0, 2)

            const stateAfter = useGridStore.getState()
            const rowAfter = stateAfter.rows[0]

            expect(rowAfter.productIds).toEqual(['p2', 'p3', 'p1'])
        })
    })

    describe('Overflow: Single row displacement', () => {
        it('should displace the rightmost product when target row is full (3 products)', () => {
            const { setProducts, addRowWithProducts, moveProductBetweenRows } =
                useGridStore.getState()

            // Setup: 4 products
            const products: IProduct[] = [
                {
                    id: 'p1',
                    name: 'Product 1',
                    imageUrl: 'url1',
                    price: '$10',
                },
                {
                    id: 'p2',
                    name: 'Product 2',
                    imageUrl: 'url2',
                    price: '$20',
                },
                {
                    id: 'p3',
                    name: 'Product 3',
                    imageUrl: 'url3',
                    price: '$30',
                },
                {
                    id: 'p4',
                    name: 'Product 4',
                    imageUrl: 'url4',
                    price: '$40',
                },
            ]
            setProducts(products)

            // Row 1: full (3 products)
            // Row 2: has p4 (will be moved to row 1, causing overflow)
            addRowWithProducts(['p1', 'p2', 'p3'])
            addRowWithProducts(['p4'])

            const stateBefore = useGridStore.getState()
            const row1Before = stateBefore.rows[0]
            const row2Before = stateBefore.rows[1]

            expect(row1Before.productIds).toEqual(['p1', 'p2', 'p3'])
            expect(row2Before.productIds).toEqual(['p4'])

            // Move p4 to the full row 1 (at the end position)
            // Expected behavior:
            // - p3 (rightmost) should be displaced to row 2
            // - p4 should be added to row 1 at the end
            const targetIndex = row1Before.productIds.length
            moveProductBetweenRows('p4', row2Before.id, row1Before.id, targetIndex)

            const stateAfter = useGridStore.getState()
            const row1After = stateAfter.rows.find(
                (r) => r.id === row1Before.id
            )!
            const row2After = stateAfter.rows.find(
                (r) => r.id === row2Before.id
            )!

            // Row 1 should have p1, p2, and the new p4
            expect(row1After.productIds).toEqual(['p1', 'p2', 'p4'])

            // Row 2 should now have the displaced p3
            expect(row2After.productIds).toEqual(['p3'])
        })
    })

    describe('Overflow: Recursive displacement', () => {
        it('should recursively displace products when multiple rows are full', () => {
            const { setProducts, addRowWithProducts, moveProductBetweenRows } =
                useGridStore.getState()

            // Setup: 7 products
            const products: IProduct[] = [
                { id: 'p1', name: 'P1', imageUrl: 'u1', price: '$1' },
                { id: 'p2', name: 'P2', imageUrl: 'u2', price: '$2' },
                { id: 'p3', name: 'P3', imageUrl: 'u3', price: '$3' },
                { id: 'p4', name: 'P4', imageUrl: 'u4', price: '$4' },
                { id: 'p5', name: 'P5', imageUrl: 'u5', price: '$5' },
                { id: 'p6', name: 'P6', imageUrl: 'u6', price: '$6' },
                { id: 'p7', name: 'P7', imageUrl: 'u7', price: '$7' },
            ]
            setProducts(products)

            // Row 1: full [p1, p2, p3]
            // Row 2: full [p4, p5, p6]
            // Row 3: has p7 [p7]
            addRowWithProducts(['p1', 'p2', 'p3'])
            addRowWithProducts(['p4', 'p5', 'p6'])
            addRowWithProducts(['p7'])

            const stateBefore = useGridStore.getState()
            const row1Before = stateBefore.rows[0]
            const row2Before = stateBefore.rows[1]
            const row3Before = stateBefore.rows[2]

            expect(row1Before.productIds).toEqual(['p1', 'p2', 'p3'])
            expect(row2Before.productIds).toEqual(['p4', 'p5', 'p6'])
            expect(row3Before.productIds).toEqual(['p7'])

            // Move p7 to row 1 (full) at the end position
            // Expected cascade:
            // 1. p3 (rightmost of row1) gets displaced to row2
            // 2. row2 is full, so p6 (rightmost of row2) gets displaced to row3
            // 3. row3 has space, so p6 stays there
            // 4. p3 is added to row2
            // 5. p7 is added to row1
            const targetIndex = row1Before.productIds.length
            moveProductBetweenRows('p7', row3Before.id, row1Before.id, targetIndex)

            const stateAfter = useGridStore.getState()
            const row1After = stateAfter.rows.find(
                (r) => r.id === row1Before.id
            )!
            const row2After = stateAfter.rows.find(
                (r) => r.id === row2Before.id
            )!
            const row3After = stateAfter.rows.find(
                (r) => r.id === row3Before.id
            )!

            // Row 1: [p1, p2, p7] (p3 displaced)
            expect(row1After.productIds).toEqual(['p1', 'p2', 'p7'])

            // Row 2: [p4, p5, p3] (p6 displaced, p3 added)
            expect(row2After.productIds).toEqual(['p4', 'p5', 'p3'])

            // Row 3: [p6] (received displaced p6)
            expect(row3After.productIds).toEqual(['p6'])
        })

        it('should create a new row when there is no next row to displace to', () => {
            const { setProducts, addRowWithProducts, moveProductBetweenRows } =
                useGridStore.getState()

            // Setup: 4 products
            const products: IProduct[] = [
                { id: 'p1', name: 'P1', imageUrl: 'u1', price: '$1' },
                { id: 'p2', name: 'P2', imageUrl: 'u2', price: '$2' },
                { id: 'p3', name: 'P3', imageUrl: 'u3', price: '$3' },
                { id: 'p4', name: 'P4', imageUrl: 'u4', price: '$4' },
            ]
            setProducts(products)

            // Only one row, full
            addRowWithProducts(['p1', 'p2', 'p3'])

            const stateBefore = useGridStore.getState()
            const rowsBefore = stateBefore.rows
            const row1Before = rowsBefore[0]

            expect(rowsBefore.length).toBe(1)
            expect(row1Before.productIds).toEqual(['p1', 'p2', 'p3'])

            // Move p4 to the full row (from a temporary source)
            // First, add p4 to a temporary row to have a source
            addRowWithProducts(['p4'])

            const stateWithP4 = useGridStore.getState()
            const row2WithP4 = stateWithP4.rows[1]

            // Now move p4 to row 1 (which is full) at the end position
            // Expected:
            // - p3 should be displaced
            // - Since there's no row after row1 (except the temp row with p4), a NEW row should be created
            // - The new row should contain p3
            const targetIndex = row1Before.productIds.length
            moveProductBetweenRows('p4', row2WithP4.id, row1Before.id, targetIndex)

            const stateAfter = useGridStore.getState()
            const rowsAfter = stateAfter.rows

            // We should now have at least 2 rows
            expect(rowsAfter.length).toBeGreaterThanOrEqual(2)

            const row1After = rowsAfter.find((r) => r.id === row1Before.id)!

            // Row 1 should have [p1, p2, p4]
            expect(row1After.productIds).toEqual(['p1', 'p2', 'p4'])

            // Find where p3 ended up (should be in some row after row1)
            const allProductIds = rowsAfter.flatMap((r) => r.productIds)
            expect(allProductIds).toContain('p3')
        })
    })

    describe('Overflow: Edge cases', () => {
        it('should handle moving to the same row without overflow', () => {
            const { setProducts, addRowWithProducts, moveProductWithinRow } =
                useGridStore.getState()

            const products: IProduct[] = [
                { id: 'p1', name: 'P1', imageUrl: 'u1', price: '$1' },
                { id: 'p2', name: 'P2', imageUrl: 'u2', price: '$2' },
                { id: 'p3', name: 'P3', imageUrl: 'u3', price: '$3' },
            ]
            setProducts(products)

            addRowWithProducts(['p1', 'p2', 'p3'])

            const stateBefore = useGridStore.getState()
            const rowBefore = stateBefore.rows[0]

            // Move within same row
            moveProductWithinRow(rowBefore.id, 0, 2)

            const stateAfter = useGridStore.getState()
            const rowAfter = stateAfter.rows[0]

            // No overflow, just reordering
            expect(rowAfter.productIds).toEqual(['p2', 'p3', 'p1'])
            expect(stateAfter.rows.length).toBe(1)
        })

        it('should handle complex multi-row cascade with 3 full rows', () => {
            const { setProducts, addRowWithProducts, moveProductBetweenRows } =
                useGridStore.getState()

            // Setup: 10 products
            const products: IProduct[] = Array.from({ length: 10 }, (_, i) => ({
                id: `p${i + 1}`,
                name: `Product ${i + 1}`,
                imageUrl: `url${i + 1}`,
                price: `$${(i + 1) * 10}`,
            }))
            setProducts(products)

            // Create 3 full rows
            // Row 1: [p1, p2, p3]
            // Row 2: [p4, p5, p6]
            // Row 3: [p7, p8, p9]
            addRowWithProducts(['p1', 'p2', 'p3'])
            addRowWithProducts(['p4', 'p5', 'p6'])
            addRowWithProducts(['p7', 'p8', 'p9'])
            addRowWithProducts(['p10'])

            const stateBefore = useGridStore.getState()
            const row1Before = stateBefore.rows[0]
            const row4Before = stateBefore.rows[3]

            // Move p10 to row 1 (full) at the end position
            // Expected cascade:
            // - p3 displaced to row 2
            // - p6 displaced to row 3
            // - p9 displaced to row 4 (which had p10, now empty after move)
            const targetIndex = row1Before.productIds.length
            moveProductBetweenRows('p10', row4Before.id, row1Before.id, targetIndex)

            const stateAfter = useGridStore.getState()

            const row1After = stateAfter.rows.find(
                (r) => r.id === row1Before.id
            )!
            const row2After = stateAfter.rows[1]
            const row3After = stateAfter.rows[2]
            const row4After = stateAfter.rows.find(
                (r) => r.id === row4Before.id
            )!

            // Verify the cascade
            expect(row1After.productIds).toEqual(['p1', 'p2', 'p10'])
            expect(row2After.productIds).toEqual(['p4', 'p5', 'p3'])
            expect(row3After.productIds).toEqual(['p7', 'p8', 'p6'])
            expect(row4After.productIds).toEqual(['p9'])
        })
    })

    describe('Overflow: Row limits', () => {
        it('should never allow a row to have more than 3 products', () => {
            const { setProducts, addRowWithProducts, moveProductBetweenRows } =
                useGridStore.getState()

            const products: IProduct[] = Array.from({ length: 5 }, (_, i) => ({
                id: `p${i + 1}`,
                name: `Product ${i + 1}`,
                imageUrl: `url${i + 1}`,
                price: `$${(i + 1) * 10}`,
            }))
            setProducts(products)

            addRowWithProducts(['p1', 'p2', 'p3'])
            addRowWithProducts(['p4'])

            const stateBefore = useGridStore.getState()
            const row1Before = stateBefore.rows[0]
            const row2Before = stateBefore.rows[1]

            // Try to add p5 to row 1 (full)
            addRowWithProducts(['p5'])
            const stateWithP5 = useGridStore.getState()
            const row3WithP5 = stateWithP5.rows[2]

            moveProductBetweenRows('p5', row3WithP5.id, row1Before.id, 0)

            const stateAfter = useGridStore.getState()

            // Check all rows have max 3 products
            stateAfter.rows.forEach((row) => {
                expect(row.productIds.length).toBeLessThanOrEqual(3)
            })
        })
    })
})
