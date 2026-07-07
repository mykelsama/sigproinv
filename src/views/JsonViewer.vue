<template>
  <NavBar>
    <div class="main-content">
      <div class="page-header">
        <h1>Vista JSON — LocalStorage</h1>
        <p>Visualización de los datos almacenados en el navegador mediante LocalStorage y JSON</p>
      </div>
      <div class="page-body">

        <div class="alert alert-info" style="margin-bottom:20px">
          <strong>¿Cómo funciona?</strong> Los datos se guardan con <code>JSON.stringify(datos)</code> y se leen con <code>JSON.parse(datos)</code> desde el LocalStorage del navegador. No se usa ningún backend ni base de datos externa.
        </div>

        <!-- Selector de colección -->
        <div class="tabs" style="margin-bottom:20px">
          <button v-for="c in colecciones" :key="c.key" :class="['tab-btn', { active: activa===c.key }]" @click="activa=c.key">
            {{ c.label }} <span class="badge badge-gray" style="margin-left:6px">{{ getData(c.key).length }}</span>
          </button>
        </div>

        <!-- Stats de la colección -->
        <div class="grid-4" style="margin-bottom:16px">
          <div class="stat-card">
            <div class="stat-num" style="color:var(--blue)">{{ getData(activa).length }}</div>
            <div class="stat-label">Registros</div>
          </div>
          <div class="stat-card">
            <div class="stat-num" style="color:var(--teal)">{{ tamañoBytes }}</div>
            <div class="stat-label">Bytes en LS</div>
          </div>
          <div class="stat-card">
            <div class="stat-num" style="color:var(--amber)">{{ camposUnicos }}</div>
            <div class="stat-label">Campos únicos</div>
          </div>
          <div class="stat-card">
            <div class="stat-num" style="color:var(--green)">JSON</div>
            <div class="stat-label">Formato</div>
          </div>
        </div>

        <!-- Barra de herramientas -->
        <div style="display:flex;gap:10px;align-items:center;margin-bottom:14px;flex-wrap:wrap">
          <input v-model="busqueda" placeholder="Buscar en JSON..." style="max-width:260px" />
          <div style="margin-left:auto;display:flex;gap:8px">
            <button class="btn btn-secondary btn-sm" @click="copiar">📋 Copiar JSON</button>
            <button class="btn btn-secondary btn-sm" @click="descargar">⬇ Descargar .json</button>
            <button class="btn btn-secondary btn-sm" @click="expandido=!expandido">{{ expandido ? '⊟ Colapsar' : '⊞ Expandir' }}</button>
          </div>
        </div>

        <!-- Código JSON -->
        <div class="json-wrapper">
          <div class="json-toolbar">
            <span class="json-key-badge">localStorage["sigproinv_{{ activa }}"]</span>
            <span style="font-size:11px;color:var(--text3)">JSON.parse( localStorage.getItem("sigproinv_{{ activa }}") )</span>
          </div>
          <pre class="json-block" v-html="jsonColoreado"></pre>
        </div>

        <!-- Explicación educativa -->
        <div class="card" style="margin-top:20px">
          <div class="section-title" style="margin-bottom:14px">¿Cómo se guardan y leen los datos?</div>
          <div class="grid-2" style="gap:16px">
            <div>
              <div style="font-size:12px;font-weight:700;color:var(--green);margin-bottom:8px">GUARDAR — JSON.stringify()</div>
              <pre class="code-snippet">// Guardar un array de objetos
const datos = {{ previewData }}

localStorage.setItem(
  "sigproinv_{{ activa }}",
  JSON.stringify(datos)
)</pre>
            </div>
            <div>
              <div style="font-size:12px;font-weight:700;color:var(--blue);margin-bottom:8px">LEER — JSON.parse()</div>
              <pre class="code-snippet">// Leer y parsear los datos
const raw = localStorage.getItem(
  "sigproinv_{{ activa }}"
)

const datos = JSON.parse(raw)
// datos es nuevamente un array
console.log(datos.length) // {{ getData(activa).length }}</pre>
            </div>
          </div>
        </div>

        <!-- Notificación de copiado -->
        <div v-if="copiado" class="toast">✓ JSON copiado al portapapeles</div>

      </div>
    </div>
  </NavBar>
</template>

<script setup>
import { ref, computed } from 'vue'
import NavBar from '@/components/NavBar.vue'
import { useStore } from '@/stores/useStore.js'

const store = useStore()
const activa = ref('proyectos')
const busqueda = ref('')
const expandido = ref(true)
const copiado = ref(false)

const colecciones = [
  { key: 'proyectos', label: 'Proyectos' },
  { key: 'propuestas', label: 'Propuestas' },
  { key: 'evaluaciones', label: 'Evaluaciones' },
  { key: 'usuarios', label: 'Usuarios' },
]

function getData(key) {
  const map = {
    proyectos: store.proyectos,
    propuestas: store.propuestas,
    evaluaciones: store.evaluaciones,
    usuarios: store.usuarios,
  }
  return map[key] || []
}

const jsonStr = computed(() => {
  const d = getData(activa.value)
  return JSON.stringify(d, null, expandido.value ? 2 : 0)
})

const tamañoBytes = computed(() => {
  const raw = localStorage.getItem(`sigproinv_${activa.value}`) || ''
  return raw.length
})

const camposUnicos = computed(() => {
  const data = getData(activa.value)
  if (!data.length) return 0
  return Object.keys(data[0]).length
})

const previewData = computed(() => {
  const d = getData(activa.value)
  if (!d.length) return '[]'
  const sample = [{ ...d[0] }]
  Object.keys(sample[0]).forEach(k => {
    if (typeof sample[0][k] === 'string' && sample[0][k].length > 30) {
      sample[0][k] = sample[0][k].slice(0, 30) + '...'
    }
  })
  return JSON.stringify(sample, null, 2)
})

// Colorear JSON
const jsonColoreado = computed(() => {
  let str = jsonStr.value
  if (busqueda.value) {
    const r = new RegExp(`(${busqueda.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    str = str.replace(r, '<mark style="background:var(--amber);color:#000;border-radius:2px">$1</mark>')
  }
  // colorear sintaxis
  return str
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"([^"]+)":/g, '<span class="jk">"$1"</span>:')
    .replace(/: "([^"]*)"/g, ': <span class="js">"$1"</span>')
    .replace(/: (true|false)/g, ': <span class="jb">$1</span>')
    .replace(/: (\d+\.?\d*)/g, ': <span class="jn">$1</span>')
    .replace(/: (null)/g, ': <span class="jnull">$1</span>')
    .replace(/&lt;mark/g, '<mark').replace(/&gt;([^<]*)<\/mark&gt;/g, '>$1</mark>')
    .replace(/mark&gt;/g, 'mark>')
})

function copiar() {
  navigator.clipboard.writeText(jsonStr.value).then(() => {
    copiado.value = true
    setTimeout(() => copiado.value = false, 2000)
  })
}

function descargar() {
  const blob = new Blob([jsonStr.value], { type: 'application/json' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `sigproinv_${activa.value}.json`
  a.click()
}
</script>

<style scoped>
.json-wrapper { background: var(--bg); border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; }
.json-toolbar { display: flex; align-items: center; justify-content: space-between; padding: 10px 16px; background: var(--bg3); border-bottom: 1px solid var(--border); flex-wrap: wrap; gap: 6px; }
.json-key-badge { background: var(--blue-dim); color: var(--blue); font-size: 12px; font-weight: 600; padding: 3px 10px; border-radius: 4px; font-family: monospace; }
.json-block { padding: 20px; font-size: 12px; line-height: 1.7; overflow-x: auto; max-height: 520px; overflow-y: auto; font-family: 'Courier New', monospace; white-space: pre; }
:deep(.jk) { color: #9b7ff4; }
:deep(.js) { color: #34c98a; }
:deep(.jn) { color: #f5a623; }
:deep(.jb) { color: #4f8ef7; }
:deep(.jnull) { color: #f25c5c; }
.code-snippet { background: var(--bg); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 14px; font-size: 12px; line-height: 1.7; overflow-x: auto; font-family: 'Courier New', monospace; white-space: pre; color: var(--text2); }
.toast { position: fixed; bottom: 24px; right: 24px; background: var(--green); color: #fff; padding: 10px 20px; border-radius: var(--radius-sm); font-size: 13px; font-weight: 600; z-index: 200; animation: fadeUp 0.3s ease; }
@keyframes fadeUp { from { opacity:0; transform: translateY(10px) } to { opacity:1; transform: translateY(0) } }
code { background: var(--bg3); padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 13px; }
</style>
