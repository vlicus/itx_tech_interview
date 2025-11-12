import { useState, useEffect, useCallback } from 'react'
import { useGridStore, useTemplateStore, useUIStore } from '@/lib/store'
import { getProducts, getTemplates } from '@/lib/api'
import { usePathname, useRouter } from 'next/navigation'
import {
    parseGridFromURL,
    validateGridConfig,
    type ParsedGridConfig,
} from '@/utils/gridUrlSerializer'

interface UseGridDataReturn {
    isInitialLoad: boolean
    loadInitialData: () => Promise<void>
}

export function useGridData(hydrated: boolean): UseGridDataReturn {
    const [isInitialLoad, setIsInitialLoad] = useState(true)
    const pathname = usePathname()
    const router = useRouter()

    // Grid store
    const rows = useGridStore((state) => state.rows)
    const setProducts = useGridStore((state) => state.setProducts)
    const addRowWithProducts = useGridStore((state) => state.addRowWithProducts)
    const addRow = useGridStore((state) => state.addRow)
    const resetGrid = useGridStore((state) => state.resetGrid)
    const cleanOrphanProducts = useGridStore((state) => state.cleanOrphanProducts)

    // Template store
    const setTemplates = useTemplateStore((state) => state.setTemplates)
    const setTemplatesLoading = useTemplateStore((state) => state.setLoading)

    // UI store
    const isLoading = useUIStore((state) => state.isLoading)
    const setLoading = useUIStore((state) => state.setLoading)
    const addToast = useUIStore((state) => state.addToast)

    const loadInitialData = useCallback(async () => {
        setLoading(true)
        setTemplatesLoading(true)

        try {
            const templatesResponse = await getTemplates()
            setTemplates(templatesResponse.templates)

            const urlParams = new URLSearchParams(window.location.search)
            const gridConfig = parseGridFromURL(urlParams)

            if (!gridConfig) {
                resetGrid()
                addRow()
                setLoading(false)
                setTemplatesLoading(false)
                return
            }

            if (!validateGridConfig(gridConfig)) {
                addToast({
                    type: 'error',
                    message: 'Invalid grid configuration in URL',
                })
                setLoading(false)
                setTemplatesLoading(false)
                return
            }

            const { productIds, type, rows: rowConfigs } = gridConfig

            if (productIds.length === 0) {
                addToast({
                    type: 'info',
                    message: 'No product IDs found in URL',
                })
                setLoading(false)
                setTemplatesLoading(false)
                return
            }

            const productsResponse = await getProducts(productIds)
            const fetchedProducts = productsResponse.products

            if (fetchedProducts.length === 0) {
                addToast({
                    type: 'warning',
                    message: 'No products found for the given IDs',
                })
                setLoading(false)
                setTemplatesLoading(false)
                return
            }

            resetGrid()
            setProducts(fetchedProducts)

            if (type === 'full' && rowConfigs) {
                for (const rowConfig of rowConfigs) {
                    const validProductIds = rowConfig.productIds.filter((id) =>
                        fetchedProducts.some((p) => p.id === id)
                    )

                    if (validProductIds.length > 0) {
                        addRowWithProducts(validProductIds)

                        const currentRows = useGridStore.getState().rows
                        const lastRow = currentRows[currentRows.length - 1]
                        if (lastRow && rowConfig.templateId !== lastRow.templateId) {
                            useGridStore
                                .getState()
                                .assignTemplateToRow(lastRow.id, rowConfig.templateId)
                        }
                    }
                }

                addToast({
                    type: 'success',
                    message: `Loaded shared grid: ${fetchedProducts.length} products in ${rowConfigs.length} rows`,
                })
            } else {
                for (let i = 0; i < fetchedProducts.length; i += 3) {
                    const rowProducts = fetchedProducts.slice(
                        i,
                        Math.min(i + 3, fetchedProducts.length)
                    )
                    const productIdsForRow = rowProducts.map((p) => p.id)
                    addRowWithProducts(productIdsForRow)
                }

                const rowCount = Math.ceil(fetchedProducts.length / 3)

                addToast({
                    type: 'success',
                    message: `Loaded ${fetchedProducts.length} products in ${rowCount} rows`,
                })
            }
        } catch (error) {
            console.error('[useGridData] Error loading data:', error)
            addToast({
                type: 'error',
                message: 'Failed to load data from URL',
            })
        } finally {
            setLoading(false)
            setTemplatesLoading(false)
        }
    }, [
        setProducts,
        addRowWithProducts,
        addRow,
        resetGrid,
        setTemplates,
        addToast,
        setLoading,
        setTemplatesLoading,
    ])

    // Initialize data from URL parameters
    useEffect(() => {
        if (hydrated) {
            loadInitialData().then(() => {
                setIsInitialLoad(false)
            })
        }
    }, [hydrated, loadInitialData])

    // Sync URL with current grid state (when rows change)
    useEffect(() => {
        if (isInitialLoad || !hydrated || isLoading) return

        // Clean orphan products first (products not in any row)
        cleanOrphanProducts()

        const allProductIds: string[] = []
        rows.forEach((row) => {
            allProductIds.push(...row.productIds)
        })

        if (allProductIds.length > 0) {
            const idsParam = `[${allProductIds.join(',')}]`
            const newUrl = `${pathname}?ids=${idsParam}`

            console.log('🔄 [URL SYNC] Updating URL:', {
                productIds: allProductIds,
                idsParam,
                newUrl,
            })

            router.replace(newUrl, { scroll: false })
        } else {
            console.log('🔄 [URL SYNC] No products, clearing URL params')
            router.replace(pathname, { scroll: false })
        }
    }, [rows, hydrated, isLoading, isInitialLoad, pathname, router, cleanOrphanProducts])

    return {
        isInitialLoad,
        loadInitialData,
    }
}
