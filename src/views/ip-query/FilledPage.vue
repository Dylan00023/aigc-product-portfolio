<script setup lang="ts">
/**
 * 已填写IP调查问卷查询页面
 * 对接后端 /gongneng/gongneng_7 接口
 */

import { ref, onMounted } from 'vue'
import { useAppStore } from '@/stores/app'
import { ipQueryApi } from '@/api'
import type { IPQueryFilledRecord } from '@/types/api'

const appStore = useAppStore()

// 列表数据
const records = ref<IPQueryFilledRecord[]>([])
const total = ref(0)
const totalPages = ref(0)
const loading = ref(false)

// 分页参数
const page = ref(1)
const pageSize = ref(10)

// 下载弹窗
const previewVisible = ref(false)
const previewUrl = ref('')
const previewName = ref('')
const loadingSignedUrl = ref(false)
const uploadingId = ref<number | null>(null)

/**
 * 拉取列表
 */
const fetchList = async () => {
  loading.value = true
  try {
    const res = await ipQueryApi.getFilledList({ page: page.value, page_size: pageSize.value })
    if (res.code === 200 && res.data) {
      records.value = res.data.records
      total.value = res.data.total
      totalPages.value = res.data.total_pages
    } else {
      appStore.notifyError('获取失败', res.msg)
    }
  } catch (err: any) {
    appStore.notifyError('请求错误', err.message || '未知错误')
  } finally {
    loading.value = false
  }
}

/**
 * 切换页码
 */
const goPage = (p: number) => {
  if (p < 1 || p > totalPages.value) return
  page.value = p
  fetchList()
}

/**
 * 下载 - 获取签名URL
 */
const handleDownload = async (record: IPQueryFilledRecord) => {
  loadingSignedUrl.value = true
  previewName.value = record.name || record.querry_oss_path.split('/').pop() || '文件'
  previewVisible.value = true
  previewUrl.value = ''
  try {
    const res = await ipQueryApi.getSignedUrl({ url: record.querry_oss_path })
    if (res.code === 200 && res.data?.signed_url) {
      previewUrl.value = res.data.signed_url
    } else {
      appStore.notifyError('获取下载链接失败', res.msg)
      previewVisible.value = false
    }
  } catch (err: any) {
    appStore.notifyError('请求错误', err.message || '未知错误')
    previewVisible.value = false
  } finally {
    loadingSignedUrl.value = false
  }
}

/**
 * 执行下载
 */
const doDownload = () => {
  if (!previewUrl.value) return
  const a = document.createElement('a')
  a.href = previewUrl.value
  a.download = previewName.value
  a.target = '_blank'
  a.click()
}

/**
 * 上传此问卷（将“已填写问卷”重新上传到“问卷上传”接口）
 */
const handleUploadThis = async (record: IPQueryFilledRecord) => {
  if (uploadingId.value) return
  uploadingId.value = record.id

  try {
    const signed = await ipQueryApi.getSignedUrl({ url: record.querry_oss_path })
    if (signed.code !== 200 || !signed.data?.signed_url) {
      appStore.notifyError('获取下载链接失败', signed.msg)
      return
    }

    const res = await fetch(signed.data.signed_url)
    if (!res.ok) {
      appStore.notifyError('下载失败', `无法拉取问卷文件（${res.status}）`)
      return
    }

    const blob = await res.blob()
    const fileName =
      (record.name ? `${record.name}` : (record.querry_oss_path.split('/').pop() || '已填写问卷')) || '已填写问卷'
    const file = new File([blob], fileName, { type: blob.type || 'application/octet-stream' })

    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', record.type || '已填写')
    formData.append('name', record.name || fileName)
    formData.append('jianjie', record.jianjie || '由“已填写问卷”一键上传')

    const uploadRes = await ipQueryApi.upload(formData)
    if (uploadRes.code === 200) {
      appStore.notifySuccess('上传成功', '已上传到“问卷列表/问卷上传”同一接口')
    } else {
      appStore.notifyError('上传失败', uploadRes.msg)
    }
  } catch (err: any) {
    appStore.notifyError('上传失败', err.message || '未知错误')
  } finally {
    uploadingId.value = null
  }
}

/**
 * 关闭弹窗
 */
const closePreview = () => {
  previewVisible.value = false
  previewUrl.value = ''
}

/**
 * 格式化时间
 */
const formatTime = (time: string) => {
  if (!time) return '-'
  return time.replace('T', ' ').substring(0, 19)
}

onMounted(() => {
  fetchList()
})
</script>

<template>
  <div class="space-y-6">
    <!-- 页面标题 -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-white">已填写问卷</h1>
        <p class="text-dark-400 mt-1">共 {{ total }} 条记录</p>
      </div>
      <button
        @click="fetchList"
        :disabled="loading"
        class="btn-secondary flex items-center gap-2"
      >
        <svg
          class="w-4 h-4"
          :class="{ 'animate-spin': loading }"
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        刷新
      </button>
    </div>

    <!-- 数据表格 -->
    <div class="card-premium overflow-hidden">
      <!-- 加载中 -->
      <div v-if="loading" class="flex items-center justify-center py-24">
        <svg class="animate-spin w-8 h-8 text-primary-400" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>

      <!-- 空状态 -->
      <div v-else-if="records.length === 0" class="flex flex-col items-center justify-center py-24 text-dark-400">
        <svg class="w-16 h-16 mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
        <p class="text-lg font-medium">暂无数据</p>
        <p class="text-sm mt-1">还没有提交任何已填写问卷</p>
      </div>

      <!-- 表格 -->
      <table v-else class="w-full">
        <thead>
          <tr class="border-b border-dark-700">
            <th class="text-left px-6 py-4 text-sm font-medium text-dark-400">ID</th>
            <th class="text-left px-6 py-4 text-sm font-medium text-dark-400">名称</th>
            <th class="text-left px-6 py-4 text-sm font-medium text-dark-400">类别</th>
            <th class="text-left px-6 py-4 text-sm font-medium text-dark-400">简介</th>
            <th class="text-left px-6 py-4 text-sm font-medium text-dark-400">提交时间</th>
            <th class="text-right px-6 py-4 text-sm font-medium text-dark-400">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-dark-800">
          <tr
            v-for="record in records"
            :key="record.id"
            class="hover:bg-white/3 transition-colors"
          >
            <td class="px-6 py-4 text-sm text-dark-400">#{{ record.id }}</td>
            <td class="px-6 py-4">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-accent-500/20 flex items-center justify-center flex-shrink-0">
                  <svg class="w-4 h-4 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <span class="text-sm font-medium text-white">
                  {{ record.name || '未命名' }}
                </span>
              </div>
            </td>
            <td class="px-6 py-4">
              <span v-if="record.type" class="badge badge-primary">{{ record.type }}</span>
              <span v-else class="text-sm text-dark-500">-</span>
            </td>
            <td class="px-6 py-4 text-sm text-dark-300 max-w-xs truncate">
              {{ record.jianjie || '-' }}
            </td>
            <td class="px-6 py-4 text-sm text-dark-400">
              {{ formatTime(record.create_time) }}
            </td>
            <td class="px-6 py-4 text-right space-x-2">
              <button
                @click="handleDownload(record)"
                class="btn-secondary text-sm px-4 py-2"
              >
                下载
              </button>
              <button
                @click="handleUploadThis(record)"
                class="btn-primary text-sm px-4 py-2"
                :disabled="uploadingId === record.id"
              >
                {{ uploadingId === record.id ? '上传中...' : '上传此问卷' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- 分页 -->
      <div
        v-if="totalPages > 1"
        class="flex items-center justify-between px-6 py-4 border-t border-dark-800"
      >
        <p class="text-sm text-dark-400">
          第 {{ page }} / {{ totalPages }} 页，共 {{ total }} 条
        </p>
        <div class="flex items-center gap-2">
          <button
            @click="goPage(page - 1)"
            :disabled="page <= 1"
            class="btn-secondary px-3 py-2 text-sm disabled:opacity-40"
          >
            上一页
          </button>
          <template v-for="p in totalPages" :key="p">
            <button
              v-if="Math.abs(p - page) <= 2 || p === 1 || p === totalPages"
              @click="goPage(p)"
              :class="[
                'px-3 py-2 rounded-lg text-sm transition-colors',
                p === page
                  ? 'bg-primary-500 text-white'
                  : 'text-dark-400 hover:bg-white/5 hover:text-white'
              ]"
            >
              {{ p }}
            </button>
            <span
              v-else-if="Math.abs(p - page) === 3"
              class="text-dark-500 px-1"
            >...</span>
          </template>
          <button
            @click="goPage(page + 1)"
            :disabled="page >= totalPages"
            class="btn-secondary px-3 py-2 text-sm disabled:opacity-40"
          >
            下一页
          </button>
        </div>
      </div>
    </div>

    <!-- 下载弹窗 -->
    <Teleport to="body">
      <div
        v-if="previewVisible"
        class="fixed inset-0 z-50 flex items-center justify-center"
      >
        <!-- 遮罩 -->
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="closePreview"></div>
        <!-- 弹窗内容 -->
        <div class="relative z-10 card-premium p-8 w-full max-w-md mx-4">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-semibold text-white">文件下载</h3>
            <button
              @click="closePreview"
              class="p-2 rounded-lg text-dark-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- 加载中 -->
          <div v-if="loadingSignedUrl" class="flex flex-col items-center py-8 gap-4">
            <svg class="animate-spin w-8 h-8 text-primary-400" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p class="text-dark-400 text-sm">正在获取下载链接...</p>
          </div>

          <!-- 获取成功 -->
          <div v-else-if="previewUrl" class="space-y-4">
            <div class="flex items-center gap-3 p-4 rounded-xl bg-dark-800">
              <div class="w-10 h-10 rounded-lg bg-accent-500/20 flex items-center justify-center flex-shrink-0">
                <svg class="w-5 h-5 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-white text-sm font-medium truncate">{{ previewName }}</p>
                <p class="text-dark-400 text-xs mt-0.5">链接有效，点击下载</p>
              </div>
            </div>
            <button
              @click="doDownload"
              class="btn-primary w-full flex items-center justify-center gap-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              立即下载
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
