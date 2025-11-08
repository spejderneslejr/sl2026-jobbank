<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const currentTheme = ref('light');
let observer = null;

const syncTheme = () => {
  const theme = document.documentElement.getAttribute('data-theme') || 'light';
  currentTheme.value = theme;
};

onMounted(() => {
  // Initialize from DOM
  syncTheme();

  // Watch for external theme changes
  observer = new MutationObserver(() => {
    syncTheme();
  });

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  });
});

onUnmounted(() => {
  if (observer) {
    observer.disconnect();
  }
});

const toggleTheme = () => {
  const newTheme = currentTheme.value === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme-preference', newTheme);
  // syncTheme will be called by the observer
};
</script>

<template>
  <button
    @click="toggleTheme"
    class="theme-toggle"
    :aria-label="currentTheme === 'light' ? 'Skift til mørkt tema' : 'Skift til lyst tema'"
    :title="currentTheme === 'light' ? 'Skift til mørkt tema' : 'Skift til lyst tema'"
  >
    <svg v-if="currentTheme === 'light'" class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    </svg>
    <svg v-else class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="5"></circle>
      <line x1="12" y1="1" x2="12" y2="3"></line>
      <line x1="12" y1="21" x2="12" y2="23"></line>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
      <line x1="1" y1="12" x2="3" y2="12"></line>
      <line x1="21" y1="12" x2="23" y2="12"></line>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
    </svg>
  </button>
</template>

<style scoped>
.theme-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--color-text-primary);
  cursor: pointer;
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
}

.theme-toggle:hover {
  background: var(--color-hover-bg);
}

.theme-toggle:focus {
  outline: 2px solid var(--color-primary-green);
  outline-offset: 2px;
}

.icon {
  width: 20px;
  height: 20px;
}
</style>
