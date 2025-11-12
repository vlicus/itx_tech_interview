/**
 * Grid Type Definitions
 * Defines the structure of the product grid and rows
 */

import { IProduct } from './product'

/**
 * Minimum and maximum products allowed per rows
 */
export const MIN_PRODUCTS_PER_ROW: number = 1
export const MAX_PRODUCTS_PER_ROW: number = 3

/**
 * Grid row containing products and template assignment
 */
export interface IGridRow {
    id: string
    productIds: string[] // References to product IDs
    templateId: string | null // Can be null if no template assigned
    order: number // Position in the grid
}

/**
 * Complete grid state
 * Note: Products are managed by TanStack Query, not stored here
 */
export interface IGridState {
    rows: IGridRow[]
    selectedRowId: string | null
}

/**
 * Validation result for grid state
 */
export interface IValidationResult {
    isValid: boolean
    errors: IValidationError[]
}

/**
 * Individual validation error
 */
export interface IValidationError {
    rowId: string
    message: string
    type: 'MISSING_PRODUCTS' | 'MISSING_TEMPLATE' | 'TOO_MANY_PRODUCTS'
}

/**
 * Drag and drop types
 */
export type TDragType = 'PRODUCT' | 'ROW'

/**
 * Drag data for products
 */
export interface IProductDragData {
    type: 'PRODUCT'
    productId: string
    sourceRowId: string
    sourceIndex: number
}

/**
 * Drag data for rows
 */
export interface IRowDragData {
    type: 'ROW'
    rowId: string
    sourceIndex: number
}

/**
 * Union type for all drag data
 */
export type TDragData = IProductDragData | IRowDragData
