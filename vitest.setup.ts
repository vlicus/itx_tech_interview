// vitest.setup.ts

import '@testing-library/jest-dom'
import { vi } from 'vitest'
import React from 'react' // 🚨 1. Importar React

// --- EXPORTACIÓN DE MOCKS FUNCIONALES ---

export const mockRedirect = vi.fn()
export const mockUseSavedGrids = vi.fn()
export const mockFormatSavedGrid = vi.fn((grid) => ({
    id: grid.id,
    title: `Historial ${grid.id.slice(-1)}`,
    description: `Contenido de ${grid.id}`,
    url: `/products?ids=[p${grid.id.slice(-1)}]`,
    icon: 'heroicons:archive-box-20-solid',
    accentColor: 'text-green-600',
}))

export const mockSortable = vi.fn()
export const mockDroppable = vi.fn()
export const mockUseProducts = vi.fn()
export const mockUseTemplates = vi.fn()
export const mockAssignTemplateToRow = vi.fn()
export const mockRemoveRow = vi.fn()
export const mockGetTemplateById = vi.fn()
export const mockCn = vi.fn((...classes) => classes.filter(Boolean).join(' '))

// --- LLAMADAS GLOBALES A VI.MOCK ---

vi.mock('next/navigation', async (importOriginal) => {
    const actual = await importOriginal<typeof import('next/navigation')>()
    return {
        ...actual,
        redirect: mockRedirect,
    }
})

vi.mock('@/hooks/api', () => ({
    useSavedGrids: mockUseSavedGrids,
}))

vi.mock('@/hooks/api/useProducts', () => ({ useProducts: mockUseProducts }))
vi.mock('@/hooks/api/useTemplates', () => ({ useTemplates: mockUseTemplates }))

vi.mock('@/utils', () => ({
    formatSavedGrid: mockFormatSavedGrid,
    getTemplateById: mockGetTemplateById,
    cn: mockCn,
}))

// Mock: DND Kit (para GridRow)
vi.mock('@dnd-kit/sortable', () => ({
    useSortable: mockSortable,
    // 🚨 2. Reemplazar JSX con React.createElement
    SortableContext: ({ children }: { children: React.ReactNode }) =>
        React.createElement('div', null, children),
}))

vi.mock('@dnd-kit/core', () => ({
    useDroppable: mockDroppable,
}))

// Mock: Zustand Store (para GridRow)
vi.mock('@/lib/store', () => ({
    useGridStore: vi.fn((selector) => {
        if (selector.toString().includes('assignTemplateToRow'))
            return mockAssignTemplateToRow
        if (selector.toString().includes('removeRow')) return mockRemoveRow
        return {}
    }),
}))
