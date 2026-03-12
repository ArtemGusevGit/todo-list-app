<script setup lang="ts">
import type { Todo } from '~/types/note'

interface Props {
  todo: Todo
  readonly?: boolean
  autofocus?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  readonly: false,
  autofocus: false,
})

const emit = defineEmits<{
  toggle: [id: string]
  'update-text': [id: string, text: string]
  'commit-text': [id: string, text: string]
  delete: [id: string]
}>()

const inputRef = ref<HTMLInputElement | null>(null)
const localText = ref(props.todo.text)

// Sync when todo prop changes (undo/redo updates)
watch(
  () => props.todo,
  (newTodo) => {
    if (localText.value !== newTodo.text) {
      localText.value = newTodo.text
    }
  },
  { deep: true },
)

onMounted(() => {
  if (props.autofocus && inputRef.value) {
    inputRef.value.focus()
  }
})

function onInput(e: Event) {
  const text = (e.target as HTMLInputElement).value
  localText.value = text
  emit('update-text', props.todo.id, text)
}

function onBlur() {
  emit('commit-text', props.todo.id, localText.value)
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    e.preventDefault()
    ;(e.target as HTMLInputElement).blur()
  }
}
</script>

<template>
  <div
    :class="['todo-item', { 'todo-item--completed': todo.completed, 'todo-item--readonly': readonly }]"
  >
    <!-- Checkbox -->
    <label class="todo-item__checkbox-label" :title="readonly ? '' : todo.completed ? 'Mark incomplete' : 'Mark complete'">
      <input
        type="checkbox"
        class="todo-item__checkbox"
        :checked="todo.completed"
        :disabled="readonly"
        @change="!readonly && emit('toggle', todo.id)"
      />
      <span class="todo-item__checkbox-custom" aria-hidden="true">
        <svg v-if="todo.completed" width="10" height="8" viewBox="0 0 10 8" fill="none">
          <path d="M1 3.5L3.8 6.5L9 1" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </span>
    </label>

    <!-- Text (editable or readonly) -->
    <span v-if="readonly" class="todo-item__text">
      {{ todo.text || 'Empty todo' }}
    </span>

    <input
      v-else
      ref="inputRef"
      class="todo-item__input"
      type="text"
      :value="localText"
      placeholder="Add a task…"
      @input="onInput"
      @blur="onBlur"
      @keydown="onKeydown"
      autocomplete="off"
      spellcheck="false"
    />

    <!-- Delete button (edit mode only) -->
    <button
      v-if="!readonly"
      class="todo-item__delete"
      type="button"
      @click="emit('delete', todo.id)"
      aria-label="Delete todo"
      title="Delete todo"
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M10.5 3.5L3.5 10.5M3.5 3.5l7 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
      </svg>
    </button>
  </div>
</template>

<style lang="scss" scoped>
.todo-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-1);
  border-radius: var(--radius-md);
  transition: background-color var(--duration-fast) ease;
  min-height: 36px;

  &:not(&--readonly):hover {
    background-color: var(--color-surface-hover);

    .todo-item__delete {
      opacity: 1;
    }
  }

  &--completed {
    .todo-item__text,
    .todo-item__input {
      color: var(--color-text-muted);
      text-decoration: line-through;
    }
  }

  // ── Checkbox ───────────────────────────────────────────────────────────────
  &__checkbox-label {
    display: flex;
    flex-shrink: 0;
    cursor: pointer;
  }

  &--readonly &__checkbox-label {
    cursor: default;
    pointer-events: none;
  }

  &__checkbox {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;

    &:focus-visible + .todo-item__checkbox-custom {
      @include focus-ring;
    }
  }

  &__checkbox-custom {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    border-radius: var(--radius-sm);
    border: 1.5px solid var(--color-border);
    background-color: var(--color-surface);
    transition:
      background-color var(--duration-fast) ease,
      border-color var(--duration-fast) ease;
    flex-shrink: 0;

    svg {
      color: var(--color-text-inverse);
    }
  }

  &__checkbox:checked + &__checkbox-custom {
    background-color: var(--color-primary);
    border-color: var(--color-primary);
  }

  &:not(&--readonly) &__checkbox-label:hover &__checkbox-custom {
    border-color: var(--color-primary);
  }

  // ── Text / Input ───────────────────────────────────────────────────────────
  &__text {
    flex: 1;
    font-size: var(--font-size-sm);
    color: var(--color-text);
    line-height: var(--line-height-normal);
    min-width: 0;
    @include truncate;
  }

  &__input {
    flex: 1;
    border: none;
    outline: none;
    background: transparent;
    font-size: var(--font-size-sm);
    color: var(--color-text);
    line-height: var(--line-height-normal);
    min-width: 0;
    padding: 0;

    &::placeholder {
      color: var(--color-text-placeholder);
    }
  }

  // ── Delete button ──────────────────────────────────────────────────────────
  &__delete {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    border-radius: var(--radius-sm);
    color: var(--color-text-muted);
    opacity: 0;
    transition:
      opacity var(--duration-fast) ease,
      color var(--duration-fast) ease,
      background-color var(--duration-fast) ease;
    flex-shrink: 0;

    &:hover {
      color: var(--color-danger);
      background-color: var(--color-danger-light);
    }

    &:focus-visible {
      @include focus-ring;
      opacity: 1;
    }
  }
}
</style>
