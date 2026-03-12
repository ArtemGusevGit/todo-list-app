<script setup lang="ts">
interface Props {
  modelValue: boolean
  title?: string
  confirmLabel?: string
  cancelLabel?: string
  confirmVariant?: 'primary' | 'danger' | 'secondary'
  hideFooter?: boolean
  maxWidth?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  confirmLabel: 'Confirm',
  cancelLabel: 'Cancel',
  confirmVariant: 'primary',
  hideFooter: false,
  maxWidth: '440px',
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: []
  cancel: []
}>()

function close() {
  emit('update:modelValue', false)
  emit('cancel')
}

function confirm() {
  emit('confirm')
}

function onOverlayClick(e: MouseEvent) {
  if (e.target === e.currentTarget) close()
}

// Close on Escape
function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') close()
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="modal-overlay" @click="onOverlayClick" role="dialog" aria-modal="true">
        <div class="modal-dialog" :style="{ maxWidth }" @click.stop>
          <!-- Header -->
          <div class="modal-header">
            <h3 v-if="title" class="modal-title">{{ title }}</h3>
            <button class="modal-close-btn" @click="close" aria-label="Close modal" type="button">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" />
              </svg>
            </button>
          </div>

          <!-- Body -->
          <div class="modal-body">
            <slot />
          </div>

          <!-- Footer -->
          <div v-if="!hideFooter" class="modal-footer">
            <slot name="footer">
              <BaseButton variant="ghost" @click="close">{{ cancelLabel }}</BaseButton>
              <BaseButton :variant="confirmVariant" @click="confirm">{{ confirmLabel }}</BaseButton>
            </slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style lang="scss" scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(2px);
  z-index: var(--z-modal-overlay);
  @include flex-center;
  padding: var(--space-4);
}

.modal-dialog {
  background-color: var(--color-surface);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  width: 100%;
  overflow: hidden;
  z-index: var(--z-modal);
}

.modal-header {
  @include flex-between;
  padding: var(--space-5) var(--space-6) var(--space-4);
  border-bottom: 1px solid var(--color-border);
}

.modal-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
  line-height: var(--line-height-tight);
}

.modal-close-btn {
  @include flex-center;
  width: 30px;
  height: 30px;
  border-radius: var(--radius-md);
  color: var(--color-text-muted);
  transition: background-color var(--duration-fast) ease, color var(--duration-fast) ease;
  flex-shrink: 0;
  margin-left: var(--space-3);

  &:hover {
    background-color: var(--color-surface-hover);
    color: var(--color-text);
  }

  &:focus-visible {
    @include focus-ring;
  }
}

.modal-body {
  padding: var(--space-5) var(--space-6);
  color: var(--color-text-secondary);
  font-size: var(--font-size-base);
  line-height: var(--line-height-relaxed);
}

.modal-footer {
  @include flex-between;
  padding: var(--space-4) var(--space-6) var(--space-5);
  border-top: 1px solid var(--color-border);
  gap: var(--space-3);

  > * {
    flex: 1;
  }
}
</style>
