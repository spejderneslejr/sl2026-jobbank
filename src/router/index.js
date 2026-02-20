import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/' },
  { path: '/detail/:slug' },
  { path: '/en_GB', redirect: '/' },
  { path: '/en_GB/', redirect: '/' },
  { path: '/en_GB/detail/:slug', redirect: to => `/detail/${to.params.slug}` },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

export default createRouter({
  history: createWebHistory(),
  routes,
})
