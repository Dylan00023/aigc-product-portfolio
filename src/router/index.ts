/**
 * 路由配置
 * 所有页面路由都在这里定义
 */

import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

/**
 * 路由配置
 */
const routes: RouteRecordRaw[] = [
  // 欢迎页（第一屏，不需要认证）
  {
    path: '/',
    name: 'Welcome',
    component: () => import('@/views/welcome/WelcomePage.vue'),
    meta: {
      title: '欢迎',
      requiresAuth: false,
    },
  },

  // 登录页面（不需要认证）
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/LoginPage.vue'),
    meta: {
      title: '登录',
      requiresAuth: false,
    },
  },
  
  // 注册页面（不需要认证）
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/auth/RegisterPage.vue'),
    meta: {
      title: '注册',
      requiresAuth: false,
    },
  },
  
  // 主应用（当前“主页”与各功能入口）
  {
    path: '/app',
    component: () => import('@/views/layout/MainLayout.vue'),
    meta: {
      requiresAuth: false,
    },
    children: [
      // 首页
      {
        path: '',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/DashboardPage.vue'),
        meta: {
          title: '首页概览',
          icon: 'home',
          requiresAuth: false,
        },
      },
      
      // 简单模式（占位页，后续再接入具体功能）
      {
        path: 'simple-mode',
        name: 'SimpleMode',
        component: () => import('@/views/simple/SimpleModePage.vue'),
        meta: {
          title: '简单模式',
          icon: 'merge',
          requiresAuth: true,
        },
      },

      // 自定义模式（占位页）
      {
        path: 'custom-mode',
        name: 'CustomMode',
        component: () => import('@/views/custom/CustomModePage.vue'),
        meta: {
          title: '自定义模式',
          icon: 'settings',
          requiresAuth: true,
        },
      },
      
      // ==================== IP调查问卷 ====================
      {
        path: 'ip-query/list',
        name: 'IPQueryList',
        component: () => import('@/views/ip-query/ListPage.vue'),
        meta: {
          title: '问卷查询',
          icon: 'list',
          group: 'IP调查问卷',
          requiresAuth: true,
        },
      },
      {
        path: 'ip-query/upload',
        name: 'IPQueryUpload',
        component: () => import('@/views/ip-query/UploadPage.vue'),
        meta: {
          title: '问卷上传',
          icon: 'upload',
          group: 'IP调查问卷',
          requiresAuth: true,
        },
      },
      {
        path: 'ip-query/filled',
        name: 'IPQueryFilled',
        component: () => import('@/views/ip-query/FilledPage.vue'),
        meta: {
          title: '已填写问卷',
          icon: 'document',
          group: 'IP调查问卷',
          requiresAuth: true,
        },
      },
      {
        path: 'ip-query/online-fill',
        name: 'IPQueryOnlineFill',
        component: () => import('@/views/ip-query/OnlineFillPage.vue'),
        meta: {
          title: '在线填写（简易版）',
          icon: 'document',
          group: 'IP调查问卷',
          requiresAuth: true,
        },
      },

      // ==================== 简单模式 - 问卷链路（不归入“调查问卷”分组） ====================
      {
        path: 'simple/ip-query/online-fill',
        name: 'SimpleIPQueryOnlineFill',
        component: () => import('@/views/ip-query/OnlineFillPage.vue'),
        meta: {
          title: '在线填写问卷（简单模式）',
          requiresAuth: true,
        },
      },
      {
        path: 'simple/ip-query/filled',
        name: 'SimpleIPQueryFilled',
        component: () => import('@/views/ip-query/FilledPage.vue'),
        meta: {
          title: '已填写问卷（简单模式）',
          requiresAuth: true,
        },
      },
      {
        path: 'simple/ip-query/upload',
        name: 'SimpleIPQueryUpload',
        component: () => import('@/views/ip-query/UploadPage.vue'),
        meta: {
          title: '问卷上传（简单模式）',
          requiresAuth: true,
        },
      },
      
      // ==================== IP提示词 ====================
      {
        path: 'ip-prompt',
        name: 'IPPromptHome',
        component: () => import('@/views/ip-prompt/SimpleHomePage.vue'),
        meta: {
          title: '简单拼接',
          icon: 'merge',
          group: 'IP提示词',
          requiresAuth: true,
        },
      },
      {
        path: 'ip-prompt/upload',
        name: 'IPPromptUpload',
        component: () => import('@/views/ip-prompt/UploadPage.vue'),
        meta: {
          title: '提示词上传',
          icon: 'upload',
          group: 'IP提示词',
          requiresAuth: true,
        },
      },
      {
        path: 'ip-prompt/list',
        name: 'IPPromptList',
        component: () => import('@/views/ip-prompt/ListPage.vue'),
        meta: {
          title: '提示词查询',
          icon: 'list',
          group: 'IP提示词',
          requiresAuth: true,
        },
      },
      {
        path: 'ip-prompt/merge',
        name: 'IPPromptMerge',
        component: () => import('@/views/ip-prompt/MergePage.vue'),
        meta: {
          title: '提示词拼接',
          icon: 'merge',
          group: 'IP提示词',
          requiresAuth: true,
        },
      },
      {
        path: 'ip-prompt/results',
        name: 'IPPromptResults',
        component: () => import('@/views/ip-prompt/ResultsPage.vue'),
        meta: {
          title: '拼接结果',
          icon: 'result',
          group: 'IP提示词',
          requiresAuth: true,
        },
      },
      
      // ==================== 账号运营 - 简介 ====================
      {
        path: 'account/brief',
        name: 'AccountBrief',
        component: () => import('@/views/account/BriefPage.vue'),
        meta: {
          title: '账号简介',
          icon: 'user',
          group: '账号运营',
          requiresAuth: true,
        },
      },
      
      // ==================== 账号运营 - 头像 ====================
      {
        path: 'account/avatar',
        name: 'AccountAvatar',
        component: () => import('@/views/account/AvatarPage.vue'),
        meta: {
          title: '账号头像',
          icon: 'avatar',
          group: '账号运营',
          requiresAuth: true,
        },
      },
      
      // ==================== 账号运营 - 头图 ====================
      {
        path: 'account/cover',
        name: 'AccountCover',
        component: () => import('@/views/account/CoverPage.vue'),
        meta: {
          title: '账号头图',
          icon: 'image',
          group: '账号运营',
          requiresAuth: true,
        },
      },
      
      // ==================== 直播间搭建 - 主题 ====================
      {
        path: 'live/theme',
        name: 'LiveTheme',
        component: () => import('@/views/live/ThemePage.vue'),
        meta: {
          title: '直播主题',
          icon: 'star',
          group: '直播间搭建',
          requiresAuth: true,
        },
      },
      
      // ==================== 直播间搭建 - 背景 ====================
      {
        path: 'live/background',
        name: 'LiveBackground',
        component: () => import('@/views/live/BackgroundPage.vue'),
        meta: {
          title: '直播背景',
          icon: 'image',
          group: '直播间搭建',
          requiresAuth: true,
        },
      },
      
      // ==================== 直播间搭建 - 话术 ====================
      {
        path: 'live/script',
        name: 'LiveScript',
        component: () => import('@/views/live/ScriptPage.vue'),
        meta: {
          title: '直播话术',
          icon: 'document',
          group: '直播间搭建',
          requiresAuth: true,
        },
      },
      
      // ==================== 直播间搭建 - 数据分析 ====================
      {
        path: 'live/data-analysis',
        name: 'LiveDataAnalysis',
        component: () => import('@/views/live/DataAnalysisPage.vue'),
        meta: {
          title: '数据分析',
          icon: 'chart',
          group: '直播间搭建',
          requiresAuth: true,
        },
      },
      
      // ==================== 直播间搭建 - 投流分析 ====================
      {
        path: 'live/touliu',
        name: 'LiveTouliu',
        component: () => import('@/views/live/TouliuPage.vue'),
        meta: {
          title: '投流分析',
          icon: 'trend',
          group: '直播间搭建',
          requiresAuth: true,
        },
      },
      
      // ==================== 积分中心 ====================
      {
        path: 'points',
        name: 'Points',
        component: () => import('@/views/points/PointsPage.vue'),
        meta: {
          title: '积分中心',
          icon: 'coin',
          requiresAuth: true,
        },
      },
      
      // ==================== 个人中心 ====================
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/profile/ProfilePage.vue'),
        meta: {
          title: '个人中心',
          icon: 'settings',
          requiresAuth: true,
        },
      },
    ],
  },
  
  // 404页面
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/error/NotFoundPage.vue'),
    meta: {
      title: '页面未找到',
      requiresAuth: false,
    },
  },
]

/**
 * 创建路由实例
 */
const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  },
})

/**
 * 路由守卫 - 认证检查
 */
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  // 设置页面标题
  document.title = `${to.meta.title || 'IP定位平台'} - IP定位运营平台`
  
  // 检查是否需要认证（仅当 meta.requiresAuth === true 时）
  if (to.meta.requiresAuth === true) {
    if (!authStore.isAuthenticated) {
      // 未登录，跳转到登录页
      next({
        path: '/login',
        query: { redirect: to.fullPath },
      })
      return
    }
  } else if (to.path === '/login' || to.path === '/register') {
    // 如果已登录，访问登录/注册页时重定向到首页
    if (authStore.isAuthenticated) {
      next('/app')
      return
    }
  }
  
  next()
})

// 路由加载/解析错误捕获（例如懒加载 chunk 失败）
router.onError((err) => {
  // eslint-disable-next-line no-console
  console.error('[Router error]', err)
})

export default router
