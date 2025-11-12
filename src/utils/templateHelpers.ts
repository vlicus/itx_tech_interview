/**
 * Template Helper Functions
 * Pure utility functions for working with templates
 */

import type { ITemplate } from '@/types'

/**
 * Find a template by its ID
 */
export function getTemplateById(
    templates: ITemplate[],
    id: string
): ITemplate | undefined {
    return templates.find((template) => template.id === id)
}

/**
 * Find templates by alignment
 */
export function getTemplatesByAlignment(
    templates: ITemplate[],
    alignment: 'LEFT' | 'CENTER' | 'RIGHT'
): ITemplate[] {
    return templates.filter((template) => template.alignment === alignment)
}
