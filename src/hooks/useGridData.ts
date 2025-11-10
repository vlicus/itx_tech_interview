/**
 * useGridData Hook
 * Handles loading products and templates from URL parameters
 */

import { useState, useEffect, useCallback } from 'react'
import { useGridStore, useTemplateStore, useUIStore } from '@/lib/store'
import { getProducts, getTemplates } from '@/services/api'
import { usePathname, useRouter } from 'next/navigation'

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
            // Load templates first
            const templatesResponse = await getTemplates()
            setTemplates(templatesResponse.templates)

            // Parse product IDs from URL
            const urlParams = new URLSearchParams(window.location.search)
            const idsParam = urlParams.get('ids')

            if (!idsParam) {
                setLoading(false)
                setTemplatesLoading(false)
                addToast({
                    type: 'info',
                    message: 'No products specified. Add ?ids=[id1,id2,...] to URL',
                })
                return
            }

            // Parse IDs from format: [productId1,productId2,...]
            let productIds: string[] = []
            try {
                // Remove brackets and split by comma
                const cleaned = idsParam.replace(/[\[\]]/g, '').trim()
                if (cleaned) {
                    productIds = cleaned.split(',').map((id) => id.trim())
                }
            } catch (e) {
                addToast({
                    type: 'error',
                    message: 'Invalid product IDs format in URL',
                })
                setLoading(false)
                setTemplatesLoading(false)
                return
            }

            if (productIds.length === 0) {
                addToast({
                    type: 'info',
                    message: 'No product IDs found in URL',
                })
                setLoading(false)
                setTemplatesLoading(false)
                return
            }

            // Fetch products from API
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

            // Clear any existing state first (BEFORE setting products)
            resetGrid()

            // Store products in state (AFTER clearing)
            setProducts(fetchedProducts)

            // Auto-distribute products into rows (max 3 per row)
            // Use addRowWithProducts to create rows with products atomically
            for (let i = 0; i < fetchedProducts.length; i += 3) {
                const rowProducts = fetchedProducts.slice(
                    i,
                    Math.min(i + 3, fetchedProducts.length)
                )
                const productIds = rowProducts.map((p) => p.id)
                addRowWithProducts(productIds)
            }

            const rowCount = Math.ceil(fetchedProducts.length / 3)

            addToast({
                type: 'success',
                message: `Loaded ${fetchedProducts.length} products in ${rowCount} rows`,
            })
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
    }, [setProducts, addRowWithProducts, resetGrid, setTemplates, addToast, setLoading, setTemplatesLoading])

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
