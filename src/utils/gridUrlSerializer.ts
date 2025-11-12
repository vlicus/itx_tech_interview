import type { IGridRow } from '@/types'

export function serializeGridToURL(rows: IGridRow[]): string {
    if (!rows || rows.length === 0) return ''

    const serializedRows = rows.map((row, index) => {
        const productIds = row.productIds.join(',')
        const templateId = row.templateId || 'template_right'
        return `r${index + 1}:${productIds}:${templateId}`
    })

    return serializedRows.join('|')
}

export function extractProductIds(rows: IGridRow[]): string[] {
    const allIds = new Set<string>()
    rows.forEach((row) => {
        row.productIds.forEach((id) => allIds.add(id))
    })
    return Array.from(allIds)
}

export function createShareableURL(rows: IGridRow[], baseUrl: string): string {
    const gridParam = serializeGridToURL(rows)
    const productIds = extractProductIds(rows)
    const idsParam = `[${productIds.join(',')}]`

    const params = new URLSearchParams()
    if (gridParam) params.set('grid', gridParam)
    if (productIds.length > 0) params.set('ids', idsParam)

    return `${baseUrl}?${params.toString()}`
}

/**
 * Parsed grid configuration from URL
 */
export interface ParsedGridConfig {
    type: 'simple' | 'full' // simple = only IDs, full = complete grid
    productIds: string[]
    rows?: Array<{
        productIds: string[]
        templateId: string
    }>
}

/**
 * Parse URL parameters to extract grid configuration
 * @param searchParams - URL search parameters
 * @returns Parsed grid configuration
 */
export function parseGridFromURL(
    searchParams: URLSearchParams
): ParsedGridConfig | null {
    const idsParam = searchParams.get('ids')
    const gridParam = searchParams.get('grid')

    // No params at all
    if (!idsParam && !gridParam) {
        return null
    }

    // Parse product IDs
    let productIds: string[] = []
    if (idsParam) {
        try {
            // Remove brackets and split by comma
            const cleaned = idsParam.replace(/[\[\]]/g, '').trim()
            if (cleaned) {
                productIds = cleaned.split(',').map((id) => id.trim())
            }
        } catch (e) {
            console.error('[gridUrlSerializer] Error parsing IDs:', e)
            return null
        }
    }

    // If no grid param, return simple format (only IDs)
    if (!gridParam) {
        return {
            type: 'simple',
            productIds,
        }
    }

    // Parse full grid configuration
    try {
        const rowConfigs = gridParam.split('|')
        const parsedRows = rowConfigs.map((rowConfig) => {
            // Format: r1:id1,id2:templateId
            const parts = rowConfig.split(':')
            if (parts.length !== 3) {
                throw new Error(`Invalid row format: ${rowConfig}`)
            }

            const [_rowIndex, productIdsStr, templateId] = parts
            const rowProductIds = productIdsStr
                .split(',')
                .map((id) => id.trim())
                .filter(Boolean)

            return {
                productIds: rowProductIds,
                templateId: templateId || 'template_right',
            }
        })

        return {
            type: 'full',
            productIds,
            rows: parsedRows,
        }
    } catch (e) {
        console.error('[gridUrlSerializer] Error parsing grid param:', e)
        // Fallback to simple format if grid parsing fails
        return {
            type: 'simple',
            productIds,
        }
    }
}

/**
 * Validate that parsed grid configuration is consistent
 * @param config - Parsed grid configuration
 * @returns True if valid, false otherwise
 */
export function validateGridConfig(config: ParsedGridConfig): boolean {
    if (!config) return false

    // Check product IDs exist
    if (!config.productIds || config.productIds.length === 0) {
        return false
    }

    // For full format, validate rows
    if (config.type === 'full' && config.rows) {
        // Check all products in rows are in the productIds list
        const rowProductIds = new Set<string>()
        config.rows.forEach((row) => {
            row.productIds.forEach((id) => rowProductIds.add(id))
        })

        // All products in rows must be in the main productIds list
        for (const id of rowProductIds) {
            if (!config.productIds.includes(id)) {
                console.warn(
                    `[gridUrlSerializer] Product ${id} in rows but not in productIds list`
                )
                return false
            }
        }

        // Check row constraints (1-3 products per row)
        for (const row of config.rows) {
            if (row.productIds.length < 1 || row.productIds.length > 3) {
                console.warn(
                    `[gridUrlSerializer] Row has invalid product count: ${row.productIds.length}`
                )
                return false
            }
        }
    }

    return true
}
