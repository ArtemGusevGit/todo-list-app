import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import type { Note, Todo } from '~/types/note'

const STORAGE_KEY = 'notes-app-v1'

export const useNotesStore = defineStore('notes', () => {
  const notes = ref<Note[]>([])
  const initialized = ref(false)

  // ─── Persistence ────────────────────────────────────────────────────────────

  function loadFromStorage(): void {
    if (!import.meta.client) return
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) {
          notes.value = parsed
        }
      }
    } catch (e) {
      console.error('[NotesStore] Failed to load from localStorage', e)
    }
    initialized.value = true
  }

  function saveToStorage(): void {
    if (!import.meta.client) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes.value))
    } catch (e) {
      console.error('[NotesStore] Failed to save to localStorage', e)
    }
  }

  // Auto-save on any mutation
  watch(notes, saveToStorage, { deep: true })

  // Initialize on store creation (client side only)
  if (import.meta.client) {
    loadFromStorage()
  }

  // ─── Getters ─────────────────────────────────────────────────────────────────

  function getNoteById(id: string): Note | undefined {
    return notes.value.find((n) => n.id === id)
  }

  // ─── Actions ──────────────────────────────────────────────────────────────────

  function createNote(): Note {
    const note: Note = {
      id: generateId(),
      title: '',
      todos: [],
      createdAt: Date.now(),
    }
    notes.value.unshift(note)
    return deepClone(note)
  }

  function updateNote(id: string, updates: { title?: string; todos?: Todo[] }): void {
    const index = notes.value.findIndex((n) => n.id === id)
    if (index === -1) return
    notes.value[index] = {
      ...notes.value[index],
      ...updates,
    }
  }

  function deleteNote(id: string): void {
    notes.value = notes.value.filter((n) => n.id !== id)
  }

  // ─── Todo helpers (used from edit page via store) ────────────────────────────

  function createTodo(text = ''): Todo {
    return {
      id: generateId(),
      text,
      completed: false,
    }
  }

  return {
    notes,
    initialized,
    getNoteById,
    createNote,
    updateNote,
    deleteNote,
    createTodo,
    loadFromStorage,
  }
})
