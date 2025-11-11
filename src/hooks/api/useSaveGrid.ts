/**
 * TanStack Query mutation hook for saving grid configuration
 */

import { useMutation } from '@tanstack/react-query'
import { saveGrid } from '@/services/api'
import type { ISaveGridRequest, ISaveGridResponse } from '@/types'

export function useSaveGrid() {
    return useMutation<ISaveGridResponse, Error, ISaveGridRequest>({
        mutationFn: saveGrid,
        onSuccess: (data) => {
            console.log('✅ [useSaveGrid] Grid saved successfully:', data.gridId)
        },
        onError: (error) => {
            console.error('❌ [useSaveGrid] Failed to save grid:', error)
        },
    })
}
