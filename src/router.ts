import { setupLayouts } from 'virtual:generated-layouts'
import { createRouter, createWebHistory } from 'vue-router'
import { handleHotUpdate, routes } from 'vue-router/auto-routes'

routes.push({
  path: '/',
  redirect: _to => '/browser'
})

export const router = createRouter({
  history: createWebHistory(),
  routes: setupLayouts(routes)
})

// This will update routes at runtime without reloading the page
if (import.meta.hot) {
  handleHotUpdate(router)
}
