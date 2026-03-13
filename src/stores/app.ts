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
        // 刷新积分
        await fetchPoints()
        
        return {
          success: true,
          message: response.msg,
        }
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
    
    notifications.value.push({
      id,
      type,
      title,
      message,
      duration,
    })
    
    // 自动移除
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id)
      }, duration)
    }
    
    return id
  }
  
  /**
   * 移除通知
   */
  const removeNotification = (id: string) => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }
  
  /**
   * 快捷方法 - 成功通知
   */
  const notifySuccess = (title: string, message?: string) => {
    return showNotification('success', title, message)
  }
  
  /**
   * 快捷方法 - 错误通知
   */
  const notifyError = (title: string, message?: string) => {
    return showNotification('error', title, message, 5000)
  }
  
  /**
   * 快捷方法 - 警告通知
   */
  const notifyWarning = (title: string, message?: string) => {
    return showNotification('warning', title, message, 4000)
  }
  
  /**
   * 快捷方法 - 信息通知
   */
  const notifyInfo = (title: string, message?: string) => {
    return showNotification('info', title, message)
  }
  
  return {
    // 状态
    sidebarCollapsed,
    points,
    globalLoading,
    notifications,
    
    // 方法
    toggleSidebar,
    setSidebarCollapsed,
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
