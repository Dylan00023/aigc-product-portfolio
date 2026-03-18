<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { onBeforeUnmount, onMounted, ref } from 'vue'
import * as THREE from 'three'
import OnlineFillDialog from '@/views/ip-query/OnlineFillDialog.vue'

const router = useRouter()
const appStore = useAppStore()

const onlineFillVisible = ref(false)

const webglCanvasRef = ref<HTMLCanvasElement | null>(null)

let renderer: THREE.WebGLRenderer | null = null
let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let animationId: number | null = null
let particleSystem: THREE.Points | null = null

const initWebGLBackground = () => {
  const canvas = webglCanvasRef.value
  if (!canvas) return

  const width = window.innerWidth
  const height = window.innerHeight

  renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
  })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(width, height)

  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000)
  camera.position.z = 45

  const geometry = new THREE.BufferGeometry()
  const particleCount = 1800
  const positions = new Float32Array(particleCount * 3)
  const colors = new Float32Array(particleCount * 3)

  const colorStart = new THREE.Color('#fb923c')
  const colorMid = new THREE.Color('#f97316')
  const colorEnd = new THREE.Color('#e879f9')

  for (let i = 0; i < particleCount; i += 1) {
    const i3 = i * 3
    const radius = 12 + Math.random() * 22
    const angle = Math.random() * Math.PI * 2
    const y = (Math.random() - 0.5) * 18

    positions[i3] = Math.cos(angle) * radius
    positions[i3 + 1] = y
    positions[i3 + 2] = Math.sin(angle) * radius

    const t = Math.random()
    const color = new THREE.Color()
    if (t < 0.5) {
      color.lerpColors(colorStart, colorMid, t / 0.5)
    } else {
      color.lerpColors(colorMid, colorEnd, (t - 0.5) / 0.5)
    }

    colors[i3] = color.r
    colors[i3 + 1] = color.g
    colors[i3 + 2] = color.b
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

  const material = new THREE.PointsMaterial({
    size: 0.32,
    vertexColors: true,
    transparent: true,
    opacity: 0.92,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })

  particleSystem = new THREE.Points(geometry, material)
  scene.add(particleSystem)

  const clock = new THREE.Clock()

  const animate = () => {
    if (!scene || !camera || !renderer || !particleSystem) return

    const elapsed = clock.getElapsedTime()

    particleSystem.rotation.y = elapsed * 0.08
    particleSystem.rotation.x = Math.sin(elapsed * 0.3) * 0.15

    const positionsAttr = particleSystem.geometry.getAttribute('position') as THREE.BufferAttribute
    const positionsArray = positionsAttr.array as Float32Array

    for (let i = 0; i < positionsArray.length; i += 3) {
      const baseY = positionsArray[i + 1]
      positionsArray[i + 1] = baseY + Math.sin(elapsed * 1.5 + positionsArray[i] * 0.18) * 0.008
    }
    positionsAttr.needsUpdate = true

    camera.position.x = Math.sin(elapsed * 0.2) * 6
    camera.position.y = Math.cos(elapsed * 0.25) * 3
    camera.lookAt(0, 0, 0)

    renderer.setClearColor(new THREE.Color('#020617'), 0.9)
    renderer.render(scene, camera)

    animationId = window.requestAnimationFrame(animate)
  }

  animate()

  const handleResize = () => {
    if (!renderer || !camera) return
    const newWidth = window.innerWidth
    const newHeight = window.innerHeight
    camera.aspect = newWidth / newHeight
    camera.updateProjectionMatrix()
    renderer.setSize(newWidth, newHeight)
  }

  window.addEventListener('resize', handleResize)

  ;(initWebGLBackground as any)._cleanup = () => {
    window.removeEventListener('resize', handleResize)
  }
}

const destroyWebGLBackground = () => {
  if ((initWebGLBackground as any)._cleanup) {
    ;(initWebGLBackground as any)._cleanup()
  }
  if (animationId !== null) {
    window.cancelAnimationFrame(animationId)
    animationId = null
  }
  if (scene && particleSystem) {
    scene.remove(particleSystem)
    particleSystem.geometry.dispose()
    ;(particleSystem.material as THREE.Material).dispose()
    particleSystem = null
  }
  if (renderer) {
    renderer.dispose()
    renderer = null
  }
  scene = null
  camera = null
}

onMounted(() => {
  initWebGLBackground()
})

onBeforeUnmount(() => {
  destroyWebGLBackground()
})

// 简单模式的“填问卷”链路：使用弹窗（窗口式），不进入“调查问卷”分组
const gotoMerge = () => {
  onlineFillVisible.value = true
}

const gotoUpload = () => {
  router.push('/app/ip-query/filled')
}

const handleSubmitted = () => {
  const resolved = router.resolve('/app/ip-query/filled')
  window.open(resolved.href, '_blank')
}
</script>

<template>
  <div class="relative">
    <!-- WebGL 背景 -->
    <canvas
      ref="webglCanvasRef"
      class="pointer-events-none fixed inset-0 -z-10 h-full w-full"
    />

    <div class="space-y-8 relative z-10">
    <!-- 顶部区域 -->
    <div class="card-premium p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
      <div class="space-y-3 max-w-xl">
        <h1 class="text-3xl lg:text-4xl font-extrabold text-white leading-tight">
          30秒 做好你的
          <span class="bg-gradient-to-r from-orange-400 via-amber-300 to-fuchsia-400 bg-clip-text text-transparent">
            人设 IP
          </span>
        </h1>
        <p class="text-sm font-semibold uppercase tracking-[0.2em] text-primary-300">
          SIMPLE MODE · 简单拼接
        </p>
        <p class="text-sm lg:text-base text-dark-300">
          在线填写文档，只管把想法丢进来，随时查看「结果」。
        </p>
      </div>

      <div class="relative">
        <div
          class="w-40 h-40 rounded-[2rem] bg-gradient-to-br from-orange-500 via-amber-400 to-fuchsia-500 flex items-center justify-center shadow-glow-lg rotate-3"
        >
          <svg class="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div
          class="absolute -bottom-3 -left-3 w-16 h-16 rounded-2xl bg-black/40 backdrop-blur flex items-center justify-center border border-white/10"
        >
          <span class="text-xs font-semibold text-white">ROCK&nbsp;IP</span>
        </div>
      </div>
    </div>

    <!-- 主入口 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- 填问卷入口 -->
      <button
        type="button"
        @click="gotoMerge"
        class="group card-premium p-7 text-left cursor-pointer hover:scale-[1.02] transition-transform duration-200"
      >
        <div class="flex items-start gap-5">
          <div
            class="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center shadow-glow"
          >
            <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
              />
            </svg>
          </div>
          <div class="flex-1 space-y-2">
            <div class="flex items-center gap-3">
              <h2 class="text-xl font-bold text-white">填个问卷！</h2>
              <span
                class="px-2 py-0.5 rounded-full text-[18px] font-semibold uppercase tracking-wide bg-gray-900/15 text-gray-900 border border-orange-400/60"
              >
                STEP 1
              </span>
            </div>
            <p class="text-sm text-dark-300">
              一份问卷就能打造你的人设，给后面的内容创作打个好底。
            </p>
            <div class="flex items-center gap-3 pt-2">
            </div>
          </div>
        </div>
      </button>

      <!-- 已填写列表入口 -->
      <button
        type="button"
        @click="gotoUpload"
        class="group card-premium p-7 text-left cursor-pointer hover:scale-[1.02] transition-transform duration-200"
      >
        <div class="flex items-start gap-5">
          <div
            class="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-400 to-fuchsia-500 flex items-center justify-center shadow-glow"
          >
            <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M12 12v9m0 0l-3-3m3 3l3-3"
              />
            </svg>
          </div>
          <div class="flex-1 space-y-2">
            <div class="flex items-center gap-3">
              <h2 class="text-xl font-bold text-white">已填写列表</h2>
            </div>
            <p class="text-sm text-dark-300">
              拼接我们的专业提示词，直接上传拿到结果。
            </p>
            
          </div>
        </div>
      </button>
    </div>

      <!-- 小提示 -->
      <div class="flex items-center gap-2 text-xs text-dark-400">
        <span class="w-1.5 h-1.5 rounded-full bg-primary-400" />
        <span>完成简单拼接后，可以直接去「账号运营」「直播间搭建」继续往下走完整 IP 链路。</span>
      </div>
    </div>

    <OnlineFillDialog
      v-model="onlineFillVisible"
      @submitted="handleSubmitted"
    />
  </div>
</template>

