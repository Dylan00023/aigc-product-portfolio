<script setup lang="ts">
/**
 * IP调查问卷上传页面
 * 高级商务风格设计
 */

import { ref } from 'vue'
import { useAppStore } from '@/stores/app'
import { ipQueryApi } from '@/api'

const appStore = useAppStore()

// 表单数据
const formData = ref({
  type: '',
  name: '',
  jianjie: '',
})

// 上传文件
const uploadFile = ref<File | null>(null)
const fileInputRef = ref<HTMLInputElement>()

// 上传状态
const uploading = ref(false)
const uploadProgress = ref(0)

/**
 * 选择文件
 */
const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const file = target.files[0]
    
    // 验证文件类型
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'application/msword', // .doc
    ]
    
    if (!allowedTypes.includes(file.type)) {
      appStore.notifyError('文件格式错误', '请上传 .doc 或 .docx 格式的文件')
      return
    }
    
    // 验证文件大小（最大10MB）
    if (file.size > 10 * 1024 * 1024) {
      appStore.notifyError('文件过大', '文件大小不能超过10MB')
      return
    }
    
    uploadFile.value = file
  }
}

/**
 * 触发文件选择
 */
const triggerFileSelect = () => {
  fileInputRef.value?.click()
}

/**
 * 移除文件
 */
const removeFile = () => {
  uploadFile.value = null
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

/**
 * 处理上传
 */
const handleUpload = async () => {
  if (!uploadFile.value) {
    appStore.notifyError('请选择文件', '请先选择要上传的调查问卷文件')
    return
  }
  
  uploading.value = true
  uploadProgress.value = 0
  
  try {
    // 构建FormData
    const formDataObj = new FormData()
    formDataObj.append('file', uploadFile.value)
    formDataObj.append('type', formData.value.type)
    formDataObj.append('name', formData.value.name)
    formDataObj.append('jianjie', formData.value.jianjie)
    
    // 模拟上传进度
    const progressInterval = setInterval(() => {
      if (uploadProgress.value < 90) {
        uploadProgress.value += 10
      }
    }, 100)
    
    // 调用API
    const response = await ipQueryApi.upload(formDataObj)
    
    clearInterval(progressInterval)
    uploadProgress.value = 100
    
    if (response.code === 200) {
      appStore.notifySuccess('上传成功', '调查问卷已成功上传')
      
      // 重置表单
      formData.value = { type: '', name: '', jianjie: '' }
      removeFile()
    } else {
      throw new Error(response.msg)
    }
  } catch (err: any) {
    appStore.notifyError('上传失败', err.response?.data?.msg || err.message || '未知错误')
  } finally {
    uploading.value = false
    uploadProgress.value = 0
  }
}

/**
 * 格式化文件大小
 */
const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}
</script>

<template>
  <div class="space-y-6">
    <!-- 页面标题 -->
    <div>
      <h1 class="text-2xl font-bold text-white">IP调查问卷上传</h1>
      <p class="text-dark-400 mt-1">上传IP定位调查问卷文档（支持 .doc, .docx 格式）</p>
    </div>
    
    <!-- 上传表单 -->
    <div class="card-premium p-8">
      <form @submit.prevent="handleUpload" class="space-y-6">
        <!-- 文件上传区域 -->
        <div>
          <label class="block text-sm font-medium text-dark-300 mb-3">
            选择文件 <span class="text-red-400">*</span>
          </label>
          
          <!-- 文件拖拽区域 -->
          <div
            @click="triggerFileSelect"
            @dragover.prevent
            @drop.prevent="handleFileSelect"
            :class="[
              'relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200',
              uploadFile 
                ? 'border-primary-500 bg-primary-500/5' 
                : 'border-dark-600 hover:border-dark-500 hover:bg-white/5'
            ]"
          >
            <input
              ref="fileInputRef"
              type="file"
              accept=".doc,.docx"
              @change="handleFileSelect"
              class="hidden"
            />
            
            <!-- 未选择文件时 -->
            <div v-if="!uploadFile" class="space-y-4">
              <div class="w-16 h-16 mx-auto rounded-full bg-dark-700 flex items-center justify-center">
                <svg class="w-8 h-8 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div>
                <p class="text-white font-medium">点击或拖拽文件到此处</p>
                <p class="text-sm text-dark-400 mt-1">支持 .doc, .docx 格式，最大 10MB</p>
              </div>
            </div>
            
            <!-- 已选择文件时 -->
            <div v-else class="space-y-4">
              <div class="flex items-center justify-center gap-4">
                <div class="w-12 h-12 rounded-lg bg-primary-500/20 flex items-center justify-center">
                  <svg class="w-6 h-6 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div class="text-left">
                  <p class="text-white font-medium">{{ uploadFile.name }}</p>
                  <p class="text-sm text-dark-400">{{ formatFileSize(uploadFile.size) }}</p>
                </div>
                <button
                  type="button"
                  @click.stop="removeFile"
                  class="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
            
            <!-- 上传进度条 -->
            <div v-if="uploading" class="absolute inset-0 bg-dark-900/90 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <div class="text-center">
                <div class="w-32 h-2 bg-dark-700 rounded-full overflow-hidden mb-2">
                  <div 
                    class="h-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all duration-300"
                    :style="{ width: uploadProgress + '%' }"
                  ></div>
                </div>
                <p class="text-sm text-dark-300">上传中... {{ uploadProgress }}%</p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 其他表单字段 -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label class="block text-sm font-medium text-dark-300 mb-2">
              类别
            </label>
            <input
              v-model="formData.type"
              type="text"
              placeholder="例如：详细"
              class="input"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-dark-300 mb-2">
              名称
            </label>
            <input
              v-model="formData.name"
              type="text"
              placeholder="例如：IP调查问卷详细版"
              class="input"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-dark-300 mb-2">
              简介
            </label>
            <input
              v-model="formData.jianjie"
              type="text"
              placeholder="简单描述"
              class="input"
            />
          </div>
        </div>
        
        <!-- 提交按钮 -->
        <div class="flex items-center gap-4">
          <button
            type="submit"
            :disabled="uploading || !uploadFile"
            class="btn-primary flex items-center gap-2"
          >
            <svg v-if="uploading" class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>{{ uploading ? '上传中...' : '上传问卷' }}</span>
          </button>
          
          <button
            type="button"
            @click="formData = { type: '', name: '', jianjie: '' }; removeFile()"
            class="btn-secondary"
          >
            重置
          </button>
        </div>
      </form>
    </div>
    
    <!-- 使用说明 -->
    <div class="card-premium p-6">
      <h3 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <svg class="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        使用说明
      </h3>
      <div class="space-y-2 text-sm text-dark-300">
        <p>1. 选择或拖拽上传 IP 定位调查问卷文件（.doc 或 .docx 格式）</p>
        <p>2. 填写类别、名称和简介（可选）</p>
        <p>3. 点击"上传问卷"按钮完成上传</p>
        <p>4. 上传成功后可在"问卷查询"页面查看和管理</p>
      </div>
    </div>
  </div>
</template>
