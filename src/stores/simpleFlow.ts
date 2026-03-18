import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export type SimpleFlowStep = 'questionnaire' | 'merge' | 'results' | 'upload'

type CompletedState = Record<SimpleFlowStep, boolean>

const STORAGE_KEY = 'simple_flow_v1'

const defaultCompleted = (): CompletedState => ({
  questionnaire: false,
  merge: false,
  results: false,
  upload: false,
})

const safeParse = (raw: string | null) => {
  if (!raw) return null
  try {
    return JSON.parse(raw) as { completed?: Partial<CompletedState> }
  } catch {
    return null
  }
}

export const useSimpleFlowStore = defineStore('simpleFlow', () => {
  const completed = ref<CompletedState>(defaultCompleted())

  const hydrate = () => {
    const parsed = safeParse(localStorage.getItem(STORAGE_KEY))
    if (!parsed?.completed) return
    completed.value = { ...defaultCompleted(), ...parsed.completed }
  }

  const persist = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ completed: completed.value }))
  }

  const markDone = (step: SimpleFlowStep) => {
    if (completed.value[step]) return
    completed.value = { ...completed.value, [step]: true }
    persist()
  }

  const reset = () => {
    completed.value = defaultCompleted()
    persist()
  }

  const progress = computed(() => {
    const order: SimpleFlowStep[] = ['questionnaire', 'results', 'merge', 'upload']
    return order.filter(s => completed.value[s]).length / order.length
  })

  // init
  hydrate()

  return {
    completed,
    progress,
    markDone,
    reset,
  }
})

