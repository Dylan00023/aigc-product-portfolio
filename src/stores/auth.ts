/**
 * 认证状态管理
 * 管理用户登录状态、Token、设备信息等
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '@/api'
import type { Device, LoginParams, RegisterParams } from '@/types/api'

const TOKEN_KEY = 'access_token'
const REFRESH_TOKEN_KEY = 'refresh_token'
const DEVICE_ID_KEY = 'device_id'

export const useAuthStore = defineStore('auth', () => {
  // ==================== 状态 ====================
  
  /** 访问令牌 */
  const accessToken = ref<string | null>(localStorage.getItem(TOKEN_KEY))
  
  /** 刷新令牌 */
  const refreshToken = ref<string | null>(localStorage.getItem(REFRESH_TOKEN_KEY))
  
  /** 当前设备ID */
  const deviceId = ref<string | null>(localStorage.getItem(DEVICE_ID_KEY))
  
  /** 设备列表 */
  const devices = ref<Device[]>([])
  
  /** 加载状态 */
  const loading = ref(false)
  
  /** 错误信息 */
  const error = ref<string | null>(null)
  
  // ==================== 计算属性 ====================
  
  /** 是否已登录 */
  const isAuthenticated = computed(() => !!accessToken.value)
  
  /** 当前设备信息 */
  const currentDevice = computed(() => {
    if (!deviceId.value) return null
    return devices.value.find(d => d.device_id === deviceId.value)
  })
  
  // ==================== 方法 ====================
  
  /**
   * 保存Token到本地存储
   */
  const saveTokens = (access: string, refresh: string, device?: string) => {
    accessToken.value = access
    refreshToken.value = refresh
    
    localStorage.setItem(TOKEN_KEY, access)
    localStorage.setItem(REFRESH_TOKEN_KEY, refresh)
    
    if (device) {
      deviceId.value = device
      localStorage.setItem(DEVICE_ID_KEY, device)
    }
  }
  
  /**
   * 清除本地存储的Token
   */
  const clearTokens = () => {
    accessToken.value = null
    refreshToken.value = null
    deviceId.value = null
    
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(DEVICE_ID_KEY)
  }
  
  /**
   * 用户注册
   */
  const register = async (params: RegisterParams) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await authApi.register(params)
      
      if (response.code === 200) {
        return { success: true, message: response.msg }
      } else {
        throw new Error(response.msg)
      }
    } catch (err: any) {
      error.value = err.response?.data?.msg || err.message || '注册失败'
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }
  
  /**
   * 用户登录
   */
  const login = async (params: LoginParams) => {
    loading.value = true
    error.value = null
    
    try {
      // 生成设备ID（如果未提供）
      if (!params.device_id) {
        params.device_id = generateDeviceId()
      }
      if (!params.device_name) {
        params.device_name = getDeviceName()
      }
      
      const response = await authApi.login(params)
      
      if (response.code === 200 && response.data) {
        // 保存Token
        saveTokens(
          response.data.access_token,
          response.data.refresh_token,
          response.data.device_id
        )
        
        return { success: true, data: response.data }
      } else {
        throw new Error(response.msg)
      }
    } catch (err: any) {
      error.value = err.response?.data?.msg || err.message || '登录失败'
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }
  
  /**
   * 刷新访问令牌
   */
  const refreshAccessToken = async () => {
    if (!refreshToken.value) {
      throw new Error('No refresh token available')
    }
    
    try {
      const response = await authApi.refreshToken({
        refresh_token: refreshToken.value,
      })
      
      if (response.code === 200 && response.data) {
        accessToken.value = response.data.access_token
        localStorage.setItem(TOKEN_KEY, response.data.access_token)
        
        return response.data.access_token
      } else {
        throw new Error(response.msg)
      }
    } catch (err) {
      // 刷新失败，清除登录状态
      clearTokens()
      throw err
    }
  }
  
  /**
   * 退出登录
   */
  const logout = async (allDevices = false) => {
    try {
      if (allDevices) {
        await authApi.logoutAll()
      } else {
        await authApi.logoutOthers()
      }
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      clearTokens()
      devices.value = []
    }
  }
  
  /**
   * 获取设备列表
   */
  const fetchDevices = async () => {
    loading.value = true
    
    try {
      const response = await authApi.getDevices()
      
      if (response.code === 200 && response.data) {
        devices.value = response.data
      }
    } catch (err) {
      console.error('Fetch devices error:', err)
    } finally {
      loading.value = false
    }
  }
  
  /**
   * 踢下线指定设备
   */
  const kickDevice = async (deviceId: string) => {
    try {
      const response = await authApi.logoutOne({ device_id: deviceId })
      
      if (response.code === 200) {
        // 刷新设备列表
        await fetchDevices()
        return { success: true }
      } else {
        throw new Error(response.msg)
      }
    } catch (err: any) {
      return { success: false, message: err.message }
    }
  }
  
  // ==================== 工具函数 ====================
  
  /**
   * 生成设备ID
   */
  const generateDeviceId = () => {
    return `web_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
  
  /**
   * 获取设备名称
   */
  const getDeviceName = () => {
    const ua = navigator.userAgent
    let name = 'Web Browser'
    
    if (ua.includes('Chrome')) name = 'Chrome'
    else if (ua.includes('Firefox')) name = 'Firefox'
    else if (ua.includes('Safari')) name = 'Safari'
    else if (ua.includes('Edge')) name = 'Edge'
    
    return `${name} - ${navigator.platform}`
  }
  
  return {
    // 状态
    accessToken,
    refreshToken,
    deviceId,
    devices,
    loading,
    error,
    
    // 计算属性
    isAuthenticated,
    currentDevice,
    
    // 方法
    register,
    login,
    logout,
    refreshAccessToken,
    fetchDevices,
    kickDevice,
    clearTokens,
  }
})
