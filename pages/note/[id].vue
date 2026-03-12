<script setup lang="ts">
import { useNotesStore } from '~/stores/notes'
import { useUndoRedo } from '~/composables/useUndoRedo'
import type { Note } from '~/types/note'
import { onBeforeRouteLeave } from 'vue-router'

const route = useRoute()
const router = useRouter()
const notesStore = useNotesStore()

// ─── Load note ────────────────────────────────────────────────────────────────
const noteId = computed(() => route.params.id as string)

const storeNote = computed(() => notesStore.getNoteById(noteId.value))

// Redirect if note does not exist
onMounted(() => {
  if (!storeNote.value) {
    router.replace('/')
  }
})

// ─── Undo/Redo ────────────────────────────────────────────────────────────────
const isMac = import.meta.client && /Mac|iPhone|iPad/.test(navigator.userAgent)
const modKey = isMac ? '⌘' : 'Ctrl'

const { present, set, undo, redo, canUndo, canRedo, reset } = useUndoRedo<Note>(
  storeNote.value ?? createPlaceholder(),
)

// Sync initial load (in case store hydration was async)
watch(
  storeNote,
  (note) => {
    if (note && !hasUnsavedChanges.value) {
      reset(note)
    }
  },
  { once: true },
)

function createPlaceholder(): Note {
  return { id: '', title: '', todos: [], createdAt: Date.now() }
}

// ─── Change detection ─────────────────────────────────────────────────────────
const savedSnapshot = ref(JSON.stringify(storeNote.value ?? {}))

const hasUnsavedChanges = computed(() => {
  return JSON.stringify(present.value) !== savedSnapshot.value
})

// ─── Keyboard shortcuts ──────────────────────────────────────────────────────
function onKeydown(e: KeyboardEvent) {
  const isMac = /Mac|iPhone|iPad/.test(navigator.userAgent)
  const ctrlOrCmd = isMac ? e.metaKey : e.ctrlKey

  if (!ctrlOrCmd) return

  // Undo: Ctrl+Z / Cmd+Z
  if (e.key === 'z' && !e.shiftKey) {
    const target = e.target as HTMLElement
    // Don't intercept for text inputs (let browser handle native undo for typing)
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return
    e.preventDefault()
    undo()
    return
  }

  // Redo: Ctrl+Shift+Z / Cmd+Shift+Z
  if (e.key === 'z' && e.shiftKey) {
    e.preventDefault()
    redo()
    return
  }

  // Save: Ctrl+S / Cmd+S
  if (e.key === 's') {
    e.preventDefault()
    save()
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))

// ─── Actions ─────────────────────────────────────────────────────────────────

/** Called by NoteForm whenever a committable action occurs */
function onCommit(updatedNote: Note) {
  set(updatedNote)
}

function save() {
  if (!present.value.id) return
  notesStore.updateNote(present.value.id, {
    title: present.value.title,
    todos: present.value.todos,
  })
  savedSnapshot.value = JSON.stringify(present.value)
  showSavedToast()
}

// ─── Toast feedback ───────────────────────────────────────────────────────────
const savedToastVisible = ref(false)
let toastTimer: ReturnType<typeof setTimeout> | null = null

function showSavedToast() {
  savedToastVisible.value = true
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    savedToastVisible.value = false
  }, 2200)
}

// ─── Cancel modal ─────────────────────────────────────────────────────────────
const showCancelModal = ref(false)

function requestCancel() {
  if (hasUnsavedChanges.value) {
    showCancelModal.value = true
  } else {
    router.push('/')
  }
}

function confirmCancel() {
  showCancelModal.value = false
  router.push('/')
}

// ─── Delete modal ─────────────────────────────────────────────────────────────
const showDeleteModal = ref(false)

function requestDelete() {
  showDeleteModal.value = true
}

function confirmDelete() {
  notesStore.deleteNote(noteId.value)
  showDeleteModal.value = false
  router.push('/')
}

// ─── Route leave guard ────────────────────────────────────────────────────────
onBeforeRouteLeave((_to, _from, next) => {
  if (hasUnsavedChanges.value && !showCancelModal.value && !showDeleteModal.value) {
    showCancelModal.value = true
    // Store the next callback to call when user confirms
    pendingNavigation.value = next
    return
  }
  next()
})

const pendingNavigation = ref<((confirm?: boolean) => void) | null>(null)

function confirmLeave() {
  showCancelModal.value = false
  if (pendingNavigation.value) {
    const nav = pendingNavigation.value
    pendingNavigation.value = null
    nav()
  } else {
    router.push('/')
  }
}

function cancelLeave() {
  showCancelModal.value = false
  if (pendingNavigation.value) {
    pendingNavigation.value(false)
    pendingNavigation.value = null
  }
}
</script>

<template>
  <div class="edit-page" v-if="present.id">
    <!-- ── Header ─────────────────────────────────────────────────────────── -->
    <header class="edit-page__header">
      <div class="edit-page__header-content">
        <!-- Back -->
        <button class="edit-page__back" type="button" @click="requestCancel" aria-label="Back to notes">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <path d="M11 14L6 9l5-5" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          Notes
        </button>

        <!-- Right side -->
        <div class="edit-page__header-actions">
          <!-- Undo/Redo -->
          <div class="edit-page__history" role="toolbar" aria-label="History controls">
            <button
              class="edit-page__history-btn"
              type="button"
              :disabled="!canUndo"
              @click="undo"
              :title="`Undo (${modKey}+Z)`"
              aria-label="Undo"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 7H11C13.2 7 15 8.8 15 11C15 13.2 13.2 15 11 15H5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                <path d="M6 4L3 7L6 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
            <button
              class="edit-page__history-btn"
              type="button"
              :disabled="!canRedo"
              @click="redo"
              :title="`Redo (${modKey}+Shift+Z)`"
              aria-label="Redo"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M13 7H5C2.8 7 1 8.8 1 11C1 13.2 2.8 15 5 15H11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                <path d="M10 4L13 7L10 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
          </div>

          <div class="edit-page__divider" aria-hidden="true" />

          <ThemeToggle />

          <BaseButton variant="ghost" size="sm" @click="requestDelete" class="edit-page__delete-btn">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M1.5 3.5h11M5 3.5V2h4v1.5M2.5 3.5l.75 8.25h7.5l.75-8.25" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            Delete
          </BaseButton>

          <BaseButton variant="primary" size="sm" @click="save" :disabled="!hasUnsavedChanges">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M2 7.5l3.5 3.5L12 3" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            Save
          </BaseButton>

        </div>
      </div>
    </header>

    <!-- ── Editor ─────────────────────────────────────────────────────────── -->
    <main class="edit-page__main">
      <div class="edit-page__container">
        <Transition name="fade">
          <span
            v-if="savedToastVisible || hasUnsavedChanges"
            :class="savedToastVisible ? 'edit-page__saved-badge' : 'edit-page__unsaved-badge'"
            role="status"
          >
            <template v-if="savedToastVisible">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M2 6l2.5 2.5L10 3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              Saved
            </template>
            <template v-else>Unsaved changes</template>
          </span>
        </Transition>

        <NoteForm :note="present" @commit="onCommit" />
      </div>
    </main>

    <!-- ── Modals ─────────────────────────────────────────────────────────── -->
    <!-- Cancel / Discard changes -->
    <BaseModal
      v-model="showCancelModal"
      title="Discard changes?"
      confirm-label="Discard"
      cancel-label="Keep editing"
      confirm-variant="danger"
      @confirm="confirmLeave"
      @cancel="cancelLeave"
    >
      <p>You have unsaved changes. If you leave now, they will be lost.</p>
    </BaseModal>

    <!-- Delete note -->
    <BaseModal
      v-model="showDeleteModal"
      title="Delete Note"
      confirm-label="Delete"
      cancel-label="Cancel"
      confirm-variant="danger"
      @confirm="confirmDelete"
    >
      <p>
        Are you sure you want to delete
        <strong>"{{ present.title || 'Untitled' }}"</strong>?
        <br />
        This action cannot be undone.
      </p>
    </BaseModal>
  </div>

  <!-- Loading / not found fallback -->
  <div v-else class="edit-page edit-page--loading">
    <p>Loading…</p>
  </div>
</template>

<style lang="scss" scoped>
.edit-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--color-surface);

  &--loading {
    @include flex-center;
    color: var(--color-text-muted);
  }

  // ── Header ──────────────────────────────────────────────────────────────────
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

  &__back {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    color: var(--color-text-secondary);
    border-radius: var(--radius-md);
    padding: var(--space-2) var(--space-3);
    transition: background-color var(--duration-fast) ease, color var(--duration-fast) ease;
    white-space: nowrap;

    &:hover {
      background-color: var(--color-surface-hover);
      color: var(--color-text);
    }

    &:focus-visible {
      @include focus-ring;
    }
  }

  &__header-actions {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  &__history {
    display: flex;
    align-items: center;
    gap: var(--space-1);
  }

  &__history-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: var(--radius-md);
    color: var(--color-text-secondary);
    transition:
      background-color var(--duration-fast) ease,
      color var(--duration-fast) ease;

    &:hover:not(:disabled) {
      background-color: var(--color-surface-hover);
      color: var(--color-text);
    }

    &:disabled {
      opacity: 0.35;
      cursor: not-allowed;
    }

    &:focus-visible {
      @include focus-ring;
    }
  }

  &__divider {
    width: 1px;
    height: 20px;
    background-color: var(--color-border);
    flex-shrink: 0;
  }

  &__delete-btn {
    color: var(--color-danger) !important;

    &:hover {
      background-color: var(--color-danger-light) !important;
    }
  }

  &__saved-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-medium);
    color: var(--color-success);
    background-color: var(--color-success-light);
    padding: 2px 8px;
    border-radius: var(--radius-full);
    white-space: nowrap;
    margin-bottom: var(--space-4);
  }

  &__unsaved-badge {
    display: inline-flex;
    align-items: center;
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-medium);
    color: var(--color-text-muted);
    white-space: nowrap;
    margin-bottom: var(--space-4);
  }

  // ── Main ────────────────────────────────────────────────────────────────────
  &__main {
    flex: 1;
    padding: var(--space-8) var(--space-6);
  }

  &__container {
    max-width: 800px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
  }
}

// ── Status transition ──────────────────────────────────────────────────────────
.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--duration-normal) ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
