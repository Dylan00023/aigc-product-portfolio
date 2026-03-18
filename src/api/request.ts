/**
 * Axios HTTP客户端配置
 * 统一的请求拦截、响应拦截、错误处理
 */

import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios'
import { useAuthStore } from '@/stores/auth'

// API基础URL - 从环境变量或默认值
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://192.168.1.98:8020'

/**
 * 创建Axios实例
 */
const http: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // 30秒超时
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * 请求拦截器 - 自动添加Token
 */
http.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore()
    
    // 如果有access_token，添加到请求头
    if (authStore.accessToken) {
      config.headers.Authorization = `Bearer ${authStore.accessToken}`
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

/**
 * 响应拦截器 - 统一错误处理和Token刷新
 */
http.interceptors.response.use(
  (response: AxiosResponse) => {
    // 直接返回响应数据
    return response
  },
  async (error) => {
    const originalRequest = error.config
    
    // 如果是401错误且有refresh_token，尝试刷新token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      try {
        const authStore = useAuthStore()
        
        // 开发模式 mock token，不尝试刷新，直接跳过
        if (authStore.accessToken?.startsWith('dev_mock_')) {
          return Promise.reject(error)
        }

        // 刷新token
        await authStore.refreshAccessToken()
        
        // 重新发起原请求
        originalRequest.headers.Authorization = `Bearer ${authStore.accessToken}`
        return http(originalRequest)
      } catch (refreshError) {
        // 刷新失败，清除登录状态，跳转到登录页
        const authStore = useAuthStore()
        authStore.logout()
        
        // 跳转到登录页
        window.location.href = '/login'
        
        return Promise.reject(refreshError)
      }
    }
    
    // 其他错误，统一处理
    const errorMessage = error.response?.data?.msg || error.message || '请求失败'
    
    // 可以在这里添加全局错误提示
    console.error('API Error:', errorMessage)
    
    return Promise.reject(error)
  }
)

/**
 * 封装请求方法
 */
export const request = {
  /**
   * GET请求
   */
  get<T = any>(url: string, params?: any, config?: AxiosRequestConfig): Promise<T> {
    return http.get(url, { params, ...config }).then(res => res.data)
  },
  
  /**
   * POST请求（JSON格式）
   */
  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return http.post(url, data, config).then(res => res.data)
  },
  
  /**
   * POST请求（Form表单格式）
   */
  postForm<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const formData = new URLSearchParams()
    
    // 将对象转换为URLSearchParams
    if (data) {
      Object.keys(data).forEach(key => {
        if (data[key] !== undefined && data[key] !== null) {
          formData.append(key, data[key])
        }
      })
    }
    
    return http.post(url, formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      ...config,
    }).then(res => res.data)
  },
  
  /**
   * POST请求（Multipart文件上传）
   */
  upload<T = any>(url: string, data: FormData, config?: AxiosRequestConfig): Promise<T> {
    return http.post(url, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      ...config,
    }).then(res => res.data)
  },
  
  /**
   * PUT请求
   */
  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return http.put(url, data, config).then(res => res.data)
  },
  
  /**
   * DELETE请求
   */
  delete<T = any>(url: string, params?: any, config?: AxiosRequestConfig): Promise<T> {
    return http.delete(url, { params, ...config }).then(res => res.data)
  },
}

export default http
