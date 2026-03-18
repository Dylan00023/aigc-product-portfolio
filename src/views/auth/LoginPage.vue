<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const appStore = useAppStore()

const formData = ref({ phone: '', password: '' })
const errors = ref({ phone: '', password: '' })
const showPassword = ref(false)

const validateForm = () => {
  let isValid = true
  errors.value = { phone: '', password: '' }
  const phone = formData.value.phone.trim()
  formData.value.phone = phone

  if (!phone) {
    errors.value.phone = '请输入手机号'; isValid = false
  }
  if (!formData.value.password) {
    errors.value.password = '请输入密码'; isValid = false
  } else if (formData.value.password.length < 6) {
    errors.value.password = '密码长度不能少于6位'; isValid = false
  }
  return isValid
}

const handleLogin = async () => {
  if (!validateForm()) return
  const result = await authStore.login(formData.value)
  if (result.success) {
    appStore.notifySuccess('登录成功', '欢迎回来！')
    const redirect = route.query.redirect as string
    await router.push(redirect || '/app')
    appStore.fetchPoints()
  } else {
    appStore.notifyError('登录失败', result.message)
  }
}

const handleDevLogin = async () => {
  const mockToken = 'dev_mock_access_token_' + Date.now()
  const mockRefreshToken = 'dev_mock_refresh_token_' + Date.now()
  const mockDeviceId = 'dev_device_001'
  authStore.saveTokens(mockToken, mockRefreshToken, mockDeviceId)
  appStore.notifySuccess('开发模式', '已绕过登录验证')
  const redirect = route.query.redirect as string
  await router.push(redirect || '/app')
}

const goToRegister = () => router.push('/register')
</script>

<template>
  <div
    class="min-h-screen flex items-center justify-center relative overflow-hidden transition-colors duration-300"
    :style="{ background: 'var(--bg-base)' }"
  >
    <!-- 主题切换按钮 -->
    <button
      @click="appStore.toggleTheme()"
      class="fixed top-4 right-4 z-50 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 shadow-sm"
      :style="{ background: 'var(--bg-surface)', border: '1px solid var(--border-base)' }"
      :title="appStore.isDark ? '切换到日间模式' : '切换到夜间模式'"
    >
      <svg v-if="appStore.isDark" class="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
      <svg v-else class="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
      </svg>
    </button>

    <!-- 背景装饰 -->
    <div v-if="appStore.isDark" class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute inset-0 bg-gradient-to-br from-dark-900 via-dark-950 to-primary-950/20"></div>
      <div class="absolute top-1/4 -left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl animate-pulse-slow"></div>
      <div class="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-accent-500/20 rounded-full blur-3xl animate-pulse-slow" style="animation-delay:1.5s"></div>
    </div>
    <div v-else class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-accent-50"></div>
      <div class="absolute top-1/4 -left-1/4 w-96 h-96 bg-primary-200/40 rounded-full blur-3xl"></div>
      <div class="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-accent-200/40 rounded-full blur-3xl"></div>
    </div>

    <!-- 登录卡片 -->
    <div class="relative z-10 w-full max-w-md px-6">
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 shadow-glow mb-4">
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h1 class="text-3xl font-bold mb-2"><span class="text-gradient">IP定位平台</span></h1>
        <p :style="{ color: 'var(--text-muted)' }">智能化运营管理系统</p>
      </div>

      <div class="card-premium p-8">
        <form @submit.prevent="handleLogin" class="space-y-6">
          <h2 class="text-xl font-semibold mb-6" :style="{ color: 'var(--text-primary)' }">登录账号</h2>
          <div>
            <label class="block text-sm font-medium mb-2" :style="{ color: 'var(--text-secondary)' }">手机号</label>
            <div class="relative">
              <input v-model="formData.phone" type="text" placeholder="请输入手机号" class="input pl-10" :class="{ 'border-red-500': errors.phone }" />
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="w-5 h-5" :style="{ color: 'var(--text-muted)' }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
            </div>
            <p v-if="errors.phone" class="mt-2 text-sm text-red-500">{{ errors.phone }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium mb-2" :style="{ color: 'var(--text-secondary)' }">密码</label>
            <div class="relative">
              <input v-model="formData.password" :type="showPassword ? 'text' : 'password'" placeholder="请输入密码" class="input pl-10 pr-10" :class="{ 'border-red-500': errors.password }" />
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="w-5 h-5" :style="{ color: 'var(--text-muted)' }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <button type="button" @click="showPassword = !showPassword" class="absolute inset-y-0 right-0 pr-3 flex items-center">
                <svg v-if="showPassword" class="w-5 h-5" :style="{ color: 'var(--text-muted)' }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <svg v-else class="w-5 h-5" :style="{ color: 'var(--text-muted)' }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              </button>
            </div>
            <p v-if="errors.password" class="mt-2 text-sm text-red-500">{{ errors.password }}</p>
          </div>
          <button type="submit" :disabled="authStore.loading" class="btn-primary w-full flex items-center justify-center gap-2">
            <svg v-if="authStore.loading" class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>{{ authStore.loading ? '登录中...' : '登录' }}</span>
          </button>
          <div class="text-center text-sm">
            <span :style="{ color: 'var(--text-muted)' }">还没有账号？</span>
            <button type="button" @click="goToRegister" class="text-primary-500 hover:text-primary-400 ml-1 font-medium">立即注册</button>
          </div>
        </form>
        <!-- 分隔线 -->
        <div class="relative my-6">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t" :style="{ borderColor: 'var(--border-base)' }"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-4 text-xs rounded" :style="{ background: 'var(--bg-surface)', color: 'var(--text-muted)' }">开发调试</span>
          </div>
        </div>

        <!-- 开发模式按钮 -->
        <button
          type="button"
          @click="handleDevLogin"
          class="w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2"
          style="background: linear-gradient(to right, rgba(217,119,6,0.15), rgba(234,88,12,0.15)); border: 1px solid rgba(217,119,6,0.3); color: #d97706;"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
          开发模式进入（跳过登录）
        </button>
        <p class="text-center text-xs mt-2" :style="{ color: 'var(--text-muted)' }">后端服务未启动时可使用此方式预览</p>
      </div>

      <div class="text-center mt-8 text-sm" :style="{ color: 'var(--text-muted)' }">
        <p>© 2026 丝路智播 IP定位与直播运营平台</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes pulse-slow {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 0.8; }
}
.animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
</style>