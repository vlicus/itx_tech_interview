import { IProduct } from './product'
import { ITemplate } from './template'
import { IGridRow } from './grid'

/**
 * GET /products?ids=[...] Request
 */
export interface IGetProductsRequest {
    ids: string[]
}

/**
 * GET /products?ids=[...] Response
 */
export interface IGetProductsResponse {
    products: IProduct[]
    notFoundIds?: string[]
    requestedCount?: number
    foundCount?: number
}

/**
 * GET /templates Response
 */
export interface IGetTemplatesResponse {
    templates: ITemplate[]
}

/**
 * POST /grids Request
 */
export interface ISaveGridRequest {
    rows: IGridRow[]
}

/**
 * POST /grids Response
 */
export interface ISaveGridResponse {
    success: boolean
    gridId?: string
    message?: string
}

/**
 * Stored grid entry (from server storage)
 */
export interface IStoredGrid {
    id: string
    timestamp: string
    data: ISaveGridRequest
}

/**
 * GET /grids Response (all saved grids)
 */
export interface IGetSavedGridsResponse {
    grids: IStoredGrid[]
    count: number
}

/**
 * Generic API error response
 */
export interface IApiError {
    message: string
    code?: string
    details?: unknown
}
