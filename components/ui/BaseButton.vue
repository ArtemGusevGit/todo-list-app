<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  block?: boolean
  type?: 'button' | 'submit' | 'reset'
  iconOnly?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
  block: false,
  type: 'button',
  iconOnly: false,
})

</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="[
      'btn',
      `btn--${variant}`,
      `btn--${size}`,
      {
        'btn--loading': loading,
        'btn--block': block,
        'btn--icon-only': iconOnly,
      },
    ]"
    v-bind="$attrs"
  >
    <span v-if="loading" class="btn__spinner" aria-hidden="true" />
    <slot />
  </button>
</template>

<style lang="scss" scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  font-family: var(--font-family);
  font-weight: var(--font-weight-medium);
  line-height: 1;
  border-radius: var(--radius-md);
  border: 1.5px solid transparent;
  cursor: pointer;
  white-space: nowrap;
  transition:
    background-color var(--duration-fast) ease,
    border-color var(--duration-fast) ease,
    color var(--duration-fast) ease,
    box-shadow var(--duration-fast) ease,
    opacity var(--duration-fast) ease;
  user-select: none;
  position: relative;
  flex-shrink: 0;

  &:focus-visible {
    @include focus-ring;
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
    pointer-events: none;
  }

  // ── Sizes ──────────────────────────────────────────────────────────────────
  &--sm {
    height: 30px;
    padding: 0 var(--space-3);
    font-size: var(--font-size-sm);
    border-radius: var(--radius-sm);

    &.btn--icon-only {
      width: 30px;
      padding: 0;
    }
  }

  &--md {
    height: 38px;
    padding: 0 var(--space-4);
    font-size: var(--font-size-sm);

    &.btn--icon-only {
      width: 38px;
      padding: 0;
    }
  }

  &--lg {
    height: 46px;
    padding: 0 var(--space-6);
    font-size: var(--font-size-base);

    &.btn--icon-only {
      width: 46px;
      padding: 0;
    }
  }

  &--block {
    width: 100%;
  }

  // ── Variants ───────────────────────────────────────────────────────────────
  &--primary {
    background-color: var(--color-primary);
    color: var(--color-text-inverse);
    border-color: var(--color-primary);

    &:hover:not(:disabled) {
      background-color: var(--color-primary-hover);
      border-color: var(--color-primary-hover);
    }

    &:active:not(:disabled) {
      transform: translateY(1px);
    }
  }

  &--secondary {
    background-color: var(--color-surface);
    color: var(--color-text);
    border-color: var(--color-border);
    box-shadow: var(--shadow-xs);

    &:hover:not(:disabled) {
      background-color: var(--color-surface-hover);
      border-color: #cbd5e1;
    }

    &:active:not(:disabled) {
      transform: translateY(1px);
    }
  }

  &--danger {
    background-color: var(--color-danger);
    color: var(--color-text-inverse);
    border-color: var(--color-danger);

    &:hover:not(:disabled) {
      background-color: var(--color-danger-hover);
      border-color: var(--color-danger-hover);
    }

    &:active:not(:disabled) {
      transform: translateY(1px);
    }
  }

  &--ghost {
    background-color: transparent;
    color: var(--color-text-secondary);
    border-color: transparent;

    &:hover:not(:disabled) {
      background-color: var(--color-surface-hover);
      color: var(--color-text);
    }

    &:active:not(:disabled) {
      background-color: var(--color-border);
    }
  }

  &--outline {
    background-color: transparent;
    color: var(--color-primary);
    border-color: var(--color-primary-muted);

    &:hover:not(:disabled) {
      background-color: var(--color-primary-light);
    }

    &:active:not(:disabled) {
      transform: translateY(1px);
    }
  }

  // ── Loading spinner ────────────────────────────────────────────────────────
  &--loading {
    cursor: wait;
    pointer-events: none;

    .btn__spinner {
      display: block;
    }

    > :not(.btn__spinner) {
      opacity: 0.5;
    }
  }

  &__spinner {
    display: none;
    width: 14px;
    height: 14px;
    border: 2px solid currentColor;
    border-right-color: transparent;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
    flex-shrink: 0;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
