/**
 * TanStack Query hook for fetching products
 */

import { useQuery } from '@tanstack/react-query'
import { getProducts } from '@/services/api'
import type { IGetProductsResponse } from '@/types'

export function useProducts(productIds: string[]) {
    return useQuery<IGetProductsResponse>({
        queryKey: ['products', productIds.sort().join(',')], // Sort for cache consistency
        queryFn: () => getProducts(productIds),
        enabled: productIds.length > 0, // Only fetch if we have IDs
        staleTime: 1000 * 60 * 5, // 5 minutes
    })
}
