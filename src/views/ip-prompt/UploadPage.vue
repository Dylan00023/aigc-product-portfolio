<script setup lang="ts">
import { ref } from 'vue'
import { useAppStore } from '@/stores/app'
import { ipPromptApi } from '@/api'

const appStore = useAppStore()
const uploadFile = ref<File|null>(null)
const fileInputRef = ref<HTMLInputElement>()
const uploading = ref(false)
const form = ref({ type:'', name:'', jianjie:'' })

const handleFileSelect = (e: Event) => {
  const f = (e.target as HTMLInputElement).files?.[0]
  if (!f) return
  if (!f.name.match(/\.(doc|docx)$/i)) { appStore.notifyError('格式错误','请上传 .doc 或 .docx 文件'); return }
  if (f.size > 10*1024*1024) { appStore.notifyError('文件过大','最大 10MB'); return }
  uploadFile.value = f
}
const handleUpload = async () => {
  if (!uploadFile.value) { appStore.notifyError('请选择文件',''); return }
  uploading.value = true
  try {
    const fd = new FormData()
    fd.append('file', uploadFile.value)
    fd.append('type', form.value.type)
    fd.append('name', form.value.name)
    fd.append('jianjie', form.value.jianjie)
    const res = await ipPromptApi.upload(fd)
    if (res.code === 200) {
      appStore.notifySuccess('上传成功', '提示词已上传')
      uploadFile.value = null
      if (fileInputRef.value) fileInputRef.value.value = ''
      form.value = { type:'', name:'', jianjie:'' }
    } else throw new Error(res.msg)
  } catch(e:any) { appStore.notifyError('上传失败', e.message) }
  finally { uploading.value = false }
}
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold" :style="{color:'var(--text-primary)'}">IP提示词上传</h1>
      <p class="mt-1 text-sm" :style="{color:'var(--text-muted)'}">上传IP定位提示词文档，用于后续拼接生成</p>
    </div>
    <div class="card-premium p-8 space-y-6">
      <div
        @click="fileInputRef?.click()"
        :class="['border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-200',
          uploadFile ? 'border-primary-500 bg-primary-500/5' : 'border-dark-600 hover:border-primary-400']"
      >
        <input ref="fileInputRef" type="file" accept=".doc,.docx" @change="handleFileSelect" class="hidden"/>
        <div v-if="!uploadFile" class="space-y-3">
          <div class="w-16 h-16 mx-auto rounded-full flex items-center justify-center" :style="{background:'var(--bg-surface-2)'}">
            <svg class="w-8 h-8 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>
          </div>
          <p class="text-lg font-medium" :style="{color:'var(--text-primary)'}">点击上传提示词文件</p>
          <p class="text-sm" :style="{color:'var(--text-muted)'}">支持 .doc .docx 格式，最大 10MB</p>
        </div>
        <div v-else class="flex items-center justify-center gap-4">
          <div class="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center">
            <svg class="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
          </div>
          <span class="font-medium" :style="{color:'var(--text-primary)'}">{{ uploadFile.name }}</span>
          <button type="button" @click.stop="uploadFile=null" class="p-1 rounded text-red-400 hover:bg-red-500/10">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div><label class="block text-sm font-medium mb-1" :style="{color:'var(--text-secondary)'}">类别</label><input v-model="form.type" placeholder="如：人物定位" class="input"/></div>
        <div><label class="block text-sm font-medium mb-1" :style="{color:'var(--text-secondary)'}">名称</label><input v-model="form.name" placeholder="提示词名称" class="input"/></div>
        <div><label class="block text-sm font-medium mb-1" :style="{color:'var(--text-secondary)'}">简介</label><input v-model="form.jianjie" placeholder="简单描述" class="input"/></div>
      </div>
      <button @click="handleUpload" :disabled="uploading||!uploadFile" class="btn-primary flex items-center gap-2">
        <svg v-if="uploading" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
        <span>{{ uploading ? '上传中...' : '上传提示词' }}</span>
      </button>
    </div>
  </div>
</template>
