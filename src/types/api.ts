/**
 * API Type Definitions
 * Request and response types for API interactions
 */

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
 * Generic API error response
 */
export interface IApiError {
  message: string
  code?: string
  details?: unknown
}
