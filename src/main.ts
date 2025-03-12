import ArcoVue from '@arco-design/web-vue'
import ArcoVueIcon from '@arco-design/web-vue/es/icon'
import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router'
import '@arco-design/web-vue/dist/arco.css'
import 'virtual:uno.css'
import './style.scss'

const app = createApp(App)

app.use(ArcoVue)
app.use(ArcoVueIcon)
app.use(router)

app.mount('#app').$nextTick(() => {
  // Use contextBridge
  window.ipcRenderer.on('main-process-message', (_event, message) => {
    console.log(message)
  })
})
