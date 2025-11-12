import { useState, useEffect, useCallback, useMemo } from 'react'
import { useGridStore, useUIStore } from '@/lib/store'
import { useProducts } from './api/useProducts'
import { useTemplates } from './api/useTemplates'
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
    const [shouldLoadFromURL, setShouldLoadFromURL] = useState(false)
    const [gridConfig, setGridConfig] = useState<ParsedGridConfig | null>(null)
    const pathname = usePathname()
    const router = useRouter()

    // Grid store
    const rows = useGridStore((state) => state.rows)
    const addRowWithProducts = useGridStore((state) => state.addRowWithProducts)
    const addRow = useGridStore((state) => state.addRow)
    const resetGrid = useGridStore((state) => state.resetGrid)

    // UI store
    const isLoading = useUIStore((state) => state.isLoading)
    const setLoading = useUIStore((state) => state.setLoading)
    const addToast = useUIStore((state) => state.addToast)

    // Parse URL to extract product IDs
    const productIdsToFetch = useMemo(() => {
        if (!shouldLoadFromURL || !gridConfig) return []
        return gridConfig.productIds
    }, [shouldLoadFromURL, gridConfig])

    // ✅ Use TanStack Query hooks for data fetching
    // Templates are fetched automatically (preloaded in layout or eagerly loaded)
    useTemplates()

    const {
        data: productsData,
        isLoading: productsLoading,
        isError: productsError,
    } = useProducts(productIdsToFetch)

    // Set up grid when products are loaded
    useEffect(() => {
        if (!shouldLoadFromURL) return
        if (!gridConfig) return

        // Wait for products to load
        if (productsLoading) {
            setLoading(true)
            return
        }

        // Handle errors
        if (productsError) {
            addToast({
                type: 'error',
                message: 'Failed to load products',
            })
            setLoading(false)
            setShouldLoadFromURL(false)
            setIsInitialLoad(false)
            return
        }

        // Products loaded successfully
        if (productsData?.products) {
            const fetchedProducts = productsData.products

            if (fetchedProducts.length === 0) {
                addToast({
                    type: 'warning',
                    message: 'No products found for the given IDs',
                })
                setLoading(false)
                setShouldLoadFromURL(false)
                setIsInitialLoad(false)
                return
            }

            // Reset grid and set up rows
            resetGrid()

            const { type, rows: rowConfigs } = gridConfig

            if (type === 'full' && rowConfigs) {
                // Full grid configuration with templates
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
                // Simple ID list - create rows of 3 products each
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

            setLoading(false)
            setShouldLoadFromURL(false)
            setIsInitialLoad(false)
        }
    }, [
        shouldLoadFromURL,
        gridConfig,
        productsData,
        productsLoading,
        productsError,
        resetGrid,
        addRowWithProducts,
        addToast,
        setLoading,
    ])

    const loadInitialData = useCallback(async () => {
        setLoading(true)

        try {
            const urlParams = new URLSearchParams(window.location.search)
            const parsedConfig = parseGridFromURL(urlParams)

            if (!parsedConfig) {
                // No URL params - start with empty grid
                resetGrid()
                addRow()
                setLoading(false)
                setIsInitialLoad(false)
                return
            }

            if (!validateGridConfig(parsedConfig)) {
                addToast({
                    type: 'error',
                    message: 'Invalid grid configuration in URL',
                })
                setLoading(false)
                setIsInitialLoad(false)
                return
            }

            if (parsedConfig.productIds.length === 0) {
                addToast({
                    type: 'info',
                    message: 'No product IDs found in URL',
                })
                setLoading(false)
                setIsInitialLoad(false)
                return
            }

            // Set config and trigger loading
            setGridConfig(parsedConfig)
            setShouldLoadFromURL(true)
        } catch (error) {
            console.error('[useGridData] Error loading data:', error)
            addToast({
                type: 'error',
                message: 'Failed to load data from URL',
            })
            setLoading(false)
            setIsInitialLoad(false)
        }
    }, [addRow, resetGrid, addToast, setLoading])

    // Initialize data from URL parameters
    useEffect(() => {
        if (hydrated && isInitialLoad) {
            loadInitialData()
        }
    }, [hydrated, isInitialLoad, loadInitialData])

    // Sync URL with current grid state (when rows change)
    useEffect(() => {
        if (isInitialLoad || !hydrated || isLoading) return

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
    }, [rows, hydrated, isLoading, isInitialLoad, pathname, router])

    return {
        isInitialLoad,
        loadInitialData,
    }
}
