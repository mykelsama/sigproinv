<template>
  <NavBar>
    <div class="main-content">
      <div class="page-header">
        <div style="display:flex;align-items:center;gap:12px">
          <router-link to="/comite" class="btn btn-secondary btn-sm">← Volver</router-link>
          <h1>Evaluación de propuesta</h1>
        </div>
      </div>
      <div class="page-body" v-if="propuesta">
        <div class="grid-2">
          <!-- Info propuesta -->
          <div>
            <div class="card" style="margin-bottom:16px">
              <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:12px">
                <div>
                  <div style="font-size:15px;font-weight:700;margin-bottom:6px">{{ propuesta.titulo }}</div>
                  <span class="badge badge-amber">Pendiente de evaluación</span>
                  <span style="font-size:12px;color:var(--text2);margin-left:8px">Enviada: {{ propuesta.fechaEnvio }}</span>
                </div>
              </div>
              <div class="grid-2" style="margin-bottom:12px;gap:8px">
                <div><span class="review-label">Investigador principal</span><div style="font-size:13px">{{ invNombre }}</div></div>
                <div><span class="review-label">Tipo</span><div style="font-size:13px">{{ propuesta.tipo }}</div></div>
                <div><span class="review-label">Facultad</span><div style="font-size:13px">{{ invFacultad }}</div></div>
                <div><span class="review-label">Duración</span><div style="font-size:13px">{{ propuesta.duracion }} meses</div></div>
              </div>
              <div class="review-label" style="margin-bottom:4px">Resumen del problema</div>
              <p style="font-size:13px;color:var(--text2);line-height:1.7">{{ propuesta.planteamiento }}</p>
              <div class="review-label" style="margin-top:12px;margin-bottom:4px">Objetivo general</div>
              <p style="font-size:13px;color:var(--text2);line-height:1.7">{{ propuesta.objetivo }}</p>
              <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:12px">
                <span v-for="kw in propuesta.palabrasClave" :key="kw" class="badge badge-blue">{{ kw }}</span>
              </div>
            </div>
          </div>

          <!-- Formulario evaluación -->
          <div>
            <div class="card">
              <div class="section-title" style="margin-bottom:16px">Criterios de evaluación</div>

              <div v-for="c in criterios" :key="c.key" class="criterio-item">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
                  <span style="font-size:13px;font-weight:500">{{ c.label }}</span>
                  <span style="font-size:14px;font-weight:700;color:var(--blue)">{{ ev[c.key] }}/10</span>
                </div>
                <input type="range" min="0" max="10" step="0.5" v-model.number="ev[c.key]" class="score-slider" />
              </div>

              <div style="padding:14px;background:var(--bg3);border-radius:var(--radius-sm);margin:16px 0;display:flex;align-items:center;justify-content:space-between">
                <span style="font-size:13px;font-weight:500">Puntuación total</span>
                <span style="font-size:22px;font-weight:800" :style="{ color: puntuacion >= 7 ? 'var(--green)' : puntuacion >= 5 ? 'var(--amber)' : 'var(--red)' }">
                  {{ puntuacion.toFixed(1) }}/10
                </span>
              </div>

              <div class="field">
                <label>Observaciones del comité *</label>
                <textarea
                  v-model="ev.observaciones"
                  rows="4"
                  placeholder="Escribe tus observaciones antes de tomar una decisión..."
                  :class="{ error: mostrarError }"
                  @input="mostrarError = false"
                ></textarea>
                <div v-if="mostrarError" class="field-error">⚠ Debes escribir observaciones antes de enviar la evaluación.</div>
              </div>

              <!-- Confirmación exitosa -->
              <div v-if="guardado" class="alert alert-success" style="margin-bottom:12px">
                ✓ Evaluación guardada correctamente. Redirigiendo...
              </div>

              <div style="display:flex;gap:8px;margin-top:4px">
                <button class="btn btn-danger" style="flex:1;justify-content:center" @click="decidir('rechazada')" :disabled="guardado">✕ Rechazar</button>
                <button class="btn btn-secondary" style="flex:1;justify-content:center" @click="decidir('correcciones')" :disabled="guardado">✎ Correcciones</button>
                <button class="btn btn-success" style="flex:1;justify-content:center" @click="decidir('aprobada')" :disabled="guardado">✓ Aprobar</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="page-body">
        <div class="alert alert-danger">Propuesta no encontrada.</div>
      </div>
    </div>
  </NavBar>
</template>

<script setup>
import { reactive, computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import NavBar from '@/components/NavBar.vue'
import { useStore } from '@/stores/useStore.js'

const store = useStore()
const route = useRoute()
const router = useRouter()

const mostrarError = ref(false)
const guardado = ref(false)

const propuesta = computed(() => store.getPropuesta(route.params.id))
const inv = computed(() => store.getUsuario(propuesta.value?.investigadorId))
const invNombre = computed(() => inv.value?.nombre || 'Desconocido')
const invFacultad = computed(() => inv.value?.facultad || '—')

const criterios = [
  { key: 'pertinencia', label: 'Pertinencia e impacto' },
  { key: 'viabilidad', label: 'Viabilidad metodológica' },
  { key: 'originalidad', label: 'Originalidad científica' },
  { key: 'marco', label: 'Marco teórico y bibliografía' },
]

const ev = reactive({ pertinencia: 7, viabilidad: 7, originalidad: 7, marco: 7, observaciones: '' })

const puntuacion = computed(() => {
  const vals = criterios.map(c => Number(ev[c.key]) || 0)
  return vals.reduce((a, b) => a + b, 0) / vals.length
})

function decidir(decision) {
  // Validar observaciones
  if (!ev.observaciones.trim()) {
    mostrarError.value = true
    return
  }

  mostrarError.value = false

  try {
    const resultado = store.evaluarPropuesta(route.params.id, {
      criterios: {
        pertinencia: ev.pertinencia,
        viabilidad: ev.viabilidad,
        originalidad: ev.originalidad,
        marco: ev.marco,
      },
      puntuacion: parseFloat(puntuacion.value.toFixed(1)),
      decision,
      observaciones: ev.observaciones,
    })

    guardado.value = true

    setTimeout(() => {
      if (decision === 'aprobada' && resultado?.proyectoId) {
        alert('✓ Propuesta APROBADA.\nSe creó el proyecto automáticamente.\nEl investigador ya puede registrar avances.')
      }
      router.push('/comite')
    }, 1000)

  } catch (e) {
    console.error('Error al guardar evaluación:', e)
    alert('Ocurrió un error al guardar. Intenta de nuevo.')
  }
}
</script>

<style scoped>
.criterio-item { padding: 12px 0; border-bottom: 1px solid var(--border); }
.criterio-item:last-of-type { border-bottom: none; }
.score-slider { width: 100%; accent-color: var(--blue); }
.review-label { font-size: 11px; font-weight: 600; color: var(--text3); text-transform: uppercase; letter-spacing: 0.05em; }
</style>
