import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/' },
  // CampOS URLs: /detail/:slug and /en_GB/* locale variants
  { path: '/detail/:slug' },
  { path: '/en_GB', redirect: '/' },
  { path: '/en_GB/', redirect: '/' },
  { path: '/en_GB/detail/:slug', redirect: to => `/detail/${to.params.slug}` },
  // Catch-all: redirect unknown paths to the listing
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

export default createRouter({
  history: createWebHistory(),
  routes,
})
