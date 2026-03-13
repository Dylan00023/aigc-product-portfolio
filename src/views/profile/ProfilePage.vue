<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app'

const authStore = useAuthStore()
const appStore = useAppStore()

const loading = ref(false)

onMounted(() => {
  authStore.fetchDevices()
})

const handleKickDevice = async (deviceId: string) => {
  if (confirm('确定要踢下线该设备吗？')) {
    const result = await authStore.kickDevice(deviceId)
    if (result.success) {
      appStore.notifySuccess('操作成功', '设备已踢下线')
    } else {
      appStore.notifyError('操作失败', result.message || '未知错误')
    }
  }
}

const handleLogoutAll = async () => {
  if (confirm('确定要退出所有设备吗？这将包括当前设备。')) {
    await authStore.logout(true)
    window.location.href = '/login'
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- 页面标题 -->
    <div>
      <h1 class="text-2xl font-bold text-white">个人中心</h1>
      <p class="text-dark-400 mt-1">管理您的账户和设备</p>
    </div>
    
    <!-- 账户信息 -->
    <div class="card-premium p-8">
      <h3 class="text-xl font-semibold text-white mb-6">账户信息</h3>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="flex items-center gap-4 p-4 bg-dark-800/50 rounded-lg border border-dark-700">
          <div class="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <p class="text-sm text-dark-400">设备ID</p>
            <p class="text-white font-medium">{{ authStore.deviceId || '-' }}</p>
          </div>
        </div>
        
        <div class="flex items-center gap-4 p-4 bg-dark-800/50 rounded-lg border border-dark-700">
          <div class="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p class="text-sm text-dark-400">登录状态</p>
            <p class="text-green-400 font-medium">已登录</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 设备管理 -->
    <div class="card-premium p-8">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-xl font-semibold text-white">设备管理</h3>
        <button
          @click="handleLogoutAll"
          class="btn-secondary text-red-400 hover:text-red-300"
        >
          退出所有设备
        </button>
      </div>
      
      <!-- 设备列表 -->
      <div v-if="authStore.devices.length > 0" class="space-y-3">
        <div
          v-for="device in authStore.devices"
          :key="device.device_id"
          class="flex items-center justify-between p-4 bg-dark-800/50 rounded-lg border border-dark-700"
        >
          <div class="flex items-center gap-4">
            <div class="w-10 h-10 rounded-lg bg-dark-700 flex items-center justify-center">
              <svg class="w-5 h-5 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p class="text-white font-medium">{{ device.device_name || device.device_id }}</p>
              <p class="text-sm text-dark-400">IP: {{ device.last_login_ip }} · {{ device.last_login_time }}</p>
            </div>
          </div>
          
          <div class="flex items-center gap-3">
            <span v-if="device.device_id === authStore.deviceId" class="badge-success">当前设备</span>
            <button
              v-else
              @click="handleKickDevice(device.device_id)"
              class="px-3 py-1 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              踢下线
            </button>
          </div>
        </div>
      </div>
      
      <div v-else class="text-center py-8 text-dark-400">
        暂无设备信息
      </div>
    </div>
  </div>
</template>
