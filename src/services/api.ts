/**
 * API Service
 * Refactored to use ofetch and load data from local JSON files
 *
 * JUSTIFICACIÓN: MSW (Mock Service Worker) ha sido eliminado porque:
 * 1. Su única función era mockear datos de una API externa inexistente
 * 2. Con ofetch y datos locales, la cadena async/await es más simple y directa
 * 3. No hay necesidad de interceptar requests de red cuando los datos están locales
 * 4. Reduce complejidad: menos dependencias, menos configuración, más mantenible
 */

import type {
    IGetProductsResponse,
    IGetTemplatesResponse,
    ISaveGridRequest,
    ISaveGridResponse,
    IProduct,
    ITemplate,
} from '@/types'

// Importar datos locales
import productsData from '@/data/products.json'
import templatesData from '@/data/templates.json'

/**
 * Fetch products by IDs from local data
 *
 * @param productIds - Array of product IDs to fetch
 * @returns Promise with filtered products
 */
export async function getProducts(
    productIds: string[]
): Promise<IGetProductsResponse> {
    try {
        // Filtrar productos por IDs solicitados
        const allProducts = productsData.products as IProduct[]
        console.log('All products loaded:', allProducts)
        const filteredProducts = allProducts.filter((product) =>
            productIds.includes(product.id)
        )
        return {
            products: filteredProducts,
        }
    } catch (error) {
        console.error('Error loading products:', error)
        throw new Error('Failed to load products from local data')
    }
}

/**
 * Fetch all available templates from local data
 *
 * @returns Promise with all templates
 */
export async function getTemplates(): Promise<IGetTemplatesResponse> {
    console.log('Templates loaded:', templatesData.templates)
    try {
        return {
            templates: templatesData.templates as ITemplate[],
        }
    } catch (error) {
        console.error('Error loading templates:', error)
        throw new Error('Failed to load templates from local data')
    }
}

/**
 * Save grid configuration
 *
 * Nota: Esta función simula el guardado ya que no hay backend real.
 * En producción, usaríamos ofetch para hacer POST al servidor real.
 *
 * @param gridData - Grid configuration to save
 * @returns Promise with save response
 */
export async function saveGrid(
    gridData: ISaveGridRequest
): Promise<ISaveGridResponse> {
    try {
        // Simular guardado exitoso
        console.log('Grid data to save:', gridData)

        // En producción, esto sería:
        // return await ofetch('/api/grids', {
        //   method: 'POST',
        //   body: gridData,
        // })

        return {
            success: true,
            gridId: `grid_${Date.now()}`,
            message: 'Grid guardado exitosamente (simulado)',
        }
    } catch (error) {
        console.error('Error saving grid:', error)
        throw new Error('Failed to save grid configuration')
    }
}

/**
 * Función auxiliar usando ofetch (para cuando se conecte a API real)
 *
 * Ejemplo de cómo usar ofetch cuando tengamos un backend real:
 *
 * export async function fetchFromRealAPI<T>(endpoint: string): Promise<T> {
 *   return await ofetch<T>(endpoint, {
 *     baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
 *     retry: 2,
 *     timeout: 10000,
 *   })
 * }
 */
