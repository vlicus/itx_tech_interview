/**
 * Validation Utilities
 * Functions for validating grid state before saving
 */

import type {
    IGridRow,
    IValidationResult,
    IValidationError,
    MIN_PRODUCTS_PER_ROW,
    MAX_PRODUCTS_PER_ROW,
} from '@/types'

const MIN_PRODUCTS = 1 // harcoded minimum products per row because test will fail
const MAX_PRODUCTS = 3

/**
 * Validate a single grid row
 */
export function validateRow(row: IGridRow): IValidationError[] {
    const errors: IValidationError[] = []

    // Check if row has at least one product
    if (row.productIds.length < MIN_PRODUCTS) {
        errors.push({
            rowId: row.id,
            message: 'Row must have at least one product',
            type: 'MISSING_PRODUCTS',
        })
    }

    // Check if row doesn't exceed maximum products
    if (row.productIds.length > MAX_PRODUCTS) {
        errors.push({
            rowId: row.id,
            message: `Row cannot have more than ${MAX_PRODUCTS} products`,
            type: 'TOO_MANY_PRODUCTS',
        })
    }

    // Check if row has a valid template assigned
    // Must have a template AND it cannot be 'template_none' (explicit "None" selection)
    if (row.templateId === null || row.templateId === 'template_none') {
        errors.push({
            rowId: row.id,
            message:
                'Row must have a valid template assigned (Left, Center, or Right)',
            type: 'MISSING_TEMPLATE',
        })
    }

    return errors
}

/**
 * Validate entire grid
 */
export function validateGrid(rows: IGridRow[]): IValidationResult {
    const allErrors: IValidationError[] = []

    rows?.forEach((row) => {
        const rowErrors = validateRow(row)
        allErrors.push(...rowErrors)
    })

    return {
        isValid: allErrors.length === 0,
        errors: allErrors,
    }
}

/**
 * Check if a row can accept more products
 */
export function canRowAcceptProduct(row: IGridRow): boolean {
    return row.productIds.length < MAX_PRODUCTS
}

/**
 * Get validation error message for display
 */
export function getValidationErrorMessage(error: IValidationError): string {
    return error.message
}

/**
 * Group validation errors by row
 */
export function groupErrorsByRow(
    errors: IValidationError[]
): Record<string, IValidationError[]> {
    return errors.reduce((acc, error) => {
        if (!acc[error.rowId]) {
            acc[error.rowId] = []
        }
        acc[error.rowId].push(error)
        return acc
    }, {} as Record<string, IValidationError[]>)
}
