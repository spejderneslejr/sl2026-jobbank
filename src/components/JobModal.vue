<template>
  <div v-if="show" class="modal-backdrop" @click.self="closeModal">
    <div
      class="modal"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
    >
      <header class="modal-header">
        <div class="header-content">
          <span class="job-area-badge">{{ job.org_hierarchy?.area || 'Unknown' }}</span>
          <div v-if="hasOrgPath" class="org-path">
            <span v-if="job.org_hierarchy.committee" class="org-path-separator">›</span>
            <span v-if="job.org_hierarchy.committee" class="org-path-item">{{ job.org_hierarchy.committee }}</span>
            <span v-if="job.org_hierarchy.team" class="org-path-separator">›</span>
            <span v-if="job.org_hierarchy.team" class="org-path-item">{{ job.org_hierarchy.team }}</span>
            <span v-if="job.org_hierarchy.workgroup" class="org-path-separator">›</span>
            <span v-if="job.org_hierarchy.workgroup" class="org-path-item">{{ job.org_hierarchy.workgroup }}</span>
          </div>
          <h2 class="job-title">{{ job.name }}</h2>
          <p class="job-teaser">{{ job.teaser }}</p>
        </div>
        <button type="button" class="btn-close" @click="closeModal" aria-label="Luk">
          ✕
        </button>
      </header>

      <div class="modal-body">
        <div v-if="job.description" class="content-section">
          <h3>Beskrivelse</h3>
          <p class="content-text">{{ job.description }}</p>
        </div>

        <div v-if="job.description_time_and_scope" class="content-section">
          <h3>Tid og omfang</h3>
          <p class="content-text">{{ job.description_time_and_scope }}</p>
        </div>

        <div v-if="job.requirements" class="content-section">
          <h3>Særlige krav</h3>
          <p class="content-text">{{ job.requirements }}</p>
        </div>

        <div class="content-section">
          <h3>Rekruttering</h3>
          <p class="content-text">
            <strong>{{ job.no_of_hired_employee }}</strong> af
            <strong>{{ job.no_of_recruitment }}</strong> pladser besat
          </p>
          <div class="progress-bar">
            <div
              class="progress-fill"
              :style="{ width: recruitmentPercentage + '%' }"
            ></div>
          </div>
        </div>

        <div class="content-section">
          <h3>Ansøg</h3>
          <p class="content-text">
            For at ansøge dette job, skal du klikke på
            <a :href="applyLink" target="_blank" rel="noopener">dette link</a>.
            Linket fører dig videre til tilmeldings-systemet, hvor du hvis du er
            medlem af et spejderkorps kan logge på og fuldføre din ansøgning.
            Hvis du ikke er medlem af et spejderkorps skal du oprette en bruger først.
          </p>
        </div>
      </div>

      <footer class="modal-footer">
        <div class="footer-info">
          <span class="created-date">Oprettet {{ job.formatted_create_date }}</span>
          <div v-if="orgBreakdown.length" class="org-breakdown">
            <span v-for="(part, index) in orgBreakdown" :key="index" class="org-breakdown-item">
              <span class="org-breakdown-label">{{ part.label }}:</span> {{ part.value }}
            </span>
          </div>
        </div>
        <div class="button-group">
          <a
            :href="applyLink"
            class="btn btn-primary"
            target="_blank"
            rel="noopener"
          >
            ANSØG JOB
          </a>
          <button type="button" class="btn btn-secondary" @click="closeModal">
            LUK
          </button>
        </div>
      </footer>
    </div>
  </div>
</template>

<script>
export default {
  name: 'JobModal',
  props: {
    job: {
      type: Object,
      required: true,
    },
    show: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['close'],
  data() {
    return {
      touchStartX: 0,
      touchStartY: 0,
      touchEndX: 0,
      touchEndY: 0,
    }
  },
  computed: {
    applyLink() {
      return `https://tilmelding.spejderneslejr.dk/da/member/job/${this.job.id}`
    },
    recruitmentPercentage() {
      if (this.job.no_of_recruitment === 0) return 0
      return Math.round(
        (this.job.no_of_hired_employee / this.job.no_of_recruitment) * 100
      )
    },
    hasOrgPath() {
      return this.job.org_hierarchy && (this.job.org_hierarchy.committee || this.job.org_hierarchy.team || this.job.org_hierarchy.workgroup)
    },
    orgBreakdown() {
      if (!this.job.org_hierarchy) return []

      const parts = []
      if (this.job.org_hierarchy.area_full) {
        parts.push({ label: 'Område', value: this.job.org_hierarchy.area_full })
      }
      if (this.job.org_hierarchy.committee_full) {
        parts.push({ label: 'Udvalg', value: this.job.org_hierarchy.committee_full })
      }
      if (this.job.org_hierarchy.team_full) {
        parts.push({ label: 'Team', value: this.job.org_hierarchy.team_full })
      }
      if (this.job.org_hierarchy.workgroup_full) {
        parts.push({ label: 'Arbejdsgruppe', value: this.job.org_hierarchy.workgroup_full })
      }
      return parts
    },
  },
  methods: {
    closeModal() {
      this.$emit('close')
    },
    handleKeydown(event) {
      if (event.key === 'Escape') {
        this.closeModal()
      }
    },
    handleTouchStart(event) {
      this.touchStartX = event.touches[0].clientX
      this.touchStartY = event.touches[0].clientY
    },
    handleTouchMove(event) {
      this.touchEndX = event.touches[0].clientX
      this.touchEndY = event.touches[0].clientY
    },
    handleTouchEnd() {
      const deltaX = this.touchEndX - this.touchStartX
      const deltaY = Math.abs(this.touchEndY - this.touchStartY)

      // Swipe right detection (swipe from left edge)
      // Require: swipe distance > 100px, horizontal > vertical, starting from left edge
      if (deltaX > 100 && deltaX > deltaY && this.touchStartX < 50) {
        this.closeModal()
      }
    },
  },
  watch: {
    show(newVal) {
      // Prevent body scroll when modal is open
      if (newVal) {
        document.body.style.overflow = 'hidden'
        // Add job id to URL hash
        window.location.hash = this.job.id
        // Add ESC key listener
        window.addEventListener('keydown', this.handleKeydown)
      } else {
        document.body.style.overflow = ''
        // Clear hash when closing without scrolling
        if (window.location.hash) {
          history.replaceState(null, '', window.location.pathname + window.location.search)
        }
        // Remove ESC key listener
        window.removeEventListener('keydown', this.handleKeydown)
      }
    },
  },
  mounted() {
    // If modal is visible on mount, setup immediately
    if (this.show) {
      document.body.style.overflow = 'hidden'
      window.location.hash = this.job.id
      window.addEventListener('keydown', this.handleKeydown)
    }
  },
  beforeUnmount() {
    // Clean up on component unmount
    document.body.style.overflow = ''
    window.removeEventListener('keydown', this.handleKeydown)
  },
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  overflow-y: auto;
  padding: var(--spacing-xl);
}

.modal {
  background: var(--color-white);
  border-radius: var(--radius-xl);
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-xl);
  position: relative;
}

.modal-header {
  padding: var(--spacing-3xl);
  border-bottom: 1px solid var(--color-border-light);
  position: relative;
}

.header-content {
  padding-right: var(--spacing-4xl);
}

.job-area-badge {
  display: inline-block;
  padding: 6px 14px;
  background: var(--color-primary-green-light);
  color: var(--color-primary-green);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--spacing-sm);
}

.org-path {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  padding-left: var(--spacing-xs);
}

.org-path-item {
  color: var(--color-text-secondary);
}

.org-path-separator {
  color: var(--color-text-tertiary);
  font-size: var(--font-size-base);
}

.job-title {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: var(--spacing-md) 0;
  line-height: var(--line-height-tight);
}

.job-teaser {
  font-size: var(--font-size-lg);
  color: var(--color-text-secondary);
  line-height: var(--line-height-relaxed);
  margin-top: var(--spacing-md);
}

.btn-close {
  position: absolute;
  top: var(--spacing-2xl);
  right: var(--spacing-2xl);
  background: none;
  border: none;
  font-size: var(--font-size-3xl);
  cursor: pointer;
  color: var(--color-text-tertiary);
  width: var(--spacing-4xl);
  height: var(--spacing-4xl);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-full);
  transition: all var(--transition-fast);
}

.btn-close:hover {
  background: #f5f5f5;
  color: #333;
}

.modal-body {
  padding: var(--spacing-3xl);
}

.content-section {
  margin-bottom: 28px;
}

.content-section:last-child {
  margin-bottom: 0;
}

.content-section h3 {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-md) 0;
}

.content-text {
  color: var(--color-text-light);
  line-height: var(--line-height-loose);
  white-space: pre-line;
  margin: 0;
}

.content-text a {
  color: var(--color-primary-green);
  text-decoration: underline;
}

.content-text a:hover {
  color: var(--color-primary-green-hover);
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: var(--color-accent-yellow-light);
  border-radius: var(--radius-sm);
  overflow: hidden;
  margin-top: var(--spacing-md);
}

.progress-fill {
  height: 100%;
  background: var(--color-accent-yellow);
  transition: width var(--transition-normal);
}

.modal-footer {
  padding: var(--spacing-2xl) var(--spacing-3xl);
  border-top: 1px solid var(--color-border-light);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-lg);
}

.footer-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  flex: 1;
  min-width: 0;
}

.created-date {
  color: var(--color-text-tertiary);
  font-size: var(--font-size-xs);
}

.org-breakdown {
  display: none; /* Hidden on screen, shown in print */
  flex-wrap: wrap;
  gap: var(--spacing-sm) var(--spacing-lg);
  color: var(--color-text-tertiary);
  font-size: var(--font-size-xs);
  line-height: var(--line-height-relaxed);
}

.org-breakdown-item {
  white-space: nowrap;
}

.org-breakdown-label {
  font-weight: var(--font-weight-semibold);
}

.button-group {
  display: flex;
  gap: var(--spacing-md);
}

.btn {
  padding: var(--spacing-md) var(--spacing-2xl);
  border: none;
  border-radius: var(--radius-md);
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-xs);
  cursor: pointer;
  transition: all var(--transition-fast);
  text-decoration: none;
  display: inline-block;
}

.btn-primary {
  background: var(--color-primary-green);
  color: var(--color-white);
}

.btn-primary:hover {
  background: var(--color-success-hover);
}

.btn-secondary {
  background: var(--color-primary-green-light);
  color: var(--color-primary-green);
}

.btn-secondary:hover {
  background: var(--color-primary-green-lighter);
}

@media (max-width: 768px) {
  .modal-backdrop {
    padding: 0;
    align-items: flex-start;
  }

  .modal {
    max-height: 100vh;
    border-radius: 0;
  }

  .modal-header,
  .modal-body,
  .modal-footer {
    padding: var(--spacing-xl);
  }

  .job-title {
    font-size: var(--font-size-2xl);
  }

  .modal-footer {
    flex-direction: column-reverse;
    gap: var(--spacing-md);
    align-items: stretch;
  }

  .footer-info {
    align-items: center;
    text-align: center;
  }

  .org-breakdown {
    justify-content: center;
  }

  .button-group {
    flex-direction: column;
    width: 100%;
  }

  .btn {
    width: 100%;
    text-align: center;
  }

  .created-date {
    text-align: center;
  }
}

/* Print Styles */
@media print {
  /* Hide modal backdrop and make modal fill page */
  .modal-backdrop {
    position: static;
    background: none;
    padding: 0;
  }

  .modal {
    max-width: 100%;
    max-height: none;
    box-shadow: none;
    border-radius: 0;
    overflow: visible;
  }

  /* Hide interactive elements */
  .btn-close,
  .button-group {
    display: none;
  }

  /* Clean header for print */
  .modal-header {
    border-bottom: 2px solid #000;
    padding: 16pt 0 12pt 0;
    page-break-after: avoid;
  }

  .header-content {
    padding-right: 0;
  }

  .job-area-badge {
    background: none;
    color: #000;
    border: 1.5pt solid #000;
    padding: 4pt 10pt;
    font-weight: 600;
  }

  .org-path {
    color: #333;
    margin-bottom: 8pt;
    padding-left: 0;
  }

  .org-path-item {
    color: #333;
  }

  .org-path-separator {
    color: #666;
  }

  .job-title {
    font-size: 20pt;
    color: #000;
    margin: 8pt 0;
  }

  .job-teaser {
    font-size: 11pt;
    color: #333;
    line-height: 1.5;
  }

  /* Body sections */
  .modal-body {
    padding: 12pt 0;
  }

  .content-section {
    page-break-inside: avoid;
    margin-bottom: 16pt;
  }

  .content-section h3 {
    font-size: 13pt;
    color: #000;
    margin-bottom: 6pt;
    font-weight: 600;
  }

  .content-text {
    font-size: 10pt;
    color: #000;
    line-height: 1.6;
  }

  .content-text a {
    color: #000;
    text-decoration: underline;
  }

  .content-text a::after {
    content: " (" attr(href) ")";
    font-size: 9pt;
    color: #555;
  }

  /* Progress bar - show as simple text in print */
  .progress-bar {
    display: none;
  }

  /* Footer */
  .modal-footer {
    border-top: 1pt solid #ccc;
    padding: 12pt 0 0 0;
    page-break-inside: avoid;
  }

  .footer-info {
    width: 100%;
  }

  .created-date {
    color: #666;
    font-size: 9pt;
  }

  .org-breakdown {
    display: block;
    color: #000;
    font-size: 9pt;
    margin-top: 8pt;
    padding-top: 8pt;
    border-top: 1pt solid #eee;
  }

  .org-breakdown-item {
    display: block;
    margin-bottom: 4pt;
  }

  .org-breakdown-label {
    font-weight: 600;
    color: #000;
  }

  /* Page breaks */
  .modal-header {
    page-break-after: avoid;
  }

  .content-section {
    page-break-inside: avoid;
  }

  /* Ensure colors print correctly */
  * {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}
</style>
