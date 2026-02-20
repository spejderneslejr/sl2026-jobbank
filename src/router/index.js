import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/' },
  // CampOS URLs: /detail/:slug and /en_GB/* locale variants
  { path: '/detail/:slug' },
  { path: '/en_GB', redirect: to => ({ path: '/', query: to.query }) },
  { path: '/en_GB/', redirect: to => ({ path: '/', query: to.query }) },
  { path: '/en_GB/detail/:slug', redirect: to => ({ path: `/detail/${to.params.slug}`, query: to.query }) },
  // Catch-all: redirect unknown paths to the listing, preserving query params
  { path: '/:pathMatch(.*)*', redirect: to => ({ path: '/', query: to.query }) },
]

export default createRouter({
  history: createWebHistory(),
  routes,
})
