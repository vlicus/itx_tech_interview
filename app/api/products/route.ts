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

import { IProduct } from '@/types'
import { NextRequest, NextResponse } from 'next/server'
import productsData from '@/data/products.json'

export async function GET(request: NextRequest) {
    try {
        // Obtener parámetros de query
        const { searchParams } = new URL(request.url)
        const idsParam = searchParams.get('ids')

        // Cargar todos los productos desde el archivo JSON
        const allProducts = productsData.products as IProduct[]

        // Si se proporciona filtro de IDs, filtrar productos
        if (idsParam) {
            console.log('Filtering products by IDs:', idsParam)
            const requestedIds = idsParam.split(',').map((id) => id.trim())
            const filteredProducts = allProducts.filter((product) =>
                requestedIds.includes(product.id)
            )

            return NextResponse.json(filteredProducts, { status: 200 })
        }

        // Si no hay filtro, retornar todos los productos
        return NextResponse.json(allProducts, { status: 200 })
    } catch (error) {
        console.error('Error loading products:', error)
        return NextResponse.json(
            { error: 'Failed to load products' },
            { status: 500 }
        )
    }
}
