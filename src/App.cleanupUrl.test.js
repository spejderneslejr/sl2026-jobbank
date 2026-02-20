import { describe, it, expect, vi } from 'vitest'
import AppVue from './App.vue'

const { cleanupUrl, parseSlugToId } = AppVue.methods

// Build a minimal fake 'this' context for cleanupUrl
function makeCtx({ slug = '', query = {} } = {}) {
  return {
    $route: { params: { slug }, query },
    $router: { replace: vi.fn() },
    parseSlugToId,
  }
}

describe('cleanupUrl', () => {
  describe('canonical URLs — no replace called', () => {
    it('/ with no query params', () => {
      const ctx = makeCtx()
      cleanupUrl.call(ctx)
      expect(ctx.$router.replace).not.toHaveBeenCalled()
    })

    it('/detail/409 with no query params', () => {
      const ctx = makeCtx({ slug: '409' })
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

  describe('full slug → numeric id', () => {
    it('/detail/konsulent-i-bredygtighedsudvalget-409 → /detail/409', () => {
      const ctx = makeCtx({ slug: 'konsulent-i-bredygtighedsudvalget-409' })
      cleanupUrl.call(ctx)
      expect(ctx.$router.replace).toHaveBeenCalledWith('/detail/409')
    })

    it('/detail/job-12 → /detail/12', () => {
      const ctx = makeCtx({ slug: 'job-12' })
      cleanupUrl.call(ctx)
      expect(ctx.$router.replace).toHaveBeenCalledWith('/detail/12')
    })
  })

  describe('detail URL with query params → stripped', () => {
    it('/detail/409?organization=7 → /detail/409', () => {
      const ctx = makeCtx({ slug: '409', query: { organization: '7' } })
      cleanupUrl.call(ctx)
      expect(ctx.$router.replace).toHaveBeenCalledWith('/detail/409')
    })

    it('/detail/slug-409?search=is → /detail/409', () => {
      const ctx = makeCtx({ slug: 'slug-409', query: { search: 'is' } })
      cleanupUrl.call(ctx)
      expect(ctx.$router.replace).toHaveBeenCalledWith('/detail/409')
    })
  })

  describe('unparseable slug — no replace called', () => {
    it('/detail/no-numbers-here', () => {
      const ctx = makeCtx({ slug: 'no-numbers-here' })
      cleanupUrl.call(ctx)
      expect(ctx.$router.replace).not.toHaveBeenCalled()
    })
  })
})
