<template>
  <NavBar>
    <div class="main-content">
      <div class="page-header">
        <h1>Panel de evaluación — Comité</h1>
        <p>{{ store.sesion?.nombre }}</p>
      </div>
      <div class="page-body">

        <!-- Stats -->
        <div class="grid-4" style="margin-bottom:20px">
          <div class="stat-card">
            <div class="stat-num" style="color:var(--amber)">{{ store.propuestasPendientes.length }}</div>
            <div class="stat-label">Pendientes</div>
          </div>
          <div class="stat-card">
            <div class="stat-num" style="color:var(--green)">{{ misEvaluaciones.length }}</div>
            <div class="stat-label">Evaluadas</div>
          </div>
          <div class="stat-card">
            <div class="stat-num" style="color:var(--text)">{{ totalMes }}</div>
            <div class="stat-label">Este mes</div>
          </div>
          <div class="stat-card">
            <div class="stat-num" style="color:var(--blue)">{{ promedioDias }}</div>
            <div class="stat-label">Promedio días</div>
          </div>
        </div>

        <!-- Filtros -->
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:16px">
          <span style="font-size:13px;font-weight:600">Propuestas para evaluar</span>
          <div style="margin-left:auto;display:flex;gap:6px">
            <button v-for="f in filtros" :key="f.val" class="btn btn-sm" :class="filtro===f.val ? 'btn-primary' : 'btn-secondary'" @click="filtro=f.val">{{ f.label }}</button>
          </div>
        </div>

        <!-- Pendientes -->
        <div class="section-title">Pendientes de revisión</div>
        <div v-for="p in propuestasFiltradas" :key="p.id" class="card" style="margin-bottom:12px">
          <div style="display:flex;align-items:flex-start;gap:16px">
            <div style="flex:1">
              <div style="font-size:14px;font-weight:700;margin-bottom:4px">{{ p.titulo }}</div>
              <div style="font-size:12px;color:var(--text2);margin-bottom:8px">{{ getInv(p.investigadorId) }} · Enviada: {{ p.fechaEnvio }}</div>
              <div style="display:flex;gap:6px;flex-wrap:wrap">
                <span class="badge badge-blue">{{ p.area }}</span>
                <span class="badge badge-gray">{{ p.modalidad }}</span>
                <span class="badge badge-amber">{{ p.duracion }} meses</span>
              </div>
            </div>
            <router-link :to="`/evaluacion/${p.id}`" class="btn btn-primary btn-sm">Evaluar</router-link>
          </div>
        </div>
        <div v-if="!propuestasFiltradas.length" class="card">
          <div class="empty-state"><div class="empty-icon">✓</div><p>No hay propuestas pendientes</p></div>
        </div>

        <!-- Recientemente evaluadas -->
        <div class="section-title" style="margin-top:24px">Recientemente evaluadas</div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Propuesta</th><th>Decisión</th><th>Puntuación</th><th>Fecha</th></tr></thead>
            <tbody>
              <tr v-for="ev in misEvaluaciones" :key="ev.id">
                <td>{{ getTituloPropuesta(ev.propuestaId) }}</td>
                <td><span :class="['badge', decisionColor(ev.decision)]">{{ ev.decision }}</span></td>
                <td style="font-weight:700;color:var(--blue)">{{ ev.puntuacion }}</td>
                <td style="color:var(--text2)">{{ ev.fecha }}</td>
              </tr>
              <tr v-if="!misEvaluaciones.length">
                <td colspan="4" style="text-align:center;color:var(--text3)">Sin evaluaciones registradas</td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </div>
  </NavBar>
</template>

<script setup>
import { ref, computed } from 'vue'
import NavBar from '@/components/NavBar.vue'
import { useStore } from '@/stores/useStore.js'

const store = useStore()
const filtro = ref('todas')
const filtros = [{ val: 'todas', label: 'Todas' }, { val: 'urgentes', label: 'Urgentes' }]

const propuestasFiltradas = computed(() => store.propuestasPendientes)
const misEvaluaciones = computed(() => store.evaluaciones.filter(e => e.propuestaId))
const totalMes = computed(() => misEvaluaciones.value.filter(e => e.fecha?.startsWith('2026-05') || e.fecha?.startsWith('2026-06')).length)
const promedioDias = computed(() => 4.2)

function getInv(id) { return store.getUsuario(id)?.nombre || 'Desconocido' }
function getTituloPropuesta(id) {
  if (!id) return '—'
  return store.getPropuesta(id)?.titulo?.slice(0, 50) + '...' || 'Propuesta eliminada'
}
function decisionColor(d) {
  return { aprobada: 'badge-green', rechazada: 'badge-red', correcciones: 'badge-amber' }[d] || 'badge-gray'
}
</script>
