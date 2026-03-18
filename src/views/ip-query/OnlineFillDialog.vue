<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useAppStore } from '@/stores/app'
import { ipQueryApi } from '@/api'

const props = defineProps<{
  modelValue: boolean
  templateName?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'submitted'): void
}>()

const appStore = useAppStore()

// 元信息：用于已填写问卷上传接口的 type/name/jianjie
const meta = ref({
  type: '个人',
  name: '个人 IP 简易调研问卷',
  jianjie: '通过在线表单填写的个人 IP 简易调研问卷',
})

watch(
  () => props.templateName,
  (name) => {
    if (name) meta.value.name = name
  },
  { immediate: true },
)

type QuestionType = 'input' | 'textarea' | 'single' | 'multi'

interface Question {
  id: string
  label: string
  placeholder?: string
  type: QuestionType
  options?: string[]
}

interface Section {
  id: string
  title: string
  questions: Question[]
}

const sections: Section[] = [
  {
    id: 'basic',
    title: '一、基础信息',
    questions: [
      {
        id: 'nickname',
        label: '1. 昵称 / 想用的 IP 名字',
        placeholder: '例：阿梅美食、老张创业说',
        type: 'input',
      },
      {
        id: 'age_range',
        label: '2. 年龄区间',
        type: 'single',
        options: ['18-25', '26-35', '36-45', '46+'],
      },
      {
        id: 'city',
        label: '3. 所在城市',
        placeholder: '例：杭州、青岛',
        type: 'input',
      },
      {
        id: 'job',
        label: '4. 主业 / 职业',
        placeholder: '例：宝妈、实体店老板、职场人、创业者',
        type: 'input',
      },
    ],
  },
  {
    id: 'strength',
    title: '二、核心优势',
    questions: [
      {
        id: 'best_three',
        label: '1. 你最擅长的 3 件事',
        placeholder: '例：做家常菜、育儿、开店避坑、剪视频',
        type: 'textarea',
      },
      {
        id: 'often_help',
        label: '2. 别人常找你帮什么忙',
        placeholder: '例：选母婴用品、咨询创业问题',
        type: 'textarea',
      },
      {
        id: 'unique_exp',
        label: '3. 你独有的经历 / 资源',
        placeholder: '例：开了 10 年花店、有农村农产品货源',
        type: 'textarea',
      },
    ],
  },
  {
    id: 'direction',
    title: '三、IP 方向',
    questions: [
      {
        id: 'field',
        label: '1. 想做的领域（选 1 个）',
        type: 'single',
        options: ['美食', '育儿', '创业', '穿搭', '职场', '三农', '其他'],
      },
      {
        id: 'content_core',
        label: '2. 想分享的核心内容',
        placeholder: '例：教新手做家常菜、宝妈副业干货',
        type: 'textarea',
      },
      {
        id: 'tags',
        label: '3. 希望别人记住你的标签',
        placeholder: '例：接地气的宝妈、实在的开店博主',
        type: 'textarea',
      },
    ],
  },
  {
    id: 'audience',
    title: '四、目标受众',
    questions: [
      {
        id: 'target_people',
        label: '1. 想吸引的人',
        placeholder: '例：25-35 岁宝妈、想创业的年轻人',
        type: 'textarea',
      },
      {
        id: 'solve_problem',
        label: '2. 帮他们解决什么问题',
        placeholder: '例：没时间做饭、创业怕踩坑',
        type: 'textarea',
      },
    ],
  },
  {
    id: 'goal',
    title: '五、IP 目标',
    questions: [
      {
        id: 'short_goal',
        label: '1. 短期目标（1 年内）',
        type: 'single',
        options: ['涨粉', '变现', '分享经验', '其他'],
      },
      {
        id: 'money_way',
        label: '2. 变现方式（可多选）',
        type: 'multi',
        options: ['卖货', '咨询 / 陪跑', '课程', '广告', '其他'],
      },
      {
        id: 'never_do',
        label: '3. 绝对不做的事',
        placeholder: '例：夸大宣传、推荐劣质产品',
        type: 'textarea',
      },
    ],
  },
  {
    id: 'content_pref',
    title: '六、内容偏好',
    questions: [
      {
        id: 'tone',
        label: '1. 说话风格',
        type: 'single',
        options: ['亲切聊天', '专业干货', '幽默搞笑', '温柔细腻'],
      },
      {
        id: 'form',
        label: '2. 内容形式',
        type: 'multi',
        options: ['口播', '场景实拍', '图文', '直播'],
      },
      {
        id: 'scene',
        label: '3. 拍摄场景',
        type: 'multi',
        options: ['家里', '职场 / 店铺', '户外', '纯色背景'],
      },
    ],
  },
]

const answers = ref<Record<string, any>>({})

const requiredKeys = ['nickname', 'age_range', 'job', 'field', 'target_people']

const toggleSingle = (qid: string, opt: string) => {
  answers.value[qid] = answers.value[qid] === opt ? null : opt
}

const toggleMulti = (qid: string, opt: string) => {
  const current = Array.isArray(answers.value[qid]) ? (answers.value[qid] as string[]) : []
  const set = new Set(current)
  if (set.has(opt)) set.delete(opt)
  else set.add(opt)
  answers.value[qid] = Array.from(set)
}
const isValid = computed(() =>
  requiredKeys.every((key) => {
    const v = answers.value[key]
    return Array.isArray(v) ? v.length > 0 : !!v
  }),
)

const buildTextContent = () => {
  const lines: string[] = []
  lines.push('个人 IP 打造简易调研问卷')
  lines.push('')

  for (const section of sections) {
    lines.push(section.title)
    for (const q of section.questions) {
      const value = answers.value[q.id]
      let display = ''
      if (q.type === 'multi' && Array.isArray(value)) {
        display = value.join('，')
      } else if (typeof value === 'string') {
        display = value
      } else if (value != null) {
        display = String(value)
      }
      lines.push(`${q.label} ${display || ''}`.trim())
    }
    lines.push('')
  }

  return lines.join('\n')
}

const submitting = ref(false)

const close = () => {
  emit('update:modelValue', false)
}

const handleSubmit = async () => {
  if (!isValid.value) {
    appStore.notifyError('请完善必填项', '带序号的核心问题请至少填写完整基础信息和方向相关内容')
    return
  }

  try {
    submitting.value = true
    const content = buildTextContent()

    const blob = new Blob([content], {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    })

    const fileName = `${meta.value.name || '个人IP简易调研问卷'}.docx`
    const file = new File([blob], fileName, {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    })

    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', meta.value.type)
    formData.append('name', meta.value.name)
    formData.append('jianjie', meta.value.jianjie)

    const res = await ipQueryApi.uploadFilled(formData)
    if (res.code === 200) {
      appStore.notifySuccess('提交成功', '已作为已填写问卷上传，可在“已填写IP调查问卷”中查看')
      emit('submitted')
      close()
    } else {
      appStore.notifyError('提交失败', res.msg)
    }
  } catch (err: any) {
    appStore.notifyError('提交失败', err.message || '未知错误')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-50 flex items-center justify-center"
    >
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="close"></div>

      <div class="relative z-10 card-premium w-full max-w-5xl mx-4 max-h-[90vh] flex flex-col">
        <div class="flex items-center justify-between px-6 py-4 border-b border-dark-800">
          <div>
            <h2 class="text-lg font-semibold text-white">个人 IP 打造简易调研问卷</h2>
            <p class="text-xs text-dark-400 mt-1">
              在线填写即可自动生成并上传为“已填写 IP 调查问卷”，无需下载文档再上传。
            </p>
          </div>
          <button
            class="p-2 rounded-lg text-dark-400 hover:text-white hover:bg-white/5 transition-colors"
            @click="close"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="px-6 pt-4 pb-2">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-xs font-medium text-dark-300 mb-1">类别</label>
              <input v-model="meta.type" type="text" class="input h-8 text-xs" />
            </div>
            <div>
              <label class="block text-xs font-medium text-dark-300 mb-1">名称</label>
              <input v-model="meta.name" type="text" class="input h-8 text-xs" />
            </div>
            <div>
              <label class="block text-xs font-medium text-dark-300 mb-1">简介</label>
              <input v-model="meta.jianjie" type="text" class="input h-8 text-xs" />
            </div>
          </div>
        </div>

        <div class="px-6 pb-4 flex-1 overflow-y-auto space-y-6">
          <div
            v-for="section in sections"
            :key="section.id"
            class="space-y-3"
          >
            <h3 class="text-sm font-semibold text-white border-l-4 border-primary-500 pl-3">
              {{ section.title }}
            </h3>

            <div class="space-y-3">
              <div
                v-for="q in section.questions"
                :key="q.id"
                class="space-y-1.5"
              >
                <p class="text-xs font-medium text-dark-200">
                  {{ q.label }}
                  <span
                    v-if="requiredKeys.includes(q.id)"
                    class="text-red-400 ml-1"
                  >*</span>
                </p>

                <input
                  v-if="q.type === 'input'"
                  v-model="answers[q.id]"
                  type="text"
                  class="input h-9 text-xs"
                  :placeholder="q.placeholder"
                />

                <textarea
                  v-else-if="q.type === 'textarea'"
                  v-model="answers[q.id]"
                  rows="3"
                  class="input !h-auto resize-y text-xs"
                  :placeholder="q.placeholder"
                />

                <div
                  v-else-if="q.type === 'single' && q.options"
                  class="flex flex-wrap gap-2"
                >
                  <button
                    v-for="opt in q.options"
                    :key="opt"
                    type="button"
                    class="px-3 py-1 rounded-full text-[11px] border transition-colors"
                    :class="answers[q.id] === opt ? 'bg-primary-500 text-white border-primary-500' : 'text-dark-300 border-dark-600 hover:border-dark-400'"
                    @click="toggleSingle(q.id, opt)"
                  >
                    {{ opt }}
                  </button>
                </div>

                <div
                  v-else-if="q.type === 'multi' && q.options"
                  class="flex flex-wrap gap-2"
                >
                  <button
                    v-for="opt in q.options"
                    :key="opt"
                    type="button"
                    class="px-3 py-1 rounded-full text-[11px] border transition-colors"
                    :class="Array.isArray(answers[q.id]) && answers[q.id].includes(opt)
                      ? 'bg-primary-500 text-white border-primary-500'
                      : 'text-dark-300 border-dark-600 hover:border-dark-400'"
                    @click="toggleMulti(q.id, opt)"
                  >
                    {{ opt }}
                  </button>
                </div>
              </div>
            </div>

            <div class="border-t border-dark-800 pt-3" />
          </div>
        </div>

        <div class="px-6 py-4 border-t border-dark-800 flex items-center justify-between">
          <p class="text-[11px] text-dark-400">
            * 带星号的问题建议尽量填写完整，这将直接影响后续 IP 方案与话术的质量。
          </p>
          <button
            class="btn-primary px-6 py-2 text-xs flex items-center gap-2"
            :disabled="submitting"
            @click="handleSubmit"
          >
            <svg
              v-if="submitting"
              class="w-4 h-4 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              />
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>{{ submitting ? '提交中...' : '提交并保存为已填写问卷' }}</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

