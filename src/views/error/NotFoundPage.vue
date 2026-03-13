<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-dark-950">
    <div class="text-center">
      <div class="mb-8">
        <h1 class="text-9xl font-bold text-gradient">404</h1>
      </div>
      <h2 class="text-2xl font-semibold text-white mb-4">页面未找到</h2>
      <p class="text-dark-400 mb-8">抱歉，您访问的页面不存在</p>
      <button
        @click="router.push('/')"
        class="btn-primary"
      >
        返回首页
      </button>
    </div>
  </div>
</template>
