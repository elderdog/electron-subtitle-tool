<script setup lang="ts">
import { Message, Modal } from '@arco-design/web-vue'
import { h, ref } from 'vue'

const folderPath = ref<string | undefined>()
const fileList = ref<{ name: string, path: string }[]>([])

const columns = [
  { title: 'Filename', dataIndex: 'name' },
  { title: 'Operate', slotName: 'operate' }
]

function handleChoose() {
  const paths: string[] | undefined = window.ipcRenderer.sendSync('dialog:choose_folder')
  if (!paths)
    return
  folderPath.value = paths[0]

  fileList.value = window.ipcRenderer.sendSync('file:get_subtitle_file_list', folderPath.value)
}

function handleCopy(record: { name: string, path: string }) {
  window.ipcRenderer.sendSync('file:copy_content', record.path)
  Message.success(`content copied from ${record.name}`)
}

function handleView(record: { name: string, path: string }) {
  const blocks: { id: string, time: string, text: string }[] = window.ipcRenderer.sendSync('file:get_content_blocks', record.path)
  Modal.open({
    title: `📁${record.path}➡️${record.name}`,
    content: () => h('ul', blocks.map(({ id, time, text }) => {
      return h('ul', { key: id, class: 'b-b-1px b-b-solid b-b-sky-100' }, [h('p', {}, id), h('p', {}, time), h('p', {}, text)])
    })),
    okText: 'Ok',
    hideCancel: true,
    fullscreen: true
  })
}
</script>

<template>
  <div class="flex flex-col h-full p-10px box-border overflow-hidden">
    <div class="shrink-0">
      <a-button @click="handleChoose">
        Choose Folder
      </a-button>
      <p>Folder Path: {{ folderPath || '--' }}</p>
    </div>
    <a-table
      v-if="folderPath"
      class="grow"
      :columns="columns"
      :data="fileList"
      :pagination="false"
      :scroll="{ y: '10%' }"
    >
      <template #operate="{ record }">
        <a-button @click="handleCopy(record)">
          copy
        </a-button>
        <a-button class="ml-10px" @click="handleView(record)">
          view
        </a-button>
      </template>
    </a-table>
  </div>
</template>
