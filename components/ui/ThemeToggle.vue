<script setup lang="ts">
const { isDark, toggle } = useTheme()
</script>

<template>
  <button
    class="theme-toggle"
    type="button"
    :aria-label="isDark ? 'Switch to light theme' : 'Switch to dark theme'"
    :title="isDark ? 'Light mode' : 'Dark mode'"
    @click="toggle"
  >
    <Transition name="theme-icon" mode="out-in">
      <!-- Moon — currently dark, click for light -->
      <svg v-if="isDark" key="moon" width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path
          d="M13.5 10.5A6 6 0 0 1 5.5 2.5a6 6 0 1 0 8 8z"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      <!-- Sun — currently light, click for dark -->
      <svg v-else key="sun" width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="3" stroke="currentColor" stroke-width="1.5" />
        <path
          d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3.05 3.05l1.06 1.06M11.89 11.89l1.06 1.06M3.05 12.95l1.06-1.06M11.89 4.11l1.06-1.06"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
        />
      </svg>
    </Transition>
  </button>
</template>

<style lang="scss" scoped>
.theme-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  flex-shrink: 0;
  transition: background-color var(--duration-fast) ease, color var(--duration-fast) ease;

  &:hover {
    background-color: var(--color-surface-hover);
    color: var(--color-text);
  }

  &:focus-visible {
    @include focus-ring;
  }
}

// Icon swap animation
.theme-icon-enter-active,
.theme-icon-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.theme-icon-enter-from {
  opacity: 0;
  transform: rotate(-30deg) scale(0.8);
}

.theme-icon-leave-to {
  opacity: 0;
  transform: rotate(30deg) scale(0.8);
}
</style>
