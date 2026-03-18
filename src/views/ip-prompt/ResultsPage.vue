<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAppStore } from '@/stores/app'
import { ipPromptApi, ipQueryApi } from '@/api'

const appStore = useAppStore()
const results = ref<any[]>([])
const total = ref(0)
const loading = ref(false)
const statusFilter = ref('')
const signedUrlMap = ref<Record<number,string>>({})
const loadingIds = ref<Set<number>>(new Set())

const fetchResults = async () => {
  loading.value = true
  try {
    const params: any = { page: 1, page_size: 20 }
    if (statusFilter.value !== '') params.status = Number(statusFilter.value)
    const res = await ipPromptApi.getMergeResults(params)
    if (res.code === 200 && res.data) { results.value = res.data.records; total.value = res.data.total }
  } catch(e:any) { appStore.notifyError('获取失败', e.message) }
  finally { loading.value = false }
}

const getSignedUrl = async (r: any) => {
  if (!r.task_record || signedUrlMap.value[r.id]) return
  const newIds = new Set(loadingIds.value); newIds.add(r.id); loadingIds.value = newIds
  try {
    const res = await ipQueryApi.getSignedUrl({ url: r.task_record })
    if (res.code === 200 && res.data?.signed_url)
      signedUrlMap.value = { ...signedUrlMap.value, [r.id]: res.data.signed_url }
  } catch {}
  finally { const s = new Set(loadingIds.value); s.delete(r.id); loadingIds.value = s }
}

const statusLabel = (s: number) => (['待处理','处理中','处理成功','处理失败','已取消'][s] ?? '未知')
const statusClass = (s: number) => (['badge-warning','badge-primary','badge-success','badge-error','badge-error'][s] ?? '')
const formatTime = (t: string) => t?.replace('T',' ').substring(0,19) ?? '-'

onMounted(() => {
  fetchResults()
})
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold" :style="{color:'var(--text-primary)'}">IP提示词拼接结果</h1>
      <p class="mt-1 text-sm" :style="{color:'var(--text-muted)'}">查看所有IP提示词拼接生成的结果</p>
    </div>
    <div class="card-premium overflow-hidden">
      <div class="flex items-center justify-between px-6 py-4" :style="{borderBottom:'1px solid var(--border-base)'}">
        <select v-model="statusFilter" @change="fetchResults()" class="input w-36 text-sm">
          <option value="">全部状态</option>
          <option value="0">待处理</option>
          <option value="1">处理中</option>
          <option value="2">处理成功</option>
          <option value="3">处理失败</option>
          <option value="4">已取消</option>
        </select>
        <div class="flex items-center gap-3">
          <span class="text-sm" :style="{color:'var(--text-muted)'}">共 {{ total }} 条</span>
          <button @click="fetchResults" :disabled="loading" class="btn-secondary text-sm flex items-center gap-1">
            <svg class="w-4 h-4" :class="{'animate-spin':loading}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
            刷新
          </button>
        </div>
      </div>
      <div v-if="loading" class="flex justify-center py-16">
        <svg class="animate-spin w-8 h-8 text-primary-400" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
      </div>
      <div v-else-if="results.length===0" class="flex flex-col items-center py-16" :style="{color:'var(--text-muted)'}">
        暂无拼接结果
      </div>
      <table v-else class="w-full">
        <thead>
          <tr :style="{borderBottom:'1px solid var(--border-base)'}">
            <th class="text-left px-6 py-3 text-sm font-medium" :style="{color:'var(--text-muted)'}">ID</th>
            <th class="text-left px-6 py-3 text-sm font-medium" :style="{color:'var(--text-muted)'}">状态</th>
            <th class="text-left px-6 py-3 text-sm font-medium" :style="{color:'var(--text-muted)'}">消耗积分</th>
            <th class="text-left px-6 py-3 text-sm font-medium" :style="{color:'var(--text-muted)'}">创建时间</th>
            <th class="text-left px-6 py-3 text-sm font-medium" :style="{color:'var(--text-muted)'}">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="r in results" :key="r.id"
            :style="{borderBottom:'1px solid var(--border-base)'}"
            @mouseenter="$event.currentTarget.style.background='var(--bg-hover)'"
            @mouseleave="$event.currentTarget.style.background=''"
          >
            <td class="px-6 py-3 text-sm" :style="{color:'var(--text-muted)'}">#{{ r.id }}</td>
            <td class="px-6 py-3"><span :class="['badge', statusClass(r.status)]">{{ statusLabel(r.status) }}</span></td>
            <td class="px-6 py-3 text-sm" :style="{color:'var(--text-primary)'}">{{ r.consume_points ?? '-' }}</td>
            <td class="px-6 py-3 text-sm" :style="{color:'var(--text-muted)'}">{{ formatTime(r.create_time) }}</td>
            <td class="px-6 py-3">
              <template v-if="r.status===2 && r.task_record">
                <button v-if="!signedUrlMap[r.id]" @click="getSignedUrl(r)" :disabled="loadingIds.has(r.id)" class="text-sm text-primary-500 hover:text-primary-400">
                  {{ loadingIds.has(r.id) ? '获取中...' : '获取下载链接' }}
                </button>
                <a v-else :href="signedUrlMap[r.id]" target="_blank" download class="text-sm text-accent-500 hover:text-accent-400">下载结果</a>
              </template>
              <span v-else :style="{color:'var(--text-muted)'}">-</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
