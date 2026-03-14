#!/usr/bin/env node
/**
 * Fetch job export from CampOS API and generate jobs-export.json
 *
 * This script fetches data from the CampOS API:
 * - Job export: Contains job data with organization references
 * - Organization export: Contains organization hierarchy (parent_path)
 *
 * And generates:
 * - jobs-export.json (for use by the jobbank Vue app)
 * - Per-job OG HTML pages in public/job/{slug}/index.html
 *
 * Configuration:
 * - API credentials are stored in config.json (not committed to git)
 * - See config.example.json for the required structure
 *
 * Usage:
 *   node scripts/fetch-job-export.js
 *   npm run fetch-export
 */

import { readFileSync, writeFileSync, mkdirSync, rmSync, readdirSync, statSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { marked } from 'marked'
import { ORG_NAME_OVERRIDES } from '../src/config/org-overrides.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// ─── Config ──────────────────────────────────────────────────────────────────

function loadConfig(configFile) {
  let raw
  try {
    raw = readFileSync(configFile, 'utf8')
  } catch {
    console.error(`Error: Configuration file not found: ${configFile}`)
    console.error('Please create config.json based on config.example.json')
    process.exit(1)
  }

  let config
  try {
    config = JSON.parse(raw)
  } catch (e) {
    console.error(`Error: Invalid JSON in ${configFile}: ${e.message}`)
    process.exit(1)
  }

  const required = ['job_export_url', 'org_export_url']
  const missing = required.filter(f => !(f in config))
  if (missing.length) {
    console.error(`Error: Missing required fields in ${configFile}: ${missing.join(', ')}`)
    console.error('Please see config.example.json for the required structure')
    process.exit(1)
  }

  console.log(`Loaded configuration from ${configFile}`)
  return config
}

// ─── HTTP ─────────────────────────────────────────────────────────────────────

async function fetchJson(url) {
  let response
  try {
    response = await fetch(url, {
      headers: { 'User-Agent': 'JobBank/1.0' },
      signal: AbortSignal.timeout(30_000),
    })
  } catch (e) {
    console.error(`URL Error: ${e.message}`)
    console.error(`URL: ${url}`)
    process.exit(1)
  }

  if (!response.ok) {
    console.error(`HTTP Error ${response.status}: ${response.statusText}`)
    console.error(`URL: ${url}`)
    process.exit(1)
  }

  return response.json()
}

// ─── Date ─────────────────────────────────────────────────────────────────────

function formatDateDanish(isoDateString) {
  if (!isoDateString) return null
  // Extract date directly from the ISO string to preserve the source timezone
  const m = isoDateString.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!m) return null
  return `${m[3]}-${m[2]}-${m[1]}`
}

// ─── Org hierarchy ────────────────────────────────────────────────────────────

function extractOrgIdFromPath(path) {
  if (!path) return null
  const parts = path.replace(/\/$/, '').split('/')
  return parts.length ? parts[parts.length - 1] : null
}

function applyOrgNameOverride(orgName) {
  if (!orgName) return orgName
  return ORG_NAME_OVERRIDES[orgName] ?? orgName
}

/** Returns [numericPrefix, cleanName] */
function cleanOrgName(orgName) {
  if (!orgName) return [null, null]
  // Match "5532 - GRAS", "0050 Korpsansatte", or just "GRAS"
  const m = orgName.match(/^(\d+)\s*(?:-\s*)?(.+)$/)
  if (m) {
    return [m[1], applyOrgNameOverride(m[2].trim())]
  }
  return [null, applyOrgNameOverride(orgName.trim())]
}

function buildOrgLookup(orgData) {
  console.log(`Building organization lookup from ${orgData.length} organizations...`)
  const orgLookup = {}
  for (const org of orgData) {
    if (org.name) orgLookup[org.name] = org.parent_path
  }
  console.log(`Built lookup for ${Object.keys(orgLookup).length} organizations`)
  return orgLookup
}

/**
 * Build a mapping from every org ID to its top-level area (short) name.
 *
 * Allows ?organization=nnn redirects to filter to the correct area.
 * Path structure:
 *   "1/"           -> root (skip)
 *   "1/2/"         -> camp level (skip)
 *   "1/2/9/"       -> area (ID 9 maps to itself)
 *   "1/2/9/27/"    -> committee (ID 27 maps to area 9)
 *   "1/2/9/27/28/" -> team (ID 28 maps to area 9)
 */
function buildOrgMap(orgLookup) {
  // Reverse lookup: org_id -> full_name
  const orgIdToName = {}
  for (const [name, path] of Object.entries(orgLookup)) {
    const orgId = extractOrgIdFromPath(path)
    if (orgId) orgIdToName[orgId] = name
  }

  const orgMap = {}
  for (const [name, path] of Object.entries(orgLookup)) {
    if (!path) continue
    const ownId = extractOrgIdFromPath(path)
    if (!ownId) continue

    // Strip the two fixed top levels: 1 (Spejderne root) and 2 (SL2026)
    let parts = path.replace(/\/$/, '').split('/')
    if (parts.length < 3) continue
    parts = parts.slice(2) // [area_id, ...]

    const areaFullName = orgIdToName[parts[0]]
    if (!areaFullName) continue

    const [, areaShortName] = cleanOrgName(areaFullName)
    if (areaShortName) orgMap[ownId] = areaShortName
  }

  console.log(`Built org_map for ${Object.keys(orgMap).length} org IDs`)
  return orgMap
}

function getOrgHierarchyForJob(orgName, orgLookup) {
  const orgPath = orgLookup[orgName]

  if (!orgPath) {
    return {
      area: 'Unknown', area_full: 'Unknown',
      committee: null, committee_full: null,
      team: null, team_full: null,
      workgroup: null, workgroup_full: null,
      full_path: [orgName],
    }
  }

  // Parse path "1/2/6/55/131/456/" and strip leading levels
  let parts = orgPath.replace(/\/$/, '').split('/')
  if (parts.length > 1) parts = parts.slice(1) // remove root (1)

  const hierarchy = {
    area: null, area_full: null,
    committee: null, committee_full: null,
    team: null, team_full: null,
    workgroup: null, workgroup_full: null,
    full_path: [],
  }

  // Camp-level job: only has ID 2
  if (parts.length === 1 && parts[0] === '2') {
    const cleanCampName = cleanOrgName(orgName)[1] || 'Spejdernes Lejr 2026'
    hierarchy.area = cleanCampName
    hierarchy.area_full = orgName
    hierarchy.full_path.push(cleanCampName)
    return hierarchy
  }

  if (parts.length > 1) parts = parts.slice(1) // remove camp level (2)

  // Reverse lookup: org_id -> org_name
  const orgIdLookup = {}
  for (const [name, path] of Object.entries(orgLookup)) {
    const orgId = extractOrgIdFromPath(path)
    if (orgId) orgIdLookup[orgId] = name
  }

  const levels = ['area', 'committee', 'team', 'workgroup']
  for (let i = 0; i < parts.length; i++) {
    const orgFullName = orgIdLookup[parts[i]] || `ID-${parts[i]}`
    const [, orgCleanName] = cleanOrgName(orgFullName)
    const level = levels[i]
    if (level) {
      hierarchy[level] = orgCleanName
      hierarchy[`${level}_full`] = orgFullName
      hierarchy.full_path.push(orgCleanName)
    }
  }

  if (!hierarchy.area) {
    hierarchy.area = cleanOrgName(orgName)[1] || 'Unknown'
    hierarchy.area_full = orgName
  }

  return hierarchy
}

// ─── Jobs ─────────────────────────────────────────────────────────────────────

function processJobs(jobData, orgLookup) {
  console.log(`Processing ${jobData.length} jobs...`)
  const jobs = []

  for (const job of jobData) {
    const orgName = job.organization_id || 'Unknown'
    const h = getOrgHierarchyForJob(orgName, orgLookup)
    const createDateIso = job.create_date || null

    jobs.push({
      id: job.id,
      name: job.name || 'Unnamed Job',
      teaser: job.teaser || '',
      description: job.description || '',
      description_time_and_scope: job.description_time_and_scope || '',
      requirements: job.requirements ?? null,
      application_count: job.application_count || 0,
      no_of_recruitment: job.no_of_recruitment || 0,
      no_of_hired_employee: job.application_count || 0,
      min_age: job.min_age ?? null,
      website_url: job.website_url || '',
      create_date: createDateIso,
      formatted_create_date: formatDateDanish(createDateIso),
      org_hierarchy: {
        area: h.area,
        area_full: h.area_full,
        committee: h.committee,
        committee_full: h.committee_full,
        team: h.team,
        team_full: h.team_full,
        workgroup: h.workgroup,
        workgroup_full: h.workgroup_full,
      },
    })
  }

  console.log(`Processed ${jobs.length} jobs`)
  return jobs
}

function writeOutput(jobs, orgMap, outputFile) {
  mkdirSync(dirname(outputFile), { recursive: true })
  writeFileSync(outputFile, JSON.stringify({ jobs, org_map: orgMap }, null, 2), 'utf8')
  console.log(`Wrote ${jobs.length} jobs and ${Object.keys(orgMap).length} org mappings to ${outputFile}`)
}

// ─── OG pages ─────────────────────────────────────────────────────────────────

function buildJobSlug(job) {
  let name = (job.name || '').toLowerCase()
  name = name.replace(/æ/g, 'ae').replace(/ø/g, 'oe').replace(/å/g, 'aa').replace(/é/g, 'e')
  name = name.replace(/[\u2011\u2013\u2014]/g, '-')
  name = name.replace(/[^a-z0-9-]+/g, '-')
  name = name.replace(/-{2,}/g, '-')
  name = name.replace(/^-|-$/g, '')
  return name ? `${name}-${job.id}` : String(job.id)
}

function escapeHtml(str) {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function stripHtmlTags(text) {
  return (text || '').replace(/<[^>]+>/g, '').trim()
}

/**
 * Generate per-job OG HTML pages alongside index.html.
 *
 * Reads the deployed index.html from outputDir, injects per-job OG meta tags,
 * and writes {outputDir}/job/{slug}/index.html for each job.
 *
 * Skips silently if index.html is not present (e.g. local dev where outputDir
 * is public/ and no build has run).
 */
function generateOgPages(jobs, outputDir) {
  const indexPath = join(outputDir, 'index.html')
  if (!existsSync(indexPath)) {
    console.log('Skipping OG page generation: index.html not found in output directory')
    return
  }

  const baseHtml = readFileSync(indexPath, 'utf8')
  const titleMatch = baseHtml.match(/<title>([^<]*)<\/title>/)
  const siteTitle = titleMatch ? titleMatch[1] : 'Jobbank - Spejdernes Lejr 2026'

  const siteUrl = (process.env.SITE_URL || 'https://jobs.spejderneslejr.dk').replace(/\/$/, '')
  const ogImageUrl = `${siteUrl}/og-jobbank.jpg`

  const jobDir = join(outputDir, 'job')
  mkdirSync(jobDir, { recursive: true })

  const generatedSlugs = new Set()

  for (const job of jobs) {
    const slug = buildJobSlug(job)
    generatedSlugs.add(slug)

    const jobName = escapeHtml(job.name || '')
    // Parse markdown → HTML → strip tags for plain-text OG description
    const teaserHtml = marked.parse(job.teaser || '')
    const teaser = escapeHtml(stripHtmlTags(teaserHtml).slice(0, 300))
    const canonicalUrl = `${siteUrl}/job/${slug}`

    let pageHtml = baseHtml.replace(
      /<title>[^<]*<\/title>/,
      `<title>${jobName} — ${escapeHtml(siteTitle)}</title>`
    )

    const ogMeta = [
      `  <meta property="og:type" content="website" />`,
      `  <meta property="og:site_name" content="${escapeHtml(siteTitle)}" />`,
      `  <meta property="og:title" content="${jobName}" />`,
      `  <meta property="og:description" content="${teaser}" />`,
      `  <meta property="og:url" content="${canonicalUrl}" />`,
      `  <meta property="og:image" content="${ogImageUrl}" />`,
      `  <meta name="twitter:card" content="summary_large_image" />`,
      `  <meta name="twitter:title" content="${jobName}" />`,
      `  <meta name="twitter:description" content="${teaser}" />`,
      `  <meta name="description" content="${teaser}" />`,
    ].join('\n') + '\n'

    pageHtml = pageHtml.replace('</head>', ogMeta + '</head>')

    const slugDir = join(jobDir, slug)
    mkdirSync(slugDir, { recursive: true })
    writeFileSync(join(slugDir, 'index.html'), pageHtml, 'utf8')
  }

  console.log(`Generated ${generatedSlugs.size} OG pages in ${jobDir}`)

  // Remove stale OG pages for jobs no longer in the export
  let staleCount = 0
  for (const entry of readdirSync(jobDir)) {
    const entryPath = join(jobDir, entry)
    if (statSync(entryPath).isDirectory() && !generatedSlugs.has(entry)) {
      rmSync(entryPath, { recursive: true })
      staleCount++
    }
  }
  if (staleCount) console.log(`Cleaned up ${staleCount} stale OG page(s)`)
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('='.repeat(60))
  console.log('CampOS Job Export Fetcher')
  console.log('='.repeat(60))

  const scriptDir = __dirname
  const projectRoot = dirname(scriptDir)

  const configFile = join(scriptDir, 'config.json')
  const outputDir = process.env.OUTPUT_DIR
  const outputFile = outputDir
    ? join(outputDir, 'jobs-export.json')
    : join(projectRoot, 'public', 'jobs-export.json')

  const config = loadConfig(configFile)

  console.log('\nFetching organization data...')
  const orgData = await fetchJson(config.org_export_url)
  console.log(`Fetched ${orgData.length} organizations`)

  const orgLookup = buildOrgLookup(orgData)
  const orgMap = buildOrgMap(orgLookup)

  console.log('\nFetching job data...')
  const jobData = await fetchJson(config.job_export_url)
  console.log(`Fetched ${jobData.length} jobs`)

  const jobs = processJobs(jobData, orgLookup)
  writeOutput(jobs, orgMap, outputFile)
  generateOgPages(jobs, dirname(outputFile))

  console.log('\n' + '='.repeat(60))
  console.log('Export complete!')
  console.log('='.repeat(60))
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
