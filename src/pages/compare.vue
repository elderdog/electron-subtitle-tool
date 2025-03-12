<script setup lang="ts">
import { computed, ref } from 'vue'

const leftLines = ref<string[]>([])
const rightLines = ref<string[]>([])
const diffLineNumbers = computed(() => {
  return getDiffLineNumbers(leftLines.value, rightLines.value)
})

function handleChooseFile(side: string) {
  const lines: string[] = window.ipcRenderer.sendSync('dialog:choose_file')
  switch (side) {
    case 'left':
      leftLines.value = lines
      break
    case 'right':
      rightLines.value = lines
      break
  }
}

function getDiffLineNumbers(lLines: string[], rLines: string[]) {
  if (!lLines.length || !rLines.length)
    return []
  const timeLineNumbers = Array.from({ length: lLines.length / 3 }, (_, i) => i * 3 + 1)
  const diffNumbers: number[] = []
  for (const i of timeLineNumbers) {
    if (lLines[i] !== rLines[i])
      diffNumbers.push(i)
  }
  return diffNumbers
}

// 标志变量：区分用户滚动和程序滚动
let isProgrammaticScroll = false

function onContentScroll(event: Event) {
  if (isProgrammaticScroll)
    return
  isProgrammaticScroll = true
  const target = event.target as HTMLDivElement
  if (target) {
    const scrollTop = target.scrollTop
    if (target.id === 'leftScroll') {
      const right = document.getElementById('rightScroll')
      if (right)
        right.scrollTop = scrollTop
    } else {
      const left = document.getElementById('leftScroll')
      if (left)
        left.scrollTop = scrollTop
    }
  }
  requestAnimationFrame(() => {
    isProgrammaticScroll = false
  })
}
</script>

<template>
  <div class="flex flex-row h-full">
    <div
      v-for="side in ['left', 'right']"
      :key="side"
      class="flex flex-col w-50% m-10px p-[5px_0_0_10px] b-amber b-1px b-solid rd-10px"
    >
      <a-button class="w-100px mb-5px" @click="handleChooseFile(side)">
        Choose
      </a-button>
      <div
        :id="side === 'left' ? 'leftScroll' : 'rightScroll'"
        class="grow overflow-x-hidden overflow-y-auto"
        @scroll="onContentScroll"
      >
        <p
          v-for="(line, i) in side === 'left' ? leftLines : rightLines"
          :key="line"
          class="break-all"
          :class="diffLineNumbers.includes(i) ? 'bg-red' : ''"
        >
          {{ line }}
          <a-divider v-if="i % 3 === 2" />
        </p>
      </div>
    </div>
  </div>
</template>
