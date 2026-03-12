<script setup lang="ts">
import { useNotesStore } from '~/stores/notes';

const notesStore = useNotesStore()
const router = useRouter()

// ─── Delete confirmation modal ────────────────────────────────────────────────
const showDeleteModal = ref(false)
const noteToDeleteId = ref<string | null>(null)

function requestDelete(id: string) {
  noteToDeleteId.value = id
  showDeleteModal.value = true
}

function confirmDelete() {
  if (noteToDeleteId.value) {
    notesStore.deleteNote(noteToDeleteId.value)
  }
  showDeleteModal.value = false
  noteToDeleteId.value = null
}

function cancelDelete() {
  showDeleteModal.value = false
  noteToDeleteId.value = null
}

// ─── Create note ──────────────────────────────────────────────────────────────
function createNote() {
  const note = notesStore.createNote()
  router.push(`/note/${note.id}`)
}

// ─── Computed ─────────────────────────────────────────────────────────────────
const sortedNotes = computed(() =>
  [...notesStore.notes].sort((a, b) => b.createdAt - a.createdAt),
)

const noteToDelete = computed(() =>
  noteToDeleteId.value ? notesStore.getNoteById(noteToDeleteId.value) : null,
)
</script>

<template>
  <div class="notes-page">
    <!-- ── Header ─────────────────────────────────────────────────────────── -->
    <header class="notes-page__header">
      <div class="notes-page__header-content">
        <div class="notes-page__brand">
          <svg class="notes-page__brand-icon" width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
            <rect width="28" height="28" rx="8" fill="#6366f1" />
            <path
              d="M8 10h12M8 14h8M8 18h10"
              stroke="white"
              stroke-width="1.75"
              stroke-linecap="round"
            />
          </svg>
          <span class="notes-page__brand-name">Notes</span>
        </div>

        <div class="notes-page__header-actions">
          <ThemeToggle />
          <BaseButton variant="primary" size="md" @click="createNote">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M7 1v12M1 7h12" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" />
            </svg>
            <span class="btn-label">New Note</span>
          </BaseButton>
        </div>
      </div>
    </header>

    <!-- ── Main content ───────────────────────────────────────────────────── -->
    <main class="notes-page__main">
      <!-- Empty state -->
      <div v-if="sortedNotes.length === 0" class="notes-page__empty">
        <div class="notes-page__empty-icon" aria-hidden="true">
          <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
            <rect width="56" height="56" rx="16" fill="#eef2ff" />
            <path
              d="M16 20h24M16 28h16M16 36h20"
              stroke="#6366f1"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
        </div>
        <h2 class="notes-page__empty-title">No notes yet</h2>
        <p class="notes-page__empty-desc">Create your first note to get started.</p>
        <BaseButton variant="primary" size="lg" @click="createNote">
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
            <path d="M7.5 1.5v12M1.5 7.5h12" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" />
          </svg>
          Create Note
        </BaseButton>
      </div>

      <!-- Notes grid -->
      <TransitionGroup
        v-else
        name="card"
        tag="div"
        class="notes-page__grid"
      >
        <NoteCard
          v-for="note in sortedNotes"
          :key="note.id"
          :note="note"
          @delete="requestDelete"
        />
      </TransitionGroup>
    </main>

    <!-- ── Delete confirmation modal ─────────────────────────────────────── -->
    <BaseModal
      v-model="showDeleteModal"
      title="Delete Note"
      confirm-label="Delete"
      cancel-label="Keep it"
      confirm-variant="danger"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    >
      <p>
        Are you sure you want to delete
        <strong>"{{ noteToDelete?.title || 'Untitled' }}"</strong>?
        <br />
        This action cannot be undone.
      </p>
    </BaseModal>
  </div>
</template>

<style lang="scss" scoped>
.notes-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;

  // ── Header ─────────────────────────────────────────────────────────────────
  &__header {
    position: sticky;
    top: 0;
    z-index: var(--z-dropdown);
    background-color: var(--color-header-bg);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--color-border);
  }

  &__header-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: var(--space-4) var(--space-6);
    @include flex-between;
  }

  &__brand {
    display: flex;
    align-items: center;
    gap: var(--space-3);
  }

  &__brand-icon {
    flex-shrink: 0;
  }

  &__header-actions {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  .btn-label {
    @media (max-width: 479px) {
      display: none;
    }
  }

  &__brand-name {
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-bold);
    color: var(--color-text);
    letter-spacing: -0.02em;
  }

  // ── Main ───────────────────────────────────────────────────────────────────
  &__main {
    flex: 1;
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
    padding: var(--space-8) var(--space-6);
  }

  // ── Empty state ────────────────────────────────────────────────────────────
  &__empty {
    @include flex-center;
    flex-direction: column;
    gap: var(--space-4);
    min-height: 60vh;
    text-align: center;
  }

  &__empty-icon {
    margin-bottom: var(--space-2);
  }

  &__empty-title {
    font-size: var(--font-size-2xl);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text);
  }

  &__empty-desc {
    font-size: var(--font-size-base);
    color: var(--color-text-muted);
    margin-top: calc(var(--space-1) * -1);
  }

  // ── Grid ───────────────────────────────────────────────────────────────────
  &__grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--space-5);

    @include sm {
      grid-template-columns: repeat(2, 1fr);
    }

    @include lg {
      grid-template-columns: repeat(3, 1fr);
    }

    @include xl {
      grid-template-columns: repeat(4, 1fr);
    }
  }
}

// ── Card grid transition ────────────────────────────────────────────────────────
.card-enter-active,
.card-leave-active {
  transition: opacity var(--duration-normal) ease, transform var(--duration-normal) ease;
}

.card-enter-from {
  opacity: 0;
  transform: scale(0.96) translateY(8px);
}

.card-leave-to {
  opacity: 0;
  transform: scale(0.96);
}

.card-move {
  transition: transform var(--duration-slow) ease;
}

.card-leave-active {
  position: absolute;
}
</style>
