<template>
  <section class="job-card" @click="$emit('show-modal', job)">
    <div class="job-header">
      <h3 class="job-title">{{ job.name }}</h3>
      <span class="job-area">{{ job.org_hierarchy?.area || 'Unknown' }}</span>
    </div>
    <p class="job-teaser">{{ job.teaser }}</p>
    <div class="job-footer">
      <span class="job-recruitment">
        {{ job.no_of_hired_employee }} / {{ job.no_of_recruitment }} rekrutteret
      </span>
      <button class="btn-secondary" @click.stop="$emit('show-modal', job)">
        LÆS MERE
      </button>
    </div>
  </section>
</template>

<script>
export default {
  name: 'JobCard',
  props: {
    job: {
      type: Object,
      required: true,
    },
  },
  emits: ['show-modal'],
}
</script>

<style scoped>
.job-card {
  background: var(--color-white);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  cursor: pointer;
  transition: all var(--transition-normal);
  box-shadow: var(--shadow-sm);
}

.job-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.job-header {
  margin-bottom: var(--spacing-md);
}

.job-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  margin: 0 0 var(--spacing-sm) 0;
  color: var(--color-text-primary);
}

.job-area {
  display: inline-block;
  padding: var(--spacing-xs) var(--spacing-md);
  background: var(--color-primary-green-light);
  color: var(--color-primary-green);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

.job-teaser {
  color: var(--color-text-secondary);
  line-height: var(--line-height-relaxed);
  margin: var(--spacing-md) 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.job-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: var(--spacing-lg);
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--color-border-light);
}

.job-recruitment {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-medium);
}

.btn-secondary {
  padding: var(--spacing-sm) var(--spacing-lg);
  background: var(--color-primary-green);
  color: var(--color-white);
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-xs);
  transition: background var(--transition-fast);
}

.btn-secondary:hover {
  background: var(--color-primary-green-hover);
}

@media (max-width: 768px) {
  .job-card {
    padding: var(--spacing-lg);
  }

  .job-title {
    font-size: var(--font-size-lg);
  }

  .job-footer {
    flex-direction: column;
    gap: var(--spacing-md);
    align-items: flex-start;
  }

  .btn-secondary {
    width: 100%;
  }
}

/* Print styles - compact list format */
@media print {
  .job-card {
    background: none;
    border: none;
    border-bottom: 1pt solid #ddd;
    border-radius: 0;
    padding: 8pt 0;
    box-shadow: none;
    cursor: default;
    page-break-inside: avoid;
    transition: none;
  }

  .job-card:hover {
    transform: none;
    box-shadow: none;
  }

  .job-header {
    margin-bottom: 4pt;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 8pt;
  }

  .job-title {
    font-size: 11pt;
    font-weight: 600;
    color: #000;
    margin: 0;
    flex: 1;
  }

  .job-area {
    background: none;
    color: #000;
    border: 1pt solid #000;
    padding: 2pt 6pt;
    font-size: 8pt;
    font-weight: 600;
    white-space: nowrap;
    flex-shrink: 0;
  }

  .job-teaser {
    font-size: 9pt;
    color: #333;
    line-height: 1.4;
    margin: 4pt 0;
    -webkit-line-clamp: 2;
  }

  .job-footer {
    margin-top: 4pt;
    padding-top: 0;
    border-top: none;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .job-recruitment {
    font-size: 8pt;
    color: #666;
    font-weight: 600;
  }

  .btn-secondary {
    display: none;
  }
}
</style>
