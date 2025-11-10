'use client'

/**
 * ProductCard Component
 * Displays a product with image, name, and price
 * Supports drag-and-drop functionality
 */

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card, CardBody, CardFooter, Image, Skeleton } from '@heroui/react'
import { Icon } from '@iconify/react'
import { cn } from '@/utils'
import type { IProduct } from '@/types'

interface ProductCardProps {
    product: IProduct
    isDragging?: boolean
    isLoading?: boolean
    rowId: string
    index: number
}

export function ProductCard({
    product,
    isLoading = false,
    rowId,
    index,
}: ProductCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
        setActivatorNodeRef,
    } = useSortable({
        id: `${rowId}-${product.id}`,
        data: {
            type: 'PRODUCT',
            productId: product.id,
            sourceRowId: rowId,
            sourceIndex: index,
        },
    })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

    if (isLoading) {
        return <ProductCardSkeleton />
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                'w-full sm:w-[calc(50%-0.5rem)] md:w-[calc(33.333%-0.667rem)] relative',
                'flex items-center justify-center',
                'transition-all duration-200',
                isDragging && 'opacity-30 scale-95 z-50'
            )}
        >
            {/* Drag Handle - Top Right Corner */}
            <div
                ref={setActivatorNodeRef}
                {...attributes}
                {...listeners}
                className={cn(
                    'absolute top-2 right-2 z-10',
                    'w-8 h-8 flex items-center justify-center',
                    'bg-white/90 backdrop-blur-sm rounded-full shadow-lg',
                    'cursor-grab active:cursor-grabbing',
                    'hover:bg-primary-50 hover:scale-110 hover:shadow-xl',
                    'transition-all duration-200',
                    isDragging && 'cursor-grabbing bg-primary-100 scale-110'
                )}
                aria-label="Drag to reorder product"
            >
                <Icon
                    icon="mdi:drag"
                    className={cn(
                        "w-5 h-5 transition-colors duration-200",
                        isDragging ? "text-primary-600" : "text-default-600"
                    )}
                />
            </div>

            <Card
                className={cn(
                    'w-full transition-all duration-200',
                    'hover:shadow-2xl hover:scale-[1.02]',
                    'shadow-md',
                    isDragging && 'shadow-2xl ring-4 ring-primary/50 ring-offset-2 scale-105'
                )}
            >
                <CardBody className="p-0 relative">
                    <Image
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full object-cover aspect-2/3"
                        radius="none"
                        loading="lazy"
                    />
                </CardBody>
                <CardFooter className="flex flex-col items-start gap-1 p-3">
                    <h3
                        className="text-sm font-medium line-clamp-2"
                        title={product.name}
                    >
                        {product.name}
                    </h3>
                    <p className="text-sm font-semibold text-primary">
                        {product.price}
                    </p>
                </CardFooter>
            </Card>
        </div>
    )
}

/**
 * ProductCard Skeleton
 * Loading state for ProductCard
 */
function ProductCardSkeleton() {
    return (
        <Card className="w-full">
            <CardBody className="p-0">
                <Skeleton className="w-full aspect-2/3 rounded-none " />
            </CardBody>
            <CardFooter className="flex flex-col items-start gap-1 p-3">
                <Skeleton className="h-4 w-3/4 rounded-lg" />
                <Skeleton className="h-4 w-1/2 rounded-lg" />
            </CardFooter>
        </Card>
    )
}
