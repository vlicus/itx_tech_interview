/**
 * GET /api/products
 *
 * Retorna productos desde datos locales con soporte para filtrado por IDs.
 *
 * Query params:
 * - ids: Comma-separated list of product IDs (optional)
 *   Ejemplo: /api/products?ids=product_1,product_2,product_3
 *
 * Si no se proporciona 'ids', retorna todos los productos.
 */

import { IProduct, IGetProductsResponse } from '@/types'
import { NextRequest, NextResponse } from 'next/server'
import productsData from '@/data/products.json'

export async function GET(request: NextRequest) {
    try {
        // Obtener parámetros de query
        const { searchParams } = new URL(request.url)
        const idsParam = searchParams.get('ids')

        // Cargar todos los productos desde el archivo JSON
        const allProducts = productsData.products as IProduct[]

        let products: IProduct[]

        // Si se proporciona filtro de IDs, filtrar productos
        if (idsParam) {
            console.log('Filtering products by IDs:', idsParam)
            const requestedIds = idsParam.split(',').map((id) => id.trim())
            products = allProducts.filter((product) =>
                requestedIds.includes(product.id)
            )
        } else {
            // Si no hay filtro, retornar todos los productos
            products = allProducts
        }

        const response: IGetProductsResponse = { products }

        return NextResponse.json(response, {
            status: 200,
            headers: {
                'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate',
            },
        })
    } catch (error) {
        console.error('Error loading products:', error)
        return NextResponse.json(
            { error: 'Failed to load products' },
            { status: 500 }
        )
    }
}
