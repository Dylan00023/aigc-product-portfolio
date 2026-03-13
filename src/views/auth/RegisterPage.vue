<script setup lang="ts">
/**
 * 注册页面
 * 高级商务风格设计，包含动态背景和精致的表单
 */

import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app'

const router = useRouter()
const authStore = useAuthStore()
const appStore = useAppStore()

// 表单数据
const formData = ref({
  phone: '',
  password: '',
  confirmPassword: '',
})

// 表单验证错误
const errors = ref({
  phone: '',
  password: '',
  confirmPassword: '',
})

// 密码可见性
const showPassword = ref(false)
const showConfirmPassword = ref(false)

/**
 * 表单验证
 */
const validateForm = () => {
  let isValid = true
  
  // 重置错误
  errors.value = { phone: '', password: '', confirmPassword: '' }
  
  // 验证手机号
  if (!formData.value.phone) {
    errors.value.phone = '请输入手机号'
    isValid = false
  } else if (!/^1[3-9]\d{9}$/.test(formData.value.phone)) {
    errors.value.phone = '请输入正确的手机号'
    isValid = false
  }
  
  // 验证密码
  if (!formData.value.password) {
    errors.value.password = '请输入密码'
    isValid = false
  } else if (formData.value.password.length < 6) {
    errors.value.password = '密码长度不能少于6位'
    isValid = false
  }
  
  // 验证确认密码
  if (!formData.value.confirmPassword) {
    errors.value.confirmPassword = '请再次输入密码'
    isValid = false
  } else if (formData.value.password !== formData.value.confirmPassword) {
    errors.value.confirmPassword = '两次输入的密码不一致'
    isValid = false
  }
  
  return isValid
}

/**
 * 处理注册
 */
const handleRegister = async () => {
  if (!validateForm()) return
  
  const result = await authStore.register({
    phone: formData.value.phone,
    password: formData.value.password,
  })
  
  if (result.success) {
    appStore.notifySuccess('注册成功', '请使用新账号登录')
    router.push('/login')
  } else {
    appStore.notifyError('注册失败', result.message)
  }
}

/**
 * 跳转到登录页
 */
const goToLogin = () => {
  router.push('/login')
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-dark-950 relative overflow-hidden">
    <!-- 动态背景 -->
    <div class="absolute inset-0 overflow-hidden">
      <!-- 渐变背景 -->
      <div class="absolute inset-0 bg-gradient-to-br from-dark-900 via-dark-950 to-accent-950/20"></div>
      
      <!-- 动态网格 -->
      <div class="absolute inset-0 bg-[linear-gradient(rgba(168,85,247,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(168,85,247,0.03)_1px,transparent_1px)] bg-[size:100px_100px]"></div>
      
      <!-- 发光球体 -->
      <div class="absolute top-1/4 -right-1/4 w-96 h-96 bg-accent-500/20 rounded-full blur-3xl animate-pulse-slow"></div>
      <div class="absolute bottom-1/4 -left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl animate-pulse-slow" style="animation-delay: 1.5s"></div>
    </div>
    
    <!-- 注册卡片 -->
    <div class="relative z-10 w-full max-w-md px-6">
      <!-- Logo和标题 -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-500 to-primary-500 shadow-glow mb-4">
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
        </div>
        <h1 class="text-3xl font-bold text-white mb-2">
          <span class="text-gradient">创建账号</span>
        </h1>
        <p class="text-dark-400">开始您的智能化运营之旅</p>
      </div>
      
      <!-- 注册表单 -->
      <div class="card-premium p-8">
        <form @submit.prevent="handleRegister" class="space-y-5">
          <h2 class="text-xl font-semibold text-white mb-6">账号注册</h2>
          
          <!-- 手机号输入 -->
          <div>
            <label class="block text-sm font-medium text-dark-300 mb-2">
              手机号
            </label>
            <div class="relative">
              <input
                v-model="formData.phone"
                type="text"
                placeholder="请输入手机号"
                class="input pl-10"
                :class="{ 'border-red-500': errors.phone }"
              />
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="w-5 h-5 text-dark-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
            </div>
            <p v-if="errors.phone" class="mt-2 text-sm text-red-400">{{ errors.phone }}</p>
          </div>
          
          <!-- 密码输入 -->
          <div>
            <label class="block text-sm font-medium text-dark-300 mb-2">
              密码
            </label>
            <div class="relative">
              <input
                v-model="formData.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="请输入密码（至少6位）"
                class="input pl-10 pr-10"
                :class="{ 'border-red-500': errors.password }"
              />
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="w-5 h-5 text-dark-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <svg v-if="showPassword" class="w-5 h-5 text-dark-500 hover:text-dark-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <svg v-else class="w-5 h-5 text-dark-500 hover:text-dark-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              </button>
            </div>
            <p v-if="errors.password" class="mt-2 text-sm text-red-400">{{ errors.password }}</p>
          </div>
          
          <!-- 确认密码输入 -->
          <div>
            <label class="block text-sm font-medium text-dark-300 mb-2">
              确认密码
            </label>
            <div class="relative">
              <input
                v-model="formData.confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                placeholder="请再次输入密码"
                class="input pl-10 pr-10"
                :class="{ 'border-red-500': errors.confirmPassword }"
              />
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="w-5 h-5 text-dark-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <button
                type="button"
                @click="showConfirmPassword = !showConfirmPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <svg v-if="showConfirmPassword" class="w-5 h-5 text-dark-500 hover:text-dark-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <svg v-else class="w-5 h-5 text-dark-500 hover:text-dark-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              </button>
            </div>
            <p v-if="errors.confirmPassword" class="mt-2 text-sm text-red-400">{{ errors.confirmPassword }}</p>
          </div>
          
          <!-- 注册按钮 -->
          <button
            type="submit"
            :disabled="authStore.loading"
            class="btn-accent w-full flex items-center justify-center gap-2 mt-6"
          >
            <svg v-if="authStore.loading" class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>{{ authStore.loading ? '注册中...' : '注册' }}</span>
          </button>
          
          <!-- 登录链接 -->
          <div class="text-center text-sm">
            <span class="text-dark-400">已有账号？</span>
            <button
              type="button"
              @click="goToLogin"
              class="text-accent-400 hover:text-accent-300 font-medium ml-1 transition-colors"
            >
              立即登录
            </button>
          </div>
        </form>
        
        <!-- 提示信息 -->
        <div class="mt-6 p-4 bg-dark-800/50 rounded-lg border border-dark-700">
          <div class="flex items-start gap-3">
            <svg class="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div class="text-sm text-dark-300">
              <p class="font-medium text-dark-200 mb-1">注册须知：</p>
              <ul class="space-y-1 list-disc list-inside">
                <li>5秒内同一手机号只能注册一次</li>
                <li>1小时内同一IP最多注册10次</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 底部信息 -->
      <div class="text-center mt-8 text-sm text-dark-500">
        <p>© 2024 IP定位平台. All rights reserved.</p>
      </div>
    </div>
  </div>
</template>
