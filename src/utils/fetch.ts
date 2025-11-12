import { addToast } from '@heroui/react'
import { ofetch } from 'ofetch'
import type { FetchOptions } from 'ofetch'

interface Options<T, R = T> extends FetchOptions<'json', T> {
    default?: () => T
    transform?: (data: T) => R
}

export async function $fetch<T, R = T>(
    url: string,
    options: Options<T, R> = {}
): Promise<R | T | undefined> {
    try {
        const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api'

        const headers = new Headers(options.headers as HeadersInit)
        if (!headers.has('Content-Type')) {
            headers.set('Content-Type', 'application/json')
        }

        const response = await ofetch<T>(url, {
            baseURL,
            onResponse({ response }) {
                if (!response.ok) {
                    throw new Error(
                        `HTTP ${response.status}: ${response.statusText}`
                    )
                }
            },
            onResponseError({ response }) {
                const whitelist = [402, 404]
                if (!whitelist.includes(response?.status)) {
                    addToast({
                        title: 'Error de red',
                        description: `Error al cargar datos (${response?.status})`,
                        color: 'danger',
                        timeout: 3000,
                        variant: 'solid',
                    })
                }
            },
            ...options,
            headers,
        })

        const transformedData = options.transform?.(response) ?? response
        return transformedData as R
    } catch (error) {
        console.error('$fetch error:', error)

        addToast({
            title: 'Error',
            description:
                error instanceof Error
                    ? error.message
                    : 'An unexpected error occurred',
            color: 'danger',
            timeout: 3000,
            variant: 'solid',
        })

        return options.default?.()
    }
}

export default $fetch
