'use client'

import { redirect, RedirectType } from 'next/navigation'
import { Icon } from '@iconify/react'
import { Button, Spinner } from '@heroui/react'
import { useSavedGrids } from '@/hooks/api'
import { formatSavedGrid } from '@/utils'

export default function HomePage() {
    const { data: savedGridsData, isLoading, isError } = useSavedGrids()

    const quickStartTemplates = [
        {
            id: 'template-6-products',
            title: '6 Products Grid',
            description: '2 rows × 3 columns layout',
            icon: 'mdi:grid-large',
            url: '/products?ids=[product_1,product_2,product_3,product_4,product_5,product_6]',
            accentColor: 'text-indigo-600',
        },
        {
            id: 'template-1-product',
            title: '1 Product',
            description: 'Minimal single row layout',
            icon: 'heroicons:square-3-stack-3d-20-solid',
            url: '/products?ids=[product_1]',
            accentColor: 'text-pink-600',
        },
        {
            id: 'template-empty',
            title: 'Empty Grid',
            description: 'Start from a blank grid',
            icon: 'heroicons:square-3-stack-3d-20-solid',
            url: '/products',
            accentColor: 'text-gray-600',
        },
    ]

    const navigateToGrid = (url: string) => {
        redirect(url, RedirectType.push)
    }

    const formattedSavedGrids = savedGridsData?.grids.map(formatSavedGrid) || []
    const hasSavedGrids = formattedSavedGrids.length > 0
    const showEmptyState = !isLoading && !isError && !hasSavedGrids

    return (
        <div className="min-h-screen bg-gray-50 pt-16 pb-20">
            <div className="max-w-5xl mx-auto px-6 lg:px-8">
                <div className="space-y-6 mb-16 text-center">
                    <div className="pt-4">
                        <Button
                            color="default"
                            variant="bordered"
                            size="lg"
                            onPress={() => navigateToGrid('/products')}
                        >
                            Empezar con una Parrilla Vacía
                            <Icon
                                icon="heroicons:arrow-right-20-solid"
                                className="ml-2 w-5 h-5"
                            />
                        </Button>
                    </div>
                </div>

                <div className="space-y-8">
                    <p className="text-sm uppercase tracking-widest font-bold text-neutral-500 text-center">
                        O elige una plantilla de inicio rápido
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {quickStartTemplates.map((template) => (
                            <div
                                key={template.id}
                                onClick={() => navigateToGrid(template.url)}
                                className="bg-white border border-neutral-200 rounded-xl p-6 shadow-lg hover:shadow-2xl hover:border-indigo-400 transition-all duration-300 ease-out cursor-pointer flex flex-col space-y-4 transform hover:-translate-y-1.5"
                            >
                                <div
                                    className={`flex items-center justify-center w-14 h-14 rounded-lg bg-gray-50 ${template.accentColor} group-hover:bg-white transition-colors duration-200 border border-neutral-100`}
                                >
                                    <Icon
                                        icon={template.icon}
                                        className="w-7 h-7"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <h3 className="text-lg font-bold text-neutral-900">
                                        {template.title}
                                    </h3>
                                    <p className="text-sm text-neutral-500">
                                        {template.description}
                                    </p>
                                </div>

                                <div
                                    className={`text-sm font-semibold pt-2 flex items-center ${template.accentColor}`}
                                >
                                    Empezar ahora
                                    <Icon
                                        icon="heroicons:arrow-right-20-solid"
                                        className="w-4 h-4 ml-1.5"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-8 mt-20">
                    <p className="text-sm uppercase tracking-widest font-bold text-neutral-500 text-center">
                        Tus Parrillas Guardadas
                    </p>

                    {isLoading && (
                        <div className="flex justify-center items-center py-12">
                            <Spinner size="lg" label="Cargando historial..." />
                        </div>
                    )}

                    {isError && !isLoading && (
                        <div className="text-center py-12">
                            <Icon
                                icon="heroicons:exclamation-circle-20-solid"
                                className="w-12 h-12 text-red-500 mx-auto mb-3"
                            />
                            <p className="text-sm text-neutral-600">
                                Error al cargar el historial. Intenta recargar
                                la página.
                            </p>
                        </div>
                    )}

                    {showEmptyState && (
                        <div className="text-center py-12">
                            <Icon
                                icon="heroicons:archive-box-x-mark-20-solid"
                                className="w-12 h-12 text-neutral-400 mx-auto mb-3"
                            />
                            <p className="text-sm text-neutral-600">
                                No hay parrillas guardadas aún.
                            </p>
                            <p className="text-xs text-neutral-400 mt-1">
                                Crea y guarda tu primera parrilla para verla
                                aquí.
                            </p>
                        </div>
                    )}

                    {hasSavedGrids && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {formattedSavedGrids.map((grid) => (
                                <div
                                    key={grid.id}
                                    onClick={() => navigateToGrid(grid.url)}
                                    className="bg-white border border-neutral-200 rounded-xl p-6 shadow-lg hover:shadow-2xl hover:border-indigo-400 transition-all duration-300 ease-out cursor-pointer flex flex-col space-y-4 transform hover:-translate-y-1.5"
                                >
                                    <div
                                        className={`flex items-center justify-center w-14 h-14 rounded-lg bg-gray-50 ${grid.accentColor} group-hover:bg-white transition-colors duration-200 border border-neutral-100`}
                                    >
                                        <Icon
                                            icon={grid.icon}
                                            className="w-7 h-7"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <h3 className="text-lg font-bold text-neutral-900">
                                            {grid.title}
                                        </h3>
                                        <p className="text-sm text-neutral-500">
                                            {grid.description}
                                        </p>
                                    </div>

                                    <div
                                        className={`text-sm font-semibold pt-2 flex items-center ${grid.accentColor}`}
                                    >
                                        Abrir parrilla
                                        <Icon
                                            icon="heroicons:arrow-right-20-solid"
                                            className="w-4 h-4 ml-1.5"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="mt-20 pt-8 border-t border-neutral-100">
                    <p className="text-sm text-neutral-500 leading-relaxed text-center">
                        La carga inicial de productos se realiza a través de la
                        URL
                        <span className="text-neutral-400">
                            (máximo 3 productos por fila)
                        </span>
                        .
                    </p>
                </div>
            </div>
        </div>
    )
}
