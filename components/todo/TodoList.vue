<script setup lang="ts">
import type { Todo } from '~/types/note'

interface Props {
  todos: Todo[]
  readonly?: boolean
  previewLimit?: number
}

const props = withDefaults(defineProps<Props>(), {
  readonly: false,
  previewLimit: 0,
})

const emit = defineEmits<{
  add: []
  delete: [id: string]
  toggle: [id: string]
  'update-text': [id: string, text: string]
  'commit-text': [id: string, text: string]
}>()

// Index of the most recently added todo (for autofocus)
const newTodoIndex = ref<number | null>(null)

const displayedTodos = computed(() => {
  if (props.previewLimit > 0) {
    return props.todos.slice(0, props.previewLimit)
  }
  return props.todos
})

const hiddenCount = computed(() => {
  if (props.previewLimit > 0) {
    return Math.max(0, props.todos.length - props.previewLimit)
  }
  return 0
})

function onAdd() {
  newTodoIndex.value = props.todos.length
  emit('add')
}

watch(
  () => props.todos.length,
  () => {
    // Reset autofocus tracking after next tick
    nextTick(() => {
      newTodoIndex.value = null
    })
  },
)
</script>

<template>
  <div class="todo-list">
    <TransitionGroup name="todo" tag="div" class="todo-list__items">
      <TodoItem
        v-for="(todo, index) in displayedTodos"
        :key="todo.id"
        :todo="todo"
        :readonly="readonly"
        :autofocus="!readonly && index === newTodoIndex"
        @toggle="emit('toggle', $event)"
        @update-text="(id, text) => emit('update-text', id, text)"
        @commit-text="(id, text) => emit('commit-text', id, text)"
        @delete="emit('delete', $event)"
      />
    </TransitionGroup>

    <!-- Hidden count badge (preview mode) -->
    <p v-if="hiddenCount > 0" class="todo-list__more">
      +{{ hiddenCount }} more {{ hiddenCount === 1 ? 'item' : 'items' }}
    </p>

    <!-- Empty state (edit mode) -->
    <p v-if="!readonly && todos.length === 0" class="todo-list__empty">
      No tasks yet — add one below.
    </p>

    <!-- Add button (edit mode only) -->
    <button v-if="!readonly" class="todo-list__add-btn" type="button" @click="onAdd">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <path d="M7 1v12M1 7h12" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" />
      </svg>
      Add task
    </button>
  </div>
</template>

<style lang="scss" scoped>
.todo-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);

  &__items {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  &__empty {
    font-size: var(--font-size-sm);
    color: var(--color-text-placeholder);
    padding: var(--space-3) var(--space-1);
    text-align: center;
  }

  &__more {
    font-size: var(--font-size-sm);
    color: var(--color-text-muted);
    padding: var(--space-1) var(--space-2);
  }

  &__add-btn {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    margin-top: var(--space-2);
    padding: var(--space-2) var(--space-3);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    color: var(--color-primary);
    border-radius: var(--radius-md);
    transition:
      background-color var(--duration-fast) ease,
      color var(--duration-fast) ease;
    align-self: flex-start;

    &:hover {
      background-color: var(--color-primary-light);
    }

    &:focus-visible {
      @include focus-ring;
    }
  }
}

// ── Todo item transitions ──────────────────────────────────────────────────────
.todo-enter-active,
.todo-leave-active {
  transition:
    opacity var(--duration-fast) ease,
    transform var(--duration-fast) ease;
}

.todo-enter-from {
  opacity: 0;
  transform: translateY(-6px);
}

.todo-leave-to {
  opacity: 0;
  transform: translateX(10px);
}

.todo-move {
  transition: transform var(--duration-normal) ease;
}
</style>
