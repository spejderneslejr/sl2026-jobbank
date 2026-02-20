import { createRouter, createWebHistory } from 'vue-router'

// App.vue owns all rendering — no <router-view> is used. The router exists
// purely for URL state management. Routes still need a component though;
// without one the router can't resolve a match and falls through to the
// catch-all, which redirects to '/', creating an infinite redirect loop.
const EmptyView = { render: () => null }

const routes = [
  { path: '/', component: EmptyView },
  // CampOS URLs: /detail/:slug and /en_GB/* locale variants
  { path: '/detail/:slug', component: EmptyView },
  { path: '/en_GB', redirect: to => ({ path: '/', query: to.query }) },
  { path: '/en_GB/', redirect: to => ({ path: '/', query: to.query }) },
  { path: '/en_GB/detail/:slug', redirect: to => ({ path: `/detail/${to.params.slug}`, query: to.query }) },
  { path: '/da_DK', redirect: to => ({ path: '/', query: to.query }) },
  { path: '/da_DK/', redirect: to => ({ path: '/', query: to.query }) },
  { path: '/da_DK/detail/:slug', redirect: to => ({ path: `/detail/${to.params.slug}`, query: to.query }) },
  // Catch-all: redirect unknown paths to the listing, preserving query params
  { path: '/:pathMatch(.*)*', redirect: to => ({ path: '/', query: to.query }) },
]

export default createRouter({
  history: createWebHistory(),
  routes,
})
