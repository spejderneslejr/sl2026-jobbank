import { describe, it, expect, beforeEach } from 'vitest'
import { createRouter, createMemoryHistory } from 'vue-router'

// Mirror the production EmptyView — render: () => null means no DOM output,
// which is correct since App.vue owns all rendering (no <router-view> used).
const EmptyView = { render: () => null }

const routes = [
  { path: '/', component: EmptyView },
  { path: '/detail/:slug', component: EmptyView },
  { path: '/en_GB', redirect: to => ({ path: '/', query: to.query }) },
  { path: '/en_GB/', redirect: to => ({ path: '/', query: to.query }) },
  { path: '/en_GB/detail/:slug', redirect: to => ({ path: `/detail/${to.params.slug}`, query: to.query }) },
  { path: '/:pathMatch(.*)*', redirect: to => ({ path: '/', query: to.query }) },
]

function makeRouter() {
  // createMemoryHistory avoids needing a real browser URL bar in tests
  return createRouter({ history: createMemoryHistory(), routes })
}

async function navigate(router, path) {
  await router.push(path)
  return router.currentRoute.value
}

describe('router redirects', () => {
  let router

  beforeEach(() => {
    router = makeRouter()
  })

  describe('normal routes (no redirect)', () => {
    it('/ stays at /', async () => {
      const route = await navigate(router, '/')
      expect(route.path).toBe('/')
    })

    it('/detail/409 stays at /detail/409', async () => {
      const route = await navigate(router, '/detail/409')
      expect(route.path).toBe('/detail/409')
      expect(route.params.slug).toBe('409')
    })

    it('/detail/konsulent-i-bredygtighedsudvalget-409 stays at that path', async () => {
      const route = await navigate(router, '/detail/konsulent-i-bredygtighedsudvalget-409')
      expect(route.path).toBe('/detail/konsulent-i-bredygtighedsudvalget-409')
      expect(route.params.slug).toBe('konsulent-i-bredygtighedsudvalget-409')
    })
  })

  describe('en_GB redirects', () => {
    it('/en_GB redirects to /', async () => {
      const route = await navigate(router, '/en_GB')
      expect(route.path).toBe('/')
    })

    it('/en_GB/ redirects to /', async () => {
      const route = await navigate(router, '/en_GB/')
      expect(route.path).toBe('/')
    })

    it('/en_GB/detail/409 redirects to /detail/409', async () => {
      const route = await navigate(router, '/en_GB/detail/409')
      expect(route.path).toBe('/detail/409')
    })

    it('/en_GB/detail/slug-409 redirects to /detail/slug-409', async () => {
      const route = await navigate(router, '/en_GB/detail/slug-409')
      expect(route.path).toBe('/detail/slug-409')
    })

    it('/en_GB/?organization=7 redirects to / and preserves organization param', async () => {
      const route = await navigate(router, '/en_GB/?organization=7')
      expect(route.path).toBe('/')
      expect(route.query.organization).toBe('7')
    })

    it('/en_GB/detail/slug-409?organization=7 redirects to /detail/slug-409 and preserves organization param', async () => {
      const route = await navigate(router, '/en_GB/detail/slug-409?organization=7')
      expect(route.path).toBe('/detail/slug-409')
      expect(route.query.organization).toBe('7')
    })
  })

  describe('catch-all redirects unknown paths to /', () => {
    it('/unknown-path redirects to /', async () => {
      const route = await navigate(router, '/unknown-path')
      expect(route.path).toBe('/')
    })

    it('/jobs/detail/409 redirects to /', async () => {
      const route = await navigate(router, '/jobs/detail/409')
      expect(route.path).toBe('/')
    })

    it('/unknown-path?organization=7 redirects to / and preserves organization param', async () => {
      const route = await navigate(router, '/unknown-path?organization=7')
      expect(route.path).toBe('/')
      expect(route.query.organization).toBe('7')
    })
  })

  describe('query params are preserved on normal routes', () => {
    it('/?search=brandmand keeps search param', async () => {
      const route = await navigate(router, '/?search=brandmand')
      expect(route.query.search).toBe('brandmand')
    })

    it('/?organization=7 keeps organization param', async () => {
      const route = await navigate(router, '/?organization=7')
      expect(route.query.organization).toBe('7')
    })
  })
})
