import { describe, it, expect, vi } from 'vitest'
import AppVue from './App.vue'

const { cleanupUrl, parseSlugToId, buildJobSlug } = AppVue.methods

const mockJobs = [
  { id: 409, name: 'Konsulent i bæredygtighedsudvalget' },
  { id: 12,  name: 'Job Twelve' },
]

// Expected canonical slug for job 409
const slug409 = buildJobSlug(mockJobs[0])  // 'konsulent-i-bredygtighedsudvalget-409'
const slug12  = buildJobSlug(mockJobs[1])  // 'job-twelve-12'

// Build a minimal fake 'this' context for cleanupUrl
function makeCtx({ slug = '', query = {}, jobs = mockJobs } = {}) {
  return {
    $route: { params: { slug }, query },
    $router: { replace: vi.fn() },
    allJobs: jobs,
    parseSlugToId,
    buildJobSlug,
  }
}

describe('cleanupUrl', () => {
  describe('canonical URLs — no replace called', () => {
    it('/ with no query params', () => {
      const ctx = makeCtx()
      cleanupUrl.call(ctx)
      expect(ctx.$router.replace).not.toHaveBeenCalled()
    })

    it('/job/<canonical-slug-409> with no query params', () => {
      const ctx = makeCtx({ slug: slug409 })
      cleanupUrl.call(ctx)
      expect(ctx.$router.replace).not.toHaveBeenCalled()
    })

    it('/job/<canonical-slug-12> with no query params', () => {
      const ctx = makeCtx({ slug: slug12 })
      cleanupUrl.call(ctx)
      expect(ctx.$router.replace).not.toHaveBeenCalled()
    })
  })

  describe('listing URL with query params → /', () => {
    it('/?search=brandmand', () => {
      const ctx = makeCtx({ query: { search: 'brandmand' } })
      cleanupUrl.call(ctx)
      expect(ctx.$router.replace).toHaveBeenCalledWith('/')
    })

    it('/?organization=7', () => {
      const ctx = makeCtx({ query: { organization: '7' } })
      cleanupUrl.call(ctx)
      expect(ctx.$router.replace).toHaveBeenCalledWith('/')
    })
  })

  describe('numeric-only slug → pretty canonical', () => {
    it('/job/409 → /job/<canonical-slug-409>', () => {
      const ctx = makeCtx({ slug: '409' })
      cleanupUrl.call(ctx)
      expect(ctx.$router.replace).toHaveBeenCalledWith('/job/' + slug409)
    })

    it('/job/12 → /job/<canonical-slug-12>', () => {
      const ctx = makeCtx({ slug: '12' })
      cleanupUrl.call(ctx)
      expect(ctx.$router.replace).toHaveBeenCalledWith('/job/' + slug12)
    })
  })

  describe('wrong name in slug → pretty canonical', () => {
    it('/job/wrong-name-409 → /job/<canonical-slug-409>', () => {
      const ctx = makeCtx({ slug: 'wrong-name-409' })
      cleanupUrl.call(ctx)
      expect(ctx.$router.replace).toHaveBeenCalledWith('/job/' + slug409)
    })
  })

  describe('/detail/ arriving after router redirect → pretty canonical', () => {
    // After router redirects /detail/409 → /job/409, cleanupUrl sees slug='409'
    it('/job/409 (arrived via /detail/409 redirect) → /job/<canonical>', () => {
      const ctx = makeCtx({ slug: '409' })
      cleanupUrl.call(ctx)
      expect(ctx.$router.replace).toHaveBeenCalledWith('/job/' + slug409)
    })
  })

  describe('job URL with query params → stripped to canonical', () => {
    it('/job/409?organization=7 → /job/<canonical>', () => {
      const ctx = makeCtx({ slug: '409', query: { organization: '7' } })
      cleanupUrl.call(ctx)
      expect(ctx.$router.replace).toHaveBeenCalledWith('/job/' + slug409)
    })

    it('/job/slug-409?search=is → /job/<canonical>', () => {
      const ctx = makeCtx({ slug: 'slug-409', query: { search: 'is' } })
      cleanupUrl.call(ctx)
      expect(ctx.$router.replace).toHaveBeenCalledWith('/job/' + slug409)
    })
  })

  describe('unparseable slug — no replace called', () => {
    it('/job/no-numbers-here', () => {
      const ctx = makeCtx({ slug: 'no-numbers-here' })
      cleanupUrl.call(ctx)
      expect(ctx.$router.replace).not.toHaveBeenCalled()
    })
  })

  describe('unknown job id — no replace called', () => {
    it('/job/999 (id not in allJobs)', () => {
      const ctx = makeCtx({ slug: '999' })
      cleanupUrl.call(ctx)
      expect(ctx.$router.replace).not.toHaveBeenCalled()
    })
  })
})
