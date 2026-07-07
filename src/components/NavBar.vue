<template>
  <div class="layout-shell">
    <!-- SIDEBAR -->
    <aside class="sidebar" :class="{ 'sidebar-open': menuOpen }">
      <div class="sidebar-brand">
        <div class="brand-icon">S</div>
        <div>
          <div class="brand-name">SigProInv</div>
          <div class="brand-sub">ULEAM</div>
        </div>
      </div>

      <nav class="sidebar-nav">
        <router-link
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="nav-item"
          active-class="nav-item-active"
          @click="menuOpen=false"
        >
          <span class="nav-icon">{{ item.icon }}</span>
          <span>{{ item.label }}</span>
        </router-link>
      </nav>

      <div class="sidebar-user">
        <div class="user-avatar">{{ iniciales }}</div>
        <div class="user-meta">
          <div class="user-name">{{ store.sesion?.nombre }}</div>
          <div class="user-rol">{{ rolLabel }}</div>
        </div>
      </div>
    </aside>

    <!-- Overlay móvil -->
    <div v-if="menuOpen" class="sidebar-overlay" @click="menuOpen=false"></div>

    <!-- RIGHT PANEL -->
    <div class="right-panel">
      <!-- TOPBAR -->
      <header class="topbar">
        <div class="topbar-left">
          <button class="hamburger" @click="menuOpen=!menuOpen">☰</button>
          <span class="topbar-title">{{ paginaActual }}</span>
        </div>
        <div class="topbar-right">
          <div class="topbar-user">
            <div class="topbar-avatar">{{ iniciales }}</div>
            <div class="topbar-info">
              <router-link to="/perfil" class="topbar-name" style="cursor:pointer;text-decoration:none">{{ store.sesion?.nombre }}</router-link>
              <span :class="['badge', rolBadge]" style="font-size:10px">{{ rolLabel }}</span>
            </div>
          </div>
          <button class="btn-cerrar" @click="logout" title="Cerrar sesión">
            <span class="cerrar-txt">Cerrar sesión</span>
            <span>↩</span>
          </button>
        </div>
      </header>

      <!-- PAGE CONTENT SLOT -->
      <div class="page-slot">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useStore } from '@/stores/useStore.js'

const store = useStore()
const router = useRouter()
const route = useRoute()
const menuOpen = ref(false)

const rolLabel = computed(() => ({ director: 'Director', investigador: 'Investigador', comite: 'Comité Evaluador' }[store.sesion?.rol] || ''))
const rolBadge = computed(() => ({ director: 'badge-purple', investigador: 'badge-teal', comite: 'badge-amber' }[store.sesion?.rol] || 'badge-gray'))
const iniciales = computed(() => store.sesion?.nombre?.split(' ').map(w => w[0]).slice(0, 2).join('') || '')

const routeTitles = {
  '/director': 'Dashboard General',
  '/investigador': 'Mi panel de investigación',
  '/comite': 'Panel de evaluación',
  '/propuesta/nueva': 'Nueva propuesta',
  '/investigaciones': 'Investigaciones',
  '/json-viewer': 'Vista JSON',
  '/reportes': 'Reportes',
  '/perfil': 'Mi perfil',
}
const paginaActual = computed(() => {
  if (routeTitles[route.path]) return routeTitles[route.path]
  if (route.path.includes('/evaluacion')) return 'Evaluación de propuesta'
  if (route.path.includes('/seguimiento')) return 'Seguimiento y ejecución'
  if (route.path.includes('/cierre')) return 'Resultados y cierre'
  if (route.path.includes('/equipo')) return 'Gestión de equipo'
  if (route.path.includes('/proyecto')) return 'Detalle del proyecto'
  if (route.path.includes('/propuesta/editar')) return 'Editar propuesta'
  return 'SigProInv'
})

const navItems = computed(() => {
  const rol = store.sesion?.rol
  if (rol === 'director') return [
    { to: '/director', label: 'Dashboard', icon: '⊞' },
    { to: '/investigaciones', label: 'Investigaciones', icon: '🔬' },
    { to: '/reportes', label: 'Reportes', icon: '📊' },
    { to: '/json-viewer', label: 'Vista JSON', icon: '{ }' },
    { to: '/perfil', label: 'Mi perfil', icon: '👤' },
  ]
  if (rol === 'investigador') return [
    { to: '/investigador', label: 'Mi panel', icon: '⊞' },
    { to: '/propuesta/nueva', label: 'Nueva propuesta', icon: '+' },
    { to: '/json-viewer', label: 'Vista JSON', icon: '{ }' },
    { to: '/perfil', label: 'Mi perfil', icon: '👤' },
  ]
  if (rol === 'comite') return [
    { to: '/comite', label: 'Evaluaciones', icon: '✓' },
    { to: '/json-viewer', label: 'Vista JSON', icon: '{ }' },
    { to: '/perfil', label: 'Mi perfil', icon: '👤' },
  ]
  return []
})

function logout() { store.logout(); router.push('/login') }
</script>

<style scoped>
.layout-shell { display: flex; min-height: 100vh; }

.sidebar { width: 220px; background: var(--bg2); border-right: 1px solid var(--border); display: flex; flex-direction: column; flex-shrink: 0; position: sticky; top: 0; height: 100vh; z-index: 60; transition: transform 0.25s ease; }
.sidebar-brand { display: flex; align-items: center; gap: 10px; padding: 20px 16px; border-bottom: 1px solid var(--border); }
.brand-icon { width: 32px; height: 32px; background: var(--blue); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 700; color: #fff; font-size: 16px; }
.brand-name { font-weight: 700; font-size: 14px; }
.brand-sub { font-size: 11px; color: var(--text2); }
.sidebar-nav { flex: 1; padding: 12px 8px; display: flex; flex-direction: column; gap: 2px; overflow-y: auto; }
.nav-item { display: flex; align-items: center; gap: 10px; padding: 9px 10px; border-radius: var(--radius-sm); color: var(--text2); font-size: 13px; font-weight: 500; transition: all 0.18s; }
.nav-item:hover { background: var(--bg3); color: var(--text); }
.nav-item-active { background: var(--blue-dim) !important; color: var(--blue) !important; }
.nav-icon { width: 18px; text-align: center; font-size: 14px; }
.sidebar-user { padding: 12px 14px; border-top: 1px solid var(--border); display: flex; align-items: center; gap: 8px; }
.user-avatar { width: 30px; height: 30px; background: var(--purple-dim); border: 1px solid var(--purple); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 600; color: var(--purple); flex-shrink: 0; }
.user-meta { min-width: 0; }
.user-name { font-size: 12px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.user-rol { font-size: 11px; color: var(--text2); }

.right-panel { flex: 1; display: flex; flex-direction: column; min-width: 0; }

.topbar { height: 56px; background: var(--bg2); border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; padding: 0 20px; position: sticky; top: 0; z-index: 50; flex-shrink: 0; gap: 12px; }
.topbar-left { display: flex; align-items: center; gap: 10px; min-width: 0; }
.topbar-title { font-size: 14px; font-weight: 600; color: var(--text2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.topbar-right { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
.topbar-user { display: flex; align-items: center; gap: 8px; }
.topbar-avatar { width: 32px; height: 32px; background: var(--purple-dim); border: 1px solid var(--purple); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: var(--purple); flex-shrink: 0; }
.topbar-info { display: flex; flex-direction: column; align-items: flex-end; }
.topbar-name { font-size: 12px; font-weight: 600; white-space: nowrap; color: var(--text); }
.topbar-name:hover { color: var(--blue); }
.btn-cerrar { display: flex; align-items: center; gap: 7px; background: var(--red-dim); border: 1px solid rgba(242,92,92,0.3); color: var(--red); border-radius: var(--radius-sm); padding: 7px 14px; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.18s; white-space: nowrap; }
.btn-cerrar:hover { background: var(--red); color: #fff; border-color: var(--red); }
.page-slot { flex: 1; overflow-y: auto; }

.hamburger { display: none; background: none; border: none; color: var(--text); font-size: 20px; cursor: pointer; padding: 4px 8px; border-radius: 4px; }
.hamburger:hover { background: var(--bg3); }
.sidebar-overlay { display: none; }

@media (max-width: 900px) {
  .sidebar { position: fixed; left: 0; top: 0; height: 100vh; transform: translateX(-100%); }
  .sidebar.sidebar-open { transform: translateX(0); box-shadow: 4px 0 20px rgba(0,0,0,0.5); }
  .sidebar-overlay { display: block; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 55; }
  .hamburger { display: flex; }
  .topbar-info { display: none; }
  .cerrar-txt { display: none; }
}
</style>
