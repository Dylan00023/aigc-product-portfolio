<script setup lang="ts">
/**
 * 通用占位页面组件
 * 用于尚未完全实现的页面
 */

defineProps<{
  title: string
  description?: string
}>()
</script>

<template>
  <div class="space-y-6">
    <!-- 页面标题 -->
    <div>
      <h1 class="text-2xl font-bold text-white">{{ title }}</h1>
      <p class="text-dark-400 mt-1">{{ description || '页面开发中...' }}</p>
    </div>
    
    <!-- 占位内容 -->
    <div class="card-premium p-12 text-center">
      <div class="max-w-md mx-auto">
        <div class="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center">
          <svg class="w-10 h-10 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h2 class="text-xl font-semibold text-white mb-2">功能开发中</h2>
        <p class="text-dark-400">该页面功能正在紧张开发中，敬请期待...</p>
      </div>
    </div>
  </div>
</template>
