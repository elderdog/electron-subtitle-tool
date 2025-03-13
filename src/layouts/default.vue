<script setup lang="ts">
import { useRouter } from 'vue-router/auto'

const router = useRouter()
const buttons = [
  { title: 'Browser', path: '/browser' },
  { title: 'Compare', path: '/compare' },
  { title: 'Usage', path: '/usage' }
]

function isActive(path: string) {
  return router.currentRoute.value.path === path
}
</script>

<template>
  <a-layout class="w-full h-full">
    <a-layout-sider style="width: 120px;" class="bg-gray-2 pt-5px">
      <div
        v-for="btn in buttons"
        :key="btn.title"
        :class="isActive(btn.path) ? 'bg-gray-3 font-bold' : 'hover:bg-gray-3/50'"
        class="m-5px p-[5px_10px] cursor-pointer lh-20px rd-4px text-gray-9"
        @click="router.push(btn.path)"
      >
        {{ btn.title }}
      </div>
    </a-layout-sider>
    <a-layout-content class="p-10px">
      <router-view v-slot="{ Component }">
        <keep-alive>
          <component :is="Component" />
        </keep-alive>
      </router-view>
    </a-layout-content>
  </a-layout>
</template>
