<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAppStore } from '@/stores/app'
import { ipPromptApi } from '@/api'

const appStore = useAppStore()
const list = ref<any[]>([])
const total = ref(0)
const loading = ref(false)

const fetchList = async () => {
  loading.value = true
  try {
    const res = await ipPromptApi.getList({ page: 1, page_size: 100 })
    if (res.code === 200 && res.data) { list.value = res.data.records; total.value = res.data.total }
  } catch(e:any) { appStore.notifyError('获取失败', e.message) }
  finally { loading.value = false }
}

const formatTime = (t: string) => t?.replace('T',' ').substring(0,19) ?? '-'

onMounted(() => fetchList())
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold" :style="{color:'var(--text-primary)'}">IP提示词列表</h1>
      <p class="mt-1 text-sm" :style="{color:'var(--text-muted)'}">查看所有已上传的IP提示词</p>
    </div>
    <div class="card-premium overflow-hidden">
      <div class="flex items-center justify-between px-6 py-4" :style="{borderBottom:'1px solid var(--border-base)'}">
        <span class="font-medium" :style="{color:'var(--text-primary)'}">共 {{ total }} 条</span>
        <button @click="fetchList" :disabled="loading" class="btn-secondary text-sm flex items-center gap-1">
          <svg class="w-4 h-4" :class="{'animate-spin':loading}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
          刷新
        </button>
      </div>
      <div v-if="loading" class="flex justify-center py-16">
        <svg class="animate-spin w-8 h-8 text-primary-400" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
      </div>
      <div v-else-if="list.length===0" class="flex flex-col items-center py-16" :style="{color:'var(--text-muted)'}">
        <svg class="w-12 h-12 mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
        <p>暂无提示词，请先上传</p>
      </div>
      <table v-else class="w-full">
        <thead>
          <tr :style="{borderBottom:'1px solid var(--border-base)'}">
            <th class="text-left px-6 py-3 text-sm font-medium" :style="{color:'var(--text-muted)'}">ID</th>
            <th class="text-left px-6 py-3 text-sm font-medium" :style="{color:'var(--text-muted)'}">名称</th>
            <th class="text-left px-6 py-3 text-sm font-medium" :style="{color:'var(--text-muted)'}">类别</th>
            <th class="text-left px-6 py-3 text-sm font-medium" :style="{color:'var(--text-muted)'}">简介</th>
            <th class="text-left px-6 py-3 text-sm font-medium" :style="{color:'var(--text-muted)'}">上传时间</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="r in list" :key="r.id"
            :style="{borderBottom:'1px solid var(--border-base)'}"
            @mouseenter="$event.currentTarget.style.background='var(--bg-hover)'"
            @mouseleave="$event.currentTarget.style.background=''"
          >
            <td class="px-6 py-3 text-sm" :style="{color:'var(--text-muted)'}">#{{ r.id }}</td>
            <td class="px-6 py-3 text-sm font-medium" :style="{color:'var(--text-primary)'}">{{ r.name || '未命名' }}</td>
            <td class="px-6 py-3"><span v-if="r.type" class="badge badge-primary">{{ r.type }}</span><span v-else :style="{color:'var(--text-muted)'}">-</span></td>
            <td class="px-6 py-3 text-sm" :style="{color:'var(--text-muted)'}">{{ r.jianjie || '-' }}</td>
            <td class="px-6 py-3 text-sm" :style="{color:'var(--text-muted)'}">{{ formatTime(r.create_time) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
