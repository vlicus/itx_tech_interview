import { useQuery } from '@tanstack/react-query'
import { getProducts } from '@/lib/api'
import type { IGetProductsResponse } from '@/types'

export function useProducts(productIds: string[]) {
    return useQuery<IGetProductsResponse>({
        queryKey: ['products', [...productIds].sort().join(',')],
        queryFn: () => getProducts(productIds),
        enabled: productIds.length > 0,
        staleTime: 1000 * 60 * 5,
    })
}
