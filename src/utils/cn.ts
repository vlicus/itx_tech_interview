/**
 * Class Name Utility
 * Utility for merging Tailwind CSS classes with clsx
 */

import { clsx, type ClassValue } from 'clsx'

/**
 * Merge class names with clsx
 * Useful for conditional class application and preventing class conflicts
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}
