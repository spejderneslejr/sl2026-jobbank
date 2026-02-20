<template>
  <header class="site-header">
    <div class="header-content">
      <div class="header-left">
        <img :src="logoSrc" alt="Spejdernes Lejr 2026" class="camp-logo" />
        <div class="site-title-container">
          <h1 class="site-title">{{ appHeader }}</h1>
        </div>
      </div>
      <ThemeToggle />
    </div>
  </header>
</template>

<script>
import ThemeToggle from './ThemeToggle.vue'

export default {
  name: 'Header',
  components: {
    ThemeToggle,
  },
  data() {
    return {
      logoSrc: './sl2026-camp-logo.svg',
      appHeader: import.meta.env.VITE_APP_HEADER || 'Jobbank',
    }
  },
  mounted() {
    this.updateLogo()
    // Listen for theme changes
    const observer = new MutationObserver(() => {
      this.updateLogo()
    })
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    })
  },
  methods: {
    updateLogo() {
      const theme = document.documentElement.getAttribute('data-theme')
      this.logoSrc = theme === 'dark'
        ? './sl2026-camp-logo-positive.svg'
        : './sl2026-camp-logo.svg'
    },
  },
}
</script>

<style scoped>
.site-header {
  background: var(--color-white);
  border-bottom: 3px solid var(--color-accent-orange);
  padding: var(--spacing-xl) 0;
  margin-bottom: 0;
}

.header-content {
  max-width: var(--max-width-content);
  margin: 0 auto;
  padding: 0 var(--spacing-xl);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-2xl);
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-2xl);
}

.camp-logo {
  height: 80px;
  width: auto;
}

.site-title-container {
  display: flex;
  flex-direction: column;
  border-left: 3px solid var(--color-accent-orange);
  padding-left: var(--spacing-xl);
}

.site-title {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
  letter-spacing: -0.5px;
}

@media (max-width: 768px) {
  .site-header {
    padding: var(--spacing-lg) 0;
  }

  .header-content {
    padding: 0 var(--spacing-lg);
    gap: var(--spacing-lg);
  }

  .header-left {
    gap: var(--spacing-lg);
  }

  .camp-logo {
    height: 60px;
  }

  .site-title-container {
    padding-left: var(--spacing-lg);
  }

  .site-title {
    font-size: var(--font-size-2xl);
  }
}

/* Print styles */
@media print {
  .site-header {
    border-bottom: 2pt solid #000;
    padding: 0 0 12pt 0;
    page-break-after: avoid;
  }

  .header-content {
    padding: 0;
  }

  .camp-logo {
    height: 50pt;
  }

  .site-title {
    font-size: 18pt;
    color: #000;
  }

  .site-title-container {
    border-left: 2pt solid #000;
  }
}
</style>
