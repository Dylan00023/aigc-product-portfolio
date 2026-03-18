<script setup lang="ts">
import { onErrorCaptured, ref, watch } from 'vue'
import { useAppStore } from '@/stores/app'

const props = defineProps<{
  resetKey?: string | number
}>()

const appStore = useAppStore()

const hasError = ref(false)
const message = ref('')

const reset = () => {
  hasError.value = false
  message.value = ''
}

watch(
  () => props.resetKey,
  () => reset(),
)

onErrorCaptured((err) => {
  hasError.value = true
  message.value = err instanceof Error ? err.message : String(err)
  appStore.notifyError('页面渲染失败', message.value || '未知错误')
  return false
})
</script>

<template>
  <div>
    <div v-if="hasError" class="card-premium p-8">
      <div class="space-y-3">
        <h2 class="text-lg font-bold text-white">页面发生错误</h2>
        <p class="text-sm text-dark-300">
          这个页面加载失败了，但你仍然可以切换到其它菜单继续使用。
        </p>
        <p v-if="message" class="text-xs text-dark-400 break-all">
          {{ message }}
        </p>
        <button type="button" class="btn-secondary" @click="reset">重试</button>
      </div>
    </div>
    <slot v-else />
  </div>
</template>

