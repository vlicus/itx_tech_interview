import { IProduct, IGetProductsResponse } from '@/types'
import { NextRequest, NextResponse } from 'next/server'
import productsData from '@/data/products.json'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const idsParam = searchParams.get('ids')

        const allProducts = productsData.products as IProduct[]

        let products: IProduct[]
        let notFoundIds: string[] = []

        if (idsParam) {
            const requestedIds = idsParam.split(',').map((id) => id.trim())
            products = allProducts.filter((product) =>
                requestedIds.includes(product.id)
            )

            // Identificar IDs que no se encontraron
            const foundIds = products.map((p) => p.id)
            notFoundIds = requestedIds.filter((id) => !foundIds.includes(id))
        } else {
            products = allProducts
        }

        const response: IGetProductsResponse = {
            products,
            notFoundIds: notFoundIds.length > 0 ? notFoundIds : undefined,
            requestedCount: idsParam ? idsParam.split(',').length : undefined,
            foundCount: products.length,
        }

        return NextResponse.json(response, {
            status: 200,
            headers: {
                'Cache-Control':
                    'public, s-maxage=3600, stale-while-revalidate',
            },
        })
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to load products' },
            { status: 500 }
        )
    }
}
