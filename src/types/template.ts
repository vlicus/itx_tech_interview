/**
 * Template Type Definitions
 * Defines layout templates for grid rows
 */

/**
 * Template alignment options
 */
export type TTemplateAlignment = 'LEFT' | 'CENTER' | 'RIGHT'

/**
 * Template interface matching API response
 */
export interface ITemplate {
  id: string
  name: string
  alignment: TTemplateAlignment
}
