<template>
  <NavBar>
    <div class="main-content">
      <div class="page-header">
        <h1>Mi panel de investigación</h1>
        <p>{{ store.sesion?.nombre }} · {{ store.sesion?.facultad }}</p>
      </div>
      <div class="page-body">

        <!-- Stats -->
        <div class="grid-3" style="margin-bottom:20px">
          <div class="stat-card">
            <div class="stat-num" style="color:var(--teal)">{{ store.misProyectos.filter(p=>p.estado==='ejecucion').length }}</div>
            <div class="stat-label">Proyectos activos</div>
            <span class="badge badge-teal" style="margin-top:8px">En ejecución</span>
          </div>
          <div class="stat-card">
            <div class="stat-num" style="color:var(--amber)">{{ store.misPropuestas.filter(p=>p.estado==='pendiente').length }}</div>
            <div class="stat-label">Propuestas enviadas</div>
            <span class="badge badge-amber" style="margin-top:8px">Pendiente</span>
          </div>
          <div class="stat-card">
            <div class="stat-num" style="color:var(--green)">{{ store.misProyectos.filter(p=>p.estado==='finalizado').length }}</div>
            <div class="stat-label">Proyectos finalizados</div>
            <span class="badge badge-green" style="margin-top:8px">Completados</span>
          </div>
        </div>

        <div class="grid-2">
          <!-- Mis proyectos -->
          <div>
            <div class="section-title">Mis proyectos</div>
            <div v-if="store.misProyectos.length === 0 && store.misPropuestas.length === 0" class="card">
              <div class="empty-state">
                <div class="empty-icon">🔬</div>
                <p>Aún no tienes proyectos. ¡Envía tu primera propuesta!</p>
              </div>
            </div>
            <div v-for="p in store.misProyectos" :key="p.id" class="card" style="margin-bottom:12px">
              <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;margin-bottom:10px">
                <div class="proj-title">{{ p.titulo }}</div>
                <span :class="['badge', store.estadoColor[p.estado]]">{{ store.estadoLabel[p.estado] }}</span>
              </div>
              <div style="font-size:12px;color:var(--text2);margin-bottom:10px">Inicio: {{ p.fechaInicio }} · {{ p.duracion }} meses</div>
              <div class="progress-bar" style="margin-bottom:6px"><div class="progress-fill" :style="{ width: p.avance+'%', background: 'var(--teal)' }"></div></div>
              <div style="font-size:11px;color:var(--text3);margin-bottom:12px">{{ p.avance }}% completado</div>
              <div style="display:flex;gap:8px">
                <router-link :to="`/proyecto/${p.id}/seguimiento`" class="btn btn-primary btn-sm">Registrar avance</router-link>
                <router-link :to="`/proyecto/${p.id}`" class="btn btn-secondary btn-sm">Ver detalle</router-link>
              </div>
            </div>
            <div v-for="p in store.misPropuestas" :key="p.id" class="card" style="margin-bottom:12px" :style="{ borderLeft: p.estado === 'aprobada' ? '3px solid var(--green)' : p.estado === 'correcciones' ? '3px solid var(--amber)' : p.estado === 'rechazada' ? '3px solid var(--red)' : '3px solid var(--border)' }">
              <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;margin-bottom:8px">
                <div class="proj-title">{{ p.titulo }}</div>
                <span :class="['badge', store.estadoColor[p.estado]]">{{ store.estadoLabel[p.estado] }}</span>
              </div>
              <div style="font-size:12px;color:var(--text2);margin-bottom:10px">Enviada: {{ p.fechaEnvio }}</div>

              <!-- Aprobada: mostrar acceso al proyecto generado -->
              <div v-if="p.estado === 'aprobada' && p.proyectoId" class="alert alert-success" style="margin-bottom:10px;display:flex;align-items:center;justify-content:space-between;gap:10px">
                <span style="font-size:12px">✓ Propuesta aprobada — proyecto creado. Ya puedes registrar avances.</span>
                <router-link :to="`/proyecto/${p.proyectoId}/seguimiento`" class="btn btn-success btn-sm" style="white-space:nowrap">Registrar avance →</router-link>
              </div>

              <div v-if="p.estado === 'correcciones'" class="alert alert-warn" style="font-size:12px;margin-bottom:10px">
                <strong>Correcciones solicitadas:</strong> {{ p.observaciones }}
              </div>
              <div v-if="p.estado === 'rechazada'" class="alert alert-danger" style="font-size:12px;margin-bottom:10px">{{ p.observaciones || 'Propuesta rechazada por el comité.' }}</div>
              <div v-if="p.estado === 'pendiente'" class="alert alert-info" style="font-size:12px;margin-bottom:10px">En espera de evaluación por el comité.</div>

              <div style="display:flex;gap:8px" v-if="p.estado !== 'aprobada'">
                <router-link :to="`/propuesta/editar/${p.id}`" class="btn btn-secondary btn-sm">Editar</router-link>
                <button v-if="p.estado === 'correcciones'" class="btn btn-primary btn-sm" @click="reenviarPropuesta(p.id)">↑ Reenviar al comité</button>
                <button class="btn btn-danger btn-sm" @click="eliminarPropuesta(p.id)">Eliminar</button>
              </div>
              <div v-else style="display:flex;gap:8px">
                <router-link :to="`/proyecto/${p.proyectoId}`" class="btn btn-secondary btn-sm">Ver proyecto</router-link>
              </div>
            </div>

            <!-- Acciones rápidas -->
            <div class="card" style="margin-top:8px">
              <div class="section-title" style="margin-bottom:12px">Acciones rápidas</div>
              <div style="display:flex;flex-direction:column;gap:8px">
                <router-link to="/propuesta/nueva" class="btn btn-primary" style="justify-content:center">+ Nueva propuesta de investigación</router-link>
              </div>
            </div>
          </div>

          <!-- Notificaciones -->
          <div>
            <div class="section-title">Notificaciones</div>
            <div class="card">
              <div v-for="n in notificaciones" :key="n.id" class="notif-item">
                <div class="notif-dot" :style="{ background: n.color }"></div>
                <div>
                  <div style="font-size:13px;font-weight:500">{{ n.texto }}</div>
                  <div style="font-size:11px;color:var(--text3);margin-top:2px">{{ n.tiempo }}</div>
                </div>
              </div>
              <div v-if="!notificaciones.length" class="empty-state" style="padding:30px">
                <p>Sin notificaciones nuevas</p>
              </div>
            </div>
          </div>
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

function eliminarPropuesta(id) {
  if (confirm('¿Eliminar esta propuesta?')) store.eliminarPropuesta(id)
}

function reenviarPropuesta(id) {
  if (confirm('¿Reenviar esta propuesta al comité para nueva evaluación?')) {
    store.editarPropuesta(id, { estado: 'pendiente', evaluacionId: null, evaluacionScore: null, observaciones: '' })
  }
}

const notificaciones = computed(() => {
  const ns = []
  store.misProyectos.forEach(p => {
    if (p.avances.length > 0) {
      const u = p.avances[p.avances.length - 1]
      ns.push({ id: p.id+'av', texto: `Avance registrado en "${p.titulo.slice(0,40)}..."`, tiempo: u.fecha, color: 'var(--teal)' })
    }
  })
  store.misPropuestas.forEach(p => {
    if (p.estado === 'aprobada') ns.push({ id: p.id+'ap', texto: `Propuesta "${p.titulo.slice(0,35)}..." aprobada`, tiempo: p.fechaEnvio, color: 'var(--green)' })
    if (p.estado === 'correcciones') ns.push({ id: p.id+'co', texto: `Solicitud de correcciones en "${p.titulo.slice(0,30)}..."`, tiempo: p.fechaEnvio, color: 'var(--amber)' })
  })
  return ns.slice(0, 6)
})
</script>

<style scoped>
.proj-title { font-size: 13px; font-weight: 600; }
.notif-item { display: flex; align-items: flex-start; gap: 10px; padding: 12px 0; border-bottom: 1px solid var(--border); }
.notif-item:last-child { border-bottom: none; }
.notif-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; margin-top: 4px; }
</style>
