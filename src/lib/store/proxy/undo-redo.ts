/**
 * Undo/Redo Middleware for Zustand
 * Implements undo/redo functionality for state management
 */

import { StateCreator, StoreMutatorIdentifier } from 'zustand'

/**
 * Configuration for undo/redo middleware
 */
interface UndoRedoConfig {
  limit?: number // Maximum number of history states to keep
  equality?: (a: unknown, b: unknown) => boolean // Custom equality function
}

/**
 * Undo/Redo state extension
 */
export interface UndoRedoState {
  past: unknown[]
  future: unknown[]
  canUndo: boolean
  canRedo: boolean
  undo: () => void
  redo: () => void
  clearHistory: () => void
}

/**
 * Type for the undo/redo middleware
 */
type UndoRedo = <
  T,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = []
>(
  config: StateCreator<T, Mps, Mcs>,
  options?: UndoRedoConfig
) => StateCreator<T & UndoRedoState, Mps, Mcs>

declare module 'zustand' {
  interface StoreMutators<S, A> {
    'undo-redo': WithUndoRedo<S>
  }
}

type Write<T, U> = Omit<T, keyof U> & U
type WithUndoRedo<S> = Write<S, UndoRedoState>

/**
 * Undo/Redo middleware implementation
 */
export const undoRedo: UndoRedo =
  (config, options = {}) =>
  (set, get, api) => {
    const { limit = 50, equality = Object.is } = options

    const undoRedoState: UndoRedoState = {
      past: [],
      future: [],
      canUndo: false,
      canRedo: false,

      undo: () => {
        const { past, future } = get() as unknown as UndoRedoState

        if (past.length === 0) return

        const previous = past[past.length - 1] as Record<string, unknown>
        const newPast = past.slice(0, past.length - 1)
        const current = getCurrentState(get())

        set(
          {
            ...previous,
            past: newPast,
            future: [current, ...future],
            canUndo: newPast.length > 0,
            canRedo: true,
          } as Partial<ReturnType<typeof get>>,
          false  // ← Changed to false to merge instead of replace
        )
      },

      redo: () => {
        const { past, future } = get() as unknown as UndoRedoState

        if (future.length === 0) return

        const next = future[0] as Record<string, unknown>
        const newFuture = future.slice(1)
        const current = getCurrentState(get())

        set(
          {
            ...next,
            past: [...past, current],
            future: newFuture,
            canUndo: true,
            canRedo: newFuture.length > 0,
          } as Partial<ReturnType<typeof get>>,
          false  // ← Changed to false to merge instead of replace
        )
      },

      clearHistory: () => {
        set(
          {
            past: [],
            future: [],
            canUndo: false,
            canRedo: false,
          } as Partial<ReturnType<typeof get>>,
          false  // ← Changed to false to merge instead of replace
        )
      },
    }

    // Wrap the original set function to track history
    // Note: Using 'any' here is unavoidable due to Zustand's complex middleware type system.
    // The middleware API has deeply nested generic types with multiple overload signatures
    // that cannot be properly expressed without 'any'. This is a known limitation when
    // creating custom Zustand middlewares.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const wrappedSet = (partial: any, replace?: boolean | undefined) => {
      const { past, future } = get() as unknown as UndoRedoState
      const current = getCurrentState(get())

      // Only add to history if state actually changed
      if (!equality(current, partial)) {
        const newPast = [...past, current].slice(-limit)

        // Call original set with the partial update
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(set as any)(partial, replace ?? false)

        // Update history state
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(set as any)(
          {
            past: newPast,
            future: [], // Clear future when new action is performed
            canUndo: true,
            canRedo: false,
          } as Partial<ReturnType<typeof get>>,
          false // ← Changed to false to merge instead of replace
        )
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(set as any)(partial, replace ?? false)
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const initialState = config(wrappedSet as any, get as any, api)

    return {
      ...initialState,
      ...undoRedoState,
    }
  }

/**
 * Helper to get current state without undo/redo properties
 */
function getCurrentState(state: unknown): unknown {
  const { past, future, canUndo, canRedo, undo, redo, clearHistory, ...current } =
    state as UndoRedoState & Record<string, unknown>

  return current
}
