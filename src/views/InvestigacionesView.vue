<template>
  <NavBar>
    <div class="main-content">
      <div class="page-header">
        <h1>Investigaciones</h1>
        <p>Listado global de proyectos y propuestas registradas en el sistema</p>
      </div>
      <div class="page-body">
        <!-- Filtros -->
        <div style="display:flex;gap:10px;margin-bottom:16px;align-items:center;flex-wrap:wrap">
          <input v-model="busqueda" placeholder="Buscar por título o investigador..." style="max-width:300px" />
          <select v-model="filtroEstado" style="max-width:180px">
            <option value="">Todos los estados</option>
            <option v-for="(label, key) in store.estadoLabel" :key="key" :value="key">{{ label }}</option>
          </select>
          <button class="btn btn-secondary btn-sm" @click="busqueda='';filtroEstado=''">Limpiar</button>
        </div>

        <div class="table-wrap" style="margin-bottom:20px">
          <table>
            <thead>
              <tr>
                <th>Título</th>
                <th>Investigador</th>
                <th>Área</th>
                <th>Estado</th>
                <th>Avance</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in filtrados" :key="p.id">
                <td style="max-width:240px;font-weight:600;font-size:13px">{{ p.titulo }}</td>
                <td style="color:var(--text2);font-size:12px">{{ store.getUsuario(p.investigadorId)?.nombre }}</td>
                <td style="color:var(--text2);font-size:12px">{{ p.area }}</td>
                <td><span :class="['badge', store.estadoColor[p.estado]]">{{ store.estadoLabel[p.estado] }}</span></td>
                <td>
                  <div style="display:flex;align-items:center;gap:8px">
                    <div class="progress-bar" style="width:80px"><div class="progress-fill" :style="{width:p.avance+'%',background:'var(--teal)'}"></div></div>
                    <span style="font-size:11px;color:var(--text3)">{{ p.avance }}%</span>
                  </div>
                </td>
                <td>
                  <div style="display:flex;gap:6px;align-items:center">
                    <select class="estado-select" :value="p.estado" @change="cambiarEstado(p.id, $event.target.value)">
                      <option value="planificacion">Planificación</option>
                      <option value="ejecucion">Ejecución</option>
                      <option value="cierre">Cierre</option>
                      <option value="finalizado">Finalizado</option>
                    </select>
                    <router-link :to="`/proyecto/${p.id}`" class="btn btn-secondary btn-sm">Ver</router-link>
                    <button class="btn btn-danger btn-sm" @click="eliminar(p.id)">✕</button>
                  </div>
                </td>
              </tr>
              <tr v-if="!filtrados.length">
                <td colspan="6" style="text-align:center;color:var(--text3);padding:30px">No se encontraron investigaciones</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Propuestas pendientes -->
        <div class="section-title" style="margin-bottom:12px">Propuestas pendientes de evaluación ({{ store.propuestasPendientes.length }})</div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Título</th><th>Investigador</th><th>Fecha envío</th><th>Estado</th></tr></thead>
            <tbody>
              <tr v-for="p in store.propuestas" :key="p.id">
                <td style="font-size:13px">{{ p.titulo }}</td>
                <td style="color:var(--text2);font-size:12px">{{ store.getUsuario(p.investigadorId)?.nombre }}</td>
                <td style="color:var(--text2);font-size:12px">{{ p.fechaEnvio }}</td>
                <td><span :class="['badge', store.estadoColor[p.estado]]">{{ store.estadoLabel[p.estado] }}</span></td>
              </tr>
              <tr v-if="!store.propuestas.length">
                <td colspan="4" style="text-align:center;color:var(--text3);padding:20px">Sin propuestas</td>
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
const busqueda = ref('')
const filtroEstado = ref('')

const filtrados = computed(() => store.proyectos.filter(p => {
  const inv = store.getUsuario(p.investigadorId)?.nombre?.toLowerCase() || ''
  const matchBusq = !busqueda.value || p.titulo.toLowerCase().includes(busqueda.value.toLowerCase()) || inv.includes(busqueda.value.toLowerCase())
  const matchEstado = !filtroEstado.value || p.estado === filtroEstado.value
  return matchBusq && matchEstado
}))

function eliminar(id) {
  if (confirm('¿Eliminar este proyecto?')) store.eliminarProyecto(id)
}
function cambiarEstado(id, estado) {
  store.cambiarEstadoProyecto(id, estado)
}
</script>

<style scoped>
.estado-select { background: var(--bg3); border: 1px solid var(--border); color: var(--text); border-radius: 4px; padding: 5px 8px; font-size: 11px; cursor: pointer; }
</style>
