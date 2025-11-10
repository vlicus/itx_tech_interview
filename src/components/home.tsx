'use client'

import { redirect, RedirectType } from 'next/navigation'
import { Icon } from '@iconify/react'

const Home = () => {
    const options = [
        {
            id: 'option-6',
            title: '6 Products Grid',
            description: '2 rows × 3 columns',
            icon: 'mdi:grid-large',
            url: '/products?ids=[product_1,product_2,product_3,product_4,product_5,product_6]',
            iconColor: 'text-neutral-600',
            iconHoverColor: 'text-indigo-600',
        },
        {
            id: 'option-4',
            title: '4 Products Grid',
            description: '2 rows: 3 + 1',
            icon: 'mdi:view-grid-outline',
            url: '/products?ids=[product_1,product_2,product_3,product_4]',
            iconColor: 'text-neutral-600',
            iconHoverColor: 'text-purple-600',
        },
        {
            id: 'option-1',
            title: '1 Product',
            description: 'Single row layout',
            icon: 'heroicons:square-3-stack-3d-20-solid',
            url: '/products?ids=[product_1]',
            iconColor: 'text-neutral-600',
            iconHoverColor: 'text-pink-600',
        },
    ]

    const handleOptionClick = (url: string) => {
        redirect(url, RedirectType.push)
    }

    return (
        <div className="max-w-4xl mx-auto bg-white rounded-3xl px-6 py-10 lg:px-16 lg:py-20 shadow-sm border border-neutral-200">
            {/* Hero Section */}
            <div className="space-y-4 mb-16 text-center">
                <h1 className="text-5xl lg:text-6xl font-semibold tracking-tight text-neutral-900 leading-tight">
                    Product Grid Editor
                </h1>
                <p className="text-xl text-neutral-600 leading-relaxed max-w-2xl mx-auto">
                    A ZARA-style product grid editor with drag-and-drop
                    functionality
                </p>
            </div>

            {/* Options Section */}
            <div className="space-y-3 mb-12">
                <p className="text-sm uppercase tracking-wide font-medium text-neutral-400 text-center">
                    Choose starting template
                </p>

                <div className="grid grid-cols-1 gap-3">
                    {options.map((option) => (
                        <button
                            key={option.id}
                            onClick={() => handleOptionClick(option.url)}
                            className="w-full group bg-white border-2 border-neutral-200 rounded-2xl p-6 text-left shadow-sm hover:shadow-md hover:border-neutral-300 transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 active:scale-[0.98] cursor-pointer"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    {/* Icon Container */}
                                    <div
                                        className={`flex items-center justify-center w-12 h-12 rounded-xl bg-neutral-100 ${option.iconColor} group-hover:bg-indigo-50 group-hover:${option.iconHoverColor} transition-colors duration-200`}
                                    >
                                        <Icon
                                            icon={option.icon}
                                            className="w-6 h-6"
                                        />
                                    </div>

                                    {/* Text Content */}
                                    <div>
                                        <h3 className="text-base font-semibold text-neutral-900 mb-1">
                                            {option.title}
                                        </h3>
                                        <p className="text-sm text-neutral-500">
                                            {option.description}
                                        </p>
                                    </div>
                                </div>

                                {/* Arrow Indicator */}
                                <Icon
                                    icon="heroicons:arrow-right-20-solid"
                                    className="w-5 h-5 text-neutral-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all duration-200 shrink-0"
                                />
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Footer Info */}
            <div className="mt-12 pt-8 border-t border-neutral-200">
                <p className="text-sm text-neutral-500 leading-relaxed text-center">
                    Products are automatically loaded from URL parameters and
                    distributed into rows{' '}
                    <span className="text-neutral-400">(max 3 per row)</span>
                </p>
            </div>
        </div>
    )
}

export default Home
