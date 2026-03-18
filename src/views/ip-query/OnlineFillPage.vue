<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { ipQueryApi } from '@/api'

const router = useRouter()
const route = useRoute()
const appStore = useAppStore()

// 元信息：用于已填写问卷上传接口的 type/name/jianjie
const meta = ref({
  type: '个人',
  name: '个人 IP 简易调研问卷',
  jianjie: '通过在线表单填写的个人 IP 简易调研问卷',
})

// 简易问卷结构（写死）
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

// 答案状态
const answers = ref<Record<string, any>>({})

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
// 初始化部分字段（比如从模板列表带过来的 name）
const templateName = computed(() => route.query.name as string | undefined)
if (templateName.value) {
  meta.value.name = templateName.value
}

const isSimpleFlow = computed(() => route.path.startsWith('/app/simple/ip-query/'))

// 校验：简单必填校验（只校验核心几项，避免过重）
const validating = ref(false)
const requiredKeys = ['nickname', 'age_range', 'job', 'field', 'target_people']

const isValid = computed(() =>
  requiredKeys.every(key => {
    const v = answers.value[key]
    return Array.isArray(v) ? v.length > 0 : !!v
  }),
)

// 序列化为文本，用于生成上传文件
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

// 提交到已填写问卷上传接口
const submitting = ref(false)

const handleSubmit = async () => {
  validating.value = true
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
      router.push(isSimpleFlow.value ? '/app/simple/ip-query/filled' : '/app/ip-query/filled')
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
  <div class="space-y-6">
    <!-- 标题 -->
    <div class="flex items-start justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-white">个人 IP 打造简易调研问卷</h1>
        <p class="text-dark-400 mt-1">
          在线填写即可自动生成并上传为“已填写 IP 调查问卷”，无需下载文档再上传。
        </p>
      </div>
    </div>

    <!-- 元信息（可选） -->
    <div class="card-premium p-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-dark-300 mb-2">类别</label>
          <input v-model="meta.type" type="text" class="input" />
        </div>
        <div>
          <label class="block text-sm font-medium text-dark-300 mb-2">名称</label>
          <input v-model="meta.name" type="text" class="input" />
        </div>
        <div>
          <label class="block text-sm font-medium text-dark-300 mb-2">简介</label>
          <input v-model="meta.jianjie" type="text" class="input" />
        </div>
      </div>
    </div>

    <!-- 问卷主体 -->
    <div class="card-premium p-8 space-y-8 max-h-[70vh] overflow-y-auto">
      <div
        v-for="section in sections"
        :key="section.id"
        class="space-y-4"
      >
        <h2 class="text-lg font-semibold text-white border-l-4 border-primary-500 pl-3">
          {{ section.title }}
        </h2>

        <div class="space-y-4">
          <div
            v-for="q in section.questions"
            :key="q.id"
            class="space-y-2"
          >
            <p class="text-sm font-medium text-dark-200">
              {{ q.label }}
              <span
                v-if="requiredKeys.includes(q.id)"
                class="text-red-400 ml-1"
              >*</span>
            </p>

            <!-- 文本输入 -->
            <input
              v-if="q.type === 'input'"
              v-model="answers[q.id]"
              type="text"
              class="input"
              :placeholder="q.placeholder"
            />

            <!-- 多行文本 -->
            <textarea
              v-else-if="q.type === 'textarea'"
              v-model="answers[q.id]"
              rows="3"
              class="input !h-auto resize-y"
              :placeholder="q.placeholder"
            />

            <!-- 单选 -->
            <div
              v-else-if="q.type === 'single' && q.options"
              class="flex flex-wrap gap-3"
            >
              <button
                v-for="opt in q.options"
                :key="opt"
                type="button"
                class="px-3 py-1.5 rounded-full text-xs border transition-colors"
                :class="answers[q.id] === opt ? 'bg-primary-500 text-white border-primary-500' : 'text-dark-300 border-dark-600 hover:border-dark-400'"
                @click="toggleSingle(q.id, opt)"
              >
                {{ opt }}
              </button>
            </div>

            <!-- 多选 -->
            <div
              v-else-if="q.type === 'multi' && q.options"
              class="flex flex-wrap gap-3"
            >
              <button
                v-for="opt in q.options"
                :key="opt"
                type="button"
                class="px-3 py-1.5 rounded-full text-xs border transition-colors"
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

        <div class="border-t border-dark-800 pt-4" />
      </div>
    </div>

    <!-- 底部提交 -->
    <div class="flex items-center gap-4">
      <button
        class="btn-primary px-8 py-3 flex items-center gap-2"
        :disabled="submitting"
        @click="handleSubmit"
      >
        <svg
          v-if="submitting"
          class="w-5 h-5 animate-spin"
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

      <p class="text-xs text-dark-400">
        * 带星号的问题建议尽量填写完整，这将直接影响后续 IP 方案与话术的质量。
      </p>
    </div>
  </div>
</template>

