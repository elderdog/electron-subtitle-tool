<script setup lang="ts">
import { computed, ref } from 'vue'

const leftFilepath = ref<string | undefined>()
const rightFilepath = ref<string | undefined>()
const leftLines = ref<string[]>([])
const rightLines = ref<string[]>([])
const diffLineNumbers = computed(() => {
  return getDiffLineNumbers(leftLines.value, rightLines.value)
})

function handleChooseFile(side: string) {
  type Data = { path: string, lines: string[] } | null
  const data: Data = window.ipcRenderer.sendSync('dialog:choose_file')
  if (!data)
    return
  switch (side) {
    case 'left':
      leftFilepath.value = data.path
      leftLines.value = data.lines
      break
    case 'right':
      rightFilepath.value = data.path
      rightLines.value = data.lines
      break
  }
}

function handleReload(side: string) {
  switch (side) {
    case 'left':
      if (!leftFilepath.value)
        return
      leftLines.value = window.ipcRenderer.sendSync('file:get_content_lines', leftFilepath.value)
      break
    case 'right':
      if (!rightFilepath.value)
        return
      rightLines.value = window.ipcRenderer.sendSync('file:get_content_lines', rightFilepath.value)
      break
  }
}

function handleClear(side: string) {
  switch (side) {
    case 'left':
      leftFilepath.value = undefined
      leftLines.value = []
      break
    case 'right':
      rightFilepath.value = undefined
      rightLines.value = []
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
  <div class="flex flex-row justify-between h-full">
    <div
      v-for="side in ['left', 'right']"
      :key="side"
      class="flex flex-col box-border w-[calc(50%-5px)] p-[5px_0_0_10px] b-gray-3 b-1px b-solid rd-10px"
    >
      <div class="mb-5px">
        <a-button @click="handleChooseFile(side)">
          Choose
        </a-button>
        <a-button class="ml-5px" @click="handleReload(side)">
          Reload
        </a-button>
        <a-button class="ml-5px" @click="handleClear(side)">
          Clear
        </a-button>
      </div>
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
