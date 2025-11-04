/**
 * Sort configuration for jobs
 *
 * This file defines the default sort behavior and available sort options
 */

export const SORT_OPTIONS = {
  TITLE: 'title',
  CREATED: 'created',
}

export const SORT_DIRECTIONS = {
  ASC: 'asc',
  DESC: 'desc',
}

export const DEFAULT_SORT = {
  field: SORT_OPTIONS.TITLE,
  direction: SORT_DIRECTIONS.ASC,
}

export const SORT_LABELS = {
  [SORT_OPTIONS.TITLE]: 'Titel',
  [SORT_OPTIONS.CREATED]: 'Oprettelsesdato',
}
