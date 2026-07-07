import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// ── Datos semilla ────────────────────────────────────────────────────────────
const SEED_USERS = [
  { id: 1, nombre: 'Dr. Jorge Reyes',      email: 'jreyes@uleam.edu.ec',   password: '123456', rol: 'director',     avatar: 'JR', facultad: 'Dirección de Investigación' },
  { id: 2, nombre: 'Mg. Luis Torres',      email: 'ltorres@uleam.edu.ec',  password: '123456', rol: 'investigador',  avatar: 'LT', facultad: 'Facultad de Sistemas' },
  { id: 3, nombre: 'Dra. Ana Vera',        email: 'avera@uleam.edu.ec',    password: '123456', rol: 'investigador',  avatar: 'AV', facultad: 'Facultad de Ciencias Ambientales' },
  { id: 4, nombre: 'Dr. Carlos Espinoza', email: 'cespinoza@uleam.edu.ec', password: '123456', rol: 'comite',        avatar: 'CE', facultad: 'Comité de Evaluación' },
  { id: 5, nombre: 'Mg. Fátima Cevallos', email: 'fcevallos@uleam.edu.ec', password: '123456', rol: 'investigador',  avatar: 'FC', facultad: 'Facultad de Ciencias Ambientales' },
]

const SEED_INVESTIGACIONES = [
  {
    id: 1, titulo: 'Impacto del cambio climático en cultivos de la costa ecuatoriana',
    investigadorId: 3, tipo: 'Aplicada', modalidad: 'Investigación científica',
    area: 'Ciencias Ambientales', fechaInicio: '2025-01-01', duracion: 24,
    estado: 'ejecucion', avance: 65,
    planteamiento: 'El cambio climático afecta significativamente la producción agrícola de la costa ecuatoriana, generando pérdidas económicas y amenazando la seguridad alimentaria.',
    objetivo: 'Analizar el impacto del cambio climático en los principales cultivos de la costa ecuatoriana durante el período 2023-2025.',
    metodologia: 'Investigación mixta (cuantitativa-cualitativa). Análisis estadístico de datos climatológicos y encuestas a agricultores.',
    palabrasClave: ['cambio climático', 'agricultura', 'costa ecuatoriana', 'seguridad alimentaria'],
    presupuesto: { personal: 8400, materiales: 3200, campo: 1800, publicacion: 600 },
    fases: [
      { nombre: 'Marco teórico y bibliografía', mesesInicio: 1, mesesFin: 3, estado: 'completa' },
      { nombre: 'Recolección de datos de campo', mesesInicio: 4, mesesFin: 8, estado: 'completa' },
      { nombre: 'Análisis estadístico de datos', mesesInicio: 9, mesesFin: 14, estado: 'en_curso' },
      { nombre: 'Resultados y publicación', mesesInicio: 15, mesesFin: 24, estado: 'pendiente' },
    ],
    equipo: [
      { usuarioId: 3, rol: 'Principal' },
    ],
    avances: [
      { fecha: '2026-04-15', descripcion: 'Análisis de 240 muestras de suelo. Correlación positiva confirmada.', fase: 'Análisis estadístico' },
      { fecha: '2026-03-20', descripcion: 'Inicio del procesamiento estadístico. Base de datos estructurada.', fase: 'Análisis estadístico' },
      { fecha: '2026-02-28', descripcion: '1,240 encuestas y 180 muestras de suelo recolectadas en campo.', fase: 'Recolección de datos' },
    ],
    evaluacion: null,
    createdAt: '2025-01-01',
  },
  {
    id: 2, titulo: 'Sistema de IA para diagnóstico temprano en enfermedades tropicales',
    investigadorId: 2, tipo: 'Aplicada', modalidad: 'Investigación aplicada',
    area: 'Sistemas e Inteligencia Artificial', fechaInicio: '2026-03-01', duracion: 18,
    estado: 'evaluacion', avance: 20,
    planteamiento: 'Las enfermedades tropicales representan un desafío crítico en Ecuador. El diagnóstico tardío incrementa la mortalidad.',
    objetivo: 'Desarrollar un sistema de inteligencia artificial para el diagnóstico temprano de enfermedades tropicales en la región costera ecuatoriana.',
    metodologia: 'Desarrollo de modelo de IA entrenado con datos clínicos regionales. Validación con médicos especialistas.',
    palabrasClave: ['inteligencia artificial', 'diagnóstico', 'enfermedades tropicales', 'machine learning'],
    presupuesto: { personal: 12000, materiales: 5000, campo: 2000, publicacion: 1000 },
    fases: [
      { nombre: 'Recopilación de datos clínicos', mesesInicio: 1, mesesFin: 4, estado: 'en_curso' },
      { nombre: 'Desarrollo del modelo IA', mesesInicio: 5, mesesFin: 12, estado: 'pendiente' },
      { nombre: 'Validación clínica', mesesInicio: 13, mesesFin: 16, estado: 'pendiente' },
      { nombre: 'Publicación y difusión', mesesInicio: 17, mesesFin: 18, estado: 'pendiente' },
    ],
    equipo: [
      { usuarioId: 2, rol: 'Principal' },
      { usuarioId: 5, rol: 'Co-investigador' },
    ],
    avances: [],
    evaluacion: {
      comiteId: 4, pertinencia: 8, viabilidad: 7, originalidad: 6, marcoTeorico: 7,
      total: 7.0, observaciones: 'Propuesta sólida con alto impacto regional. Se sugiere ampliar el marco teórico.',
      decision: 'correcciones', fecha: '2026-05-20'
    },
    createdAt: '2026-03-01',
  },
  {
    id: 3, titulo: 'Análisis socioeconómico de comunidades pesqueras de Manta',
    investigadorId: 2, tipo: 'Aplicada', modalidad: 'Tesis pregrado',
    area: 'Ciencias Sociales y Económicas', fechaInicio: '2026-04-01', duracion: 12,
    estado: 'planificacion', avance: 10,
    planteamiento: 'Las comunidades pesqueras de Manta enfrentan una disminución significativa en sus ingresos debido a factores climáticos y económicos.',
    objetivo: 'Analizar el impacto socioeconómico en comunidades pesqueras artesanales de la ciudad de Manta durante el período 2024-2026.',
    metodologia: 'Investigación mixta. Encuestas, entrevistas y análisis estadístico de datos económicos de la región.',
    palabrasClave: ['pesca artesanal', 'Manta', 'economía costera', 'socioeconómico'],
    presupuesto: { personal: 3000, materiales: 800, campo: 600, publicacion: 200 },
    fases: [
      { nombre: 'Revisión bibliográfica', mesesInicio: 1, mesesFin: 2, estado: 'completa' },
      { nombre: 'Trabajo de campo', mesesInicio: 3, mesesFin: 7, estado: 'en_curso' },
      { nombre: 'Análisis de datos', mesesInicio: 8, mesesFin: 10, estado: 'pendiente' },
      { nombre: 'Redacción y defensa', mesesInicio: 11, mesesFin: 12, estado: 'pendiente' },
    ],
    equipo: [
      { usuarioId: 2, rol: 'Principal' },
    ],
    avances: [],
    evaluacion: null,
    createdAt: '2026-04-01',
  },
]

const SEED_NOTIFICACIONES = [
  { id: 1, usuarioId: 2, tipo: 'alerta', mensaje: 'Informe mensual pendiente — Proyecto IA Diagnóstico vence en 3 días', leida: false, fecha: '2026-06-25' },
  { id: 2, usuarioId: 2, tipo: 'info',   mensaje: 'Tu propuesta "Redes neuronales" fue recibida por el comité evaluador', leida: false, fecha: '2026-06-23' },
  { id: 3, usuarioId: 2, tipo: 'success',mensaje: 'Propuesta "Biodiversidad marina" aprobada — inicia fase de planificación', leida: true, fecha: '2026-05-15' },
  { id: 4, usuarioId: 4, tipo: 'info',   mensaje: 'Nueva propuesta para evaluar: Sistema IA Diagnóstico', leida: false, fecha: '2026-06-24' },
  { id: 5, usuarioId: 1, tipo: 'alerta', mensaje: 'Informe pendiente — Proyecto IA Diagnóstico vence en 3 días', leida: false, fecha: '2026-06-25' },
]

// ── Helper LocalStorage ──────────────────────────────────────────────────────
function lsGet(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch { return fallback }
}
function lsSet(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

// ── Inicializar datos semilla si no existen ──────────────────────────────────
function seedIfEmpty() {
  if (!localStorage.getItem('sigproinv_seeded')) {
    lsSet('sigproinv_usuarios',        SEED_USERS)
    lsSet('sigproinv_investigaciones', SEED_INVESTIGACIONES)
    lsSet('sigproinv_notificaciones',  SEED_NOTIFICACIONES)
    localStorage.setItem('sigproinv_seeded', '1')
  }
}

// ── Store principal ──────────────────────────────────────────────────────────
export const useStorageStore = defineStore('storage', () => {
  seedIfEmpty()

  // ── State
  const sesion           = ref(lsGet('sigproinv_sesion', null))
  const investigaciones  = ref(lsGet('sigproinv_investigaciones', []))
  const usuarios         = ref(lsGet('sigproinv_usuarios', []))
  const notificaciones   = ref(lsGet('sigproinv_notificaciones', []))

  // ── Persist helpers
  function guardarInvestigaciones() { lsSet('sigproinv_investigaciones', investigaciones.value) }
  function guardarNotificaciones()  { lsSet('sigproinv_notificaciones', notificaciones.value)   }

  // ── Auth
  function login(email, password) {
    const user = usuarios.value.find(u => u.email === email && u.password === password)
    if (!user) return { ok: false, error: 'Credenciales incorrectas' }
    sesion.value = { ...user }
    lsSet('sigproinv_sesion', sesion.value)
    return { ok: true, user }
  }
  function logout() {
    sesion.value = null
    localStorage.removeItem('sigproinv_sesion')
  }

  // ── Computed stats
  const misInvestigaciones = computed(() =>
    sesion.value?.rol === 'investigador'
      ? investigaciones.value.filter(i => i.investigadorId === sesion.value.id)
      : investigaciones.value
  )

  const stats = computed(() => ({
    total:       investigaciones.value.length,
    enEjecucion: investigaciones.value.filter(i => i.estado === 'ejecucion').length,
    evaluacion:  investigaciones.value.filter(i => i.estado === 'evaluacion').length,
    planificacion: investigaciones.value.filter(i => i.estado === 'planificacion').length,
    finalizadas: investigaciones.value.filter(i => i.estado === 'cerrado').length,
  }))

  const notificacionesNoLeidas = computed(() =>
    notificaciones.value.filter(n => n.usuarioId === sesion.value?.id && !n.leida).length
  )

  // ── CRUD Investigaciones
  function crearInvestigacion(datos) {
    const nueva = {
      ...datos,
      id: Date.now(),
      investigadorId: sesion.value.id,
      estado: 'evaluacion',
      avance: 0,
      avances: [],
      evaluacion: null,
      createdAt: new Date().toISOString().split('T')[0],
    }
    investigaciones.value.unshift(nueva)
    guardarInvestigaciones()

    // notificación al comité
    agregarNotificacion(4, 'info', `Nueva propuesta para evaluar: ${nueva.titulo}`)
    agregarNotificacion(1, 'info', `Nueva propuesta enviada: ${nueva.titulo}`)
    return nueva
  }

  function actualizarInvestigacion(id, cambios) {
    const idx = investigaciones.value.findIndex(i => i.id === id)
    if (idx === -1) return
    investigaciones.value[idx] = { ...investigaciones.value[idx], ...cambios }
    guardarInvestigaciones()
  }

  function eliminarInvestigacion(id) {
    investigaciones.value = investigaciones.value.filter(i => i.id !== id)
    guardarInvestigaciones()
  }

  function getInvestigacion(id) {
    return investigaciones.value.find(i => i.id === Number(id))
  }

  // ── Avances
  function registrarAvance(investigacionId, avance) {
    const idx = investigaciones.value.findIndex(i => i.id === investigacionId)
    if (idx === -1) return
    investigaciones.value[idx].avances.unshift({
      ...avance,
      fecha: new Date().toISOString().split('T')[0],
    })
    guardarInvestigaciones()
  }

  // ── Evaluaciones
  function guardarEvaluacion(investigacionId, evaluacion) {
    const idx = investigaciones.value.findIndex(i => i.id === investigacionId)
    if (idx === -1) return
    const inv = investigaciones.value[idx]
    const total = ((evaluacion.pertinencia + evaluacion.viabilidad + evaluacion.originalidad + evaluacion.marcoTeorico) / 4).toFixed(1)
    inv.evaluacion = { ...evaluacion, total: parseFloat(total), comiteId: sesion.value.id, fecha: new Date().toISOString().split('T')[0] }
    if (evaluacion.decision === 'aprobado') inv.estado = 'planificacion'
    else if (evaluacion.decision === 'rechazado') inv.estado = 'rechazado'
    guardarInvestigaciones()
    agregarNotificacion(inv.investigadorId, evaluacion.decision === 'aprobado' ? 'success' : 'alerta',
      `Tu propuesta "${inv.titulo}" fue ${evaluacion.decision === 'aprobado' ? 'aprobada' : 'revisada'} por el comité`)
  }

  // ── Cierre
  function cerrarInvestigacion(id, datosCierre) {
    actualizarInvestigacion(id, { estado: 'cerrado', avance: 100, cierre: datosCierre })
    agregarNotificacion(sesion.value.id, 'success', `Investigación cerrada y archivada exitosamente`)
  }

  // ── Notificaciones
  function agregarNotificacion(usuarioId, tipo, mensaje) {
    notificaciones.value.unshift({ id: Date.now(), usuarioId, tipo, mensaje, leida: false, fecha: new Date().toISOString().split('T')[0] })
    guardarNotificaciones()
  }
  function marcarNotificacionLeida(id) {
    const n = notificaciones.value.find(n => n.id === id)
    if (n) { n.leida = true; guardarNotificaciones() }
  }
  function misNotificaciones() {
    return notificaciones.value.filter(n => n.usuarioId === sesion.value?.id)
  }

  // ── Helpers UI
  function nombreUsuario(id) {
    return usuarios.value.find(u => u.id === id)?.nombre || 'Desconocido'
  }
  function estadoBadge(estado) {
    const map = {
      evaluacion:   { label: 'Evaluación',   cls: 'badge-amber'  },
      planificacion:{ label: 'Planificación', cls: 'badge-blue'   },
      ejecucion:    { label: 'En ejecución',  cls: 'badge-teal'   },
      resultados:   { label: 'Resultados',    cls: 'badge-purple' },
      cerrado:      { label: 'Finalizado',    cls: 'badge-green'  },
      rechazado:    { label: 'Rechazado',     cls: 'badge-coral'  },
    }
    return map[estado] || { label: estado, cls: 'badge-gray' }
  }

  // ── JSON raw (para la vista del profesor)
  const rawJSON = computed(() => JSON.stringify({
    investigaciones: investigaciones.value,
    usuarios: usuarios.value.map(u => ({ ...u, password: '***' })),
    notificaciones: notificaciones.value,
  }, null, 2))

  return {
    sesion, investigaciones, usuarios, notificaciones,
    misInvestigaciones, stats, notificacionesNoLeidas,
    login, logout,
    crearInvestigacion, actualizarInvestigacion, eliminarInvestigacion, getInvestigacion,
    registrarAvance, guardarEvaluacion, cerrarInvestigacion,
    agregarNotificacion, marcarNotificacionLeida, misNotificaciones,
    nombreUsuario, estadoBadge, rawJSON,
  }
})
