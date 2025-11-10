/**
 * Template Store
 * Manages template state and template-related operations
 */

import { create } from 'zustand'
import type { ITemplate } from '@/types'

/**
 * Template state interface
 */
interface ITemplateState {
  templates: ITemplate[]
  isLoading: boolean
  error: string | null
}

/**
 * Template actions interface
 */
interface ITemplateActions {
  setTemplates: (templates: ITemplate[]) => void
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
  getTemplateById: (id: string) => ITemplate | undefined
  getTemplatesByAlignment: (alignment: 'LEFT' | 'CENTER' | 'RIGHT') => ITemplate[]
}

/**
 * Combined template store type
 */
type TTemplateStore = ITemplateState & ITemplateActions

/**
 * Initial template state
 */
const initialState: ITemplateState = {
  templates: [],
  isLoading: false,
  error: null,
}

/**
 * Create template store
 */
export const useTemplateStore = create<TTemplateStore>((set, get) => ({
  ...initialState,

  setTemplates: (templates) =>
    set({
      templates,
      isLoading: false,
      error: null,
    }),

  setLoading: (isLoading) =>
    set({
      isLoading,
    }),

  setError: (error) =>
    set({
      error,
      isLoading: false,
    }),

  getTemplateById: (id) => {
    const { templates } = get()
    return templates.find((template) => template.id === id)
  },

  getTemplatesByAlignment: (alignment) => {
    const { templates } = get()
    return templates.filter((template) => template.alignment === alignment)
  },
}))
