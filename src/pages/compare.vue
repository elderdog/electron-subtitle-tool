<script setup lang="ts">
import SublimeSvg from '@/assets/sublime.svg'
import { computed, ref } from 'vue'

interface Block { id: string, time: string, text: string }

const shouldTrim = ref<boolean>(true)
const leftFilepath = ref<string | undefined>()
const rightFilepath = ref<string | undefined>()
const leftBlocks = ref<Block[]>([])
const rightBlocks = ref<Block[]>([])
const diffLineNumbers = computed(() => {
  return getDiffBlockNumbers(leftBlocks.value, rightBlocks.value)
})

function handleChooseFile(side: string) {
  type Data = { path: string, blocks: Block[] } | null
  const data: Data = window.ipcRenderer.sendSync('dialog:choose_file')
  if (!data)
    return
  switch (side) {
    case 'left':
      leftFilepath.value = data.path
      leftBlocks.value = data.blocks
      break
    case 'right':
      rightFilepath.value = data.path
      rightBlocks.value = data.blocks
      break
  }
}

function handleReload(side: string) {
  switch (side) {
    case 'left':
      if (!leftFilepath.value)
        return
      leftBlocks.value = window.ipcRenderer.sendSync('file:get_content_blocks', leftFilepath.value)
      break
    case 'right':
      if (!rightFilepath.value)
        return
      rightBlocks.value = window.ipcRenderer.sendSync('file:get_content_blocks', rightFilepath.value)
      break
  }
}

function handleClear(side: string) {
  switch (side) {
    case 'left':
      leftFilepath.value = undefined
      leftBlocks.value = []
      break
    case 'right':
      rightFilepath.value = undefined
      rightBlocks.value = []
      break
  }
}

function handleOpen(side: string) {
  const filepath = side === 'left' ? leftFilepath.value : rightFilepath.value
  if (!filepath)
    return
  window.ipcRenderer.sendSync('file:open_via_sublime', filepath)
}

function getDiffBlockNumbers(lBlocks: Block[], rBlocks: Block[]) {
  if (!lBlocks.length || !rBlocks.length)
    return []
  const diffNumbers: number[] = []
  for (let i = 0; i < lBlocks.length; i++) {
    const lBlock = lBlocks[i]
    const rBlock = rBlocks[i]
    if (!rBlock)
      break
    const lTime = shouldTrim.value ? lBlock.time.trimEnd() : lBlock.time
    const rTime = shouldTrim.value ? rBlock.time.trimEnd() : rBlock.time
    if (lTime !== rTime)
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
  <div class="flex flex-col h-full">
    <div class="mb-5px">
      Trim: <a-switch v-model="shouldTrim" /><i class="text-12px text-gray-6 ml-5px">if on, trailing spaces of line will be ignored</i>
    </div>
    <div class="flex flex-row grow justify-between overflow-hidden">
      <div
        v-for="side in ['left', 'right']"
        :key="side"
        class="flex flex-col box-border w-[calc(50%-5px)] p-[5px_0_0_10px] b-gray-3 b-1px b-solid rd-10px"
      >
        <p class="m-[0_0_5px]">
          📝: <span class="text-gray-6">{{ side === 'left' ? leftFilepath || '--' : rightFilepath || '--' }}</span>
        </p>
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
          <a-button class="ml-5px" @click="handleOpen(side)">
            Open <SublimeSvg />
          </a-button>
        </div>
        <div
          :id="side === 'left' ? 'leftScroll' : 'rightScroll'"
          class="grow overflow-x-hidden overflow-y-auto"
          @scroll="onContentScroll"
        >
          <div
            v-for="(block, i) in side === 'left' ? leftBlocks : rightBlocks"
            :key="block.id"
            class="break-all"
          >
            <p>{{ block.id }}</p>
            <p :class="diffLineNumbers.includes(i) ? 'bg-red' : ''">
              {{ block.time }}
            </p>
            <p>{{ block.text }}</p>
            <a-divider />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
