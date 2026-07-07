<template>
  <NavBar>
    <div class="main-content">
      <div class="page-header">
        <h1>Reportes</h1>
        <p>Estadísticas globales del sistema de investigación ULEAM</p>
      </div>
      <div class="page-body">

        <!-- KPIs -->
        <div class="grid-4" style="margin-bottom:24px">
          <div class="stat-card">
            <div class="stat-num" style="color:var(--blue)">{{ store.proyectos.length }}</div>
            <div class="stat-label">Proyectos activos</div>
          </div>
          <div class="stat-card">
            <div class="stat-num" style="color:var(--amber)">{{ store.propuestas.filter(p=>p.estado==='pendiente').length }}</div>
            <div class="stat-label">Propuestas pendientes</div>
          </div>
          <div class="stat-card">
            <div class="stat-num" style="color:var(--green)">{{ store.evaluaciones.length }}</div>
            <div class="stat-label">Evaluaciones realizadas</div>
          </div>
          <div class="stat-card">
            <div class="stat-num" style="color:var(--purple)">{{ promedioAvance }}%</div>
            <div class="stat-label">Avance promedio</div>
          </div>
        </div>

        <div class="grid-2" style="margin-bottom:20px">

          <!-- Proyectos por estado -->
          <div class="card">
            <div class="section-title" style="margin-bottom:16px">Proyectos por estado</div>
            <div v-for="item in porEstado" :key="item.label" class="reporte-row">
              <div style="display:flex;align-items:center;gap:10px;flex:1;min-width:0">
                <div class="dot-estado" :style="{ background: item.color }"></div>
                <span style="font-size:13px">{{ item.label }}</span>
              </div>
              <div style="display:flex;align-items:center;gap:10px;width:60%">
                <div class="progress-bar" style="flex:1">
                  <div class="progress-fill" :style="{ width: item.pct+'%', background: item.color }"></div>
                </div>
                <span style="font-size:13px;font-weight:700;min-width:24px;text-align:right">{{ item.count }}</span>
              </div>
            </div>
          </div>

          <!-- Por área de conocimiento -->
          <div class="card">
            <div class="section-title" style="margin-bottom:16px">Proyectos por área</div>
            <div v-for="(count, area) in porArea" :key="area" class="reporte-row">
              <div style="flex:1;font-size:13px;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{{ area }}</div>
              <div style="display:flex;align-items:center;gap:10px;width:55%">
                <div class="progress-bar" style="flex:1">
                  <div class="progress-fill" :style="{ width: (count/totalProyectos*100)+'%', background: 'var(--blue)' }"></div>
                </div>
                <span style="font-size:13px;font-weight:700;min-width:20px;text-align:right">{{ count }}</span>
              </div>
            </div>
            <div v-if="!totalProyectos" class="empty-state" style="padding:20px"><p>Sin datos</p></div>
          </div>
        </div>

        <div class="grid-2" style="margin-bottom:20px">

          <!-- Propuestas por decisión -->
          <div class="card">
            <div class="section-title" style="margin-bottom:16px">Resultado de evaluaciones</div>
            <div v-for="item in porDecision" :key="item.label" class="reporte-row">
              <div style="display:flex;align-items:center;gap:10px;flex:1">
                <span :class="['badge', item.badge]">{{ item.label }}</span>
              </div>
              <div style="display:flex;align-items:center;gap:10px;width:55%">
                <div class="progress-bar" style="flex:1">
                  <div class="progress-fill" :style="{ width: totalEv ? (item.count/totalEv*100)+'%' : '0%', background: item.color }"></div>
                </div>
                <span style="font-size:13px;font-weight:700;min-width:20px;text-align:right">{{ item.count }}</span>
              </div>
            </div>
            <div v-if="!totalEv" class="empty-state" style="padding:20px"><p>Sin evaluaciones aún</p></div>
          </div>

          <!-- Investigadores más activos -->
          <div class="card">
            <div class="section-title" style="margin-bottom:16px">Investigadores más activos</div>
            <div v-for="inv in investigadoresActivos" :key="inv.id" class="reporte-row">
              <div style="display:flex;align-items:center;gap:10px;flex:1;min-width:0">
                <div class="inv-av">{{ iniciales(inv.nombre) }}</div>
                <div style="min-width:0">
                  <div style="font-size:13px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{{ inv.nombre }}</div>
                  <div style="font-size:11px;color:var(--text2)">{{ inv.facultad }}</div>
                </div>
              </div>
              <div style="text-align:right;flex-shrink:0">
                <div style="font-size:16px;font-weight:700;color:var(--teal)">{{ inv.proyectos }}</div>
                <div style="font-size:11px;color:var(--text3)">proyectos</div>
              </div>
            </div>
            <div v-if="!investigadoresActivos.length" class="empty-state" style="padding:20px"><p>Sin datos</p></div>
          </div>
        </div>

        <!-- Tabla resumen de todos los proyectos -->
        <div class="section-title" style="margin-bottom:12px">Resumen de todos los proyectos</div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Proyecto</th>
                <th>Investigador</th>
                <th>Estado</th>
                <th>Avance</th>
                <th>Inicio</th>
                <th>Evaluación</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in store.proyectos" :key="p.id">
                <td style="font-size:13px;font-weight:500;max-width:220px">{{ p.titulo }}</td>
                <td style="font-size:12px;color:var(--text2)">{{ store.getUsuario(p.investigadorId)?.nombre }}</td>
                <td><span :class="['badge', store.estadoColor[p.estado]]">{{ store.estadoLabel[p.estado] }}</span></td>
                <td>
                  <div style="display:flex;align-items:center;gap:8px">
                    <div class="progress-bar" style="width:70px"><div class="progress-fill" :style="{width:p.avance+'%',background:'var(--teal)'}"></div></div>
                    <span style="font-size:11px;color:var(--text3)">{{ p.avance }}%</span>
                  </div>
                </td>
                <td style="font-size:12px;color:var(--text2)">{{ p.fechaInicio }}</td>
                <td>
                  <span v-if="p.evaluacionScore" style="font-weight:700;color:var(--blue)">{{ p.evaluacionScore }}</span>
                  <span v-else style="color:var(--text3)">—</span>
                </td>
              </tr>
              <tr v-if="!store.proyectos.length">
                <td colspan="6" style="text-align:center;color:var(--text3);padding:30px">Sin proyectos registrados</td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </div>
  </NavBar>
</template>

<script setup>
import { computed } from 'vue'
import NavBar from '@/components/NavBar.vue'
import { useStore } from '@/stores/useStore.js'

const store = useStore()

const totalProyectos = computed(() => store.proyectos.length)
const totalEv = computed(() => store.evaluaciones.filter(e => e.propuestaId).length)

const promedioAvance = computed(() => {
  if (!store.proyectos.length) return 0
  return Math.round(store.proyectos.reduce((a, p) => a + (p.avance || 0), 0) / store.proyectos.length)
})

const porEstado = computed(() => {
  const estados = ['planificacion','ejecucion','cierre','finalizado']
  const colores = { planificacion: 'var(--blue)', ejecucion: 'var(--teal)', cierre: 'var(--amber)', finalizado: 'var(--green)' }
  const labels = { planificacion: 'Planificación', ejecucion: 'Ejecución', cierre: 'Cierre', finalizado: 'Finalizado' }
  return estados.map(e => {
    const count = store.proyectos.filter(p => p.estado === e).length
    return { label: labels[e], count, color: colores[e], pct: totalProyectos.value ? Math.round(count/totalProyectos.value*100) : 0 }
  })
})

const porArea = computed(() => {
  const areas = {}
  store.proyectos.forEach(p => { areas[p.area] = (areas[p.area] || 0) + 1 })
  return areas
})

const porDecision = computed(() => [
  { label: 'Aprobadas', count: store.propuestas.filter(p=>p.estado==='aprobada').length, color: 'var(--green)', badge: 'badge-green' },
  { label: 'Correcciones', count: store.propuestas.filter(p=>p.estado==='correcciones').length, color: 'var(--amber)', badge: 'badge-amber' },
  { label: 'Rechazadas', count: store.propuestas.filter(p=>p.estado==='rechazada').length, color: 'var(--red)', badge: 'badge-red' },
  { label: 'Pendientes', count: store.propuestas.filter(p=>p.estado==='pendiente').length, color: 'var(--text3)', badge: 'badge-gray' },
])

const investigadoresActivos = computed(() => {
  const inv = store.usuarios.filter(u => u.rol === 'investigador')
  return inv.map(u => ({
    ...u,
    proyectos: store.proyectos.filter(p => p.investigadorId === u.id).length
  })).sort((a, b) => b.proyectos - a.proyectos).filter(u => u.proyectos > 0)
})

function iniciales(nombre) { return nombre?.split(' ').map(w=>w[0]).slice(0,2).join('') || '?' }
</script>

<style scoped>
.reporte-row { display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid var(--border); gap: 10px; }
.reporte-row:last-child { border-bottom: none; }
.dot-estado { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.inv-av { width: 32px; height: 32px; border-radius: 50%; background: var(--teal-dim); border: 1px solid var(--teal); color: var(--teal); font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
</style>
