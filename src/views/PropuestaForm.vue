<template>
  <NavBar>
    <div class="main-content">
      <div class="page-header">
        <h1>{{ isEditing ? 'Editar propuesta' : 'Nueva propuesta de investigación' }}</h1>
        <p>{{ stepLabels[step - 1] }}</p>
      </div>
      <div class="page-body">

        <!-- Stepper -->
        <div class="stepper" style="margin-bottom:24px">
          <div v-for="(label, i) in stepLabels" :key="i" class="step-item">
            <div class="step-circle" :class="{ active: step === i+1, done: step > i+1 }">
              <span v-if="step > i+1">✓</span>
              <span v-else>{{ i+1 }}</span>
            </div>
            <span class="step-label" :class="{ active: step === i+1 }">{{ label }}</span>
            <div v-if="i < stepLabels.length-1" class="step-line" :class="{ done: step > i+1 }"></div>
          </div>
        </div>

        <div class="card" style="max-width:900px">

          <!-- STEP 1: Datos generales -->
          <div v-if="step === 1">
            <div class="grid-2">
              <div style="grid-column:1/-1">
                <div class="field">
                  <label>Título de la investigación *</label>
                  <input v-model="form.titulo" placeholder="Ej. Análisis socioeconómico de..." :class="{ error: err.titulo }" @input="delete err.titulo" />
                  <div v-if="err.titulo" class="field-error">{{ err.titulo }}</div>
                </div>
              </div>
              <div class="field">
                <label>Tipo de investigación *</label>
                <select v-model="form.tipo" :class="{ error: err.tipo }" @change="delete err.tipo">
                  <option value="">Seleccionar...</option>
                  <option>Básica</option><option>Aplicada</option><option>Mixta</option>
                </select>
                <div v-if="err.tipo" class="field-error">{{ err.tipo }}</div>
              </div>
              <div class="field">
                <label>Modalidad *</label>
                <select v-model="form.modalidad" :class="{ error: err.modalidad }" @change="delete err.modalidad">
                  <option value="">Seleccionar...</option>
                  <option>Proyecto institucional</option><option>Tesis pregrado</option>
                  <option>Tesis maestría</option><option>Tesis doctoral</option><option>Investigación aplicada</option>
                </select>
                <div v-if="err.modalidad" class="field-error">{{ err.modalidad }}</div>
              </div>
              <div class="field">
                <label>Área del conocimiento *</label>
                <select v-model="form.area" :class="{ error: err.area }" @change="delete err.area">
                  <option value="">Seleccionar...</option>
                  <option>Ciencias Ambientales</option>
                  <option>Ciencias Sociales y Económicas</option>
                  <option>Sistemas / Tecnología</option>
                  <option>Ciencias de la Salud</option>
                  <option>Ingeniería</option>
                  <option>Educación</option>
                  <option>Derecho</option>
                </select>
                <div v-if="err.area" class="field-error">{{ err.area }}</div>
              </div>
              <div class="field">
                <label>Fecha de inicio * <span style="font-size:11px;color:var(--text3)">(desde hoy en adelante)</span></label>
                <input
                  v-model="form.fechaInicio"
                  type="date"
                  :min="fechaMinima"
                  :class="{ error: err.fechaInicio }"
                  @change="delete err.fechaInicio"
                />
                <div v-if="err.fechaInicio" class="field-error">{{ err.fechaInicio }}</div>
              </div>
              <div class="field">
                <label>Duración estimada (meses) *</label>
                <input v-model.number="form.duracion" type="number" min="1" max="60" placeholder="12" :class="{ error: err.duracion }" @input="delete err.duracion" />
                <div v-if="err.duracion" class="field-error">{{ err.duracion }}</div>
              </div>
              <div style="grid-column:1/-1">
                <div class="field">
                  <label>Planteamiento del problema *</label>
                  <textarea v-model="form.planteamiento" rows="4" :class="{ error: err.planteamiento }" placeholder="Describe el problema de investigación..." @input="delete err.planteamiento"></textarea>
                  <div v-if="err.planteamiento" class="field-error">{{ err.planteamiento }}</div>
                </div>
              </div>
              <div style="grid-column:1/-1">
                <div class="field">
                  <label>Objetivo general *</label>
                  <textarea v-model="form.objetivo" rows="3" :class="{ error: err.objetivo }" placeholder="Define el objetivo principal..." @input="delete err.objetivo"></textarea>
                  <div v-if="err.objetivo" class="field-error">{{ err.objetivo }}</div>
                </div>
              </div>
              <div style="grid-column:1/-1">
                <div class="field">
                  <label>Metodología *</label>
                  <textarea v-model="form.metodologia" rows="3" :class="{ error: err.metodologia }" placeholder="Describe la metodología..." @input="delete err.metodologia"></textarea>
                  <div v-if="err.metodologia" class="field-error">{{ err.metodologia }}</div>
                </div>
              </div>
              <div style="grid-column:1/-1">
                <div class="field">
                  <label>Palabras clave</label>
                  <div style="display:flex;gap:8px;align-items:center">
                    <input v-model="kwInput" placeholder="Agregar palabra clave" @keydown.enter.prevent="addKw" style="flex:1" />
                    <button class="btn btn-secondary btn-sm" @click="addKw">+ Agregar</button>
                  </div>
                  <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:8px">
                    <span v-for="(kw,i) in form.palabrasClave" :key="i" class="badge badge-blue" style="cursor:pointer" @click="removeKw(i)">{{ kw }} ×</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- STEP 2: Presupuesto -->
          <div v-if="step === 2">
            <div class="section-title" style="margin-bottom:16px">Presupuesto estimado (USD)</div>
            <div class="grid-2" style="margin-bottom:24px">
              <div class="field">
                <label>Personal investigador</label>
                <input v-model.number="form.presupuesto.personal" type="number" min="0" placeholder="0" />
              </div>
              <div class="field">
                <label>Materiales y equipos</label>
                <input v-model.number="form.presupuesto.materiales" type="number" min="0" placeholder="0" />
              </div>
              <div class="field">
                <label>Salidas de campo</label>
                <input v-model.number="form.presupuesto.campo" type="number" min="0" placeholder="0" />
              </div>
              <div class="field">
                <label>Publicación y difusión</label>
                <input v-model.number="form.presupuesto.publicacion" type="number" min="0" placeholder="0" />
              </div>
            </div>
            <div class="alert alert-info">
              Total presupuesto: <strong>${{ totalPresupuesto.toLocaleString() }}</strong>
            </div>
          </div>

          <!-- STEP 3: Cronograma -->
          <div v-if="step === 3">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
              <div class="section-title">Fases del proyecto</div>
              <button class="btn btn-secondary btn-sm" @click="addFase">+ Agregar fase</button>
            </div>
            <div v-for="(fase, i) in form.fases" :key="i" class="fase-block">
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
                <span style="font-size:13px;font-weight:600;color:var(--blue)">Fase {{ i+1 }}</span>
                <button v-if="form.fases.length > 1" class="btn btn-danger btn-sm" @click="removeFase(i)">✕</button>
              </div>
              <div class="grid-2">
                <div style="grid-column:1/-1" class="field">
                  <label>Nombre de la fase *</label>
                  <input v-model="fase.nombre" placeholder="Ej. Marco teórico" />
                </div>
                <div class="field">
                  <label>Mes inicio</label>
                  <input v-model.number="fase.mesesInicio" type="number" min="1" :max="form.duracion" />
                </div>
                <div class="field">
                  <label>Mes fin</label>
                  <input v-model.number="fase.mesesFin" type="number" :min="fase.mesesInicio" :max="form.duracion" />
                </div>
              </div>
            </div>
            <div v-if="err.fases" class="alert alert-danger" style="margin-top:10px">{{ err.fases }}</div>
          </div>

          <!-- STEP 4: Revisión -->
          <div v-if="step === 4">
            <div class="alert alert-info" style="margin-bottom:20px">
              Revisa los datos antes de enviar. Una vez enviada, la propuesta quedará pendiente de evaluación por el comité.
            </div>
            <div class="review-section">
              <div class="review-label">Título</div>
              <div class="review-val">{{ form.titulo }}</div>
            </div>
            <div class="grid-2">
              <div class="review-section"><div class="review-label">Tipo</div><div class="review-val">{{ form.tipo }}</div></div>
              <div class="review-section"><div class="review-label">Modalidad</div><div class="review-val">{{ form.modalidad }}</div></div>
              <div class="review-section"><div class="review-label">Área</div><div class="review-val">{{ form.area }}</div></div>
              <div class="review-section"><div class="review-label">Duración</div><div class="review-val">{{ form.duracion }} meses</div></div>
            </div>
            <div class="review-section"><div class="review-label">Fecha de inicio</div><div class="review-val">{{ form.fechaInicio }}</div></div>
            <div class="review-section"><div class="review-label">Planteamiento</div><div class="review-val">{{ form.planteamiento }}</div></div>
            <div class="review-section"><div class="review-label">Objetivo</div><div class="review-val">{{ form.objetivo }}</div></div>
            <div class="review-section"><div class="review-label">Metodología</div><div class="review-val">{{ form.metodologia }}</div></div>
            <div class="review-section">
              <div class="review-label">Palabras clave</div>
              <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:4px">
                <span v-for="kw in form.palabrasClave" :key="kw" class="badge badge-blue">{{ kw }}</span>
                <span v-if="!form.palabrasClave.length" class="review-val">Ninguna</span>
              </div>
            </div>
            <div class="review-section">
              <div class="review-label">Presupuesto total</div>
              <div class="review-val" style="color:var(--green);font-weight:700">${{ totalPresupuesto.toLocaleString() }}</div>
            </div>
            <div class="review-section">
              <div class="review-label">Fases ({{ form.fases.length }})</div>
              <div v-for="(f,i) in form.fases" :key="i" class="review-val" style="margin-top:4px">
                {{ i+1 }}. {{ f.nombre }} (Mes {{ f.mesesInicio }}–{{ f.mesesFin }})
              </div>
            </div>
          </div>

          <!-- Footer nav -->
          <div style="display:flex;justify-content:space-between;margin-top:24px;padding-top:16px;border-top:1px solid var(--border)">
            <div style="display:flex;gap:8px">
              <button v-if="step > 1" class="btn btn-secondary" @click="step--">← Anterior</button>
              <router-link to="/investigador" class="btn btn-secondary">Cancelar</router-link>
            </div>
            <div style="display:flex;gap:8px">
              <button class="btn btn-secondary" @click="guardarBorrador">Guardar borrador</button>
              <button v-if="step < 4" class="btn btn-primary" @click="nextStep">Siguiente →</button>
              <button v-else class="btn btn-success" @click="enviar">✓ Enviar propuesta</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </NavBar>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import NavBar from '@/components/NavBar.vue'
import { useStore } from '@/stores/useStore.js'

const store = useStore()
const route = useRoute()
const router = useRouter()

const isEditing = computed(() => !!route.params.id)
const step = ref(1)
const stepLabels = ['Datos generales', 'Presupuesto', 'Cronograma', 'Revisión y envío']
const kwInput = ref('')

// Fecha mínima = hoy en formato YYYY-MM-DD
const fechaMinima = computed(() => new Date().toISOString().slice(0, 10))

const form = reactive({
  titulo: '', tipo: '', modalidad: '', area: '', fechaInicio: '', duracion: 12,
  planteamiento: '', objetivo: '', metodologia: '', palabrasClave: [],
  presupuesto: { personal: 0, materiales: 0, campo: 0, publicacion: 0 },
  fases: [{ nombre: 'Marco teórico', mesesInicio: 1, mesesFin: 3, estado: 'pendiente' }],
})
const err = reactive({})

const totalPresupuesto = computed(() =>
  Object.values(form.presupuesto).reduce((a, b) => a + (Number(b) || 0), 0)
)

onMounted(() => {
  if (isEditing.value) {
    const p = store.getPropuesta(route.params.id)
    if (p) Object.assign(form, { ...p })
  }
})

function addKw() {
  const k = kwInput.value.trim()
  if (k && !form.palabrasClave.includes(k)) form.palabrasClave.push(k)
  kwInput.value = ''
}
function removeKw(i) { form.palabrasClave.splice(i, 1) }
function addFase() { form.fases.push({ nombre: '', mesesInicio: 1, mesesFin: form.duracion, estado: 'pendiente' }) }
function removeFase(i) { form.fases.splice(i, 1) }

function validateStep1() {
  let ok = true
  const campos = ['titulo', 'tipo', 'modalidad', 'area', 'fechaInicio', 'duracion', 'planteamiento', 'objetivo', 'metodologia']
  campos.forEach(c => {
    if (!form[c]) { err[c] = 'Campo requerido'; ok = false } else delete err[c]
  })

  // Validar que la fecha no sea anterior a hoy
  if (form.fechaInicio) {
    const hoy = new Date().toISOString().slice(0, 10)
    if (form.fechaInicio < hoy) {
      err.fechaInicio = 'La fecha de inicio debe ser desde hoy en adelante'
      ok = false
    }
  }

  // Validar duración
  if (form.duracion && (form.duracion < 1 || form.duracion > 60)) {
    err.duracion = 'La duración debe ser entre 1 y 60 meses'
    ok = false
  }

  return ok
}

function validateStep3() {
  const sinNombre = form.fases.some(f => !f.nombre.trim())
  if (sinNombre) { err.fases = 'Todas las fases deben tener un nombre'; return false }
  delete err.fases
  return true
}

function nextStep() {
  if (step.value === 1 && !validateStep1()) return
  if (step.value === 3 && !validateStep3()) return
  step.value++
}

function guardarBorrador() {
  alert('Borrador guardado localmente.')
}

function enviar() {
  if (isEditing.value) {
    store.editarPropuesta(route.params.id, { ...form })
  } else {
    store.crearPropuesta({ ...form })
  }
  router.push('/investigador')
}
</script>

<style scoped>
.stepper { display: flex; align-items: center; gap: 0; }
.step-item { display: flex; align-items: center; gap: 8px; }
.step-circle { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; background: var(--bg4); color: var(--text3); border: 2px solid var(--border); flex-shrink: 0; transition: all 0.2s; }
.step-circle.active { background: var(--blue); color: #fff; border-color: var(--blue); }
.step-circle.done { background: var(--green-dim); color: var(--green); border-color: var(--green); }
.step-label { font-size: 12px; color: var(--text3); white-space: nowrap; }
.step-label.active { color: var(--blue); font-weight: 600; }
.step-line { flex: 1; height: 2px; background: var(--border); min-width: 20px; transition: background 0.2s; }
.step-line.done { background: var(--green); }
.fase-block { background: var(--bg3); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 14px; margin-bottom: 10px; }
.review-section { padding: 10px 0; border-bottom: 1px solid var(--border); }
.review-section:last-child { border-bottom: none; }
.review-label { font-size: 11px; font-weight: 600; color: var(--text3); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }
.review-val { font-size: 13px; color: var(--text); }
</style>