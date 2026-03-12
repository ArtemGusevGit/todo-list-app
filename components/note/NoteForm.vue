<script setup lang="ts">
import type { Note, Todo } from '~/types/note'

interface Props {
  note: Note
}

const props = defineProps<Props>()

const emit = defineEmits<{
  /**
   * Emitted when a discrete action happens that should create a history entry.
   * The full updated note is passed.
   */
  commit: [note: Note]
}>()

// ─── Local state (in-progress edits before commit) ───────────────────────────
const localTitle = ref(props.note.title)
const localTodos = ref<Todo[]>(deepClone(props.note.todos))

// ─── Sync from parent (undo/redo updates present) ────────────────────────────
watch(
  () => props.note,
  (newNote) => {
    localTitle.value = newNote.title
    localTodos.value = deepClone(newNote.todos)
  },
  { deep: true },
)

function buildNote(overrides?: Partial<Note>): Note {
  return {
    ...props.note,
    title: localTitle.value,
    todos: deepClone(localTodos.value),
    ...overrides,
  }
}

// ─── Title handlers ──────────────────────────────────────────────────────────
function onTitleBlur() {
  if (localTitle.value !== props.note.title) {
    emit('commit', buildNote())
  }
}

function onTitleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    e.preventDefault()
    ;(e.target as HTMLInputElement).blur()
  }
}

// ─── Todo handlers ───────────────────────────────────────────────────────────
function addTodo() {
  const newTodo: Todo = {
    id: generateId(),
    text: '',
    completed: false,
  }
  const updated = [...localTodos.value, newTodo]
  localTodos.value = updated
  emit('commit', buildNote({ todos: deepClone(updated) }))
}

function deleteTodo(id: string) {
  const updated = localTodos.value.filter((t) => t.id !== id)
  localTodos.value = updated
  emit('commit', buildNote({ todos: deepClone(updated) }))
}

function toggleTodo(id: string) {
  const updated = localTodos.value.map((t) =>
    t.id === id ? { ...t, completed: !t.completed } : t,
  )
  localTodos.value = updated
  emit('commit', buildNote({ todos: deepClone(updated) }))
}

function onUpdateText(id: string, text: string) {
  // Live update — just mutate local state, no history entry yet
  const todo = localTodos.value.find((t) => t.id === id)
  if (todo) todo.text = text
}

function onCommitText(id: string, text: string) {
  // User blurred or pressed Enter → create history entry if text changed
  const todo = localTodos.value.find((t) => t.id === id)
  if (!todo) return
  const original = props.note.todos.find((t) => t.id === id)
  if (original && original.text === text) return
  todo.text = text
  emit('commit', buildNote())
}
</script>

<template>
  <div class="note-form">
    <!-- Title input -->
    <div class="note-form__title-wrap">
      <input
        v-model="localTitle"
        class="note-form__title"
        type="text"
        placeholder="Note title…"
        maxlength="120"
        autocomplete="off"
        spellcheck="true"
        @blur="onTitleBlur"
        @keydown="onTitleKeydown"
        aria-label="Note title"
      />
    </div>

    <!-- Divider -->
    <hr class="note-form__divider" />

    <!-- Todo list -->
    <div class="note-form__todos">
      <h3 class="note-form__todos-heading">Tasks</h3>

      <TodoList
        :todos="localTodos"
        :readonly="false"
        @add="addTodo"
        @delete="deleteTodo"
        @toggle="toggleTodo"
        @update-text="onUpdateText"
        @commit-text="onCommitText"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.note-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);

  // ── Title ───────────────────────────────────────────────────────────────────
  &__title-wrap {
    position: relative;
    max-width: 560px;
  }

  &__title {
    display: block;
    width: 100%;
    font-size: var(--font-size-3xl);
    font-weight: var(--font-weight-bold);
    color: var(--color-text);
    background: transparent;
    border: none;
    outline: none;
    line-height: var(--line-height-tight);
    padding: 0;
    caret-color: var(--color-primary);

    &::placeholder {
      color: var(--color-border);
    }

    @include sm {
      font-size: clamp(22px, 3vw, 36px);
    }
  }

  // ── Divider ─────────────────────────────────────────────────────────────────
  &__divider {
    border: none;
    border-top: 1px solid var(--color-border);
    margin: 0;
  }

  // ── Todos ───────────────────────────────────────────────────────────────────
  &__todos {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  &__todos-heading {
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-semibold);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--color-text-muted);
  }
}
</style>
