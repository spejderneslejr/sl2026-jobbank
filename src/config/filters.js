/**
 * Filter configuration for jobs
 *
 * This file defines filtering behavior for the job list.
 * These settings are configured in the Vue application code.
 */

/**
 * Whether to hide fully staffed jobs from the job list
 *
 * When enabled (true): Jobs where no_of_hired_employee >= no_of_recruitment are hidden
 * When disabled (false): All jobs are shown regardless of staffing status
 *
 * Change this value and rebuild the app to toggle the filter:
 * 1. Edit this file and change true/false
 * 2. Run: npm run build
 *
 * @type {boolean}
 */
export const HIDE_FULLY_STAFFED_JOBS = true

/**
 * Apply staffing filter to jobs array
 * @param {Array} jobs - Array of job objects
 * @param {boolean} hideFullyStaffed - Whether to filter out fully staffed jobs
 * @returns {Array} - Filtered jobs array
 */
export function applyStaffingFilter(jobs, hideFullyStaffed = HIDE_FULLY_STAFFED_JOBS) {
  if (!hideFullyStaffed) {
    return jobs
  }

  return jobs.filter((job) => {
    return job.no_of_hired_employee < job.no_of_recruitment
  })
}
