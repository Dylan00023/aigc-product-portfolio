<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import * as THREE from 'three'

const router = useRouter()
const appStore = useAppStore()

const canvasRef = ref<HTMLCanvasElement | null>(null)
let renderer: THREE.WebGLRenderer | null = null
let animationId: number | null = null

const startUsing = () => router.push('/app')

const initWebGL = () => {
  const canvas = canvasRef.value
  if (!canvas) return

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000,
  )
  camera.position.z = 30
  camera.position.y = 10
  camera.rotation.x = -0.2

  renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
  })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

  const geometry = new THREE.PlaneGeometry(100, 100, 40, 40)
  const posAttr = geometry.attributes.position as THREE.BufferAttribute
  const originalPositions = new Float32Array(posAttr.count * 3)
  for (let i = 0; i < posAttr.count * 3; i++) originalPositions[i] = posAttr.array[i]

  const material = new THREE.PointsMaterial({
    color: 0x71717a,
    size: 0.15,
    transparent: true,
    opacity: 0.4,
    blending: THREE.AdditiveBlending,
  })

  const particles = new THREE.Points(geometry, material)
  particles.rotation.x = -Math.PI / 2
  scene.add(particles)

  let time = 0

  const animate = () => {
    animationId = requestAnimationFrame(animate)
    time += 0.005

    const positions = particles.geometry.attributes.position.array as Float32Array
    for (let i = 0; i < posAttr.count; i++) {
      const ix = i * 3
      const iy = i * 3 + 1
      const iz = i * 3 + 2
      const x = originalPositions[ix]
      const y = originalPositions[iy]
      positions[iz] =
        0.5 * Math.sin(x * 0.1 + time) +
        0.25 * Math.sin(x * 0.2 + time * 1.5) +
        0.5 * Math.sin(y * 0.1 + time)
    }
    particles.geometry.attributes.position.needsUpdate = true
    particles.rotation.z = time * 0.2
    renderer?.render(scene, camera)
  }

  animate()

  const handleResize = () => {
    if (!renderer) return
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
  }

  window.addEventListener('resize', handleResize)

  // 清理时移除监听
  onBeforeUnmount(() => {
    window.removeEventListener('resize', handleResize)
  })
}

onMounted(() => {
  initWebGL()
})

onBeforeUnmount(() => {
  if (animationId != null) cancelAnimationFrame(animationId)
  if (renderer) {
    renderer.dispose()
    renderer = null
  }
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center relative overflow-hidden bg-black">
    <!-- WebGL 背景 -->
    <canvas
      ref="canvasRef"
      class="fixed inset-0 z-0 pointer-events-none opacity-40"
    />

    <!-- 环境光晕 -->
    <div
      class="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-zinc-800/20 blur-[120px] rounded-full pointer-events-none z-0"
    />

    <!-- 主题切换 -->
    <button
      @click="appStore.toggleTheme()"
      class="fixed top-4 right-4 z-50 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 shadow-sm"
      :style="{ background: 'var(--bg-surface)', border: '1px solid var(--border-base)' }"
      :title="appStore.isDark ? '切换到日间模式' : '切换到夜间模式'"
    >
      <svg v-if="appStore.isDark" class="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
      <svg v-else class="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
      </svg>
    </button>

    <!-- 内容 -->
    <div class="relative z-10 w-full max-w-4xl px-10 py-24">
      <div class="max-w-3xl">
        <div class="inline-flex items-center gap-3 mb-10">
          <div class="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-glow">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span class="text-sm font-semibold tracking-wide" :style="{ color: 'var(--text-muted)' }">丝路智播 · IP定位平台</span>
        </div>

        <h1 class="text-5xl md:text-7xl font-bold leading-tight mb-8" :style="{ color: 'var(--text-primary)' }">
          让你的个人IP，
          <span class="text-gradient">更快成型</span>
        </h1>

        <p class="text-lg md:text-xl leading-relaxed mb-14" :style="{ color: 'var(--text-secondary)' }">
          一个极简、专注的创作工作台：从定位、提示词到直播搭建，所有能力都在这里完成。
        </p>

        <div class="flex flex-wrap items-center gap-4">
          <button
            class="btn-primary px-12 py-4 rounded-full text-base font-semibold shadow-glow"
            @click="startUsing"
          >
            开始使用
          </button>

          <button
            class="px-12 py-4 rounded-full text-base font-semibold border transition-colors"
            :style="{
              background: 'var(--bg-base)',
              borderColor: 'var(--border-base)',
              color: 'var(--text-primary)'
            }"
          >
            立即下载
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

