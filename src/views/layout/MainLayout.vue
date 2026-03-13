<script setup lang="ts">
/**
 * 主布局组件
 * 包含侧边栏导航、顶部栏、内容区域
 * 高级商务风格设计
 */

import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const appStore = useAppStore()

// 侧边栏菜单配置
const menuItems = [
  {
    title: '首页概览',
    icon: 'home',
    path: '/',
    exact: true,
  },
  {
    title: 'IP调查问卷',
    icon: 'document',
    children: [
      { title: '问卷上传', path: '/ip-query/upload' },
      { title: '问卷查询', path: '/ip-query/list' },
      { title: '已填写问卷', path: '/ip-query/filled' },
    ],
  },
  {
    title: 'IP提示词',
    icon: 'lightning',
    children: [
      { title: '提示词上传', path: '/ip-prompt/upload' },
      { title: '提示词查询', path: '/ip-prompt/list' },
      { title: '提示词拼接', path: '/ip-prompt/merge' },
      { title: '拼接结果', path: '/ip-prompt/results' },
    ],
  },
  {
    title: '账号运营',
    icon: 'user',
    children: [
      { title: '账号简介', path: '/account/brief' },
      { title: '账号头像', path: '/account/avatar' },
      { title: '账号头图', path: '/account/cover' },
    ],
  },
  {
    title: '直播间搭建',
    icon: 'video',
    children: [
      { title: '直播主题', path: '/live/theme' },
      { title: '直播背景', path: '/live/background' },
      { title: '直播话术', path: '/live/script' },
      { title: '数据分析', path: '/live/data-analysis' },
      { title: '投流分析', path: '/live/touliu' },
    ],
  },
  {
    title: '积分中心',
    icon: 'coin',
    path: '/points',
  },
  {
    title: '个人中心',
    icon: 'settings',
    path: '/profile',
  },
]

// 展开的菜单项
const expandedMenus = ref<string[]>([])

// 用户菜单显示状态
const showUserMenu = ref(false)

/**
 * 判断菜单是否展开
 */
const isMenuExpanded = (title: string) => {
  return expandedMenus.value.includes(title)
}

/**
 * 切换菜单展开状态
 */
const toggleMenu = (title: string) => {
  const index = expandedMenus.value.indexOf(title)
  if (index > -1) {
    expandedMenus.value.splice(index, 1)
  } else {
    expandedMenus.value.push(title)
  }
}

/**
 * 判断路由是否激活
 */
const isActive = (path: string, exact = false) => {
  if (exact) {
    return route.path === path
  }
  return route.path.startsWith(path)
}

/**
 * 判断菜单组是否有激活项
 */
const hasActiveChild = (children: Array<{ path: string }>) => {
  return children.some(child => route.path.startsWith(child.path))
}

/**
 * 处理退出登录
 */
const handleLogout = async () => {
  await authStore.logout(true)
  router.push('/login')
}

/**
 * 获取图标组件
 */
const getIcon = (iconName: string) => {
  const icons: Record<string, string> = {
    home: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
    document: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    lightning: 'M13 10V3L4 14h7v7l9-11h-7z',
    user: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
    video: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z',
    coin: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    settings: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
    chevron: 'M19 9l-7 7-7-7',
  }
  return icons[iconName] || ''
}

// 初始化时展开包含当前路由的菜单
const initExpandedMenus = () => {
  menuItems.forEach(item => {
    if (item.children && hasActiveChild(item.children)) {
      if (!expandedMenus.value.includes(item.title)) {
        expandedMenus.value.push(item.title)
      }
    }
  })
}

// 组件挂载时初始化
initExpandedMenus()
</script>

<template>
  <div class="min-h-screen bg-dark-950 flex">
    <!-- 侧边栏 -->
    <aside
      :class="[
        'fixed left-0 top-0 h-screen bg-dark-900 border-r border-dark-800 transition-all duration-300 z-30',
        appStore.sidebarCollapsed ? 'w-20' : 'w-64'
      ]"
    >
      <!-- Logo区域 -->
      <div class="h-16 flex items-center justify-center border-b border-dark-800">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-glow">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span v-if="!appStore.sidebarCollapsed" class="text-lg font-bold text-white text-gradient">IP定位平台</span>
        </div>
      </div>
      
      <!-- 导航菜单 -->
      <nav class="p-4 space-y-1 overflow-y-auto" style="height: calc(100vh - 4rem);">
        <template v-for="item in menuItems" :key="item.title">
          <!-- 有子菜单的项 -->
          <div v-if="item.children">
            <button
              @click="toggleMenu(item.title)"
              :class="[
                'w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200',
                hasActiveChild(item.children) 
                  ? 'bg-primary-500/10 text-white border-l-2 border-primary-500' 
                  : 'text-dark-300 hover:bg-white/5 hover:text-white'
              ]"
            >
              <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="getIcon(item.icon)" />
              </svg>
              <span v-if="!appStore.sidebarCollapsed" class="flex-1 text-left">{{ item.title }}</span>
              <svg 
                v-if="!appStore.sidebarCollapsed"
                class="w-4 h-4 transition-transform duration-200"
                :class="{ 'rotate-180': isMenuExpanded(item.title) }"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="getIcon('chevron')" />
              </svg>
            </button>
            
            <!-- 子菜单 -->
            <div
              v-if="!appStore.sidebarCollapsed"
              v-show="isMenuExpanded(item.title)"
              class="mt-1 ml-4 pl-4 border-l border-dark-700 space-y-1"
            >
              <router-link
                v-for="child in item.children"
                :key="child.path"
                :to="child.path"
                :class="[
                  'block px-4 py-2 rounded-lg text-sm transition-all duration-200',
                  isActive(child.path)
                    ? 'bg-primary-500/10 text-primary-300 border-l-2 border-primary-500'
                    : 'text-dark-400 hover:bg-white/5 hover:text-white'
                ]"
              >
                {{ child.title }}
              </router-link>
            </div>
          </div>
          
          <!-- 没有子菜单的项 -->
          <router-link
            v-else
            :to="item.path"
            :class="[
              'flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200',
              isActive(item.path, item.exact)
                ? 'bg-primary-500/10 text-white border-l-2 border-primary-500'
                : 'text-dark-300 hover:bg-white/5 hover:text-white'
            ]"
          >
            <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="getIcon(item.icon)" />
            </svg>
            <span v-if="!appStore.sidebarCollapsed">{{ item.title }}</span>
          </router-link>
        </template>
      </nav>
    </aside>
    
    <!-- 主内容区域 -->
    <div
      :class="[
        'flex-1 transition-all duration-300',
        appStore.sidebarCollapsed ? 'ml-20' : 'ml-64'
      ]"
    >
      <!-- 顶部栏 -->
      <header class="h-16 bg-dark-900/80 backdrop-blur-xl border-b border-dark-800 sticky top-0 z-20">
        <div class="h-full px-6 flex items-center justify-between">
          <!-- 左侧：折叠按钮 -->
          <button
            @click="appStore.toggleSidebar"
            class="p-2 rounded-lg text-dark-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <!-- 右侧：积分和用户信息 -->
          <div class="flex items-center gap-6">
            <!-- 积分显示 -->
            <div class="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20">
              <svg class="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span class="text-sm text-dark-300">积分：</span>
              <span class="text-sm font-bold text-yellow-400">{{ appStore.points }}</span>
            </div>
            
            <!-- 用户菜单 -->
            <div class="relative">
              <button
                @click="showUserMenu = !showUserMenu"
                class="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <div class="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                  <span class="text-sm font-bold text-white">
                    {{ authStore.deviceId?.substring(0, 1).toUpperCase() || 'U' }}
                  </span>
                </div>
                <div class="text-left">
                  <p class="text-sm font-medium text-white">{{ authStore.deviceId?.substring(0, 8) || '用户' }}</p>
                  <p class="text-xs text-dark-400">设备ID</p>
                </div>
                <svg class="w-4 h-4 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="getIcon('chevron')" />
                </svg>
              </button>
              
              <!-- 下拉菜单 -->
              <div
                v-if="showUserMenu"
                class="absolute right-0 mt-2 w-48 bg-dark-800 rounded-lg border border-dark-700 shadow-xl overflow-hidden"
              >
                <router-link
                  to="/profile"
                  @click="showUserMenu = false"
                  class="flex items-center gap-3 px-4 py-3 text-sm text-dark-300 hover:bg-white/5 hover:text-white transition-colors"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="getIcon('user')" />
                  </svg>
                  个人中心
                </router-link>
                <button
                  @click="handleLogout"
                  class="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  退出登录
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      <!-- 页面内容 -->
      <main class="p-6">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
    
    <!-- 点击遮罩关闭用户菜单 -->
    <div
      v-if="showUserMenu"
      @click="showUserMenu = false"
      class="fixed inset-0 z-10"
    ></div>
  </div>
</template>

<style scoped>
/* 页面过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 侧边栏滚动条样式 */
aside nav::-webkit-scrollbar {
  width: 4px;
}

aside nav::-webkit-scrollbar-track {
  background: transparent;
}

aside nav::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
}

aside nav::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}
</style>
