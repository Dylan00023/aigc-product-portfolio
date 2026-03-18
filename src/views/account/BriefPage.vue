<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAppStore } from '@/stores/app'
import { accountBriefApi, ipPromptApi, ipQueryApi } from '@/api'
import type { AccountBriefPromptRecord, TaskRecord, IPPromptMergeResult } from '@/types/api'

const appStore = useAppStore()

// 当前标签页
const activeTab = ref<'upload' | 'list' | 'merge' | 'results'>('upload')

// ==================== 上传 ====================
const uploadFile = ref<File | null>(null)
const fileInputRef = ref<HTMLInputElement>()
const uploading = ref(false)
const uploadForm = ref({ type: '', name: '', jianjie: '' })

const handleFileSelect = (e: Event) => {
  const f = (e.target as HTMLInputElement).files?.[0]
  if (!f) return
  if (!f.name.match(/\.(doc|docx)$/i)) { appStore.notifyError('格式错误', '请上传 .doc 或 .docx 文件'); return }
  if (f.size > 10 * 1024 * 1024) { appStore.notifyError('文件过大', '最大 10MB'); return }
  uploadFile.value = f
}
const removeFile = () => { uploadFile.value = null; if (fileInputRef.value) fileInputRef.value.value = '' }
const handleUpload = async () => {
  if (!uploadFile.value) { appStore.notifyError('请选择文件', ''); return }
  uploading.value = true
  try {
    const fd = new FormData()
    fd.append('file', uploadFile.value)
    fd.append('type', uploadForm.value.type)
    fd.append('name', uploadForm.value.name)
    fd.append('jianjie', uploadForm.value.jianjie)
    const res = await accountBriefApi.upload(fd)
    if (res.code === 200) {
      appStore.notifySuccess('上传成功')
      uploadForm.value = { type: '', name: '', jianjie: '' }
      removeFile()
      fetchPromptList()
    } else throw new Error(res.msg)
  } catch (e: any) { appStore.notifyError('上传失败', e.message) }
  finally { uploading.value = false }
}

// ==================== 提示词列表 ====================
const promptList = ref<AccountBriefPromptRecord[]>([])
const promptTotal = ref(0)
const promptPage = ref(1)
const promptLoading = ref(false)
const fetchPromptList = async () => {
  promptLoading.value = true
  try {
    const res = await accountBriefApi.getList({ page: promptPage.value, page_size: 10 })
    if (res.code === 200 && res.data) { promptList.value = res.data.records; promptTotal.value = res.data.total }
  } catch (e: any) { appStore.notifyError('获取失败', e.message) }
  finally { promptLoading.value = false }
}

// ==================== 拼接生成 ====================
// IP提示词拼接结果列表（用于选 IPmix_id）
const ipMixList = ref<IPPromptMergeResult[]>([])
const mergeForm = ref({ prompt_id: '', IPmix_id: '' })
const merging = ref(false)
const fetchIpMixList = async () => {
  try {
    const res = await ipPromptApi.getMergeResults({ page: 1, page_size: 100, status: 2 })
    if (res.code === 200 && res.data) ipMixList.value = res.data.records
  } catch {}
}
const handleMerge = async () => {
  if (!mergeForm.value.prompt_id || !mergeForm.value.IPmix_id) {
    appStore.notifyError('请选择', '提示词ID和IP拼接结果ID均为必填'); return
  }
  merging.value = true
  try {
    const res = await accountBriefApi.merge({
      prompt_id: Number(mergeForm.value.prompt_id),
      IPmix_id: Number(mergeForm.value.IPmix_id),
    })
    if (res.code === 200) {
      appStore.notifySuccess('任务已提交', '请在拼接结果中查看')
      mergeForm.value = { prompt_id: '', IPmix_id: '' }
      activeTab.value = 'results'
      fetchResults()
    } else throw new Error(res.msg)
  } catch (e: any) { appStore.notifyError('提交失败', e.message) }
  finally { merging.value = false }
}

// ==================== 拼接结果 ====================
const results = ref<TaskRecord[]>([])
const resultsTotal = ref(0)
const resultsPage = ref(1)
const resultsLoading = ref(false)
const statusFilter = ref('')
const signedUrlMap = ref<Record<number, string>>({})
const loadingSignedIds = ref<Set<number>>(new Set())

const fetchResults = async () => {
  resultsLoading.value = true
  try {
    const params: any = { page: resultsPage.value, page_size: 10 }
    if (statusFilter.value !== '') params.status = Number(statusFilter.value)
    const res = await accountBriefApi.getMergeResults(params)
    if (res.code === 200 && res.data) { results.value = res.data.records; resultsTotal.value = res.data.total }
  } catch (e: any) { appStore.notifyError('获取失败', e.message) }
  finally { resultsLoading.value = false }
}

const getSignedUrl = async (record: TaskRecord) => {
  if (!record.task_record || signedUrlMap.value[record.id]) return
  loadingSignedIds.value = new Set([...loadingSignedIds.value, record.id])
  try {
    const res = await ipQueryApi.getSignedUrl({ url: record.task_record })
    if (res.code === 200 && res.data?.signed_url) {
      signedUrlMap.value = { ...signedUrlMap.value, [record.id]: res.data.signed_url }
    }
  } catch {}
  finally {
    const s = new Set(loadingSignedIds.value); s.delete(record.id); loadingSignedIds.value = s
  }
}

const statusLabel = (s: number) => (['待处理','处理中','处理成功','处理失败','已取消'][s] ?? '未知')
const statusClass = (s: number) => (['badge-warning','badge-primary','badge-success','badge-error','badge-error'][s] ?? '')
const formatTime = (t: string) => t?.replace('T',' ').substring(0,19) ?? '-'

onMounted(() => {
  fetchPromptList()
  fetchIpMixList()
  fetchResults()
})
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold" :style="{color:'var(--text-primary)'}">账号简介</h1>
      <p class="mt-1 text-sm" :style="{color:'var(--text-muted)'}">上传简介提示词，基于IP拼接结果生成账号简介文案</p>
    </div>

    <!-- 标签页 -->
    <div class="flex gap-1 p-1 rounded-xl" :style="{background:'var(--bg-surface-2)'}">
      <button v-for="tab in [{k:'upload',l:'提示词上传'},{k:'list',l:'提示词列表'},{k:'merge',l:'拼接生成'},{k:'results',l:'拼接结果'}]" :key="tab.k"
        @click="activeTab = tab.k"
        class="flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200"
        :style="activeTab===tab.k ? {background:'var(--bg-surface)',color:'var(--color-primary-500)',boxShadow:'0 1px 4px rgba(0,0,0,0.08)'} : {color:'var(--text-muted)'}"
      >{{ tab.l }}</button>
    </div>

    <!-- 提示词上传 -->
    <div v-if="activeTab==='upload'" class="card-premium p-8 space-y-6">
      <div
        @click="fileInputRef?.click()"
        :class="['relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200',
          uploadFile ? 'border-primary-500 bg-primary-500/5' : 'border-dark-600 hover:border-primary-400']"
      >
        <input ref="fileInputRef" type="file" accept=".doc,.docx" @change="handleFileSelect" class="hidden" />
        <div v-if="!uploadFile" class="space-y-3">
          <div class="w-14 h-14 mx-auto rounded-full flex items-center justify-center" :style="{background:'var(--bg-surface-2)'}">
            <svg class="w-7 h-7 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>
          </div>
          <p class="font-medium" :style="{color:'var(--text-primary)'}">点击上传提示词文件</p>
          <p class="text-sm" :style="{color:'var(--text-muted)'}">支持 .doc .docx，最大 10MB</p>
        </div>
        <div v-else class="flex items-center justify-center gap-4">
          <div class="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center">
            <svg class="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
          </div>
          <span class="text-sm font-medium" :style="{color:'var(--text-primary)'}">{{ uploadFile.name }}</span>
          <button type="button" @click.stop="removeFile" class="p-1 rounded text-red-400 hover:bg-red-500/10"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg></button>
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div><label class="block text-sm font-medium mb-1" :style="{color:'var(--text-secondary)'}">类别</label><input v-model="uploadForm.type" placeholder="如：简洁版" class="input" /></div>
        <div><label class="block text-sm font-medium mb-1" :style="{color:'var(--text-secondary)'}">名称</label><input v-model="uploadForm.name" placeholder="提示词名称" class="input" /></div>
        <div><label class="block text-sm font-medium mb-1" :style="{color:'var(--text-secondary)'}">简介</label><input v-model="uploadForm.jianjie" placeholder="简单描述" class="input" /></div>

      </div>
      <button @click="handleUpload" :disabled="uploading||!uploadFile" class="btn-primary flex items-center gap-2">
        <svg v-if="uploading" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
        <span>{{ uploading ? '上传中...' : '上传提示词' }}</span>
      </button>
    </div>

    <!-- 提示词列表 -->
    <div v-if="activeTab==='list'" class="card-premium overflow-hidden">
      <div class="flex items-center justify-between px-6 py-4" :style="{borderBottom:'1px solid var(--border-base)'}">
        <span class="font-medium" :style="{color:'var(--text-primary)'}">共 {{ promptTotal }} 条</span>
        <button @click="fetchPromptList" :disabled="promptLoading" class="btn-secondary text-sm">刷新</button>
      </div>
      <div v-if="promptLoading" class="flex justify-center py-16"><svg class="animate-spin w-8 h-8 text-primary-400" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg></div>
      <div v-else-if="promptList.length===0" class="flex flex-col items-center py-16" :style="{color:'var(--text-muted)'}">暂无数据</div>
      <table v-else class="w-full">
        <thead><tr :style="{borderBottom:'1px solid var(--border-base)'}">
          <th class="text-left px-6 py-3 text-sm font-medium" :style="{color:'var(--text-muted)'}">ID</th>
          <th class="text-left px-6 py-3 text-sm font-medium" :style="{color:'var(--text-muted)'}">名称</th>
          <th class="text-left px-6 py-3 text-sm font-medium" :style="{color:'var(--text-muted)'}">类别</th>
          <th class="text-left px-6 py-3 text-sm font-medium" :style="{color:'var(--text-muted)'}">上传时间</th>
          <th class="text-left px-6 py-3 text-sm font-medium" :style="{color:'var(--text-muted)'}">操作</th>
        </tr></thead>
        <tbody>
          <tr v-for="r in promptList" :key="r.id" :style="{borderBottom:'1px solid var(--border-base)'}">
            <td class="px-6 py-3 text-sm" :style="{color:'var(--text-muted)'}">#{{ r.id }}</td>
            <td class="px-6 py-3 text-sm font-medium" :style="{color:'var(--text-primary)'}">{{ r.name || '未命名' }}</td>
            <td class="px-6 py-3"><span v-if="r.type" class="badge badge-primary">{{ r.type }}</span><span v-else :style="{color:'var(--text-muted)'}">-</span></td>
            <td class="px-6 py-3 text-sm" :style="{color:'var(--text-muted)'}">{{ formatTime(r.create_time) }}</td>
            <td class="px-6 py-3"><button @click="mergeForm.prompt_id=String(r.id);activeTab='merge'" class="text-sm text-primary-500 hover:text-primary-400">用此拼接</button></td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 拼接生成 -->
    <div v-if="activeTab==='merge'" class="card-premium p-8 space-y-6">
      <p class="text-sm" :style="{color:'var(--text-muted)'}">选择账号简介提示词和IP提示词拼接结果，生成账号简介文案</p>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block text-sm font-medium mb-2" :style="{color:'var(--text-secondary)'}">简介提示词 <span class="text-red-500">*</span></label>
          <select v-model="mergeForm.prompt_id" class="input">
            <option value="">请选择提示词</option>
            <option v-for="p in promptList" :key="p.id" :value="String(p.id)">#{{ p.id }} {{ p.name || '未命名' }}</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium mb-2" :style="{color:'var(--text-secondary)'}">IP拼接结果 <span class="text-red-500">*</span></label>
          <select v-model="mergeForm.IPmix_id" class="input">
            <option value="">请选择IP拼接结果</option>
            <option v-for="m in ipMixList" :key="m.id" :value="String(m.id)">#{{ m.id }} ({{ formatTime(m.create_time) }})</option>
          </select>
        </div>
      </div>
      <button @click="handleMerge" :disabled="merging" class="btn-primary flex items-center gap-2">
        <svg v-if="merging" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
        <span>{{ merging ? '提交中...' : '开始生成' }}</span>
      </button>
    </div>

    <!-- 拼接结果 -->
    <div v-if="activeTab==='results'" class="card-premium overflow-hidden">
      <div class="flex items-center justify-between px-6 py-4" :style="{borderBottom:'1px solid var(--border-base)'}">
        <select v-model="statusFilter" @change="resultsPage=1;fetchResults()" class="input w-36 text-sm">
          <option value="">全部状态</option>
          <option value="0">待处理</option><option value="1">处理中</option><option value="2">处理成功</option><option value="3">处理失败</option><option value="4">已取消</option>
        </select>
        <button @click="fetchResults" :disabled="resultsLoading" class="btn-secondary text-sm">刷新</button>
      </div>
      <div v-if="resultsLoading" class="flex justify-center py-16"><svg class="animate-spin w-8 h-8 text-primary-400" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg></div>
      <div v-else-if="results.length===0" class="flex flex-col items-center py-16" :style="{color:'var(--text-muted)'}">暂无结果</div>
      <table v-else class="w-full">
        <thead><tr :style="{borderBottom:'1px solid var(--border-base)'}">
          <th class="text-left px-6 py-3 text-sm font-medium" :style="{color:'var(--text-muted)'}">ID</th>
          <th class="text-left px-6 py-3 text-sm font-medium" :style="{color:'var(--text-muted)'}">状态</th>
          <th class="text-left px-6 py-3 text-sm font-medium" :style="{color:'var(--text-muted)'}">消耗积分</th>
          <th class="text-left px-6 py-3 text-sm font-medium" :style="{color:'var(--text-muted)'}">创建时间</th>
          <th class="text-left px-6 py-3 text-sm font-medium" :style="{color:'var(--text-muted)'}">操作</th>
        </tr></thead>
        <tbody>
          <tr v-for="r in results" :key="r.id" :style="{borderBottom:'1px solid var(--border-base)'}">
            <td class="px-6 py-3 text-sm" :style="{color:'var(--text-muted)'}">#{{ r.id }}</td>
            <td class="px-6 py-3"><span :class="['badge', statusClass(r.status)]">{{ statusLabel(r.status) }}</span></td>
            <td class="px-6 py-3 text-sm" :style="{color:'var(--text-primary)'}">{{ r.consume_points }}</td>
            <td class="px-6 py-3 text-sm" :style="{color:'var(--text-muted)'}">{{ formatTime(r.create_time) }}</td>
            <td class="px-6 py-3">
              <template v-if="r.status===2 && r.task_record">
                <button v-if="!signedUrlMap[r.id]" @click="getSignedUrl(r)" :disabled="loadingSignedIds.has(r.id)" class="text-sm text-primary-500 hover:text-primary-400">{{ loadingSignedIds.has(r.id) ? '获取中...' : '获取下载链接' }}</button>
                <a v-else :href="signedUrlMap[r.id]" target="_blank" download class="text-sm text-accent-500 hover:text-accent-400">下载结果</a>
              </template>
              <span v-else :style="{color:'var(--text-muted)'}">&#8212;</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
