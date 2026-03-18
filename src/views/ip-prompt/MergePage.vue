<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAppStore } from '@/stores/app'
import { ipPromptApi, ipQueryApi } from '@/api'

const appStore = useAppStore()

// 提示词列表（用于选择）
const promptList = ref<any[]>([])
const filledList = ref<any[]>([])  // 已填问卷列表
const mergeForm = ref({ prompt_id: '', querryquerryfilled_id: '' })
const merging = ref(false)

const fetchPromptList = async () => {
  try {
    const res = await ipPromptApi.getList({ page: 1, page_size: 100 })
    if (res.code === 200 && res.data) promptList.value = res.data.records
  } catch {}
}
const fetchFilledList = async () => {
  try {
    const res = await ipQueryApi.getFilledList({ page: 1, page_size: 100 })
    if (res.code === 200 && res.data) filledList.value = res.data.records
  } catch {}
}

const handleMerge = async () => {
  if (!mergeForm.value.prompt_id || !mergeForm.value.querryfilled_id) {
    appStore.notifyError('请选择', '提示词和已填问卷均为必填')
    return
  }
  merging.value = true
  try {
    const res = await ipPromptApi.merge({
      prompt_id: Number(mergeForm.value.prompt_id),
      querryfilled_id: Number(mergeForm.value.querryfilled_id),
    })
    if (res.code === 200) {
      appStore.notifySuccess('任务已提交', '请在拼接结果中查看')
      mergeForm.value = { prompt_id: '', querryfilled_id: '' }
    } else throw new Error(res.msg)
  } catch(e:any) { appStore.notifyError('提交失败', e.message) }
  finally { merging.value = false }
}

const formatTime = (t: string) => t?.replace('T',' ').substring(0,19) ?? '-'

onMounted(() => { fetchPromptList(); fetchFilledList() })
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold" :style="{color:'var(--text-primary)'}">IP提示词拼接</h1>
      <p class="mt-1 text-sm" :style="{color:'var(--text-muted)'}">选择IP提示词和已填写问卷，智能拼接生成IP定位内容</p>
    </div>
    <div class="card-premium p-8 space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block text-sm font-medium mb-2" :style="{color:'var(--text-secondary)'}">IP提示词 <span class="text-red-500">*</span></label>
          <select v-model="mergeForm.prompt_id" class="input">
            <option value="">请选择提示词</option>
            <option v-for="p in promptList" :key="p.id" :value="String(p.id)">
              #{{ p.id }} {{ p.name || '未命名' }}
            </option>
          </select>
          <p v-if="promptList.length===0" class="text-xs mt-1" :style="{color:'var(--text-muted)'}">暂无提示词，请先前往「提示词上传」页面上传</p>
        </div>
        <div>
          <label class="block text-sm font-medium mb-2" :style="{color:'var(--text-secondary)'}">已填写问卷 <span class="text-red-500">*</span></label>
          <select v-model="mergeForm.querryfilled_id" class="input">
            <option value="">请选择已填问卷</option>
            <option v-for="f in filledList" :key="f.id" :value="String(f.id)">
              #{{ f.id }} ({{ formatTime(f.create_time) }})
            </option>
          </select>
          <p v-if="filledList.length===0" class="text-xs mt-1" :style="{color:'var(--text-muted)'}">暂无已填问卷，请先前往「IP调查问卷」提交</p>
        </div>
      </div>
      <div class="p-4 rounded-lg" :style="{background:'var(--bg-surface-2)'}">
        <p class="text-sm" :style="{color:'var(--text-muted)'}"><span class="font-medium" :style="{color:'var(--text-secondary)'}">说明：</span>系统将自动把选中的IP提示词模板与已填写的问卷内容进行智能拼接，生成完整的IP定位提示词文案。生成结果可在「拼接结果」页面查看。</p>
      </div>
      <button @click="handleMerge" :disabled="merging" class="btn-primary flex items-center gap-2">
        <svg v-if="merging" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
        <span>{{ merging ? '提交中...' : '开始拼接生成' }}</span>
      </button>
    </div>
  </div>
</template>
