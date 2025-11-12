import { useQuery } from '@tanstack/react-query'
import { getSavedGrids } from '@/lib/api'
import type { IGetSavedGridsResponse } from '@/types'

export function useSavedGrids() {
    return useQuery<IGetSavedGridsResponse>({
        queryKey: ['savedGrids'],
        queryFn: getSavedGrids,
        staleTime: 1000 * 60,
    })
}
