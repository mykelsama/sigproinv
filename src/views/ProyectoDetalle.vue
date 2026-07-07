<template>
  <NavBar>
    <div class="main-content">
      <div class="page-header" v-if="proyecto">
        <div style="display:flex;align-items:flex-start;justify-content:space-between">
          <div style="display:flex;align-items:center;gap:12px">
            <router-link :to="back" class="btn btn-secondary btn-sm">← Volver</router-link>
            <div>
              <h1>{{ proyecto.titulo }}</h1>
              <p>{{ invNombre }} · {{ proyecto.area }}</p>
            </div>
          </div>
          <span :class="['badge', store.estadoColor[proyecto.estado]]" style="font-size:12px;padding:6px 14px">{{ store.estadoLabel[proyecto.estado] }}</span>
        </div>
      </div>
      <div class="page-body" v-if="proyecto">
        <div class="tabs">
          <button v-for="t in tabs" :key="t" :class="['tab-btn', { active: tab===t }]" @click="tab=t">{{ t }}</button>
        </div>

        <!-- Cronograma -->
        <div v-if="tab==='Cronograma'">
          <div class="grid-2">
            <div>
              <div class="section-title">Fases del proyecto</div>
              <div v-for="(fase,i) in proyecto.fases" :key="i" class="card" style="margin-bottom:10px;padding:14px">
                <div style="display:flex;align-items:center;gap:10px">
                  <div class="fase-num">{{ i+1 }}</div>
                  <div style="flex:1">
                    <div style="font-size:13px;font-weight:600">{{ fase.nombre }}</div>
                    <div style="font-size:11px;color:var(--text2)">Meses {{ fase.mesesInicio }}–{{ fase.mesesFin }}</div>
                  </div>
                  <span :class="['badge', faseColor(fase.estado)]">{{ faseLabel(fase.estado) }}</span>
                </div>
              </div>
            </div>
            <div>
              <div class="section-title">Presupuesto aprobado</div>
              <div class="card">
                <div v-for="(val, key) in proyecto.presupuesto" :key="key" class="budget-row">
                  <span style="font-size:13px">{{ presKey(key) }}</span>
                  <span style="font-weight:700">${{ Number(val).toLocaleString() }}</span>
                </div>
                <div class="budget-row" style="border-top:2px solid var(--border);margin-top:4px;padding-top:10px">
                  <span style="font-weight:700">Total</span>
                  <span style="font-weight:800;color:var(--green)">${{ totalPresupuesto.toLocaleString() }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Equipo -->
        <div v-if="tab==='Equipo'">
          <div class="card" style="max-width:600px">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
              <span class="section-title">Integrantes del equipo</span>
              <router-link v-if="store.sesion?.rol==='investigador'" :to="`/proyecto/${proyecto.id}/equipo`" class="btn btn-primary btn-sm">+ Gestionar equipo</router-link>
            </div>
            <div v-for="m in proyecto.equipo" :key="m.usuarioId" class="member-row">
              <div class="member-av">{{ iniciales(m.usuarioId) }}</div>
              <div style="flex:1">
                <div style="font-size:13px;font-weight:600">{{ store.getUsuario(m.usuarioId)?.nombre }}</div>
                <div style="font-size:11px;color:var(--text2)">{{ store.getUsuario(m.usuarioId)?.facultad }}</div>
              </div>
              <span :class="['badge', rolColor(m.rol)]">{{ m.rol }}</span>
            </div>
          </div>
        </div>

        <!-- Avances -->
        <div v-if="tab==='Avances'">
          <div class="card">
            <div v-if="!proyecto.avances.length" class="empty-state" style="padding:40px">
              <div class="empty-icon">📋</div>
              <p>No hay avances registrados</p>
              <router-link :to="`/proyecto/${proyecto.id}/seguimiento`" class="btn btn-primary" style="margin-top:12px">Registrar primer avance</router-link>
            </div>
            <div v-for="av in [...proyecto.avances].reverse()" :key="av.id" class="avance-item">
              <div class="av-dot"></div>
              <div>
                <div style="font-size:12px;color:var(--teal);font-weight:700">{{ av.fase }}</div>
                <div style="font-size:11px;color:var(--text3)">{{ av.fecha }}</div>
                <div style="font-size:13px;margin-top:4px">{{ av.descripcion }}</div>
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
const tab = ref('Cronograma')
const tabs = ['Cronograma', 'Equipo', 'Avances']

const proyecto = computed(() => store.getProyecto(route.params.id))
const invNombre = computed(() => store.getUsuario(proyecto.value?.investigadorId)?.nombre || '')
const back = computed(() => store.sesion?.rol === 'director' ? '/director' : '/investigador')
const totalPresupuesto = computed(() => {
  if (!proyecto.value?.presupuesto) return 0
  return Object.values(proyecto.value.presupuesto).reduce((a, b) => a + Number(b), 0)
})

const presKey = k => ({ personal: 'Personal investigador', materiales: 'Materiales y equipos', campo: 'Salidas de campo', publicacion: 'Publicación y difusión' }[k] || k)
const faseLabel = e => ({ pendiente: 'Pendiente', en_curso: 'En curso', completa: 'Completa' }[e] || e)
const faseColor = e => ({ pendiente: 'badge-gray', en_curso: 'badge-amber', completa: 'badge-green' }[e] || 'badge-gray')
function iniciales(id) { return store.getUsuario(id)?.nombre?.split(' ').map(w=>w[0]).slice(0,2).join('') || '?' }
function rolColor(r) { return { principal: 'badge-blue', 'co-investigador': 'badge-teal', tesista: 'badge-amber', asistente: 'badge-purple', 'asistente de investigación': 'badge-purple' }[r] || 'badge-gray' }
</script>

<style scoped>
.fase-num { width: 26px; height: 26px; border-radius: 6px; background: var(--blue-dim); color: var(--blue); font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.budget-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--border); font-size: 13px; }
.budget-row:last-child { border-bottom: none; }
.member-row { display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid var(--border); }
.member-row:last-child { border-bottom: none; }
.member-av { width: 36px; height: 36px; border-radius: 50%; background: var(--purple-dim); border: 1px solid var(--purple); color: var(--purple); font-size: 12px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.avance-item { display: flex; gap: 12px; padding: 14px 0; border-bottom: 1px solid var(--border); }
.avance-item:last-child { border-bottom: none; }
.av-dot { width: 10px; height: 10px; border-radius: 50%; background: var(--teal); flex-shrink: 0; margin-top: 4px; }
</style>
