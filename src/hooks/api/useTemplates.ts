/**
 * TanStack Query hook for fetching templates
 */

import { useQuery } from '@tanstack/react-query'
import { getTemplates } from '@/services/api'
import type { IGetTemplatesResponse } from '@/types'

export function useTemplates() {
    return useQuery<IGetTemplatesResponse>({
        queryKey: ['templates'],
        queryFn: getTemplates,
        staleTime: 1000 * 60 * 10, // 10 minutes (templates change rarely)
    })
}
