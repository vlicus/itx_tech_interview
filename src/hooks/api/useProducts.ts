import { useQuery } from '@tanstack/react-query'
import { getProducts } from '@/lib/api'
import type { IGetProductsResponse } from '@/types'

interface ApiError extends Error {
    status?: number
    statusCode?: number
    data?: any
}

export function useProducts(productIds: string[]) {
    return useQuery<IGetProductsResponse, ApiError>({
        queryKey: ['products', [...productIds].sort().join(',')],
        queryFn: () => getProducts(productIds),
        enabled: productIds.length > 0,
        staleTime: 1000 * 60 * 5,
        retry: (failureCount, error) => {
            const status = error.status || error.statusCode
            if (status === 404) return false
            return failureCount < 1
        },
    })
}
