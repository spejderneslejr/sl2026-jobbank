import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index.js'
import './style.css'

const app = createApp(App)
app.use(router)
// Wait for the router to resolve the initial route before mounting.
// Without this, components render before this.$route.query is populated,
// so URL params like ?search= don't reach their props at mount time.
router.isReady().then(() => app.mount('#app'))
