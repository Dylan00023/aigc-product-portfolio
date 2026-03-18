<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAppStore } from '@/stores/app'
import { accountCoverApi, ipQueryApi } from '@/api'

const appStore = useAppStore()
const activeTab = ref('upload_prompt')

const promptFile = ref<File|null>(null)
const promptFileRef = ref<HTMLInputElement>()
const promptUploading = ref(false)
const promptForm = ref({ type:'', name:'', jianjie:'' })
const handlePromptFileSelect = (e: Event) => {
  const f = (e.target as HTMLInputElement).files?.[0]
  if (!f) return
  if (!f.name.match(/\.(doc|docx)$/i)) { appStore.notifyError('格式错误','请上传 .doc 或 .docx'); return }
  if (f.size > 10*1024*1024) { appStore.notifyError('文件过大','最大 10MB'); return }
  promptFile.value = f
}
const handlePromptUpload = async () => {
  if (!promptFile.value) return
  promptUploading.value = true
  try {
    const fd = new FormData()
    fd.append('file', promptFile.value)
    fd.append('type', promptForm.value.type)
    fd.append('name', promptForm.value.name)
    fd.append('jianjie', promptForm.value.jianjie)
    const res = await accountCoverApi.uploadPrompt(fd)
    if (res.code === 200) { appStore.notifySuccess('上传成功'); promptFile.value=null; fetchPromptList() }
    else throw new Error(res.msg)
  } catch(e:any) { appStore.notifyError('上传失败',e.message) }
  finally { promptUploading.value=false }
}
const promptList = ref<any[]>([])
const promptLoading = ref(false)
const fetchPromptList = async () => {
  promptLoading.value=true
  try {
    const res = await accountCoverApi.getPromptList({page:1,page_size:100})
    if (res.code===200 && res.data) promptList.value=res.data.records
  } catch(e:any) { appStore.notifyError('获取失败',e.message) }
  finally { promptLoading.value=false }
}
const refFile = ref<File|null>(null)
const refFileRef = ref<HTMLInputElement>()
const refUploading = ref(false)
const refForm = ref({ type:'', name:'', jianjie:'' })
const handleRefFileSelect = (e: Event) => {
  const f = (e.target as HTMLInputElement).files?.[0]
  if (!f) return
  if (!f.type.startsWith('image/')) { appStore.notifyError('格式错误','请上传图片'); return }
  refFile.value = f
}
const handleRefUpload = async () => {
  if (!refFile.value) return
  refUploading.value=true
  try {
    const fd = new FormData()
    fd.append('file', refFile.value)
    fd.append('type', refForm.value.type)
    fd.append('name', refForm.value.name)
    fd.append('jianjie', refForm.value.jianjie)
    const res = await accountCoverApi.uploadRef(fd)
    if (res.code===200) { appStore.notifySuccess('上传成功'); refFile.value=null; fetchRefList() }
    else throw new Error(res.msg)
  } catch(e:any) { appStore.notifyError('上传失败',e.message) }
  finally { refUploading.value=false }
}
const refList = ref<any[]>([])
const refLoading = ref(false)
const fetchRefList = async () => {
  refLoading.value=true
  try {
    const res = await accountCoverApi.getRefList({page:1,page_size:100})
    if (res.code===200 && res.data) refList.value=res.data.records
  } catch(e:any) { appStore.notifyError('获取失败',e.message) }
  finally { refLoading.value=false }
}
const genForm = ref({ prompt_id:'', cankao_id:'' })
const generating = ref(false)
const handleGenerate = async () => {
  if (!genForm.value.prompt_id) { appStore.notifyError('请选择提示词',''); return }
  generating.value=true
  try {
    const params: any = { prompt_id: Number(genForm.value.prompt_id) }
    if (genForm.value.cankao_id) params.cankao_id = Number(genForm.value.cankao_id)
    const res = await accountCoverApi.generate(params)
    if (res.code===200) { appStore.notifySuccess('任务已提交'); activeTab.value='results'; fetchResults() }
    else throw new Error(res.msg)
  } catch(e:any) { appStore.notifyError('提交失败',e.message) }
  finally { generating.value=false }
}
const results = ref<any[]>([])
const resultsLoading = ref(false)
const statusFilter = ref('')
const signedUrlMap = ref<Record<number,string>>({})
const fetchResults = async () => {
  resultsLoading.value=true
  try {
    const params: any = {page:1,page_size:20}
    if (statusFilter.value!=='') params.status=Number(statusFilter.value)
    const res = await accountCoverApi.getResults(params)
    if (res.code===200 && res.data) results.value=res.data.records
  } catch(e:any) { appStore.notifyError('获取失败',e.message) }
  finally { resultsLoading.value=false }
}
const getSignedUrl = async (r: any) => {
  if (!r.task_record || signedUrlMap.value[r.id]) return
  try {
    const res = await ipQueryApi.getSignedUrl({url:r.task_record})
    if (res.code===200 && res.data?.signed_url)
      signedUrlMap.value={...signedUrlMap.value,[r.id]:res.data.signed_url}
  } catch {}
}
const statusLabel=(s:number)=>(['待处理','处理中','处理成功','处理失败','已取消'][s]??'未知')
const statusClass=(s:number)=>(['badge-warning','badge-primary','badge-success','badge-error','badge-error'][s]??'')
const formatTime=(t:string)=>t?.replace('T',' ').substring(0,19)??'-'
const isImage=(url:string)=>!!(url&&/\.(png|jpg|jpeg|webp|gif)$/i.test(url))
onMounted(()=>{ fetchPromptList(); fetchRefList(); fetchResults() })
</script>
<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold" :style="{color:'var(--text-primary)'}">账号头图</h1>
      <p class="mt-1 text-sm" :style="{color:'var(--text-muted)'}">上传头图提示词和参考图，生成账号头图</p>
    </div>
    <div class="flex gap-1 p-1 rounded-xl flex-wrap" :style="{background:'var(--bg-surface-2)'}">
      <button v-for="tab in [{k:'upload_prompt',l:'提示词上传'},{k:'prompt_list',l:'提示词列表'},{k:'upload_ref',l:'参考图上传'},{k:'ref_list',l:'参考图列表'},{k:'generate',l:'生成'},{k:'results',l:'生成结果'}]" :key="tab.k"
        @click="activeTab=tab.k"
        class="flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all"
        :style="activeTab===tab.k?{background:'var(--bg-surface)',color:'var(--color-primary-500)',boxShadow:'0 1px 4px rgba(0,0,0,0.08)'}:{color:'var(--text-muted)'}"
      >{{ tab.l }}</button>
    </div>
    <div v-if="activeTab==='upload_prompt'" class="card-premium p-8 space-y-6">
      <div @click="promptFileRef?.click()" :class="['border-2 border-dashed rounded-xl p-8 text-center cursor-pointer',promptFile?'border-primary-500 bg-primary-500/5':'border-dark-600 hover:border-primary-400']">
        <input ref="promptFileRef" type="file" accept=".doc,.docx" @change="handlePromptFileSelect" class="hidden"/>
        <div v-if="!promptFile" class="space-y-2"><div class="w-12 h-12 mx-auto rounded-full flex items-center justify-center" :style="{background:'var(--bg-surface-2)'}"><svg class="w-6 h-6 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg></div><p class="font-medium" :style="{color:'var(--text-primary)'}">点击上传提示词</p><p class="text-sm" :style="{color:'var(--text-muted)'}">.doc .docx 最大 10MB</p></div>
        <div v-else class="flex items-center justify-center gap-3"><span class="text-sm font-medium" :style="{color:'var(--text-primary)'}">{{ promptFile.name }}</span><button type="button" @click.stop="promptFile=null" class="text-red-400 px-2 py-1 rounded hover:bg-red-500/10">×</button></div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4"><div><label class="block text-sm font-medium mb-1" :style="{color:'var(--text-secondary)'}">类别</label><input v-model="promptForm.type" class="input"/></div><div><label class="block text-sm font-medium mb-1" :style="{color:'var(--text-secondary)'}">名称</label><input v-model="promptForm.name" class="input"/></div><div><label class="block text-sm font-medium mb-1" :style="{color:'var(--text-secondary)'}">简介</label><input v-model="promptForm.jianjie" class="input"/></div></div>
      <button @click="handlePromptUpload" :disabled="promptUploading||!promptFile" class="btn-primary">{{ promptUploading?'上传中...':'上传提示词' }}</button>
    </div>
    <div v-if="activeTab==='prompt_list'" class="card-premium overflow-hidden">
      <div class="flex items-center justify-between px-6 py-4" :style="{borderBottom:'1px solid var(--border-base)'}"><span :style="{color:'var(--text-primary)'}">共 {{ promptList.length }} 条</span><button @click="fetchPromptList" class="btn-secondary text-sm">刷新</button></div>
      <div v-if="promptLoading" class="flex justify-center py-12"><svg class="animate-spin w-8 h-8 text-primary-400" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg></div>
      <div v-else-if="promptList.length===0" class="text-center py-12" :style="{color:'var(--text-muted)'}">暂无数据</div>
      <table v-else class="w-full"><thead><tr :style="{borderBottom:'1px solid var(--border-base)'}"><th class="text-left px-6 py-3 text-sm" :style="{color:'var(--text-muted)'}">ID</th><th class="text-left px-6 py-3 text-sm" :style="{color:'var(--text-muted)'}">名称</th><th class="text-left px-6 py-3 text-sm" :style="{color:'var(--text-muted)'}">类别</th><th class="text-left px-6 py-3 text-sm" :style="{color:'var(--text-muted)'}">时间</th><th class="text-left px-6 py-3 text-sm" :style="{color:'var(--text-muted)'}">操作</th></tr></thead><tbody><tr v-for="r in promptList" :key="r.id" :style="{borderBottom:'1px solid var(--border-base)'}"><td class="px-6 py-3 text-sm" :style="{color:'var(--text-muted)'}">#{{ r.id }}</td><td class="px-6 py-3 text-sm font-medium" :style="{color:'var(--text-primary)'}">{{ r.name||'未命名' }}</td><td class="px-6 py-3"><span v-if="r.type" class="badge badge-primary">{{ r.type }}</span><span v-else :style="{color:'var(--text-muted)'}">-</span></td><td class="px-6 py-3 text-sm" :style="{color:'var(--text-muted)'}">{{ formatTime(r.create_time) }}</td><td class="px-6 py-3"><button @click="genForm.prompt_id=String(r.id);activeTab='generate'" class="text-sm text-primary-500 hover:text-primary-400">用此生成</button></td></tr></tbody></table>
    </div>
    <div v-if="activeTab==='upload_ref'" class="card-premium p-8 space-y-6">
      <div @click="refFileRef?.click()" :class="['border-2 border-dashed rounded-xl p-8 text-center cursor-pointer',refFile?'border-accent-500 bg-accent-500/5':'border-dark-600 hover:border-accent-400']">
        <input ref="refFileRef" type="file" accept="image/*" @change="handleRefFileSelect" class="hidden"/>
        <div v-if="!refFile" class="space-y-2"><div class="w-12 h-12 mx-auto rounded-full flex items-center justify-center" :style="{background:'var(--bg-surface-2)'}"><svg class="w-6 h-6 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg></div><p class="font-medium" :style="{color:'var(--text-primary)'}">点击上传参考头图</p><p class="text-sm" :style="{color:'var(--text-muted)'}">jpg/png/webp 最大 10MB</p></div>
        <div v-else class="flex items-center justify-center gap-3"><span class="text-sm font-medium" :style="{color:'var(--text-primary)'}">{{ refFile.name }}</span><button type="button" @click.stop="refFile=null" class="text-red-400 px-2 py-1 rounded hover:bg-red-500/10">×</button></div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4"><div><label class="block text-sm font-medium mb-1" :style="{color:'var(--text-secondary)'}">类别</label><input v-model="refForm.type" class="input"/></div><div><label class="block text-sm font-medium mb-1" :style="{color:'var(--text-secondary)'}">名称</label><input v-model="refForm.name" class="input"/></div><div><label class="block text-sm font-medium mb-1" :style="{color:'var(--text-secondary)'}">简介</label><input v-model="refForm.jianjie" class="input"/></div></div>
      <button @click="handleRefUpload" :disabled="refUploading||!refFile" class="btn-accent">{{ refUploading?'上传中...':'上传参考图' }}</button>
    </div>
    <div v-if="activeTab==='ref_list'" class="card-premium p-6">
      <div class="flex items-center justify-between mb-4"><span :style="{color:'var(--text-primary)'}">共 {{ refList.length }} 张</span><button @click="fetchRefList" class="btn-secondary text-sm">刷新</button></div>
      <div v-if="refLoading" class="flex justify-center py-12"><svg class="animate-spin w-8 h-8 text-primary-400" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg></div>
      <div v-else-if="refList.length===0" class="text-center py-12" :style="{color:'var(--text-muted)'}">暂无参考图</div>
      <div v-else class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div v-for="r in refList" :key="r.id" class="card-premium p-2 space-y-2">
          <img :src="r.zhanghao_touxiang_oss_path" class="w-full aspect-video object-cover rounded-lg"/>
          <p class="text-xs text-center" :style="{color:'var(--text-muted)'}">#{{ r.id }}</p>
          <button @click="genForm.cankao_id=String(r.id);activeTab='generate'" class="w-full text-xs text-primary-500 hover:text-primary-400">用作参考</button>
        </div>
      </div>
    </div>
    <div v-if="activeTab==='generate'" class="card-premium p-8 space-y-6">
      <p class="text-sm" :style="{color:'var(--text-muted)'}">选择头图提示词，可选参考图，生成账号头图</p>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div><label class="block text-sm font-medium mb-2" :style="{color:'var(--text-secondary)'}">头图提示词 <span class="text-red-500">*</span></label><select v-model="genForm.prompt_id" class="input"><option value="">请选择提示词</option><option v-for="p in promptList" :key="p.id" :value="String(p.id)">#{{ p.id }} {{ p.name||'未命名' }}</option></select></div>
        <div><label class="block text-sm font-medium mb-2" :style="{color:'var(--text-secondary)'}">参考图（可选）</label><select v-model="genForm.cankao_id" class="input"><option value="">不使用参考图</option><option v-for="r in refList" :key="r.id" :value="String(r.id)">#{{ r.id }}</option></select></div>
      </div>
      <button @click="handleGenerate" :disabled="generating" class="btn-primary">{{ generating?'提交中...':'开始生成' }}</button>
    </div>
    <div v-if="activeTab==='results'" class="card-premium overflow-hidden">
      <div class="flex items-center justify-between px-6 py-4" :style="{borderBottom:'1px solid var(--border-base)'}">
        <select v-model="statusFilter" @change="fetchResults()" class="input w-36 text-sm"><option value="">全部状态</option><option value="0">待处理</option><option value="1">处理中</option><option value="2">处理成功</option><option value="3">处理失败</option><option value="4">已取消</option></select>
        <button @click="fetchResults" class="btn-secondary text-sm">刷新</button>
      </div>
      <div v-if="resultsLoading" class="flex justify-center py-12"><svg class="animate-spin w-8 h-8 text-primary-400" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg></div>
      <div v-else-if="results.length===0" class="text-center py-12" :style="{color:'var(--text-muted)'}">暂无结果</div>
      <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
        <div v-for="r in results" :key="r.id" class="card-premium p-3 space-y-2">
          <div class="flex items-center justify-between"><span class="text-xs" :style="{color:'var(--text-muted)'}">#{{ r.id }}</span><span :class="['badge text-xs',statusClass(r.status)]">{{ statusLabel(r.status) }}</span></div>
          <template v-if="r.status===2 && r.task_record">
            <img v-if="isImage(signedUrlMap[r.id]||r.task_record)" :src="signedUrlMap[r.id]||r.task_record" class="w-full aspect-video object-cover rounded-lg" @error="getSignedUrl(r)"/>
            <button v-if="!signedUrlMap[r.id]" @click="getSignedUrl(r)" class="w-full text-xs text-primary-500 hover:text-primary-400">获取链接</button>
            <a v-else :href="signedUrlMap[r.id]" target="_blank" download class="block w-full text-center text-xs text-accent-500 hover:text-accent-400">下载</a>
          </template>
          <div v-else class="w-full aspect-video rounded-lg flex items-center justify-center" :style="{background:'var(--bg-surface-2)'}"><span class="text-xs" :style="{color:'var(--text-muted)'}">{{ statusLabel(r.status) }}</span></div>
          <p class="text-xs" :style="{color:'var(--text-muted)'}">{{ formatTime(r.create_time) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>