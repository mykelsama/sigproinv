<template>
  <NavBar>
    <div class="main-content">
      <div class="page-header">
        <div style="display:flex;align-items:center;gap:12px">
          <router-link to="/investigador" class="btn btn-secondary btn-sm">← Volver</router-link>
          <div>
            <h1>Seguimiento y ejecución</h1>
            <p v-if="proyecto">{{ proyecto.titulo }}</p>
          </div>
        </div>
      </div>
      <div class="page-body" v-if="proyecto">

        <!-- Stats -->
        <div class="grid-4" style="margin-bottom:20px">
          <div class="stat-card">
            <div class="stat-num" style="color:var(--teal)">{{ proyecto.avance }}%</div>
            <div class="stat-label">Avance global</div>
          </div>
          <div class="stat-card">
            <div class="stat-num" style="color:var(--blue)">{{ proyecto.avances.length }}</div>
            <div class="stat-label">Informes entregados</div>
          </div>
          <div class="stat-card">
            <div class="stat-num" style="color:var(--amber)">{{ fasesCompletadas }}</div>
            <div class="stat-label">Fases completadas</div>
          </div>
          <div class="stat-card">
            <div class="stat-num" style="color:var(--text2)">{{ mesesRestantes }}</div>
            <div class="stat-label">Meses restantes</div>
          </div>
        </div>

        <div class="grid-2">
          <!-- Fases y formulario avance -->
          <div>
            <div class="card" style="margin-bottom:16px">
              <div class="section-title" style="margin-bottom:14px">Fases del proyecto</div>
              <div v-for="(fase, i) in proyecto.fases" :key="i" class="fase-row">
                <div class="fase-num">{{ i+1 }}</div>
                <div style="flex:1">
                  <div style="font-size:13px;font-weight:600">{{ fase.nombre }}</div>
                  <div style="font-size:11px;color:var(--text2)">Mes {{ fase.mesesInicio }}–{{ fase.mesesFin }}</div>
                </div>
                <span :class="['badge', faseColor(fase.estado)]">{{ faseLabel(fase.estado) }}</span>
                <select v-model="fase.estado" @change="guardarCambioFase" class="fase-select">
                  <option value="pendiente">Pendiente</option>
                  <option value="en_curso">En curso</option>
                  <option value="completa">Completa</option>
                </select>
              </div>
            </div>

            <div class="card">
              <div class="section-title" style="margin-bottom:14px">Registrar nuevo avance</div>
              <div class="field">
                <label>Fase relacionada</label>
                <select v-model="nuevoAvance.fase">
                  <option v-for="f in proyecto.fases" :key="f.nombre" :value="f.nombre">{{ f.nombre }}</option>
                </select>
              </div>
              <div class="field">
                <label>Descripción del avance *</label>
                <textarea v-model="nuevoAvance.descripcion" rows="4" placeholder="Describe el avance realizado..." :class="{ error: avErr }"></textarea>
                <div v-if="avErr" class="field-error">La descripción es requerida</div>
              </div>
              <div class="field">
                <label>Porcentaje de avance global: {{ avanceTmp }}%</label>
                <input type="range" min="0" max="100" v-model.number="avanceTmp" style="width:100%;accent-color:var(--teal)" />
              </div>
              <button class="btn btn-primary" style="width:100%;justify-content:center" @click="registrar">
                Registrar avance
              </button>
            </div>
          </div>

          <!-- Historial + alerta -->
          <div>
            <div v-if="proyecto.avances.length === 0" class="alert alert-warn" style="margin-bottom:16px">
              No hay informes registrados aún.
            </div>

            <div class="card">
              <div class="section-title" style="margin-bottom:14px">Historial de avances</div>
              <div v-if="!proyecto.avances.length" class="empty-state" style="padding:30px">
                <p>Aún no hay avances registrados</p>
              </div>
              <div v-for="(av, i) in [...proyecto.avances].reverse()" :key="av.id" class="avance-item">
                <div style="display:flex;align-items:flex-start;gap:10px">
                  <div class="av-dot"></div>
                  <div>
                    <div style="font-size:12px;font-weight:700;color:var(--teal);margin-bottom:2px">{{ av.fase }}</div>
                    <div style="font-size:11px;color:var(--text3);margin-bottom:4px">{{ av.fecha }}</div>
                    <div style="font-size:13px;color:var(--text)">{{ av.descripcion }}</div>
                  </div>
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
import { ref, computed, reactive } from 'vue'
import { useRoute } from 'vue-router'
import NavBar from '@/components/NavBar.vue'
import { useStore } from '@/stores/useStore.js'

const store = useStore()
const route = useRoute()

const proyecto = computed(() => store.getProyecto(route.params.id))
const fasesCompletadas = computed(() => proyecto.value?.fases.filter(f => f.estado === 'completa').length || 0)
const mesesRestantes = computed(() => {
  if (!proyecto.value) return 0
  const inicio = new Date(proyecto.value.fechaInicio)
  const fin = new Date(inicio)
  fin.setMonth(fin.getMonth() + proyecto.value.duracion)
  const hoy = new Date()
  const diff = Math.max(0, Math.round((fin - hoy) / (1000 * 60 * 60 * 24 * 30)))
  return diff
})

const avanceTmp = ref(proyecto.value?.avance || 0)
const avErr = ref(false)
const nuevoAvance = reactive({ descripcion: '', fase: proyecto.value?.fases[0]?.nombre || '' })

function faseLabel(e) { return { pendiente: 'Pendiente', en_curso: 'En curso', completa: 'Completa' }[e] || e }
function faseColor(e) { return { pendiente: 'badge-gray', en_curso: 'badge-amber', completa: 'badge-green' }[e] || 'badge-gray' }

function guardarCambioFase() { store.save() }

function registrar() {
  if (!nuevoAvance.descripcion.trim()) { avErr.value = true; return }
  avErr.value = false
  store.registrarAvance(proyecto.value.id, { descripcion: nuevoAvance.descripcion, fase: nuevoAvance.fase })
  store.editarProyecto(proyecto.value.id, { avance: avanceTmp.value })
  nuevoAvance.descripcion = ''
}
</script>

<style scoped>
.fase-row { display: flex; align-items: center; gap: 10px; padding: 10px 0; border-bottom: 1px solid var(--border); }
.fase-row:last-child { border-bottom: none; }
.fase-num { width: 24px; height: 24px; border-radius: 6px; background: var(--blue-dim); color: var(--blue); font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.fase-select { background: var(--bg3); border: 1px solid var(--border); color: var(--text); border-radius: 4px; padding: 4px 6px; font-size: 11px; cursor: pointer; }
.avance-item { padding: 12px 0; border-bottom: 1px solid var(--border); }
.avance-item:last-child { border-bottom: none; }
.av-dot { width: 10px; height: 10px; border-radius: 50%; background: var(--teal); flex-shrink: 0; margin-top: 3px; }
</style>
