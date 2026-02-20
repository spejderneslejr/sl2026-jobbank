<template>
  <Layout class="jobs-app">
    <header class="app-header">
      <p class="intro-text">
        Velkommen til jobbanken for Spejdernes Lejr 2026. Her kan du finde
        forskellige opgaver, som vi mangler hjælp til at løse før, under og
        efter lejren.
        <br>
        Har du spørgsmål til at være frivillig i vores
        lejrorganisation, så kan du læse mere om det
        <a href="https://spejderneslejr.dk/de-frivilliges-faellesskab/">på vores hjemmeside</a>
        eller skrive dine spørgsmål til
        <a href="mailto:frivillig@sl2026.dk">frivillig@sl2026.dk</a>
        <br>
        Hvordan søger jeg et job?
        <a href="https://spejderneslejr.dk/de-frivilliges-faellesskab/vejledning-jobbank/">Se vejledning her</a>
      </p>
    </header>

    <JobFilter
      :areas="availableAreas"
      :result-count="filteredJobs.length"
      :initial-search="initialSearch"
      :initial-area="initialArea"
      @search="handleSearch"
      @area-filter="handleAreaFilter"
      @sort-change="handleSortChange"
    />

    <JobList :jobs="filteredJobs" @show-modal="showModal" />

    <JobModal
      v-if="selectedJob"
      :job="selectedJob"
      :show="isModalVisible"
      @close="closeModal"
    />
  </Layout>
</template>

<script>
import Layout from './components/Layout.vue'
import JobFilter from './components/JobFilter.vue'
import JobList from './components/JobList.vue'
import JobModal from './components/JobModal.vue'
import { SORT_OPTIONS, SORT_DIRECTIONS } from './config/sort.js'
import { applyStaffingFilter } from './config/filters.js'

export default {
  name: 'App',
  components: {
    Layout,
    JobFilter,
    JobList,
    JobModal,
  },
  data() {
    return {
      allJobs: [],
      filteredJobs: [],
      selectedJob: null,
      isModalVisible: false,
      searchQuery: '',
      selectedArea: '',
      sortField: null,
      sortDirection: null,
      orgMap: {},
    }
  },
  computed: {
    availableAreas() {
      // Extract unique areas from jobs
      const areas = this.allJobs
        .map((job) => job.org_hierarchy?.area)
        .filter(Boolean)
      return [...new Set(areas)].sort()
    },
    initialSearch() {
      return this.$route.query.search || ''
    },
    initialArea() {
      if (this.$route.query.organization) {
        return this.orgMap[this.$route.query.organization] || ''
      }
      return ''
    },
  },
  watch: {
    '$route'() {
      if (this.allJobs.length > 0) {
        this.handleRouteNavigation()
      }
    },
  },
  methods: {
    initializeTheme() {
      // Load saved theme preference from localStorage
      const savedTheme = localStorage.getItem('theme-preference') || 'light'
      document.documentElement.setAttribute('data-theme', savedTheme)
    },
    async fetchJobs() {
      try {
        // Try to load from public jobs-export.json (production data)
        const response = await fetch('/jobs-export.json')

        if (!response.ok) {
          throw new Error('Failed to fetch jobs-export.json')
        }

        const data = await response.json()
        const jobs = data.jobs
        this.orgMap = data.org_map || {}

        // Check if the data is valid (has jobs)
        if (Array.isArray(jobs) && jobs.length > 0) {
          // Apply staffing filter based on configuration
          this.allJobs = applyStaffingFilter(jobs)
          this.filteredJobs = this.allJobs
        }

        // Apply initial filters from URL query params
        if (this.$route.query.search) {
          this.handleSearch(this.$route.query.search)
        }
        if (this.$route.query.organization) {
          const area = this.orgMap[this.$route.query.organization]
          if (area) this.handleAreaFilter(area)
        }
        // Open modal if URL has a job slug
        this.handleRouteNavigation()
        // Replace legacy redirect URL with canonical form
        this.cleanupUrl()
      } catch (error) {
        console.error('Error loading jobs from /jobs-export.json:', error)
      }
    },
    handleSearch(query) {
      this.searchQuery = query
      this.applyFilters()
    },
    handleAreaFilter(area) {
      this.selectedArea = area
      this.applyFilters()
    },
    handleSortChange({ field, direction }) {
      this.sortField = field
      this.sortDirection = direction
      this.applyFilters()
    },
    applyFilters() {
      let jobs = this.allJobs

      // Apply search filter
      if (this.searchQuery) {
        const searchLower = this.searchQuery.toLowerCase()
        jobs = jobs.filter(
          (job) =>
            (job?.name || '').toLowerCase().includes(searchLower) ||
            (job?.teaser || '').toLowerCase().includes(searchLower) ||
            (job?.description ||'').toLowerCase().includes(searchLower) ||
            (job.org_hierarchy?.area || '').toLowerCase().includes(searchLower)
        )
      }

      // Apply area filter
      if (this.selectedArea) {
        jobs = jobs.filter((job) => job.org_hierarchy?.area === this.selectedArea)
      }

      // Apply sorting
      if (this.sortField && this.sortDirection) {
        jobs = this.sortJobs(jobs, this.sortField, this.sortDirection)
      }

      this.filteredJobs = jobs
    },
    sortJobs(jobs, field, direction) {
      const sorted = [...jobs].sort((a, b) => {
        let aValue, bValue

        switch (field) {
          case SORT_OPTIONS.TITLE:
            aValue = a.name.toLowerCase()
            bValue = b.name.toLowerCase()
            break
          case SORT_OPTIONS.CREATED:
            // Parse the date string (format: YYYY-MM-DD)
            aValue = new Date(a.create_date).getTime()
            bValue = new Date(b.create_date).getTime()
            break
          default:
            return 0
        }

        // Handle numeric comparison (dates converted to timestamps)
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return direction === SORT_DIRECTIONS.ASC
            ? aValue - bValue
            : bValue - aValue
        }

        // Handle string comparison
        if (direction === SORT_DIRECTIONS.ASC) {
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
        } else {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
        }
      })

      return sorted
    },
    parseSlugToId(slug) {
      const asInt = parseInt(slug, 10)
      if (!isNaN(asInt) && String(asInt) === slug) return asInt
      const lastHyphen = slug.lastIndexOf('-')
      if (lastHyphen !== -1) {
        const id = parseInt(slug.slice(lastHyphen + 1), 10)
        if (!isNaN(id)) return id
      }
      return null
    },
    handleRouteNavigation() {
      const slug = this.$route.params.slug
      if (slug) {
        const jobId = this.parseSlugToId(slug)
        const job = this.allJobs.find(j => j.id === jobId)
        if (job) {
          this.selectedJob = job
          this.isModalVisible = true
        }
        // If job not found: silently stay on listing (jobs may still be loading)
      } else {
        this.isModalVisible = false
      }
    },
    cleanupUrl() {
      const slug = this.$route.params.slug
      const hasQueryParams = Object.keys(this.$route.query).length > 0

      if (slug) {
        const jobId = this.parseSlugToId(slug)
        if (jobId === null) return  // Unparseable slug — leave it alone
        const isAlreadyClean = String(jobId) === slug && !hasQueryParams
        if (!isAlreadyClean) {
          this.$router.replace('/detail/' + jobId)
        }
      } else if (hasQueryParams) {
        this.$router.replace('/')
      }
      // Otherwise URL is already canonical — no action
    },
    showModal(job) {
      if (!job) return
      this.selectedJob = job
      this.isModalVisible = true
      this.$router.push('/detail/' + job.id)
    },
    closeModal() {
      this.isModalVisible = false
      this.$router.replace('/')
    },
  },
  mounted() {
    this.initializeTheme()
    this.fetchJobs()
  },
}
</script>

<style>
/* Global styles */
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, 'Helvetica Neue', sans-serif;
  background: var(--color-background);
  color: var(--color-text-primary);
}

.jobs-app {
  min-height: 100vh;
  padding-bottom: 60px;
}

.app-header {
  text-align: center;
  margin-bottom: 40px;
  padding: 40px 20px;
}

.app-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 16px 0;
}

.intro-text {
  font-size: 1.1rem;
  color: var(--color-text-primary);
  background-color: var(--color-border-light);
  padding: 20px;
  line-height: 1.6;
  max-width: 900px;
  text-align: left;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .app-header {
    padding: 24px 16px;
    margin-bottom: 24px;
  }

  .app-header h1 {
    font-size: 1.75rem;
  }

  .intro-text {
    font-size: 1rem;
  }
}

/* Print styles - conditionally hide based on modal state */
@media print {
  /* When modal is open, hide the main content */
  body:has(.modal-backdrop) .app-header,
  body:has(.modal-backdrop) .job-filter,
  body:has(.modal-backdrop) .job-list {
    display: none !important;
  }

  /* When modal is NOT open, optimize the job list view */
  body:not(:has(.modal-backdrop)) .app-header {
    margin-bottom: 20pt;
    padding: 12pt 0;
    page-break-after: avoid;
  }

  body:not(:has(.modal-backdrop)) .intro-text {
    font-size: 10pt;
    padding: 12pt;
    background: #f5f5f5;
    border-left: 3pt solid #000;
  }
}
</style>
