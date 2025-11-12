import { useMutation } from '@tanstack/react-query'
import { saveGrid } from '@/lib/api'
import type { ISaveGridRequest, ISaveGridResponse } from '@/types'
import { useUIStore } from '@/lib/store'

export function useSaveGrid() {
    const addToast = useUIStore((state) => state.addToast)
    return useMutation<ISaveGridResponse, Error, ISaveGridRequest>({
        mutationFn: saveGrid,
        onSuccess: () => {
            addToast({
                type: 'success',
                message: 'Grid saved successfully',
            })
        },
        onError: () => {
            addToast({
                type: 'error',
                message: 'Failed to save Grid',
            })
        },
    })
}
