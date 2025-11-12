/**
 * Central Type Exports
 * Re-exports all type definitions for easy importing
 */

// Product types
export type { IProduct, IProductWithMeta } from './product'

// Template types
export type { ITemplate, TTemplateAlignment } from './template'

// Grid types
export type {
    IGridRow,
    IGridState,
    IValidationResult,
    IValidationError,
    TDragType,
    IProductDragData,
    IRowDragData,
    TDragData,
} from './grid'

export { MIN_PRODUCTS_PER_ROW, MAX_PRODUCTS_PER_ROW } from './grid'

// API types
export type {
    IGetProductsRequest,
    IGetProductsResponse,
    IGetTemplatesResponse,
    ISaveGridRequest,
    ISaveGridResponse,
    IStoredGrid,
    IGetSavedGridsResponse,
    IApiError,
} from './api'

// UI types
export type { IUIState, TToastType, IToast, TDeviceType } from './ui'

export {
    MIN_ZOOM_LEVEL,
    MAX_ZOOM_LEVEL,
    ZOOM_STEP,
    DEFAULT_ZOOM_LEVEL,
    BREAKPOINTS,
} from './ui'
