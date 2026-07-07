<template>
  <NavBar>
    <div class="main-content">
      <div class="page-header">
        <div style="display:flex;align-items:center;gap:12px">
          <router-link :to="back" class="btn btn-secondary btn-sm">← Volver</router-link>
          <h1>Resultados y cierre del proyecto</h1>
        </div>
      </div>
      <div class="page-body" v-if="proyecto">
        <div style="background:var(--blue-dim);border:1px solid rgba(79,142,247,0.3);border-radius:var(--radius);padding:20px;margin-bottom:20px;display:flex;align-items:flex-start;justify-content:space-between">
          <div>
            <div style="font-size:15px;font-weight:700;margin-bottom:4px">{{ proyecto.titulo }}</div>
            <div style="font-size:12px;color:var(--text2)">{{ invNombre }} · {{ proyecto.modalidad }} · {{ proyecto.duracion }} meses</div>
            <div style="display:flex;gap:6px;margin-top:8px">
              <span class="badge badge-blue">{{ proyecto.area }}</span>
              <span :class="['badge', store.estadoColor[proyecto.estado]]">{{ store.estadoLabel[proyecto.estado] }}</span>
            </div>
          </div>
          <div v-if="proyecto.evaluacionScore" style="text-align:right">
            <div style="font-size:36px;font-weight:800;color:var(--blue)">{{ proyecto.evaluacionScore }}</div>
            <div style="font-size:11px;color:var(--text2)">Evaluación final</div>
          </div>
        </div>

        <div class="grid-2">
          <!-- Resultados -->
          <div>
            <div class="card" style="margin-bottom:16px">
              <div class="section-title" style="margin-bottom:14px">Resultados obtenidos</div>
              <div class="field">
                <label>Conclusiones principales</label>
                <textarea v-model="cierre.conclusiones" rows="5" placeholder="Escribe las conclusiones principales..."></textarea>
              </div>
              <div class="section-title" style="margin:16px 0 12px">Indicadores de impacto</div>
              <div class="grid-2" style="gap:10px">
                <div class="field"><label>Comunidades / grupos estudiados</label><input v-model.number="cierre.comunidades" type="number" min="0" /></div>
                <div class="field"><label>Encuestas / muestras aplicadas</label><input v-model.number="cierre.encuestas" type="number" min="0" /></div>
                <div class="field"><label>Artículos publicados</label><input v-model.number="cierre.articulos" type="number" min="0" /></div>
              </div>
            </div>

            <div class="card">
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
                <div class="section-title">Publicaciones</div>
                <button class="btn btn-secondary btn-sm" @click="addPub">+ Agregar</button>
              </div>
              <div v-for="(pub, i) in cierre.publicaciones" :key="i" class="pub-item">
                <div class="field"><label>Título</label><input v-model="pub.titulo" placeholder="Título del artículo..." /></div>
                <div class="field"><label>Revista / evento</label><input v-model="pub.revista" placeholder="Nombre de la revista..." /></div>
                <div style="display:flex;gap:8px">
                  <div class="field" style="flex:1"><label>Estado</label>
                    <select v-model="pub.estado">
                      <option>En revisión</option><option>Publicado</option><option>Aceptado</option>
                    </select>
                  </div>
                  <button class="btn btn-danger btn-sm" style="margin-top:20px" @click="removePub(i)">✕</button>
                </div>
              </div>
              <div v-if="!cierre.publicaciones.length" class="empty-state" style="padding:20px">
                <p>Sin publicaciones registradas</p>
              </div>
            </div>
          </div>

          <!-- Cierre -->
          <div>
            <div class="card" style="margin-bottom:16px">
              <div class="section-title" style="margin-bottom:14px">Documentos de cierre</div>
              <div class="doc-slot">
                <div style="font-size:13px;font-weight:500">Informe final de investigación</div>
                <div style="font-size:11px;color:var(--text3)">Adjuntar informe en PDF</div>
                <input type="file" style="margin-top:8px;font-size:12px;color:var(--text2)" />
              </div>
              <div class="doc-slot">
                <div style="font-size:13px;font-weight:500">Presentación de defensa</div>
                <div style="font-size:11px;color:var(--text3)">Adjuntar presentación</div>
                <input type="file" style="margin-top:8px;font-size:12px;color:var(--text2)" />
              </div>
            </div>

            <div class="card" style="margin-bottom:16px">
              <div class="section-title" style="margin-bottom:12px">Observaciones del evaluador final</div>
              <textarea v-model="cierre.observaciones" rows="4" placeholder="Observaciones finales del comité..."></textarea>
            </div>

            <button class="btn btn-primary" style="width:100%;justify-content:center;margin-bottom:10px" @click="archivar">
              Archivar investigación
            </button>

            <div v-if="archivado" class="card" style="text-align:center;border-color:var(--green);background:var(--green-dim)">
              <div style="font-size:28px;margin-bottom:8px">🎓</div>
              <div style="font-weight:700;color:var(--green);margin-bottom:4px">Investigación completada</div>
              <div style="font-size:12px;color:var(--text2);margin-bottom:14px">Proyecto archivado en el repositorio institucional ULEAM</div>
              <button class="btn btn-success btn-sm" style="margin:0 auto" @click="descargarCert">
                Descargar certificado
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  </NavBar>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRoute } from 'vue-router'
import NavBar from '@/components/NavBar.vue'
import { useStore } from '@/stores/useStore.js'

const store = useStore()
const route = useRoute()
const archivado = ref(false)

const proyecto = computed(() => store.getProyecto(route.params.id))
const invNombre = computed(() => store.getUsuario(proyecto.value?.investigadorId)?.nombre || '')
const back = computed(() => store.sesion?.rol === 'director' ? '/director' : '/investigador')

const cierre = reactive({ conclusiones: '', comunidades: 0, encuestas: 0, articulos: 0, publicaciones: [], observaciones: '' })

function addPub() { cierre.publicaciones.push({ titulo: '', revista: '', estado: 'En revisión' }) }
function removePub(i) { cierre.publicaciones.splice(i, 1) }

function archivar() {
  store.editarProyecto(proyecto.value.id, { estado: 'finalizado', avance: 100, publicaciones: cierre.publicaciones })
  archivado.value = true
}

function descargarCert() {
  const txt = `CERTIFICADO DE FINALIZACIÓN\n\nUniversidad Laica Eloy Alfaro de Manabí — ULEAM\nSistema de Gestión de Proyectos de Investigación — SigProInv\n\nSe certifica que el proyecto de investigación:\n"${proyecto.value.titulo}"\n\nInvestigador: ${invNombre.value}\nÁrea: ${proyecto.value.area}\nDuración: ${proyecto.value.duracion} meses\n\nHa sido completado y archivado exitosamente en el repositorio institucional.\n\nFecha: ${new Date().toLocaleDateString('es-EC')}`
  const blob = new Blob([txt], { type: 'text/plain' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `certificado_${proyecto.value.id}.txt`
  a.click()
}
</script>

<style scoped>
.doc-slot { background: var(--bg3); border: 1px dashed var(--border); border-radius: var(--radius-sm); padding: 14px; margin-bottom: 10px; }
.pub-item { background: var(--bg3); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 14px; margin-bottom: 10px; }
</style>
