export const MIN_PRODUCTS_PER_ROW: number = Number(
    process.env.MIN_PRODUCTS_PER_ROW
)
export const MAX_PRODUCTS_PER_ROW: number = Number(
    process.env.MAX_PRODUCTS_PER_ROW
)

export interface IGridRow {
    id: string
    productIds: string[]
    templateId: string | null
    order: number
}

export interface IGridState {
    rows: IGridRow[]
    selectedRowId: string | null
}

export interface IValidationResult {
    isValid: boolean
    errors: IValidationError[]
}

export interface IValidationError {
    rowId: string
    message: string
    type: 'MISSING_PRODUCTS' | 'MISSING_TEMPLATE' | 'TOO_MANY_PRODUCTS'
}

export type TDragType = 'PRODUCT' | 'ROW'

export interface IProductDragData {
    type: 'PRODUCT'
    productId: string
    sourceRowId: string
    sourceIndex: number
}

export interface IRowDragData {
    type: 'ROW'
    rowId: string
    sourceIndex: number
}

export type TDragData = IProductDragData | IRowDragData
