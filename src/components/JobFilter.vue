<template>
  <div class="job-filter">
    <div class="filter-row">
      <div class="search-box">
        <input
          type="text"
          v-model="searchQuery"
          @input="handleSearch"
          placeholder="Søg efter job..."
          class="search-input"
        />
      </div>

      <div class="filter-select">
        <select v-model="selectedArea" @change="handleAreaChange" class="area-select">
          <option value="">Alle områder</option>
          <option v-for="area in areas" :key="area" :value="area">
            {{ area }}
          </option>
        </select>
      </div>
    </div>

    <div class="sort-row">
      <div class="sort-controls">
        <label for="sort-select" class="sort-label">Sorter efter:</label>
        <div class="sort-group">
          <select
            id="sort-select"
            v-model="selectedSort"
            @change="handleSortChange"
            class="sort-select"
          >
            <option
              v-for="(label, value) in sortLabels"
              :key="value"
              :value="value"
            >
              {{ label }}
            </option>
          </select>
          <button
            type="button"
            @click="toggleSortDirection"
            class="sort-direction-btn"
            :aria-label="sortDirection === 'asc' ? 'Sorterer stigende' : 'Sorterer faldende'"
            :title="sortDirection === 'asc' ? 'Klik for faldende sortering' : 'Klik for stigende sortering'"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              :class="{ 'rotate-180': sortDirection === 'desc' }"
            >
              <path
                d="M8 3L8 13M8 3L4 7M8 3L12 7"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      <div class="filter-info">
        <p class="results-count">Viser {{ resultCount }} job</p>
      </div>
    </div>
  </div>
</template>

<script>
import { SORT_OPTIONS, SORT_DIRECTIONS, DEFAULT_SORT, SORT_LABELS } from '../config/sort.js'

export default {
  name: 'JobFilter',
  props: {
    areas: {
      type: Array,
      required: true,
    },
    resultCount: {
      type: Number,
      required: true,
    },
  },
  emits: ['search', 'area-filter', 'sort-change'],
  data() {
    return {
      searchQuery: '',
      selectedArea: '',
      selectedSort: DEFAULT_SORT.field,
      sortDirection: DEFAULT_SORT.direction,
      sortLabels: SORT_LABELS,
    }
  },
  methods: {
    handleSearch() {
      this.$emit('search', this.searchQuery)
    },
    handleAreaChange() {
      this.$emit('area-filter', this.selectedArea)
    },
    handleSortChange() {
      this.emitSortChange()
    },
    toggleSortDirection() {
      this.sortDirection =
        this.sortDirection === SORT_DIRECTIONS.ASC
          ? SORT_DIRECTIONS.DESC
          : SORT_DIRECTIONS.ASC
      this.emitSortChange()
    },
    emitSortChange() {
      this.$emit('sort-change', {
        field: this.selectedSort,
        direction: this.sortDirection,
      })
    },
  },
  mounted() {
    // Emit default sort on mount
    this.emitSortChange()
  },
}
</script>

<style scoped>
.job-filter {
  background: var(--color-white);
  border-radius: var(--radius-lg);
  padding: var(--spacing-2xl);
  box-shadow: var(--shadow-md);
  margin-bottom: var(--spacing-2xl);
}

.filter-row {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
}

.search-box {
  width: 100%;
}

.search-input {
  width: 100%;
  padding: var(--spacing-md) var(--spacing-lg);
  font-size: var(--font-size-base);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
  transition: border-color var(--transition-fast);
}

.search-input:focus {
  outline: none;
  border-color: var(--color-primary-green);
}

.filter-select {
  width: 100%;
}

.area-select {
  width: 100%;
  padding: var(--spacing-md) var(--spacing-lg);
  font-size: var(--font-size-base);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-white);
  cursor: pointer;
  transition: border-color var(--transition-fast);
}

.area-select:focus {
  outline: none;
  border-color: var(--color-primary-green);
}

.sort-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--color-border-light);
  gap: var(--spacing-lg);
}

.sort-controls {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex: 1;
}

.sort-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-medium);
  white-space: nowrap;
}

.sort-group {
  display: flex;
  gap: var(--spacing-sm);
  align-items: center;
}

.sort-select {
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: var(--font-size-xs);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-white);
  cursor: pointer;
  transition: border-color var(--transition-fast);
  min-width: 150px;
}

.sort-select:focus {
  outline: none;
  border-color: var(--color-primary-green);
}

.sort-direction-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  background: var(--color-white);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  color: var(--color-text-secondary);
}

.sort-direction-btn:hover {
  border-color: var(--color-primary-green);
  background: var(--color-primary-green-light);
  color: var(--color-primary-green);
}

.sort-direction-btn:focus {
  outline: none;
  border-color: var(--color-primary-green);
}

.sort-direction-btn svg {
  transition: transform var(--transition-fast);
}

.sort-direction-btn svg.rotate-180 {
  transform: rotate(180deg);
}

.filter-info {
  flex-shrink: 0;
}

.results-count {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

@media (max-width: 768px) {
  .job-filter {
    padding: var(--spacing-lg);
  }

  .filter-row {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
  }

  .sort-row {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-md);
  }

  .sort-controls {
    width: 100%;
    flex-wrap: wrap;
  }

  .sort-select {
    flex: 1;
    min-width: 120px;
  }

  .filter-info {
    width: 100%;
  }
}

/* Print styles */
@media print {
  .job-filter {
    background: none;
    box-shadow: none;
    border: 1pt solid #ccc;
    padding: 10pt;
    margin-bottom: 16pt;
    page-break-after: avoid;
    page-break-inside: avoid;
  }

  /* Hide interactive inputs, show their values */
  .search-input,
  .area-select,
  .sort-select,
  .sort-direction-btn {
    border: none;
    padding: 0;
    background: none;
    font-size: 9pt;
    color: #000;
  }

  .filter-row {
    display: block;
    margin-bottom: 6pt;
  }

  .search-box::before {
    content: "Søgning: ";
    font-weight: 600;
    color: #000;
  }

  .search-input {
    display: inline;
  }

  .search-input:placeholder-shown::after {
    content: "(alle)";
    font-style: italic;
    color: #666;
  }

  .filter-select::before {
    content: "Område: ";
    font-weight: 600;
    color: #000;
    display: inline-block;
    margin-top: 4pt;
  }

  .area-select {
    display: inline;
  }

  .sort-row {
    border-top: 1pt solid #eee;
    padding-top: 6pt;
    display: flex;
    justify-content: space-between;
  }

  .sort-controls {
    font-size: 9pt;
  }

  .sort-label {
    color: #000;
  }

  .sort-group {
    gap: 4pt;
  }

  .sort-direction-btn {
    display: none;
  }

  .results-count {
    font-size: 9pt;
    color: #000;
    font-weight: 600;
  }
}
</style>
