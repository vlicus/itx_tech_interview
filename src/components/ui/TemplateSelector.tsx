'use client'

/**
 * TemplateSelector Component
 * Allows users to assign templates to grid rows
 */

import { Select, SelectItem } from '@heroui/react'
import { useTemplates } from '@/hooks/api/useTemplates'
import { Icon } from '@iconify/react'

interface TemplateSelectorProps {
    selectedTemplateId?: string | null
    onTemplateChange: (templateId: string) => void
    size?: 'sm' | 'md' | 'lg'
    disabled?: boolean
    className?: string
}

export function TemplateSelector({
    selectedTemplateId,
    onTemplateChange,
    size = 'sm',
    disabled = false,
    className = '',
}: TemplateSelectorProps) {
    const { data: templatesData, isLoading } = useTemplates()
    const templates = templatesData?.templates || []

    const handleSelectionChange = (keys: 'all' | Set<React.Key>) => {
        if (keys !== 'all' && keys.size > 0) {
            const templateId = Array.from(keys)[0] as string
            onTemplateChange(templateId)
        }
    }

    return (
        <Select
            size={size}
            placeholder="Template"
            selectedKeys={
                selectedTemplateId ? new Set([selectedTemplateId]) : new Set()
            }
            onSelectionChange={handleSelectionChange}
            isLoading={isLoading}
            isDisabled={disabled}
            aria-label="Template selector"
            variant="bordered"
            className={className}
            startContent={
                <Icon
                    icon="heroicons:chevron-up-down-20-solid"
                    className="w-3 h-5 text-neutral-500 shrink-0"
                />
            }
            classNames={{
                base: 'min-w-[160px]',
                trigger:
                    'bg-white border-2 border-neutral-200 hover:border-primary hover:shadow-md transition-all duration-200 rounded-lg data-[hover=true]:bg-neutral-50',
                innerWrapper: 'flex items-center gap-2',
                value: 'text-sm font-medium text-neutral-900',
                selectorIcon: 'hidden',
            }}
            selectorIcon={
                <Icon
                    icon="heroicons:chevron-down-20-solid"
                    className="w-4 h-4"
                />
            }
            popoverProps={{
                classNames: {
                    content:
                        'bg-white border border-neutral-200 rounded-lg shadow-lg p-1',
                },
            }}
        >
            {templates.map((template) => (
                <SelectItem
                    key={template.id}
                    textValue={template.name}
                    classNames={{
                        base: 'rounded-md data-[hover=true]:bg-primary/10 data-[hover=true]:text-primary data-[focus=true]:bg-primary/10 transition-colors duration-200',
                    }}
                >
                    <div className="flex flex-col gap-0.5 py-1">
                        <span className="text-sm font-medium">
                            {template.name}
                        </span>
                        <span className="text-xs text-neutral-500">
                            Alignment: {template.alignment}
                        </span>
                    </div>
                </SelectItem>
            ))}
        </Select>
    )
}
