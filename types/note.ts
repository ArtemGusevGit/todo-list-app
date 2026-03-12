export interface Todo {
  id: string
  text: string
  completed: boolean
}

export interface Note {
  id: string
  title: string
  todos: Todo[]
  createdAt: number
}

export interface UndoRedoHistory<T> {
  past: T[]
  present: T
  future: T[]
}
