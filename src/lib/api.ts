import { ofetch } from 'ofetch'
import type {
    IGetProductsResponse,
    IGetTemplatesResponse,
    ISaveGridRequest,
    ISaveGridResponse,
    IGetSavedGridsResponse,
} from '@/types'

export async function getProducts(
    productIds: string[]
): Promise<IGetProductsResponse> {
    try {
        const idsParam = productIds.join(',')

        const response = await ofetch<IGetProductsResponse>(
            `/api/products?ids=${idsParam}`,
            {
                method: 'GET',
                retry: 1,
                timeout: 10000,
            }
        )

        return response
    } catch (error) {
        throw new Error('Failed to fetch products from API')
    }
}

export async function getTemplates(): Promise<IGetTemplatesResponse> {
    try {
        const response = await ofetch<IGetTemplatesResponse>('/api/templates', {
            method: 'GET',
            retry: 1,
            timeout: 10000,
        })

        return response
    } catch (error) {
        throw new Error('Failed to fetch templates from API')
    }
}

export async function saveGrid(
    gridData: ISaveGridRequest
): Promise<ISaveGridResponse> {
    try {
        const response = await ofetch<ISaveGridResponse>('/api/grids/id', {
            method: 'POST',
            body: gridData,
            retry: 1,
            timeout: 10000,
        })

        return response
    } catch (error) {
        throw new Error('Failed to save grid to API')
    }
}

export async function getSavedGrids(): Promise<IGetSavedGridsResponse> {
    try {
        const response = await ofetch<IGetSavedGridsResponse>('/api/grids/id', {
            method: 'GET',
            retry: 1,
            timeout: 10000,
        })

        return response
    } catch (error) {
        throw new Error('Failed to fetch saved grids from API')
    }
}
