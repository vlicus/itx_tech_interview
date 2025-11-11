/**
 * Grid Store
 * Manages grid state with undo/redo and localStorage persistence
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { produce } from 'immer'
import type { IGridState, IGridRow, IProduct } from '@/types'
import { undoRedo, UndoRedoState } from './proxy/undo-redo'

/**
 * Helper: Get default template based on number of products in row
 * - 1 producto → Alineación derecha (RIGHT)
 * - 2 productos → Alineación izquierda (LEFT)
 * - 3 productos → Alineación centro (CENTER)
 */
function getDefaultTemplateForProductCount(productCount: number): string {
    if (productCount === 1) return 'template_right'
    if (productCount === 2) return 'template_left'
    if (productCount === 3) return 'template_center'
    // Fallback: si está vacío o tiene más de 3 (edge case), usar right
    return 'template_right'
}

/**
 * Grid actions interface
 */
interface IGridActions {
    // Product management
    setProducts: (products: IProduct[]) => void
    addProduct: (product: IProduct) => void
    cleanOrphanProducts: () => void

    // Row management
    addRow: () => void
    addRowWithProducts: (productIds: string[]) => void
    removeRow: (rowId: string) => void
    moveRow: (fromIndex: number, toIndex: number) => void

    // Product-Row operations
    addProductToRow: (productId: string, rowId: string) => void
    removeProductFromRow: (productId: string, rowId: string) => void
    moveProductWithinRow: (
        rowId: string,
        fromIndex: number,
        toIndex: number
    ) => void
    moveProductBetweenRows: (
        productId: string,
        sourceRowId: string,
        targetRowId: string,
        targetIndex: number
    ) => void

    // Template assignment
    assignTemplateToRow: (rowId: string, templateId: string) => void
    unassignTemplateFromRow: (rowId: string) => void

    // Row selection
    selectRow: (rowId: string | null) => void

    // Reset
    resetGrid: () => void
}

/**
 * Combined grid store type
 */
type TGridStore = IGridState & IGridActions & UndoRedoState

/**
 * Initial grid state
 */
const initialState: IGridState = {
    rows: [],
    products: {},
    selectedRowId: null,
}

/**
 * Create grid store with undo/redo and persistence
 */
export const useGridStore = create<TGridStore>()(
    persist(
        undoRedo(
            (set) => ({
                ...initialState,

                // Product management
                setProducts: (products) =>
                    set(
                        produce((state: IGridState) => {
                            console.log(
                                '🟢 [STORE] setProducts llamado con',
                                products.length,
                                'productos'
                            )
                            console.log(
                                '🟢 [STORE] state antes de setProducts:',
                                state
                            )

                            // Asegurar que state.products existe (fix para bug de middleware undo-redo)
                            if (!state.products) {
                                console.log(
                                    '⚠️ [STORE] state.products era undefined, inicializando a {}'
                                )
                                state.products = {}
                            }

                            products.forEach((product) => {
                                state.products[product.id] = product
                            })
                            console.log(
                                '🟢 [STORE] state.products después de setProducts:',
                                Object.keys(state.products).length,
                                'productos'
                            )
                        })
                    ),

                addProduct: (product) =>
                    set(
                        produce((state: IGridState) => {
                            state.products[product.id] = product
                        })
                    ),

                cleanOrphanProducts: () =>
                    set(
                        produce((state: IGridState) => {
                            // Collect all product IDs currently in rows
                            const activeProductIds = new Set<string>()
                            state.rows.forEach((row) => {
                                row.productIds.forEach((productId) => {
                                    activeProductIds.add(productId)
                                })
                            })

                            // Remove products that are not in any row (orphan products)
                            const allProductIds = Object.keys(state.products)
                            const orphanIds = allProductIds.filter(
                                (id) => !activeProductIds.has(id)
                            )

                            if (orphanIds.length > 0) {
                                console.log(
                                    '🧹 [STORE] Cleaning orphan products:',
                                    orphanIds
                                )
                                orphanIds.forEach((id) => {
                                    delete state.products[id]
                                })
                                console.log(
                                    '✅ [STORE] Products after cleanup:',
                                    Object.keys(state.products).length
                                )
                            }
                        })
                    ),

                // Row management
                addRow: () =>
                    set(
                        produce((state: IGridState) => {
                            const newRow: IGridRow = {
                                id: `row_${Date.now()}_${Math.random()
                                    .toString(36)
                                    .substr(2, 9)}`,
                                productIds: [],
                                templateId: 'template_right', // Filas vacías por defecto: derecha
                                order: state.rows.length,
                            }
                            console.log('Adding new row', newRow)
                            state.rows.push(newRow)
                        })
                    ),

                addRowWithProducts: (productIds) =>
                    set(
                        produce((state: IGridState) => {
                            console.log(
                                '🟢 [STORE] addRowWithProducts llamado con:',
                                productIds
                            )
                            console.log(
                                '🟢 [STORE] state antes de addRowWithProducts:',
                                state
                            )

                            // Asegurar que state.rows existe (fix para bug de middleware undo-redo)
                            if (!state.rows) {
                                console.log(
                                    '⚠️ [STORE] state.rows era undefined, inicializando a []'
                                )
                                state.rows = []
                            }

                            // Ensure max 3 products
                            const finalProductIds = productIds.slice(0, 3)

                            // Usar alineación dinámica según cantidad de productos
                            const dynamicTemplateId = getDefaultTemplateForProductCount(
                                finalProductIds.length
                            )

                            const newRow: IGridRow = {
                                id: `row_${Date.now()}_${Math.random()
                                    .toString(36)
                                    .substr(2, 9)}`,
                                productIds: finalProductIds,
                                templateId: dynamicTemplateId, // ✨ Alineación dinámica
                                order: state.rows.length,
                            }
                            console.log('🟢 [STORE] newRow creada con template dinámico:', newRow)
                            state.rows.push(newRow)
                            console.log(
                                '🟢 [STORE] state.rows después de push:',
                                state.rows.length,
                                state.rows
                            )
                        })
                    ),

                removeRow: (rowId) =>
                    set(
                        produce((state: IGridState) => {
                            const index = state.rows.findIndex(
                                (row) => row.id === rowId
                            )
                            if (index !== -1) {
                                state.rows.splice(index, 1)
                                // Update order for remaining rows
                                state.rows.forEach((row, idx) => {
                                    row.order = idx
                                })
                            }
                            if (state.selectedRowId === rowId) {
                                state.selectedRowId = null
                            }
                        })
                    ),

                moveRow: (fromIndex, toIndex) =>
                    set(
                        produce((state: IGridState) => {
                            const [movedRow] = state.rows.splice(fromIndex, 1)
                            state.rows.splice(toIndex, 0, movedRow)
                            // Update order for all rows
                            state.rows.forEach((row, idx) => {
                                row.order = idx
                            })
                        })
                    ),

                // Product-Row operations
                addProductToRow: (productId, rowId) =>
                    set(
                        produce((state: IGridState) => {
                            const row = state.rows.find((r) => r.id === rowId)
                            if (row && row.productIds.length < 3) {
                                // MAX_PRODUCTS_PER_ROW
                                row.productIds.push(productId)
                            }
                        })
                    ),

                removeProductFromRow: (productId, rowId) =>
                    set(
                        produce((state: IGridState) => {
                            const row = state.rows.find((r) => r.id === rowId)
                            if (row) {
                                row.productIds = row.productIds.filter(
                                    (id) => id !== productId
                                )
                            }
                        })
                    ),

                moveProductWithinRow: (rowId, fromIndex, toIndex) =>
                    set(
                        produce((state: IGridState) => {
                            const row = state.rows.find((r) => r.id === rowId)
                            if (row) {
                                const [movedProduct] = row.productIds.splice(
                                    fromIndex,
                                    1
                                )
                                row.productIds.splice(toIndex, 0, movedProduct)
                            }
                        })
                    ),

                moveProductBetweenRows: (
                    productId,
                    sourceRowId,
                    targetRowId,
                    targetIndex
                ) =>
                    set(
                        produce((state: IGridState) => {
                            const sourceRow = state.rows.find(
                                (r) => r.id === sourceRowId
                            )
                            const targetRow = state.rows.find(
                                (r) => r.id === targetRowId
                            )

                            if (!sourceRow || !targetRow) return

                            // Safety check: if same row, use moveProductWithinRow instead
                            if (sourceRowId === targetRowId) {
                                console.warn(
                                    '⚠️ [STORE] moveProductBetweenRows called with same row, use moveProductWithinRow instead'
                                )
                                return
                            }

                            // ✅ VALIDATE FIRST: Check target row has space BEFORE removing from source
                            if (targetRow.productIds.length >= 3) {
                                console.error(
                                    '❌ [STORE] Target row is full! This should not happen - drop should be blocked earlier'
                                )
                                return // 🛑 Return WITHOUT touching source row
                            }

                            // Verify product exists in source row
                            const productIndex =
                                sourceRow.productIds.indexOf(productId)
                            if (productIndex === -1) {
                                console.warn(
                                    '⚠️ [STORE] Product not found in source row:',
                                    productId
                                )
                                return
                            }

                            // NOW it's safe to remove from source row
                            sourceRow.productIds = sourceRow.productIds.filter(
                                (id) => id !== productId
                            )

                            // Insert product at specified index or end
                            if (
                                targetIndex >= 0 &&
                                targetIndex <= targetRow.productIds.length
                            ) {
                                console.log(
                                    '✅ [STORE] Inserting at index:',
                                    targetIndex
                                )
                                targetRow.productIds.splice(
                                    targetIndex,
                                    0,
                                    productId
                                )
                            } else {
                                console.log('✅ [STORE] Adding to end')
                                targetRow.productIds.push(productId)
                            }
                        })
                    ),

                // Template assignment
                assignTemplateToRow: (rowId, templateId) =>
                    set(
                        produce((state: IGridState) => {
                            const row = state.rows.find((r) => r.id === rowId)
                            if (row) {
                                row.templateId = templateId
                            }
                        })
                    ),

                unassignTemplateFromRow: (rowId) =>
                    set(
                        produce((state: IGridState) => {
                            const row = state.rows.find((r) => r.id === rowId)
                            if (row) {
                                row.templateId = null
                            }
                        })
                    ),

                // Row selection
                selectRow: (rowId) =>
                    set(
                        produce((state: IGridState) => {
                            state.selectedRowId = rowId
                        })
                    ),

                // Reset
                resetGrid: () =>
                    set(
                        produce((state: IGridState) => {
                            console.log(
                                '🟢 [STORE] resetGrid llamado - ANTES:',
                                {
                                    rows: state.rows.length,
                                    products: Object.keys(state.products)
                                        .length,
                                }
                            )
                            state.rows = []
                            state.products = {}
                            state.selectedRowId = null
                            console.log(
                                '🟢 [STORE] resetGrid completado - DESPUÉS: rows=0, products=0'
                            )
                        })
                    ),
            }),
            { limit: 50 }
        ),
        {
            name: 'product-grid-storage',
            storage: createJSONStorage(() => localStorage),
            // Only persist grid data, not undo/redo history
            partialize: (state) => ({
                rows: state.rows,
                products: state.products,
                selectedRowId: state.selectedRowId,
            }),
        }
    )
)
