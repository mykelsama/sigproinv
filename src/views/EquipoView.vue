<template>
  <NavBar>
    <div class="main-content">
      <div class="page-header">
        <div style="display:flex;align-items:center;gap:12px">
          <router-link :to="`/proyecto/${route.params.id}`" class="btn btn-secondary btn-sm">← Volver</router-link>
          <div>
            <h1>Gestión de equipo</h1>
            <p v-if="proyecto">{{ proyecto.titulo }}</p>
          </div>
        </div>
      </div>
      <div class="page-body" v-if="proyecto">
        <div class="grid-2" style="align-items:start">

          <!-- Perfil del investigador principal -->
          <div class="card">
            <div style="text-align:center;padding:12px 0 20px">
              <div class="miembro-av grande" style="margin:0 auto 12px">{{ iniciales(store.sesion?.id) }}</div>
              <div style="font-size:15px;font-weight:700">{{ store.sesion?.nombre }}</div>
              <div style="font-size:12px;color:var(--text2);margin-top:2px">{{ store.sesion?.facultad }}</div>
              <span class="badge badge-teal" style="margin-top:8px">Investigador activo</span>
            </div>
            <div style="border-top:1px solid var(--border);padding-top:14px">
              <div class="info-row"><span class="info-label">Área</span><span>{{ store.sesion?.area || '—' }}</span></div>
              <div class="info-row"><span class="info-label">Facultad</span><span>{{ store.sesion?.facultad }}</span></div>
              <div class="info-row"><span class="info-label">Email</span><span>{{ store.sesion?.email }}</span></div>
              <div class="info-row"><span class="info-label">ORCID</span><span>{{ store.sesion?.orcid || 'No registrado' }}</span></div>
            </div>
            <router-link to="/perfil" class="btn btn-secondary" style="width:100%;justify-content:center;margin-top:14px">Editar perfil</router-link>
          </div>

          <!-- Equipo del proyecto -->
          <div>
            <div class="card" style="margin-bottom:16px">
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
                <div class="section-title">Equipo — {{ proyecto.titulo.slice(0,30) }}...</div>
                <button class="btn btn-primary btn-sm" @click="mostrarForm=!mostrarForm">+ Agregar miembro</button>
              </div>

              <!-- Lista de miembros -->
              <div v-for="m in proyecto.equipo" :key="m.usuarioId" class="miembro-row">
                <div class="miembro-av">{{ iniciales(m.usuarioId) }}</div>
                <div style="flex:1;min-width:0">
                  <div style="font-size:13px;font-weight:600">{{ getNombre(m.usuarioId) }}</div>
                  <div style="font-size:11px;color:var(--text2)">{{ getFacultad(m.usuarioId) }}</div>
                </div>
                <span :class="['badge', rolColor(m.rol)]">{{ m.rol }}</span>
                <button v-if="m.rol !== 'principal'" class="btn btn-danger btn-sm" @click="quitarMiembro(m.usuarioId)">✕</button>
                <span v-else style="width:52px"></span>
              </div>

              <!-- Form agregar -->
              <div v-if="mostrarForm" class="agregar-form">
                <div class="section-title" style="margin-bottom:12px">Agregar nuevo miembro</div>
                <div class="field">
                  <label>Buscar investigador por nombre o email</label>
                  <input v-model="busqueda" placeholder="Ej. Luis Torres o ltorres@..." @input="filtrarUsuarios" />
                </div>
                <div v-if="resultados.length" class="resultados-list">
                  <div v-for="u in resultados" :key="u.id" class="resultado-item" :class="{ selected: seleccionado?.id === u.id }" @click="seleccionado=u">
                    <div class="miembro-av small">{{ iniciales(u.id) }}</div>
                    <div>
                      <div style="font-size:13px;font-weight:600">{{ u.nombre }}</div>
                      <div style="font-size:11px;color:var(--text2)">{{ u.email }}</div>
                    </div>
                    <span v-if="seleccionado?.id===u.id" style="color:var(--blue);margin-left:auto">✓</span>
                  </div>
                </div>
                <div v-if="busqueda && !resultados.length" style="font-size:12px;color:var(--text3);padding:8px 0">Sin resultados</div>
                <div class="field" style="margin-top:12px">
                  <label>Rol en el proyecto</label>
                  <select v-model="nuevoRol">
                    <option value="co-investigador">Co-investigador</option>
                    <option value="tesista">Tesista</option>
                    <option value="asistente">Asistente de investigación</option>
                  </select>
                </div>
                <div v-if="addErr" class="alert alert-danger" style="margin-bottom:10px;font-size:12px">{{ addErr }}</div>
                <div style="display:flex;gap:8px">
                  <button class="btn btn-primary" @click="agregarMiembro">Agregar al equipo</button>
                  <button class="btn btn-secondary" @click="cancelarForm">Cancelar</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </NavBar>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import NavBar from '@/components/NavBar.vue'
import { useStore } from '@/stores/useStore.js'

const store = useStore()
const route = useRoute()
const proyecto = computed(() => store.getProyecto(route.params.id))

const mostrarForm = ref(false)
const busqueda = ref('')
const resultados = ref([])
const seleccionado = ref(null)
const nuevoRol = ref('co-investigador')
const addErr = ref('')

function iniciales(id) { return store.getUsuario(id)?.nombre?.split(' ').map(w=>w[0]).slice(0,2).join('') || '?' }
function getNombre(id) { return store.getUsuario(id)?.nombre || 'Desconocido' }
function getFacultad(id) { return store.getUsuario(id)?.facultad || '—' }
function rolColor(r) { return { principal: 'badge-blue', 'co-investigador': 'badge-teal', tesista: 'badge-amber', asistente: 'badge-purple', 'asistente de investigación': 'badge-purple' }[r] || 'badge-gray' }

function filtrarUsuarios() {
  addErr.value = ''
  seleccionado.value = null
  if (!busqueda.value.trim()) { resultados.value = []; return }
  const q = busqueda.value.toLowerCase()
  const yaEnEquipo = proyecto.value.equipo.map(m => m.usuarioId)
  resultados.value = store.usuarios.filter(u =>
    (u.nombre.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)) &&
    u.rol === 'investigador' &&
    !yaEnEquipo.includes(u.id)
  ).slice(0, 5)
}

function agregarMiembro() {
  addErr.value = ''
  if (!seleccionado.value) { addErr.value = 'Selecciona un investigador de la lista'; return }
  const equipo = [...proyecto.value.equipo, { usuarioId: seleccionado.value.id, rol: nuevoRol.value }]
  store.editarProyecto(proyecto.value.id, { equipo })
  cancelarForm()
}

function quitarMiembro(uid) {
  if (!confirm('¿Quitar este miembro del equipo?')) return
  const equipo = proyecto.value.equipo.filter(m => m.usuarioId !== uid)
  store.editarProyecto(proyecto.value.id, { equipo })
}

function cancelarForm() { mostrarForm.value = false; busqueda.value = ''; resultados.value = []; seleccionado.value = null; addErr.value = '' }
</script>

<style scoped>
.miembro-row { display: flex; align-items: center; gap: 10px; padding: 12px 0; border-bottom: 1px solid var(--border); }
.miembro-row:last-child { border-bottom: none; }
.miembro-av { width: 36px; height: 36px; border-radius: 50%; background: var(--purple-dim); border: 1px solid var(--purple); color: var(--purple); font-size: 12px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.miembro-av.grande { width: 64px; height: 64px; font-size: 22px; }
.miembro-av.small { width: 28px; height: 28px; font-size: 10px; }
.agregar-form { margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--border); }
.resultados-list { border: 1px solid var(--border); border-radius: var(--radius-sm); overflow: hidden; margin-bottom: 4px; }
.resultado-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; cursor: pointer; transition: background 0.15s; }
.resultado-item:hover, .resultado-item.selected { background: var(--blue-dim); }
.info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--border); font-size: 13px; }
.info-row:last-child { border-bottom: none; }
.info-label { font-size: 11px; font-weight: 600; color: var(--text3); text-transform: uppercase; }
</style>
