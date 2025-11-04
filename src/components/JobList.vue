<template>
  <div class="job-list">
    <div v-if="jobs.length === 0" class="no-jobs">
      <p>Ingen job matcher dine søgekriterier.</p>
    </div>
    <div v-else class="jobs-grid">
      <JobCard
        v-for="job in jobs"
        :key="job.id"
        :job="job"
        @show-modal="$emit('show-modal', job)"
      />
    </div>
  </div>
</template>

<script>
import JobCard from './JobCard.vue'

export default {
  name: 'JobList',
  components: {
    JobCard,
  },
  props: {
    jobs: {
      type: Array,
      required: true,
    },
  },
  emits: ['show-modal'],
}
</script>

<style scoped>
.job-list {
  margin-top: var(--spacing-2xl);
}

.jobs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: var(--spacing-xl);
}

.no-jobs {
  text-align: center;
  padding: 60px var(--spacing-xl);
  color: var(--color-text-secondary);
  font-size: var(--font-size-lg);
}

@media (max-width: 768px) {
  .jobs-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-lg);
  }
}

/* Print styles - single column list */
@media print {
  .job-list {
    margin-top: 0;
  }

  .jobs-grid {
    display: block;
    gap: 0;
  }

  .no-jobs {
    padding: 20pt 0;
    font-size: 10pt;
    color: #666;
  }
}
</style>
