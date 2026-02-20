import { createRouter, createWebHistory } from 'vue-router'

// App.vue owns all rendering — no <router-view> is used. The router exists
// purely for URL state management. Routes still need a component though;
// without one the router can't resolve a match and falls through to the
// catch-all, which redirects to '/', creating an infinite redirect loop.
const EmptyView = { render: () => null }

const routes = [
  { path: '/', component: EmptyView },
  { path: '/job/:slug', component: EmptyView },                                          // canonical
  { path: '/detail/:slug', redirect: to => ({ path: `/job/${to.params.slug}` }) },      // backward compat (no query — CampOS links won't have jobbank params)
  { path: '/en_GB', redirect: to => ({ path: '/', query: to.query }) },
  { path: '/en_GB/', redirect: to => ({ path: '/', query: to.query }) },
  { path: '/en_GB/job/:slug',    redirect: to => ({ path: `/job/${to.params.slug}`, query: to.query }) },
  { path: '/en_GB/detail/:slug', redirect: to => ({ path: `/job/${to.params.slug}`, query: to.query }) }, // backward compat
  { path: '/da_DK', redirect: to => ({ path: '/', query: to.query }) },
  { path: '/da_DK/', redirect: to => ({ path: '/', query: to.query }) },
  { path: '/da_DK/job/:slug',    redirect: to => ({ path: `/job/${to.params.slug}`, query: to.query }) },
  { path: '/da_DK/detail/:slug', redirect: to => ({ path: `/job/${to.params.slug}`, query: to.query }) }, // backward compat
  // Catch-all: redirect unknown paths to the listing, preserving query params
  { path: '/:pathMatch(.*)*', redirect: to => ({ path: '/', query: to.query }) },
]

export default createRouter({
  history: createWebHistory(),
  routes,
})
