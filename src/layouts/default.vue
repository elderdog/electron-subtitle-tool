<script setup lang="ts">
import { useRouter } from 'vue-router/auto'

const router = useRouter()
const buttons = [
  { title: 'Browser', path: '/browser' },
  { title: 'Compare', path: '/compare' }
]
const activeRouteClass = 'important-bg-[#434866] important-text-[#138BEC]'

function isActive(path: string) {
  return router.currentRoute.value.path === path
}
</script>

<template>
  <a-layout class="w-full h-full">
    <a-layout-sider style="width: 100px; background-color: rgb(var(--cyan-6));">
      <a-button
        v-for="btn in buttons"
        :key="btn.title"
        :class="isActive(btn.path) ? activeRouteClass : ''" type="text" size="large" class="route-btn m-t-[16px]"
        @click="router.push(btn.path)"
      >
        {{ btn.title }}
      </a-button>
    </a-layout-sider>
    <a-layout-content>
      <router-view />
    </a-layout-content>
  </a-layout>
</template>
