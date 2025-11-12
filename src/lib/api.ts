/**
 * API Service
 * Makes real HTTP requests to Next.js API Routes using ofetch
 *
 * ARQUITECTURA:
 * - Cliente (este archivo) → ofetch → API Routes (/app/api/*) → Datos
 * - Persistencia en memoria del servidor durante la vida del proceso
 * - TanStack Query maneja caching y sincronización en el cliente
 */

import { ofetch } from 'ofetch'
import type {
    IGetProductsResponse,
    IGetTemplatesResponse,
    ISaveGridRequest,
    ISaveGridResponse,
    IGetSavedGridsResponse,
} from '@/types'

/**
 * Fetch products by IDs from API Route
 *
 * @param productIds - Array of product IDs to fetch
 * @returns Promise with filtered products
 */
export async function getProducts(
    productIds: string[]
): Promise<IGetProductsResponse> {
    try {
        // Construir query string con IDs
        const idsParam = productIds.join(',')

        const response = await ofetch<IGetProductsResponse>(
            `/api/products?ids=${idsParam}`,
            {
                method: 'GET',
                retry: 1,
                timeout: 10000,
            }
        )

        console.log(
            '✅ [API Client] Products fetched:',
            response.products.length
        )
        return response
    } catch (error) {
        console.error('❌ [API Client] Error fetching products:', error)
        throw new Error('Failed to fetch products from API')
    }
}

/**
 * Fetch all available templates from API Route
 *
 * @returns Promise with all templates
 */
export async function getTemplates(): Promise<IGetTemplatesResponse> {
    try {
        const response = await ofetch<IGetTemplatesResponse>('/api/templates', {
            method: 'GET',
            retry: 1,
            timeout: 10000,
        })

        console.log(
            '✅ [API Client] Templates fetched:',
            response.templates.length
        )
        return response
    } catch (error) {
        console.error('❌ [API Client] Error fetching templates:', error)
        throw new Error('Failed to fetch templates from API')
    }
}

/**
 * Save grid configuration to server
 *
 * Hace un POST real al API Route /api/grids/id
 * Los datos persisten en memoria del servidor
 *
 * @param gridData - Grid configuration to save
 * @returns Promise with save response
 */
export async function saveGrid(
    gridData: ISaveGridRequest
): Promise<ISaveGridResponse> {
    try {
        const response = await ofetch<ISaveGridResponse>('/api/grids/id', {
            method: 'POST',
            body: gridData,
            retry: 1,
            timeout: 10000,
        })

        console.log('✅ [API Client] Grid saved:', response.gridId)
        return response
    } catch (error) {
        console.error('❌ [API Client] Error saving grid:', error)
        throw new Error('Failed to save grid to API')
    }
}

/**
 * Fetch all saved grids from server
 *
 * Hace un GET al API Route /api/grids sin ID para obtener la lista completa
 *
 * @returns Promise with list of saved grids
 */
export async function getSavedGrids(): Promise<IGetSavedGridsResponse> {
    try {
        const response = await ofetch<IGetSavedGridsResponse>('/api/grids/id', {
            method: 'GET',
            retry: 1,
            timeout: 10000,
        })

        console.log('✅ [API Client] Saved grids fetched:', response.count)
        return response
    } catch (error) {
        console.error('❌ [API Client] Error fetching saved grids:', error)
        throw new Error('Failed to fetch saved grids from API')
    }
}
