/**
 * 应用入口文件
 */

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'

// 引入样式
import './styles/main.css'

// 创建应用实例
const app = createApp(App)

// 使用Pinia状态管理
const pinia = createPinia()
app.use(pinia)

// 使用Vue Router
app.use(router)

// 全局错误捕获：避免页面直接白屏
app.config.errorHandler = (err) => {
  // eslint-disable-next-line no-console
  console.error('[Vue error]', err)
  try {
    // 懒加载 store，避免入口循环依赖
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { useAppStore } = require('@/stores/app')
    const appStore = useAppStore(pinia)
    appStore.notifyError('页面发生错误', err instanceof Error ? err.message : String(err))
  } catch {
    // ignore
  }
}

window.addEventListener('error', (e) => {
  // eslint-disable-next-line no-console
  console.error('[Window error]', e.error || e.message)
})

window.addEventListener('unhandledrejection', (e: PromiseRejectionEvent) => {
  // eslint-disable-next-line no-console
  console.error('[Unhandled rejection]', e.reason)
})

// 挂载应用
app.mount('#app')
