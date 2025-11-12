import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { produce } from 'immer'
import type { IGridState, IGridRow } from '@/types'

function getDefaultTemplateForProductCount(productCount: number): string {
    if (productCount === 1) return 'template_right'
    if (productCount === 2) return 'template_left'
    if (productCount === 3) return 'template_center'
    return 'template_right'
}

interface IGridActions {
    addRow: () => void
    addRowWithProducts: (productIds: string[]) => void
    removeRow: (rowId: string) => void
    moveRow: (fromIndex: number, toIndex: number) => void

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

    assignTemplateToRow: (rowId: string, templateId: string) => void
    unassignTemplateFromRow: (rowId: string) => void

    selectRow: (rowId: string | null) => void

    resetGrid: () => void
}

type TGridStore = IGridState & IGridActions

const initialState: IGridState = {
    rows: [],
    selectedRowId: null,
}

export const useGridStore = create<TGridStore>()(
    persist(
        (set) => ({
            ...initialState,

            addRow: () =>
                set(
                    produce((state: IGridState) => {
                        const newRow: IGridRow = {
                            id: `row_${Date.now()}_${Math.random()
                                .toString(36)
                                .slice(2, 11)}`,
                            productIds: [],
                            templateId: 'template_right',
                            order: state.rows.length,
                        }
                        state.rows.push(newRow)
                    })
                ),

            addRowWithProducts: (productIds) =>
                set(
                    produce((state: IGridState) => {
                        const finalProductIds = productIds.slice(0, 3)

                        const dynamicTemplateId =
                            getDefaultTemplateForProductCount(
                                finalProductIds.length
                            )

                        const newRow: IGridRow = {
                            id: `row_${Date.now()}_${Math.random()
                                .toString(36)
                                .slice(2, 11)}`,
                            productIds: finalProductIds,
                            templateId: dynamicTemplateId,
                            order: state.rows.length,
                        }

                        state.rows.push(newRow)
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
                        state.rows.forEach((row, idx) => {
                            row.order = idx
                        })
                    })
                ),

            addProductToRow: (productId, rowId) =>
                set(
                    produce((state: IGridState) => {
                        const row = state.rows.find((r) => r.id === rowId)
                        if (row && row.productIds.length < 3) {
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

                        if (sourceRowId === targetRowId) {
                            console.warn(
                                '⚠️ [STORE] moveProductBetweenRows called with same row, use moveProductWithinRow instead'
                            )
                            return
                        }

                        if (targetRow.productIds.length >= 3) {
                            console.error(
                                '❌ [STORE] Target row is full! This should not happen - drop should be blocked earlier'
                            )
                            return
                        }

                        const productIndex =
                            sourceRow.productIds.indexOf(productId)
                        if (productIndex === -1) {
                            console.warn(
                                '⚠️ [STORE] Product not found in source row:',
                                productId
                            )
                            return
                        }

                        sourceRow.productIds = sourceRow.productIds.filter(
                            (id) => id !== productId
                        )

                        if (
                            targetIndex >= 0 &&
                            targetIndex <= targetRow.productIds.length
                        ) {
                            targetRow.productIds.splice(
                                targetIndex,
                                0,
                                productId
                            )
                        } else {
                            targetRow.productIds.push(productId)
                        }
                    })
                ),

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

            selectRow: (rowId) =>
                set(
                    produce((state: IGridState) => {
                        state.selectedRowId = rowId
                    })
                ),

            resetGrid: () =>
                set(
                    produce((state: IGridState) => {
                        state.rows = []
                        state.selectedRowId = null
                    })
                ),
        }),
        {
            name: 'product-grid-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                rows: state.rows,
                selectedRowId: state.selectedRowId,
            }),
        }
    )
)
