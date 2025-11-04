<template>
  <div class="layout-wrapper">
    <Header />
    <main class="layout-main">
      <slot></slot>
    </main>
    <Footer />
  </div>
</template>

<script>
import Header from './Header.vue'
import Footer from './Footer.vue'

export default {
  name: 'Layout',
  components: {
    Header,
    Footer,
  },
}
</script>

<style scoped>
.layout-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.layout-main {
  flex: 1;
  max-width: var(--max-width-content);
  width: 100%;
  margin: 0 auto;
  padding: var(--spacing-xl);
}

@media (max-width: 768px) {
  .layout-main {
    padding: 10px;
  }
}

/* Print styles - conditionally hide header/footer based on modal state */
@media print {
  /* When modal is open, hide header and footer */
  body:has(.modal-backdrop) .layout-wrapper > :not(.layout-main) {
    display: none !important;
  }

  body:has(.modal-backdrop) .layout-main {
    padding: 0;
    max-width: 100%;
  }

  /* When modal is NOT open, optimize for job list printing */
  body:not(:has(.modal-backdrop)) .layout-wrapper {
    display: block;
  }

  body:not(:has(.modal-backdrop)) .layout-main {
    padding: 0 12pt;
    max-width: 100%;
  }
}
</style>
