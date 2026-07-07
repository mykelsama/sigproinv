import { createRouter, createWebHashHistory } from 'vue-router'
import { useStore } from '@/stores/useStore.js'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: () => import('@/views/LoginView.vue'), meta: { public: true } },
  { path: '/director', component: () => import('@/views/DashboardDirector.vue'), meta: { rol: 'director' } },
  { path: '/investigador', component: () => import('@/views/DashboardInvestigador.vue'), meta: { rol: 'investigador' } },
  { path: '/comite', component: () => import('@/views/DashboardComite.vue'), meta: { rol: 'comite' } },
  { path: '/propuesta/nueva', component: () => import('@/views/PropuestaForm.vue'), meta: { rol: 'investigador' } },
  { path: '/propuesta/editar/:id', component: () => import('@/views/PropuestaForm.vue'), meta: { rol: 'investigador' } },
  { path: '/evaluacion/:id', component: () => import('@/views/EvaluacionView.vue'), meta: { rol: 'comite' } },
  { path: '/proyecto/:id', component: () => import('@/views/ProyectoDetalle.vue'), meta: { roles: ['investigador','director'] } },
  { path: '/proyecto/:id/seguimiento', component: () => import('@/views/SeguimientoView.vue'), meta: { rol: 'investigador' } },
  { path: '/proyecto/:id/cierre', component: () => import('@/views/ResultadosCierre.vue'), meta: { roles: ['investigador','director'] } },
  { path: '/json-viewer', component: () => import('@/views/JsonViewer.vue') },
  { path: '/investigaciones', component: () => import('@/views/InvestigacionesView.vue'), meta: { rol: 'director' } },
  { path: '/reportes', component: () => import('@/views/ReportesView.vue'), meta: { rol: 'director' } },
  { path: '/perfil', component: () => import('@/views/PerfilView.vue') },
  { path: '/proyecto/:id/equipo', component: () => import('@/views/EquipoView.vue'), meta: { rol: 'investigador' } },
  { path: '/:pathMatch(.*)*', component: () => import('@/views/NotFound.vue'), meta: { public: true } },
]

const router = createRouter({ history: createWebHashHistory(), routes })

router.beforeEach((to) => {
  const store = useStore()
  if (to.meta.public) return true
  if (!store.sesion) return '/login'
  const rol = store.sesion.rol
  if (to.meta.rol && to.meta.rol !== rol) return `/${rol}`
  if (to.meta.roles && !to.meta.roles.includes(rol)) return `/${rol}`
  return true
})

export default router
