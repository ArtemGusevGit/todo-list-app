import { ref, computed, type Ref } from 'vue'

export interface UndoRedoReturn<T> {
  present: Ref<T>
  set: (newState: T) => void
  undo: () => void
  redo: () => void
  canUndo: Ref<boolean>
  canRedo: Ref<boolean>
  reset: (state: T) => void
}

export function useUndoRedo<T>(initialState: T): UndoRedoReturn<T> {
  const past = ref<T[]>([]) as Ref<T[]>
  const present = ref<T>(deepClone(initialState)) as Ref<T>
  const future = ref<T[]>([]) as Ref<T[]>

  /**
   * Push a new state — current present goes to past, future is cleared.
   */
  function set(newState: T): void {
    past.value.push(deepClone(present.value))
    present.value = deepClone(newState)
    future.value = []
  }

  /**
   * Undo: move present to future, pop from past into present.
   */
  function undo(): void {
    if (past.value.length === 0) return
    future.value.unshift(deepClone(present.value))
    present.value = past.value.pop()!
  }

  /**
   * Redo: move present to past, shift from future into present.
   */
  function redo(): void {
    if (future.value.length === 0) return
    past.value.push(deepClone(present.value))
    present.value = future.value.shift()!
  }

  /**
   * Reset history to a new base state (e.g. after external reload).
   */
  function reset(state: T): void {
    past.value = []
    present.value = deepClone(state)
    future.value = []
  }

  const canUndo = computed(() => past.value.length > 0)
  const canRedo = computed(() => future.value.length > 0)

  return { present, set, undo, redo, canUndo, canRedo, reset }
}
