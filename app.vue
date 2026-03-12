<script setup lang="ts">
const { init } = useTheme()

// Prevent flash of wrong theme before hydration
useHead({
  script: [
    {
      innerHTML: `(function(){var t=localStorage.getItem('notes-app-theme')||'dark';document.documentElement.setAttribute('data-theme',t);})()`,
    },
  ],
})

onMounted(init)
</script>

<template>
  <div id="app">
    <NuxtPage />
  </div>
</template>
