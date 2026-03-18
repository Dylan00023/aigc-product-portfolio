<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app'
import ErrorBoundary from '@/components/common/ErrorBoundary.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const appStore = useAppStore()

type MenuChild = { title: string; path: string }
type MenuItem =
  | { divider: true }
  | { title: string; icon: string; path: string; exact?: boolean; highlight?: string }
  | { title: string; icon: string; children: MenuChild[]; defaultPath?: string }

const menuItems: MenuItem[] = [
  { title: '首页', icon: 'home', path: '/app', exact: true },
  // IP拼接：承接拼接与结果
  { title: 'IP拼接', icon: 'merge', children: [
    { title: '开始拼接', path: '/app/ip-prompt/merge' },
    { title: '拼接结果', path: '/app/ip-prompt/results' },
  ], defaultPath: '/app/ip-prompt/merge' },
  { divider: true },
  { title: '调查问卷', icon: 'document', children: [
    { title: '问卷列表', path: '/app/ip-query/list' },
    { title: '已填写问卷', path: '/app/ip-query/filled' },
    { title: '问卷上传', path: '/app/ip-query/upload' },
  ], defaultPath: '/app/ip-query/list' },
  { title: 'IP提示词', icon: 'lightning', children: [
    { title: '提示词下载', path: '/app/ip-prompt/list' },
    { title: '提示词上传', path: '/app/ip-prompt/upload' },
  ], defaultPath: '/app/ip-prompt/list' },
  { title: '账号运营', icon: 'user', children: [
    { title: '账号简介', path: '/app/account/brief' },
    { title: '账号头像', path: '/app/account/avatar' },
    { title: '账号头图', path: '/app/account/cover' },
  ], defaultPath: '/app/account/brief' },
  { title: '直播间搭建', icon: 'video', children: [
    { title: '直播主题', path: '/app/live/theme' },
    { title: '直播背景', path: '/app/live/background' },
    { title: '直播话术', path: '/app/live/script' },
    { title: '数据分析', path: '/app/live/data-analysis' },
    { title: '投流分析', path: '/app/live/touliu' },
  ], defaultPath: '/app/live/theme' },
  { title: '积分中心', icon: 'coin', path: '/app/points' },
  { title: '个人中心', icon: 'settings', path: '/app/profile' },
]

const expandedMenus = ref<string[]>([])
const showUserMenu = ref(false)

const isAuthenticated = computed(() => authStore.isAuthenticated)

const isMenuExpanded = (title: string) => expandedMenus.value.includes(title)
const toggleMenu = (title: string) => {
  // 手风琴：展开一个时自动收起其它
  if (isMenuExpanded(title)) {
    expandedMenus.value = []
  } else {
    expandedMenus.value = [title]
  }
}

const gotoMenuHome = (item: MenuItem) => {
  if (!('children' in item)) return
  // 已展开：再次点击则收起（不跳转）
  if (isMenuExpanded(item.title)) {
    expandedMenus.value = []
    return
  }
  const target = item.defaultPath || item.children?.[0]?.path
  if (!target) return
  if (route.path !== target) router.push(target)
  expandedMenus.value = [item.title]
}
const isActive = (path: string, exact = false) =>
  exact ? route.path === path : route.path.startsWith(path)
const hasActiveChild = (children: Array<{ path: string }>) =>
  children.some(c => route.path.startsWith(c.path))
const handleLogout = async () => {
  await authStore.logout(true)
  router.push('/login')
}

const getIcon = (name: string): string => ({
  home: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
  document: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  lightning: 'M13 10V3L4 14h7v7l9-11h-7z',
  user: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  video: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z',
  coin: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  settings: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
  merge: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4',
  result: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
  chevron: 'M19 9l-7 7-7-7',
} as Record<string, string>)[name] ?? ''

const initExpandedMenus = () => {
  // 手风琴：只保留一个与当前路由匹配的分组展开
  const active = menuItems.find(item => 'children' in item && hasActiveChild(item.children))
  expandedMenus.value = (active && 'title' in active) ? [active.title] : []
}
initExpandedMenus()
</script>

<template>
  <div class="min-h-screen flex transition-colors duration-300" :style="{ background: 'var(--bg-base)' }">

    <!-- 侧边栏 -->
    <aside
      :class="['fixed left-0 top-0 h-screen border-r transition-all duration-300 z-30', appStore.sidebarCollapsed ? 'w-20' : 'w-64']"
      :style="{ background: 'var(--bg-sidebar)', borderColor: 'var(--border-base)' }"
    >
      <!-- Logo -->
      <div class="h-16 flex items-center justify-center" :style="{ borderBottom: '1px solid var(--border-base)' }">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-glow">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span v-if="!appStore.sidebarCollapsed" class="text-lg font-bold text-gradient">丝路智播 · IP定位平台</span>
        </div>
      </div>

      <!-- 导航菜单 -->
      <nav class="p-4 space-y-1 overflow-y-auto sidebar-nav" style="height: calc(100vh - 4rem);">
        <template v-for="item in menuItems" :key="item.title || 'divider-' + item.divider">
          <!-- 分隔线 -->
          <div v-if="'divider' in item" class="my-10"></div>
          <!-- 有子菜单 -->
          <div v-else-if="'children' in item">
            <button
              @click="gotoMenuHome(item)"
              :class="['w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200',
                hasActiveChild(item.children) ? 'sidebar-item-active' : 'sidebar-item']"
            >
              <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="getIcon(item.icon)" />
              </svg>
              <span v-if="!appStore.sidebarCollapsed" class="flex-1 text-left text-sm font-medium">{{ item.title }}</span>
              <svg v-if="!appStore.sidebarCollapsed"
                class="w-4 h-4 transition-transform duration-200" :class="{ 'rotate-180': isMenuExpanded(item.title) }"
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="getIcon('chevron')" />
              </svg>
            </button>
            <div
              v-if="!appStore.sidebarCollapsed" v-show="isMenuExpanded(item.title)"
              class="mt-1 ml-4 pl-4 space-y-1" :style="{ borderLeft: '1px solid var(--border-base)' }"
            >
              <router-link
                v-for="child in item.children" :key="child.path" :to="child.path"
                :class="['block px-4 py-2 rounded-lg text-sm transition-all duration-200',
                  isActive(child.path) ? 'sidebar-item-active' : 'sidebar-item']"
              >{{ child.title }}</router-link>
            </div>
          </div>

          <!-- 无子菜单 -->
          <router-link
            v-else :to="item.path"
            :class="['flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200',
              item.highlight==='green'
                ? (isActive(item.path, item.exact) ? 'sidebar-item-green-active' : 'sidebar-item-green')
                : (isActive(item.path, item.exact) ? 'sidebar-item-active' : 'sidebar-item')]"
          >
            <svg
              class="w-5 h-5 flex-shrink-0"
              :class="item.highlight==='green' ? 'text-emerald-400' : ''"
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="getIcon(item.icon)" />
            </svg>
            <span v-if="!appStore.sidebarCollapsed" class="text-sm font-semibold">{{ item.title }}</span>
          </router-link>
        </template>
      </nav>
    </aside>

    <!-- 主内容 -->
    <div :class="['flex-1 transition-all duration-300', appStore.sidebarCollapsed ? 'ml-20' : 'ml-64']">

      <!-- 顶部栏 -->
      <header
        class="h-16 backdrop-blur-xl sticky top-0 z-20 transition-colors duration-300"
        :style="{ background: 'var(--bg-header)', borderBottom: '1px solid var(--border-base)' }"
      >
        <div class="h-full px-6 flex items-center justify-between">
          <!-- 折叠按钮 -->
          <button @click="appStore.toggleSidebar" class="p-2 rounded-lg transition-colors sidebar-item">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <!-- 右侧操作区 -->
          <div class="flex items-center gap-3">
            <!-- 积分（仅登录后显示） -->
            <div
              v-if="isAuthenticated"
              class="flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors"
              :style="appStore.isDark
                ? { background: 'rgba(234,179,8,0.1)', borderColor: 'rgba(234,179,8,0.2)' }
                : { background: 'rgba(234,179,8,0.08)', borderColor: 'rgba(234,179,8,0.25)', boxShadow: '0 1px 4px rgba(234,179,8,0.1)' }"
            >
              <svg class="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span class="text-sm" :style="{ color: 'var(--text-muted)' }">积分：</span>
              <span class="text-sm font-bold text-yellow-500">{{ appStore.points }}</span>
            </div>

            <!-- 主题切换按钮 -->
            <button
              @click="appStore.toggleTheme()"
              class="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200"
              :style="{ background: 'var(--bg-surface-2)' }"
              :title="appStore.isDark ? '切换到日间模式' : '切换到夜间模式'"
            >
              <!-- 夜间模式下显示太阳（点击切日间） -->
              <svg v-if="appStore.isDark" class="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <!-- 日间模式下显示月亮（点击切夜间） -->
              <svg v-else class="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            </button>

            <!-- 用户状态 -->
            <div class="relative">
              <!-- 已登录：显示设备/用户信息和下拉菜单 -->
              <button
                v-if="isAuthenticated"
                @click="showUserMenu = !showUserMenu"
                class="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors border"
                :style="appStore.isDark
                  ? { background: 'rgba(255,255,255,0.04)', borderColor: 'var(--border-base)' }
                  : { background: 'var(--bg-surface)', borderColor: 'var(--border-base)', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }"
              >
                <div class="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                  <span class="text-sm font-bold text-white">{{ authStore.deviceId?.substring(0, 1).toUpperCase() || 'U' }}</span>
                </div>
                <div class="text-left hidden sm:block">
                  <p class="text-sm font-medium" :style="{ color: 'var(--text-primary)' }">{{ authStore.deviceId?.substring(0, 8) }}</p>
                  <p class="text-xs" :style="{ color: 'var(--text-muted)' }">当前设备</p>
                </div>
                <svg class="w-4 h-4" :style="{ color: 'var(--text-muted)' }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="getIcon('chevron')" />
                </svg>
              </button>

              <!-- 未登录：显示“未登录”按钮 -->
              <button
                v-else
                class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors border"
                :style="appStore.isDark
                  ? { background: 'rgba(255,255,255,0.04)', borderColor: 'var(--border-base)', color: 'var(--text-primary)' }
                  : { background: 'var(--bg-surface)', borderColor: 'var(--border-base)', color: 'var(--text-primary)', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }"
                @click="router.push('/login')"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 21v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11a4 4 0 100-8 4 4 0 000 8z" />
                </svg>
                未登录
              </button>

              <!-- 下拉菜单（仅登录时存在） -->
              <div
                v-if="showUserMenu && isAuthenticated"
                class="absolute right-0 mt-2 w-48 rounded-lg border shadow-xl overflow-hidden z-50"
                :style="{ background: 'var(--bg-dropdown)', borderColor: 'var(--border-base)' }"
              >
                <router-link
                  to="/profile"
                  @click="showUserMenu = false"
                  class="flex items-center gap-3 px-4 py-3 text-sm transition-colors sidebar-item rounded-none"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="getIcon('user')" />
                  </svg>
                  个人中心
                </router-link>
                <button
                  @click="handleLogout"
                  class="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-500/10 transition-colors"
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
            <ErrorBoundary :reset-key="route.fullPath">
              <component :is="Component" />
            </ErrorBoundary>
          </transition>
        </router-view>
      </main>
    </div>

    <!-- 遮罩关闭用户菜单 -->
    <div v-if="showUserMenu" @click="showUserMenu = false" class="fixed inset-0 z-10"></div>
  </div>
</template>

<style scoped>
.sidebar-item-green {
  color: #34d399;
  background: rgba(52, 211, 153, 0.08);
  border: 1px solid rgba(52, 211, 153, 0.25);
  box-shadow: 0 0 8px rgba(52, 211, 153, 0.12);
}
.sidebar-item-green:hover {
  background: rgba(52, 211, 153, 0.15);
  box-shadow: 0 0 14px rgba(52, 211, 153, 0.22);
}
.sidebar-item-green-active {
  color: #10b981;
  background: rgba(16, 185, 129, 0.18);
  border: 1px solid rgba(16, 185, 129, 0.45);
  box-shadow: 0 0 16px rgba(16, 185, 129, 0.3), inset 0 0 8px rgba(16, 185, 129, 0.08);
  font-weight: 700;
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.sidebar-nav::-webkit-scrollbar { width: 4px; }
.sidebar-nav::-webkit-scrollbar-track { background: transparent; }
.sidebar-nav::-webkit-scrollbar-thumb {
  background: rgba(128,128,128,0.2);
  border-radius: 2px;
}
.sidebar-nav::-webkit-scrollbar-thumb:hover { background: rgba(128,128,128,0.4); }
</style> 