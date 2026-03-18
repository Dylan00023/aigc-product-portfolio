/**
 * 应用状态管理
 * 管理侧边栏状态、积分、全局加载状态等
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { pointsApi } from '@/api'

export const useAppStore = defineStore('app', () => {
  // ==================== 状态 ====================

  /** 侧边栏是否折叠 */
  const sidebarCollapsed = ref(false)

  /** 是否为暗色模式（true=暗色，false=日间） */
  const isDark = ref<boolean>(
    localStorage.getItem('theme') !== 'light'
  )

  // 初始化时同步 class 到 <html>
  const _applyTheme = (dark: boolean) => {
    if (dark) {
      document.documentElement.classList.add('dark')
      document.documentElement.classList.remove('light')
    } else {
      document.documentElement.classList.remove('dark')
      document.documentElement.classList.add('light')
    }
  }
  _applyTheme(isDark.value)

  /**
   * 切换日间/夜间模式
   */
  const toggleTheme = () => {
    isDark.value = !isDark.value
    localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
    _applyTheme(isDark.value)
  }

  /** 积分余额 */
  const points = ref(0)

  /** 全局加载状态 */
  const globalLoading = ref(false)

  /** 通知消息列表 */
  const notifications = ref<Array<{
    id: string
    type: 'success' | 'error' | 'warning' | 'info'
    title: string
    message?: string
    duration?: number
  }>>([])

  // ==================== 方法 ====================

  /**
   * 切换侧边栏折叠状态
   */
  const toggleSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  /**
   * 设置侧边栏状态
   */
  const setSidebarCollapsed = (collapsed: boolean) => {
    sidebarCollapsed.value = collapsed
  }

  /**
   * 获取积分余额
   */
  const fetchPoints = async () => {
    try {
      const response = await pointsApi.getPoints()
      if (response.code === 200 && response.data) {
        points.value = response.data.points
      }
    } catch (err) {
      console.error('Fetch points error:', err)
    }
  }

  /**
   * 卡密充值
   */
  const useKami = async (cardNumber: string) => {
    try {
      const response = await pointsApi.useKami({ card_number: cardNumber })
      if (response.code === 200) {
        await fetchPoints()
        return { success: true, message: response.msg }
      } else {
        throw new Error(response.msg)
      }
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.msg || err.message || '充值失败',
      }
    }
  }

  /**
   * 显示通知
   */
  const showNotification = (
    type: 'success' | 'error' | 'warning' | 'info',
    title: string,
    message?: string,
    duration = 3000
  ) => {
    const id = Date.now().toString()
    notifications.value.push({ id, type, title, message, duration })
    if (duration > 0) {
      setTimeout(() => removeNotification(id), duration)
    }
    return id
  }

  /**
   * 移除通知
   */
  const removeNotification = (id: string) => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) notifications.value.splice(index, 1)
  }

  const notifySuccess = (title: string, message?: string) =>
    showNotification('success', title, message)

  const notifyError = (title: string, message?: string) =>
    showNotification('error', title, message, 5000)

  const notifyWarning = (title: string, message?: string) =>
    showNotification('warning', title, message, 4000)

  const notifyInfo = (title: string, message?: string) =>
    showNotification('info', title, message)

  return {
    // 状态
    sidebarCollapsed,
    points,
    globalLoading,
    notifications,
    isDark,

    // 方法
    toggleSidebar,
    setSidebarCollapsed,
    toggleTheme,
    fetchPoints,
    useKami,
    showNotification,
    removeNotification,
    notifySuccess,
    notifyError,
    notifyWarning,
    notifyInfo,
  }
})
