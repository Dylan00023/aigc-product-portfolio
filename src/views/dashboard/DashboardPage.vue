<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useAuthStore } from '@/stores/auth'
import mascotImg from '@/assets/mascot.png'

const router = useRouter()
const appStore = useAppStore()
const authStore = useAuthStore()

// 登录弹窗状态
const showLoginDialog = ref(false)
const loginForm = ref({ phone: '', password: '' })
const loginErrors = ref({ phone: '', password: '' })
const loginLoading = ref(false)
const loginRedirectPath = ref<string | null>(null)
const showLoginPassword = ref(false)

const isAuthenticated = computed(() => authStore.isAuthenticated)

// 快捷入口流程：简单模式 / 高级模式
const quickFlow = [
  {
    title: '简单模式',
    subtitle: '告诉我们<你是谁>',
    description: '适合初次使用。用一套问卷，把你的人设、优势和标签梳理明白。',
    icon: 'document',
    color: 'primary',
    path: '/app/ip-prompt',
  },
  {
    title: '自定义模式',
    subtitle: '用现有素材，拼出更完整的 IP 文案',
    description: '适合已经有一些内容/想法的人。把问卷答案和提示词组合起来，一键生成更完整的 IP 定位说明。',
    icon: 'lightning',
    color: 'accent',
    path: '/app/ip-prompt/merge',
  },
]

// 获取颜色类
const getColorClass = (color: string) => {
  const colors: Record<string, string> = {
    primary: 'from-violet-500 to-fuchsia-500',
    accent: 'from-amber-400 to-orange-500',
    green: 'from-green-500 to-green-600',
    blue: 'from-blue-500 to-blue-600',
  }
  return colors[color] || colors.primary
}

// 获取图标
const getIcon = (iconName: string) => {
  const icons: Record<string, string> = {
    document: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    lightning: 'M13 10V3L4 14h7v7l9-11h-7z',
    user: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
    video: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z',
  }
  return icons[iconName] || ''
}

// 卡片拖动/点击识别：避免拖动时误触发点击
type Point = { x: number; y: number }
const dragStart = ref<Point | null>(null)
const DRAG_THRESHOLD = 6 // px 内算点击，超过算拖动

const onCardMouseDown = (event: MouseEvent) => {
  dragStart.value = { x: event.clientX, y: event.clientY }
}

const onCardMouseUp = (event: MouseEvent, path?: string) => {
  if (!path) return
  if (!dragStart.value) {
    goFeature(path)
    return
  }
  const dx = event.clientX - dragStart.value.x
  const dy = event.clientY - dragStart.value.y
  const distance = Math.sqrt(dx * dx + dy * dy)
  dragStart.value = null
  if (distance <= DRAG_THRESHOLD) {
    goFeature(path)
  }
}

// 进入功能前检查登录状态
const goFeature = (path: string) => {
  if (!isAuthenticated.value) {
    loginRedirectPath.value = path
    showLoginDialog.value = true
    return
  }
  router.push(path)
}

// 免费试用按钮逻辑
const handleFreeTry = () => {
  goFeature('/app/ip-prompt/merge')
}

// 立即登录按钮逻辑（只弹框，不跳页面）
const openLoginDialog = () => {
  loginRedirectPath.value = router.currentRoute.value.fullPath || '/'
  showLoginDialog.value = true
}

// 校验登录表单（弹窗）：只校验非空与最小长度，手机号不做格式限制
const validateLoginForm = () => {
  let valid = true
  loginErrors.value = { phone: '', password: '' }

  const phone = loginForm.value.phone.trim()
  loginForm.value.phone = phone

  if (!phone) {
    loginErrors.value.phone = '请输入手机号'
    valid = false
  }

  if (!loginForm.value.password) {
    loginErrors.value.password = '请输入密码'
    valid = false
  } else if (loginForm.value.password.length < 6) {
    loginErrors.value.password = '密码长度不能少于6位'
    valid = false
  }

  return valid
}

// 弹窗内登录
const submitLogin = async () => {
  if (!validateLoginForm()) return
  loginLoading.value = true
  const result = await authStore.login(loginForm.value)
  loginLoading.value = false

  if (result.success) {
    appStore.notifySuccess('登录成功', '欢迎回来！')
    showLoginDialog.value = false
    const target = loginRedirectPath.value || '/'
    loginRedirectPath.value = null
    appStore.fetchPoints()
    router.push(target)
  } else {
    appStore.notifyError('登录失败', result.message)
  }
}

// 已登录时进入页面再拉取积分
onMounted(() => {
  if (isAuthenticated.value) {
    appStore.fetchPoints()
  }
})
</script>

<template>
  <div class="space-y-6">
    <!-- 欢迎区域 -->
    <div class="card-premium p-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-white mb-2">
            欢迎使用 <span class="text-gradient">丝路智播 IP定位平台</span>
          </h1>
          <p class="text-dark-400">一站式运营管理系统，轻松做到您的IP定位和直播运营</p>
        </div>
        <div class="hidden md:block">
          <div class="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-glow-lg">
            <svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 快捷入口：简单模式 / 自定义模式（Aura 风格双卡片） -->
    <div>
      <h2 class="text-xl font-bold text-white mb-4">快捷入口</h2>
      <div class="card-premium p-6">
        <div class="flex flex-col gap-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            <!-- 卡片 1：简单模式 -->
            <div
              class="group overflow-hidden bg-gradient-to-b from-white/10 via-white/5 to-transparent rounded-2xl p-[1px] cursor-pointer"
              @mousedown="onCardMouseDown"
              @mouseup="onCardMouseUp($event, quickFlow[0].path)"
            >
              <div class="flex flex-col bg-zinc-950/90 w-full h-full rounded-[15px] relative backdrop-blur-xl">
                <div class="h-40 w-full border-b border-white/5 p-4 flex items-center justify-center overflow-hidden bg-zinc-900/30">
                  <svg class="w-full h-full text-zinc-500 opacity-80 group-hover:opacity-100 transition-opacity duration-700" viewBox="0 0 500 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g class="svg-float" style="animation-duration: 8s;">
                      <path d="M0 20H500 M0 60H500 M0 100H500" stroke="currentColor" stroke-opacity="0.12" stroke-width="1" />
                    </g>
                    <path d="M20 60C60 10 80 10 110 60C140 110 160 110 190 60C220 10 240 10 270 60C300 110 320 110 350 60C380 10 400 10 430 60" stroke="#e5e5e5" stroke-width="1.8" stroke-opacity="0.9" stroke-linecap="round" class="svg-path-draw" />
                  </svg>
                </div>
                <div class="mt-auto px-6 py-6">
                  <div class="flex items-center gap-3 mb-3">
                    <div class="w-6 h-6 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center">
                      <svg class="w-3.5 h-3.5 text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="getIcon(quickFlow[0].icon)" />
                      </svg>
                    </div>
                    <span class="text-xs text-zinc-400 tracking-tight">{{ quickFlow[0].subtitle }}</span>
                  </div>
                  <h3 class="text-lg font-medium text-zinc-100 tracking-tight mb-1">{{ quickFlow[0].title }}</h3>
                  <p class="text-xs text-zinc-500 tracking-tight">{{ quickFlow[0].description }}</p>
                </div>
              </div>
            </div>

            <!-- 卡片 2：自定义模式 -->
            <div
              class="group overflow-hidden bg-gradient-to-b from-white/10 via-white/5 to-transparent rounded-2xl p-[1px] cursor-pointer"
              @mousedown="onCardMouseDown"
              @mouseup="onCardMouseUp($event, quickFlow[1].path)"
            >
              <div class="flex flex-col bg-zinc-950/90 w-full h-full rounded-[15px] relative backdrop-blur-xl">
                <div class="h-40 w-full border-b border-white/5 p-4 flex items-center justify-center overflow-hidden bg-zinc-900/20">
                  <div class="w-16 h-16 rounded-2xl border border-white/10 flex items-center justify-center text-zinc-600 group-hover:text-zinc-300 transition-colors duration-500">
                    <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7h16M4 12h10M4 17h7" />
                    </svg>
                  </div>
                </div>
                <div class="mt-auto px-6 py-6">
                  <div class="flex items-center gap-3 mb-3">
                    <div class="w-6 h-6 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center">
                      <svg class="w-3.5 h-3.5 text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="getIcon(quickFlow[1].icon)" />
                      </svg>
                    </div>
                    <span class="text-xs text-zinc-400 tracking-tight">自定义拼接</span>
                  </div>
                  <h3 class="text-lg font-medium text-zinc-100 tracking-tight mb-1">{{ quickFlow[1].title }}</h3>
                  <p class="text-xs text-zinc-500 tracking-tight">{{ quickFlow[1].description }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- 小人放在模块内部底部右侧，弱提示 -->
          <div class="flex justify-end">
            <div class="mascot-img-wrap">
              <img :src="mascotImg" alt="助手小人" class="mascot-img" />
            </div>
          </div>
        </div>
      </div>
    </div>
    
  <!-- 平台功能 / 行动按钮 -->
  <div class="card-premium p-10">
    <h2 class="text-2xl font-bold text-white mb-4">个人IP打造，就用丝路智播</h2>
    
    <p class="text-base leading-relaxed text-dark-400 max-w-2xl mb-8">
      在这里，AI 不止是工具，更可以主动分担目标的工作伙伴。通过开箱即用的智能能力，
      配合极其简单的创作方式，让每一位职场人都能轻松驾驭具备行业顶尖水准的 AI 生产线。
    </p>
  </div>

  <!-- 登录弹窗 -->
  <div
    v-if="showLoginDialog"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
  >
    <div class="w-full max-w-md mx-4 rounded-2xl card-premium p-8 relative">
      <button
        class="absolute right-4 top-4 text-sm text-dark-400 hover:text-white"
        @click="showLoginDialog = false"
      >
        ✕
      </button>

      <h2 class="text-xl font-semibold text-white mb-6">登录账号</h2>

      <form @submit.prevent="submitLogin" class="space-y-5">
        <div>
          <label class="block text-sm font-medium mb-2 text-dark-200">手机号</label>
          <div class="relative">
            <input
              v-model="loginForm.phone"
              type="text"
              placeholder="请输入手机号"
              class="input pl-10"
              :class="{ 'border-red-500': loginErrors.phone }"
            />
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="w-5 h-5 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
            </div>
          </div>
          <p v-if="loginErrors.phone" class="mt-2 text-sm text-red-500">{{ loginErrors.phone }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium mb-2 text-dark-200">密码</label>
          <div class="relative">
            <input
              v-model="loginForm.password"
              :type="showLoginPassword ? 'text' : 'password'"
              placeholder="请输入密码"
              class="input pl-10 pr-10"
              :class="{ 'border-red-500': loginErrors.password }"
            />
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="w-5 h-5 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <button
              type="button"
              class="absolute inset-y-0 right-0 pr-3 flex items-center"
              @click="showLoginPassword = !showLoginPassword"
            >
              <svg
                v-if="showLoginPassword"
                class="w-5 h-5 text-dark-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              <svg
                v-else
                class="w-5 h-5 text-dark-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                />
              </svg>
            </button>
          </div>
          <p v-if="loginErrors.password" class="mt-2 text-sm text-red-500">{{ loginErrors.password }}</p>
        </div>

        <button
          type="submit"
          class="btn-primary w-full flex items-center justify-center gap-2"
          :disabled="loginLoading"
        >
          <svg
            v-if="loginLoading"
            class="animate-spin w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span>{{ loginLoading ? '登录中...' : '登录' }}</span>
        </button>
      </form>
    </div>
  </div>
  </div>
</template>

<style scoped>
.mascot-img-wrap {
  width: 52px;
  height: 52px;
  border-radius: 999px;
  overflow: hidden;
  background: radial-gradient(circle at 20% 20%, rgba(248, 250, 252, 0.18), rgba(15, 23, 42, 0.9));
  box-shadow:
    0 0 0 1px rgba(148, 163, 184, 0.45),
    0 10px 25px rgba(0, 0, 0, 0.65);
  animation: mascotFloat 2.8s ease-in-out infinite;
}

.mascot-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

@keyframes mascotFloat {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-6px);
  }
}

@media (max-width: 768px) {
  .mascot-img-wrap {
    width: 46px;
    height: 46px;
  }
  .mascot-bubble-text {
    font-size: 10px;
  }
}
</style>
