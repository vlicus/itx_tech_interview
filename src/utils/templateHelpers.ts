import type { ITemplate } from '@/types'

export function getTemplateById(
    templates: ITemplate[],
    id: string
): ITemplate | undefined {
    return templates.find((template) => template.id === id)
}

export function getTemplatesByAlignment(
    templates: ITemplate[],
    alignment: 'LEFT' | 'CENTER' | 'RIGHT'
): ITemplate[] {
    return templates.filter((template) => template.alignment === alignment)
}
