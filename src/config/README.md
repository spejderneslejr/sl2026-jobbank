# Configuration Files

This directory contains configuration files for the jobbank application.

## org-overrides.js

Allows you to override organization names for display purposes.

### Usage

Edit the `ORG_NAME_OVERRIDES` object in [org-overrides.js](org-overrides.js):

```javascript
export const ORG_NAME_OVERRIDES = {
  'Havet': 'Havet (underlejr)',
  'Skoven': 'Skoven (underlejr)',
  'Byen': 'Byen (underlejr)',
  'Landet': 'Landet (underlejr)',
}
```

### Important: Sync with Python Script

The organization overrides must be kept in sync between two files:

1. **Frontend**: `sl2026-jobbank/src/config/org-overrides.js`
2. **Backend**: `scripts/process-job-export.py` (in the `ORG_NAME_OVERRIDES` class variable)

When you add or modify overrides:
1. Update `org-overrides.js` with your changes
2. Update the `ORG_NAME_OVERRIDES` dict in `scripts/process-job-export.py`
3. Re-run the processing script: `python3 scripts/process-job-export.py`
4. Rebuild the Vue app: `npm run build`

### Examples

```javascript
// Add context to subcamps
'Havet': 'Havet (underlejr)',

// Clarify department names
'IT': 'IT & Digitale Løsninger',

// Add abbreviations
'Kommunikation': 'Kommunikation (KOM)',
```

The overrides are applied to the **cleaned** organization names (after removing numeric prefixes like "5532 -").

## sort.js

Configures sorting options and default sort behavior for the job list.

See [sort.js](sort.js) for details.

## filters.js

Configures filtering behavior for the job list, including whether to hide fully staffed jobs.

### Usage

To change the filter behavior:

1. Open [filters.js](filters.js)
2. Change `HIDE_FULLY_STAFFED_JOBS` to `true` or `false`
3. Rebuild the app: `npm run build`

**Example:**
```javascript
// Hide fully staffed jobs
export const HIDE_FULLY_STAFFED_JOBS = true

// Show all jobs (default)
export const HIDE_FULLY_STAFFED_JOBS = false
```

When enabled, jobs where `no_of_hired_employee >= no_of_recruitment` will be filtered out from the job list.

This is a Vue-side configuration - not visible to end users. The filter is applied when loading job data in App.vue.

See [filters.js](filters.js) for the implementation details.
