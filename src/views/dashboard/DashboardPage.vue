<script setup lang="ts">
/**
 * 首页概览
 * 展示系统概览和快捷入口
 */

import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'

const router = useRouter()
const appStore = useAppStore()

// 快捷入口卡片
const quickLinks = [
  {
    title: 'IP调查问卷',
    description: '上传和管理IP定位调查问卷',
    icon: 'document',
    color: 'primary',
    path: '/ip-query/upload',
  },
  {
    title: 'IP提示词拼接',
    description: '智能拼接生成IP定位提示词',
    icon: 'lightning',
    color: 'accent',
    path: '/ip-prompt/merge',
  },
  {
    title: '账号运营',
    description: '账号简介、头像、头图生成',
    icon: 'user',
    color: 'green',
    path: '/account/brief',
  },
  {
    title: '直播间搭建',
    description: '主题、背景、话术一站式生成',
    icon: 'video',
    color: 'blue',
    path: '/live/theme',
  },
]

// 获取颜色类
const getColorClass = (color: string) => {
  const colors: Record<string, string> = {
    primary: 'from-primary-500 to-primary-600',
    accent: 'from-accent-500 to-accent-600',
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

onMounted(() => {
  // 获取积分
  appStore.fetchPoints()
})
</script>

<template>
  <div class="space-y-6">
    <!-- 欢迎区域 -->
    <div class="card-premium p-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-white mb-2">
            欢迎使用 <span class="text-gradient">IP定位平台</span>
          </h1>
          <p class="text-dark-400">智能化运营管理系统，助力您的IP定位和直播运营</p>
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
    
    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="card-premium p-6">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center">
            <svg class="w-6 h-6 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <p class="text-sm text-dark-400">问卷数量</p>
            <p class="text-2xl font-bold text-white">0</p>
          </div>
        </div>
      </div>
      
      <div class="card-premium p-6">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-accent-500/20 flex items-center justify-center">
            <svg class="w-6 h-6 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <p class="text-sm text-dark-400">提示词数量</p>
            <p class="text-2xl font-bold text-white">0</p>
          </div>
        </div>
      </div>
      
      <div class="card-premium p-6">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
            <svg class="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p class="text-sm text-dark-400">完成任务</p>
            <p class="text-2xl font-bold text-white">0</p>
          </div>
        </div>
      </div>
      
      <div class="card-premium p-6">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
            <svg class="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p class="text-sm text-dark-400">剩余积分</p>
            <p class="text-2xl font-bold text-yellow-400">{{ appStore.points }}</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 快捷入口 -->
    <div>
      <h2 class="text-xl font-bold text-white mb-4">快捷入口</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          v-for="link in quickLinks"
          :key="link.path"
          @click="router.push(link.path)"
          class="card-premium p-6 cursor-pointer hover:scale-105 transition-transform duration-200"
        >
          <div class="flex items-start gap-4">
            <div :class="['w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-glow', getColorClass(link.color)]">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="getIcon(link.icon)" />
              </svg>
            </div>
            <div class="flex-1">
              <h3 class="text-lg font-semibold text-white mb-1">{{ link.title }}</h3>
              <p class="text-sm text-dark-400">{{ link.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 功能介绍 -->
    <div class="card-premium p-8">
      <h2 class="text-xl font-bold text-white mb-6">平台功能</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="flex gap-4">
          <div class="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center flex-shrink-0">
            <svg class="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div>
            <h3 class="font-semibold text-white mb-2">IP调查问卷</h3>
            <p class="text-sm text-dark-400">上传和管理IP定位调查问卷，支持多种格式文件</p>
          </div>
        </div>
        
        <div class="flex gap-4">
          <div class="w-10 h-10 rounded-lg bg-accent-500/20 flex items-center justify-center flex-shrink-0">
            <svg class="w-5 h-5 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h3 class="font-semibold text-white mb-2">智能拼接</h3>
            <p class="text-sm text-dark-400">AI智能拼接调查问卷和提示词，生成精准内容</p>
          </div>
        </div>
        
        <div class="flex gap-4">
          <div class="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
            <svg class="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h3 class="font-semibold text-white mb-2">智能生成</h3>
            <p class="text-sm text-dark-400">自动生成账号头像、头图、直播背景等素材</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
