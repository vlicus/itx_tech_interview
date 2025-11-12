import { useMutation } from '@tanstack/react-query'
import { saveGrid } from '@/lib/api'
import type { ISaveGridRequest, ISaveGridResponse } from '@/types'

export function useSaveGrid() {
    return useMutation<ISaveGridResponse, Error, ISaveGridRequest>({
        mutationFn: saveGrid,
    })
}
