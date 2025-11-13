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

    const rows = useGridStore((state) => state.rows)
    const addRowWithProducts = useGridStore((state) => state.addRowWithProducts)
    const addRow = useGridStore((state) => state.addRow)
    const resetGrid = useGridStore((state) => state.resetGrid)

    const isLoading = useUIStore((state) => state.isLoading)
    const setLoading = useUIStore((state) => state.setLoading)
    const addToast = useUIStore((state) => state.addToast)

    const productIdsToFetch = useMemo(() => {
        if (!shouldLoadFromURL || !gridConfig) return []
        return gridConfig.productIds
    }, [shouldLoadFromURL, gridConfig])

    useTemplates()

    const {
        data: productsData,
        isLoading: productsLoading,
        isError: productsError,
    } = useProducts(productIdsToFetch)

    useEffect(() => {
        if (!shouldLoadFromURL) return
        if (!gridConfig) return

        if (productsLoading) {
            setLoading(true)
            return
        }

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

        if (productsData) {
            const fetchedProducts = productsData.products || []
            const notFoundIds = productsData.notFoundIds || []

            // Mostrar aviso si hay productos no encontrados
            if (notFoundIds.length > 0) {
                const idsText = notFoundIds.slice(0, 3).join(', ')
                const moreText =
                    notFoundIds.length > 3
                        ? ` y ${notFoundIds.length - 3} más`
                        : ''

                addToast({
                    type: 'warning',
                    message: `Productos no encontrados: ${idsText}${moreText}`,
                })
            }

            if (fetchedProducts.length === 0) {
                addToast({
                    type: 'error',
                    message:
                        'No se encontró ningún producto con los IDs proporcionados',
                })
                setLoading(false)
                setShouldLoadFromURL(false)
                setIsInitialLoad(false)
                return
            }

            resetGrid()

            const { type, rows: rowConfigs } = gridConfig

            if (type === 'full' && rowConfigs) {
                let loadedRowsCount = 0

                for (const rowConfig of rowConfigs) {
                    const validProductIds = rowConfig.productIds.filter((id) =>
                        fetchedProducts.some((p) => p.id === id)
                    )

                    if (validProductIds.length > 0) {
                        addRowWithProducts(validProductIds)
                        loadedRowsCount++

                        const currentRows = useGridStore.getState().rows
                        const lastRow = currentRows[currentRows.length - 1]
                        if (
                            lastRow &&
                            rowConfig.templateId !== lastRow.templateId
                        ) {
                            useGridStore
                                .getState()
                                .assignTemplateToRow(
                                    lastRow.id,
                                    rowConfig.templateId
                                )
                        }
                    }
                }

                const successMessage =
                    notFoundIds.length > 0
                        ? `Cargados ${fetchedProducts.length} de ${gridConfig.productIds.length} productos en ${loadedRowsCount} filas`
                        : `Cargados ${fetchedProducts.length} productos en ${loadedRowsCount} filas`

                addToast({
                    type: 'success',
                    message: successMessage,
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
                const successMessage =
                    notFoundIds.length > 0
                        ? `Cargados ${fetchedProducts.length} de ${gridConfig.productIds.length} productos en ${rowCount} filas`
                        : `Cargados ${fetchedProducts.length} productos en ${rowCount} filas`

                addToast({
                    type: 'success',
                    message: successMessage,
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

            setGridConfig(parsedConfig)
            setShouldLoadFromURL(true)
        } catch (error) {
            addToast({
                type: 'error',
                message: 'Failed to load data from URL',
            })
            setLoading(false)
            setIsInitialLoad(false)
        }
    }, [addRow, resetGrid, addToast, setLoading])

    useEffect(() => {
        if (hydrated && isInitialLoad) {
            loadInitialData()
        }
    }, [hydrated, isInitialLoad, loadInitialData])

    useEffect(() => {
        if (isInitialLoad || !hydrated || isLoading) return

        const allProductIds: string[] = []
        rows.forEach((row) => {
            allProductIds.push(...row.productIds)
        })

        if (allProductIds.length > 0) {
            const idsParam = `[${allProductIds.join(',')}]`
            const newUrl = `${pathname}?ids=${idsParam}`

            router.replace(newUrl, { scroll: false })
        } else {
            router.replace(pathname, { scroll: false })
        }
    }, [rows, hydrated, isLoading, isInitialLoad, pathname, router])

    return {
        isInitialLoad,
        loadInitialData,
    }
}
