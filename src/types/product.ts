/**
 * Product Type Definitions
 * Represents individual product entities in the grid editor
 */

/**
 * Core product interface matching API response
 */
export interface IProduct {
  id: string
  name: string
  imageUrl: string
  price: string
}

/**
 * Product with additional UI-specific properties
 */
export interface IProductWithMeta extends IProduct {
  isLoading?: boolean
  hasError?: boolean
}
