<script setup lang="ts">
import { ref } from 'vue'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()

const kamiCode = ref('')
const loading = ref(false)

const handleRecharge = async () => {
  if (!kamiCode.value.trim()) {
    appStore.notifyError('请输入卡密', '卡密不能为空')
    return
  }
  
  loading.value = true
  
  try {
    const result = await appStore.useKami(kamiCode.value.trim())
    
    if (result.success) {
      appStore.notifySuccess('充值成功', result.message)
      kamiCode.value = ''
    } else {
      appStore.notifyError('充值失败', result.message)
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- 页面标题 -->
    <div>
      <h1 class="text-2xl font-bold text-white">积分中心</h1>
      <p class="text-dark-400 mt-1">管理您的积分和卡密充值</p>
    </div>
    
    <!-- 积分展示 -->
    <div class="card-premium p-8">
      <div class="text-center">
        <div class="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center">
          <svg class="w-12 h-12 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 class="text-lg font-medium text-dark-400 mb-2">当前积分</h2>
        <p class="text-5xl font-bold text-gradient">{{ appStore.points }}</p>
      </div>
    </div>
    
    <!-- 卡密充值 -->
    <div class="card-premium p-8">
      <h3 class="text-xl font-semibold text-white mb-6">卡密充值</h3>
      
      <div class="max-w-md">
        <label class="block text-sm font-medium text-dark-300 mb-2">
          充值卡密
        </label>
        <div class="flex gap-4">
          <input
            v-model="kamiCode"
            type="text"
            placeholder="请输入充值卡密"
            class="input flex-1"
            @keyup.enter="handleRecharge"
          />
          <button
            @click="handleRecharge"
            :disabled="loading"
            class="btn-primary whitespace-nowrap"
          >
            {{ loading ? '充值中...' : '立即充值' }}
          </button>
        </div>
        <p class="mt-3 text-sm text-dark-400">
          输入卡密后点击充值按钮或按回车键完成充值
        </p>
      </div>
    </div>
    
    <!-- 充值说明 -->
    <div class="card-premium p-6">
      <h3 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <svg class="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        积分说明
      </h3>
      <div class="space-y-2 text-sm text-dark-300">
        <p>• 积分用于平台的各项AI生成功能</p>
        <p>• 每次使用AI生成功能会消耗相应积分</p>
        <p>• 积分可通过卡密充值获得</p>
        <p>• 如有疑问请联系客服</p>
      </div>
    </div>
  </div>
</template>
