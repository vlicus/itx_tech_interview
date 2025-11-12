import type { IStoredGrid } from '@/types'

export function formatSavedGrid(savedGrid: IStoredGrid) {
    const { id, timestamp, data } = savedGrid
    const rowCount = data.rows.length
    const productCount = data.rows.reduce(
        (acc, row) => acc + row.productIds.length,
        0
    )

    const allProductIds: string[] = []
    data.rows.forEach((row) => {
        allProductIds.push(...row.productIds)
    })

    const formattedDate = new Date(timestamp).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })

    const rowLabel = rowCount === 1 ? 'fila' : 'filas'
    const productLabel = productCount === 1 ? 'producto' : 'productos'

    return {
        id,
        title: `Parrilla - ${formattedDate}`,
        description: `${rowCount} ${rowLabel} con ${productCount} ${productLabel}`,
        icon: 'heroicons:archive-box-20-solid',
        url: `/products?ids=[${allProductIds.join(',')}]`,
        accentColor: 'text-indigo-600',
    }
}
