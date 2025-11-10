/**
 * Custom fetch wrapper using ofetch
 *
 * Esta utilidad encapsula ofetch para proporcionar:
 * - Manejo centralizado de errores con toasts
 * - Transformación de datos
 * - Valores por defecto en caso de error
 * - Headers personalizados
 */

import { addToast } from '@heroui/react'
import { ofetch } from 'ofetch'
import type { FetchOptions } from 'ofetch'

interface Options<T, R = T> extends FetchOptions<'json', T> {
    /** Función que retorna un valor por defecto en caso de error */
    default?: () => T
    /** Función para transformar la respuesta */
    transform?: (data: T) => R
}

/**
 * Wrapper de ofetch con manejo de errores y toasts
 *
 * @param url - URL relativa o absoluta
 * @param options - Opciones de fetch extendidas
 * @returns Datos transformados o valor por defecto
 *
 * @example
 * ```ts
 * const data = await $fetch('/api/products', {
 *   default: () => [],
 *   transform: (data) => data.products
 * })
 * ```
 */
export async function $fetch<T, R = T>(
    url: string,
    options: Options<T, R> = {}
): Promise<R | T | undefined> {
    try {
        // Configurar baseURL - usa /api local por defecto para evitar CORS
        const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api'

        // Preparar headers
        const headers = new Headers(options.headers as HeadersInit)
        if (!headers.has('Content-Type')) {
            headers.set('Content-Type', 'application/json')
        }

        // Realizar fetch con ofetch
        const response = await ofetch<T>(url, {
            baseURL,
            onResponse({ response }) {
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
                }
            },
            onResponseError({ response }) {
                // No mostrar toast para ciertos códigos de estado
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

        // Transformar respuesta si se proporciona transformador
        const transformedData = options.transform?.(response) ?? response
        return transformedData as R
    } catch (error) {
        console.error('$fetch error:', error)

        // Mostrar toast de error
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

        // Retornar valor por defecto si existe
        return options.default?.()
    }
}

export default $fetch
