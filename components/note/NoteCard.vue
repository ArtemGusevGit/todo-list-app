<script setup lang="ts">
import type { Note } from '~/types/note'

interface Props {
  note: Note
}

const props = defineProps<Props>()

const emit = defineEmits<{
  delete: [id: string]
}>()

const PREVIEW_LIMIT = 4

const completedCount = computed(() => props.note.todos.filter((t) => t.completed).length)
const totalCount = computed(() => props.note.todos.length)

const progressPercent = computed(() => {
  if (totalCount.value === 0) return 0
  return Math.round((completedCount.value / totalCount.value) * 100)
})

const formattedDate = computed(() => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(props.note.createdAt))
})
</script>

<template>
  <article class="note-card">
    <!-- Card header -->
    <div class="note-card__header">
      <h2 class="note-card__title" :title="note.title || 'Untitled'">
        {{ note.title || 'Untitled' }}
      </h2>
      <time class="note-card__date" :datetime="new Date(note.createdAt).toISOString()">
        {{ formattedDate }}
      </time>
    </div>

    <!-- Progress bar (when todos exist) -->
    <div v-if="totalCount > 0" class="note-card__progress">
      <div class="note-card__progress-bar">
        <div
          class="note-card__progress-fill"
          :style="{ width: `${progressPercent}%` }"
          role="progressbar"
          :aria-valuenow="completedCount"
          :aria-valuemax="totalCount"
        />
      </div>
      <span class="note-card__progress-label">{{ completedCount }}/{{ totalCount }}</span>
    </div>

    <!-- Todo preview -->
    <div class="note-card__todos">
      <TodoList
        :todos="note.todos"
        :readonly="true"
        :preview-limit="PREVIEW_LIMIT"
      />

      <p v-if="totalCount === 0" class="note-card__no-todos">No tasks yet.</p>
    </div>

    <!-- Card footer actions -->
    <div class="note-card__footer">
      <NuxtLink :to="`/note/${note.id}`" class="note-card__edit-link">
        <BaseButton variant="outline" size="sm">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
            <path
              d="M9 1.5L11.5 4M1 12l.75-3L9 1.5 11.5 4 4.75 11.25 1 12z"
              stroke="currentColor"
              stroke-width="1.4"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          Edit
        </BaseButton>
      </NuxtLink>

      <BaseButton variant="ghost" size="sm" @click="emit('delete', note.id)" aria-label="Delete note">
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
          <path
            d="M1.5 3.5h10M5 3.5V2h3v1.5M2.5 3.5l.75 7.5h6.5l.75-7.5"
            stroke="currentColor"
            stroke-width="1.4"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        Delete
      </BaseButton>
    </div>
  </article>
</template>

<style lang="scss" scoped>
.note-card {
  background-color: var(--color-surface);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-border);
  padding: var(--space-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  min-width: 0;
  overflow: hidden;
  transition:
    box-shadow var(--duration-normal) ease,
    transform var(--duration-normal) ease;
  height: 100%;

  &:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
  }

  // ── Header ─────────────────────────────────────────────────────────────────
  &__header {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    min-width: 0;
  }

  &__title {
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text);
    line-height: var(--line-height-tight);
    min-width: 0;
    @include clamp-lines(2);
  }

  &__date {
    font-size: var(--font-size-xs);
    color: var(--color-text-muted);
    font-weight: var(--font-weight-medium);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  // ── Progress ───────────────────────────────────────────────────────────────
  &__progress {
    display: flex;
    align-items: center;
    gap: var(--space-3);
  }

  &__progress-bar {
    flex: 1;
    height: 5px;
    background-color: var(--color-border);
    border-radius: var(--radius-full);
    overflow: hidden;
  }

  &__progress-fill {
    height: 100%;
    background-color: var(--color-primary);
    border-radius: var(--radius-full);
    transition: width var(--duration-slow) ease;
  }

  &__progress-label {
    font-size: var(--font-size-xs);
    color: var(--color-text-muted);
    font-weight: var(--font-weight-medium);
    white-space: nowrap;
  }

  // ── Todos ──────────────────────────────────────────────────────────────────
  &__todos {
    flex: 1;
    min-height: 40px;
  }

  &__no-todos {
    font-size: var(--font-size-sm);
    color: var(--color-text-placeholder);
  }

  // ── Footer ─────────────────────────────────────────────────────────────────
  &__footer {
    @include flex-between;
    padding-top: var(--space-3);
    border-top: 1px solid var(--color-border);
  }

  &__edit-link {
    text-decoration: none;
  }
}
</style>
