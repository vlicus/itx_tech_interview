export interface IProduct {
    id: string
    name: string
    imageUrl: string
    price: string
}

export interface IProductWithMeta extends IProduct {
    isLoading?: boolean
    hasError?: boolean
}
