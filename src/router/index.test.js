import { describe, it, expect, beforeEach } from 'vitest'
import { createRouter, createMemoryHistory } from 'vue-router'

// Vue Router requires routes to have a component (or redirect/children) to
// resolve successfully. Without one the router falls through to the catch-all
// on every navigation, causing an infinite redirect loop. We use a minimal
// stub component here — the production app is fine because App.vue doesn't
// use <router-view> at all, but the router still needs it during navigation.
const Stub = { template: '<div/>' }

// Mirror the production route table exactly, adding Stub where the real app
// has no component so that the router can settle on a matched route.
const routes = [
  { path: '/', component: Stub },
  { path: '/detail/:slug', component: Stub },
  { path: '/en_GB', redirect: '/' },
  { path: '/en_GB/', redirect: '/' },
  { path: '/en_GB/detail/:slug', redirect: to => `/detail/${to.params.slug}` },
  { path: '/:pathMatch(.*)*', redirect: '/' },
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
  })

  describe('query params are preserved', () => {
    it('/?search=brandmand keeps search param', async () => {
      const route = await navigate(router, '/?search=brandmand')
      expect(route.query.search).toBe('brandmand')
    })

    it('/?organization=7 keeps organization param (ignored by app, but not dropped by router)', async () => {
      const route = await navigate(router, '/?organization=7')
      expect(route.query.organization).toBe('7')
    })
  })
})
