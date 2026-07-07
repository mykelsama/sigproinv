<template>
  <div class="nf-page">
    <div class="nf-card">
      <div class="nf-code">404</div>
      <h1>Página no encontrada</h1>
      <p>La ruta que buscas no existe o no tienes acceso a ella.</p>
      <div style="display:flex;gap:10px;justify-content:center;margin-top:24px">
        <button class="btn btn-secondary" @click="router.back()">← Volver</button>
        <router-link :to="dest" class="btn btn-primary">Ir al inicio</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from '@/stores/useStore.js'

const router = useRouter()
const store = useStore()
const dest = computed(() => {
  if (!store.sesion) return '/login'
  return { director: '/director', investigador: '/investigador', comite: '/comite' }[store.sesion.rol] || '/login'
})
</script>

<style scoped>
.nf-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--bg); padding: 20px; }
.nf-card { text-align: center; max-width: 400px; }
.nf-code { font-size: 80px; font-weight: 800; color: var(--border); line-height: 1; margin-bottom: 16px; }
h1 { font-size: 20px; font-weight: 700; margin-bottom: 8px; }
p { color: var(--text2); font-size: 14px; }
</style>
