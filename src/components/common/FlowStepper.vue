<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSimpleFlowStore, type SimpleFlowStep } from '@/stores/simpleFlow'

const route = useRoute()
const router = useRouter()
const flow = useSimpleFlowStore()

type StepDef = {
  key: SimpleFlowStep
  title: string
  desc: string
  path: string
}

const steps: StepDef[] = [
  { key: 'questionnaire', title: '填问卷', desc: '提交并保存', path: '/app/ip-prompt' },
  { key: 'results', title: '结果', desc: '查看下载', path: '/app/ip-prompt/results' },
  { key: 'merge', title: '拼接', desc: '选择模板+问卷', path: '/app/ip-prompt/merge' },
  { key: 'upload', title: '提示词上传', desc: '补充模板', path: '/app/ip-prompt/upload' },
]

const activeKey = computed<SimpleFlowStep>(() => {
  const p = route.path
  if (p.startsWith('/app/ip-prompt/upload')) return 'upload'
  if (p.startsWith('/app/ip-prompt/results')) return 'results'
  if (p.startsWith('/app/ip-prompt/merge')) return 'merge'
  return 'questionnaire'
})

const activeIndex = computed(() => steps.findIndex(s => s.key === activeKey.value))

const isRelevant = computed(() => route.path.startsWith('/app/ip-prompt'))

const linePercent = computed(() => {
  const total = steps.length - 1
  const idx = Math.max(0, activeIndex.value)
  if (total <= 0) return 0
  return (idx / total) * 100
})

const go = (s: StepDef) => {
  router.push(s.path)
}
</script>

<template>
  <div v-if="isRelevant" class="card-premium px-6 py-4">
    <div class="flex items-center justify-between gap-4">
      <div class="space-y-0.5">
        <p class="text-xs font-semibold uppercase tracking-[0.18em] text-primary-300">
          SIMPLE FLOW
        </p>
        <p class="text-sm text-dark-300">
          跟着流程走，系统会实时标记你已完成的步骤
        </p>
      </div>

      <button
        type="button"
        class="btn-secondary text-xs"
        @click="flow.reset"
        title="重置流程进度"
      >
        重置
      </button>
    </div>

    <div class="mt-4">
      <div class="relative">
        <div class="h-1 rounded-full bg-dark-700/70 overflow-hidden">
          <div
            class="h-full rounded-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all duration-300"
            :style="{ width: linePercent + '%' }"
          />
        </div>

        <div class="mt-4 grid grid-cols-4 gap-4">
          <button
            v-for="(s, idx) in steps"
            :key="s.key"
            type="button"
            class="group text-left"
            @click="go(s)"
          >
            <div class="flex items-start gap-3">
              <div
                class="w-7 h-7 rounded-full border flex items-center justify-center transition-colors duration-200"
                :class="[
                  idx === activeIndex ? 'border-primary-400 bg-primary-500/20' :
                  flow.completed[s.key] ? 'border-emerald-400 bg-emerald-500/15' :
                  'border-dark-600 bg-black/10'
                ]"
              >
                <svg
                  v-if="flow.completed[s.key]"
                  class="w-4 h-4 text-emerald-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span
                  v-else
                  class="text-[11px] font-bold"
                  :class="idx === activeIndex ? 'text-primary-300' : 'text-dark-300'"
                >
                  {{ idx + 1 }}
                </span>
              </div>

              <div class="min-w-0">
                <p
                  class="text-sm font-semibold truncate transition-colors duration-200"
                  :class="idx === activeIndex ? 'text-white' : 'text-dark-200 group-hover:text-white'"
                >
                  {{ s.title }}
                </p>
                <p class="text-xs text-dark-400 truncate">
                  {{ s.desc }}
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

