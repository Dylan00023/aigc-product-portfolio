<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'

const COLORS = [
  '#ff9a3c', '#ffcc02', '#ff6b6b', '#ffa07a',
  '#ff8c42', '#ffd166', '#ff4d6d', '#ffb347',
]

function createParticle(x: number, y: number) {
  const count = 6 + Math.floor(Math.random() * 4)
  for (let i = 0; i < count; i++) {
    const el = document.createElement('span')
    const color = COLORS[Math.floor(Math.random() * COLORS.length)]
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5
    const velocity = 20 + Math.random() * 30
    const size = 2 + Math.random() * 2.5
    const tx = Math.cos(angle) * velocity
    const ty = Math.sin(angle) * velocity
    el.style.cssText = [
      'position:fixed',
      'pointer-events:none',
      'z-index:99999',
      `left:${x}px`,
      `top:${y}px`,
      `width:${size}px`,
      `height:${size}px`,
      'border-radius:50%',
      `background:${color}`,
      `box-shadow:0 0 ${size * 1.5}px ${color}`,
      'transform:translate(-50%,-50%)',
      'animation:p-fly 0.6s ease-out forwards',
      `--tx:${tx}px`,
      `--ty:${ty}px`,
    ].join(';')
    document.body.appendChild(el)
    setTimeout(() => el.remove(), 650)
  }
}

function onClick(e: MouseEvent) {
  createParticle(e.clientX, e.clientY)
}

onMounted(() => document.addEventListener('click', onClick))
onUnmounted(() => document.removeEventListener('click', onClick))
</script>

<template>
  <router-view />
</template>

<style>
/* 全局样式已移至 src/styles/main.css */

@keyframes p-fly {
  0%   { transform: translate(-50%,-50%) scale(1); opacity: 1; }
  100% { transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) scale(0.1); opacity: 0; }
}
</style>
