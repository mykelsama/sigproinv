<template>
  <NavBar>
    <div class="main-content">
      <div class="page-header">
        <div style="display:flex;align-items:center;justify-content:space-between">
          <div>
            <h1>Dashboard — Director</h1>
            <p>Bienvenido, {{ store.sesion?.nombre }}. Vista general del sistema de investigación ULEAM.</p>
          </div>
          <button class="btn btn-secondary btn-sm" @click="store.resetDatos()">↺ Restaurar demo</button>
        </div>
      </div>
      <div class="page-body">

        <!-- Stats -->
        <div class="grid-4" style="margin-bottom:20px">
          <div class="stat-card">
            <div class="stat-num" style="color:var(--text)">{{ store.proyectos.length + store.propuestas.length }}</div>
            <div class="stat-label">Total registradas</div>
            <span class="badge badge-gray" style="margin-top:8px">Total</span>
          </div>
          <div class="stat-card">
            <div class="stat-num" style="color:var(--teal)">{{ enEjecucion }}</div>
            <div class="stat-label">En ejecución</div>
            <span class="badge badge-teal" style="margin-top:8px">Activas</span>
          </div>
          <div class="stat-card">
            <div class="stat-num" style="color:var(--amber)">{{ store.propuestasPendientes.length }}</div>
            <div class="stat-label">Por evaluar</div>
            <span class="badge badge-amber" style="margin-top:8px">Pendientes</span>
          </div>
          <div class="stat-card">
            <div class="stat-num" style="color:var(--green)">{{ finalizadas }}</div>
            <div class="stat-label">Finalizadas</div>
            <span class="badge badge-green" style="margin-top:8px">Cerradas</span>
          </div>
        </div>

        <div class="grid-2" style="margin-bottom:20px">
          <!-- Investigaciones recientes -->
          <div class="card">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
              <span class="section-title">Investigaciones recientes</span>
              <router-link to="/investigaciones" class="btn btn-secondary btn-sm">Ver todas</router-link>
            </div>
            <div v-for="p in recientes" :key="p.id" class="proj-item">
              <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px">
                <div>
                  <div class="proj-title">{{ p.titulo }}</div>
                  <div class="proj-meta">{{ getInv(p.investigadorId) }} · Inicio: {{ p.fechaInicio }}</div>
                </div>
                <span :class="['badge', store.estadoColor[p.estado]]">{{ store.estadoLabel[p.estado] }}</span>
              </div>
              <div style="margin-top:8px">
                <div class="progress-bar"><div class="progress-fill" :style="{ width: p.avance+'%', background: 'var(--teal)' }"></div></div>
                <div style="font-size:11px;color:var(--text3);margin-top:3px">{{ p.avance }}% completado</div>
              </div>
            </div>
            <div v-if="!recientes.length" class="empty-state" style="padding:30px">
              <p>No hay investigaciones registradas</p>
            </div>
          </div>

          <!-- Estado por fase -->
          <div class="card">
            <div class="section-title" style="margin-bottom:16px">Estado por fase</div>
            <div v-for="fase in faseStats" :key="fase.nombre" class="fase-row">
              <div style="display:flex;align-items:center;gap:10px;flex:1">
                <div class="fase-dot" :style="{ background: fase.color }"></div>
                <span style="font-size:13px">{{ fase.nombre }}</span>
              </div>
              <span style="font-size:20px;font-weight:700;color:var(--text)">{{ fase.count }}</span>
            </div>
          </div>
        </div>

        <!-- Documentos de avance recibidos -->
        <div class="card" style="margin-bottom:20px">
          <div class="section-title" style="margin-bottom:16px">Documentos de avance recibidos</div>
          <div v-if="store.documentos.length === 0" style="font-size:12px;color:var(--text3);padding:.5rem 0">
            No hay documentos subidos aún.
          </div>
          <div v-for="d in store.documentos" :key="d.id" style="padding:12px 0;border-bottom:1px solid var(--border)">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;margin-bottom:8px">
              <div>
                <div style="font-size:13px;font-weight:600">{{ d.descripcion }}</div>
                <div style="font-size:11px;color:var(--text2)">{{ d.nombre }} · Subido el {{ d.fecha }} · {{ store.getUsuario(d.investigadorId)?.nombre }}</div>
                <div v-if="d.proyectoId" style="font-size:11px;color:var(--teal);margin-top:2px">📁 {{ store.getProyecto(d.proyectoId)?.titulo }}</div>
              </div>
              <a :href="d.dataUrl" :download="d.nombre" class="btn btn-secondary btn-sm" style="white-space:nowrap;font-size:11px">Descargar</a>
            </div>
            <div style="display:flex;gap:8px">
              <input v-model="retros[d.id]" type="text" placeholder="Escribe retroalimentación..." style="flex:1;padding:.35rem .6rem;font-size:12px;border:1px solid var(--border);border-radius:6px">
              <button class="btn btn-primary btn-sm" style="font-size:11px" @click="enviarRetro(d.id)">Enviar</button>
            </div>
            <div v-if="d.retroalimentacion" style="font-size:11px;color:var(--green);margin-top:6px">✓ Enviado: {{ d.retroalimentacion }}</div>
          </div>
        </div>

        <!-- Alertas -->
        <div class="card">
          <div class="section-title" style="margin-bottom:14px">Alertas y notificaciones recientes</div>
          <div class="grid-3">
            <div class="alert alert-warn">
              <div style="font-weight:600;margin-bottom:4px">Informe pendiente</div>
              <div style="font-size:12px">Proyecto IA Diagnóstico · vence en 3 días</div>
            </div>
            <div class="alert alert-info" v-if="store.propuestasPendientes.length">
              <div style="font-weight:600;margin-bottom:4px">Nueva propuesta</div>
              <div style="font-size:12px">{{ store.propuestasPendientes.length }} propuesta(s) enviadas para evaluación</div>
            </div>
            <div v-else class="alert alert-info">
              <div style="font-weight:600;margin-bottom:4px">Sin pendientes</div>
              <div style="font-size:12px">No hay propuestas en espera de evaluación</div>
            </div>
            <div class="alert alert-success">
              <div style="font-weight:600;margin-bottom:4px">Aprobado</div>
              <div style="font-size:12px">{{ aprobadas }} propuesta(s) aprobadas este ciclo</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </NavBar>
</template>

<script setup>
import { computed, ref } from 'vue'
import NavBar from '@/components/NavBar.vue'
import { useStore } from '@/stores/useStore.js'

const store = useStore()

const enEjecucion = computed(() => store.proyectos.filter(p => p.estado === 'ejecucion').length)
const finalizadas = computed(() => store.proyectos.filter(p => p.estado === 'finalizado' || p.estado === 'cierre').length)
const aprobadas   = computed(() => store.propuestas.filter(p => p.estado === 'aprobada').length)
const recientes   = computed(() => [...store.proyectos].slice(-3).reverse())

const faseStats = computed(() => {
  const counts = { planificacion: 0, ejecucion: 0, cierre: 0, finalizado: 0 }
  store.proyectos.forEach(p => { if (counts[p.estado] !== undefined) counts[p.estado]++ })
  return [
    { nombre: 'Formulación / Propuesta', count: store.propuestas.filter(p=>p.estado==='pendiente').length, color: 'var(--text3)' },
    { nombre: 'Evaluación',              count: store.evaluaciones.length,  color: 'var(--amber)' },
    { nombre: 'Planificación',           count: counts.planificacion,       color: 'var(--blue)'  },
    { nombre: 'Ejecución',               count: counts.ejecucion,           color: 'var(--teal)'  },
    { nombre: 'Resultados / Cierre',     count: counts.cierre + counts.finalizado, color: 'var(--green)' },
  ]
})

function getInv(id) {
  const u = store.getUsuario(id)
  return u ? u.nombre : 'Desconocido'
}

// ── retroalimentación ─────────────────────────────────────
const retros = ref({})

function enviarRetro(docId) {
  const texto = retros.value[docId]?.trim()
  if (!texto) return
  store.enviarRetroalimentacion(docId, texto)
  retros.value[docId] = ''
}
</script>

<style scoped>
.proj-item { padding: 12px 0; border-bottom: 1px solid var(--border); }
.proj-item:last-child { border-bottom: none; }
.proj-title { font-size: 13px; font-weight: 600; }
.proj-meta { font-size: 11px; color: var(--text2); margin-top: 2px; }
.fase-row { display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid var(--border); }
.fase-row:last-child { border-bottom: none; }
.fase-dot { width: 8px; height: 8px; border-radius: 2px; flex-shrink: 0; }
</style>