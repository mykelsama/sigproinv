import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// ── helpers ──────────────────────────────────────────────
const ls = {
  get: (k) => { try { return JSON.parse(localStorage.getItem(k)) } catch { return null } },
  set: (k, v) => localStorage.setItem(k, JSON.stringify(v)),
}

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2)

// ── seed data ─────────────────────────────────────────────
const SEED_USUARIOS = [
  { id: 'u1', nombre: 'Dr. Jorge Reyes', email: 'jreyes@uleam.edu.ec', password: '1234', rol: 'director', facultad: 'Dirección de Investigación', area: '' },
  { id: 'u2', nombre: 'Mg. Luis Torres', email: 'ltorres@uleam.edu.ec', password: '1234', rol: 'investigador', facultad: 'Facultad de Sistemas', area: 'Inteligencia Artificial' },
  { id: 'u3', nombre: 'Dra. Ana Vera', email: 'avera@uleam.edu.ec', password: '1234', rol: 'investigador', facultad: 'Ciencias Ambientales', area: 'Cambio Climático' },
  { id: 'u4', nombre: 'Dr. Carlos Espinoza', email: 'cespinoza@uleam.edu.ec', password: '1234', rol: 'comite', facultad: 'Facultad de Ciencias', area: '' },
  { id: 'u5', nombre: 'Est. Mychell Samaniego', email: 'msamaniego@uleam.edu.ec', password: '1234', rol: 'investigador', facultad: 'Ciencias Sociales', area: 'Economía' },
]

const SEED_PROYECTOS = [
  {
    id: 'p1', titulo: 'Impacto del cambio climático en cultivos de la costa ecuatoriana',
    tipo: 'Aplicada', modalidad: 'Proyecto institucional', area: 'Ciencias Ambientales',
    investigadorId: 'u3', fechaInicio: '2025-01-15', duracion: 24,
    estado: 'ejecucion', avance: 65,
    planteamiento: 'Las comunidades agrícolas de la costa ecuatoriana enfrentan pérdidas significativas debido a fenómenos climáticos extremos.',
    objetivo: 'Evaluar el impacto del cambio climático en los cultivos de la costa ecuatoriana durante el período 2023-2025.',
    metodologia: 'Investigación mixta (cuantitativa-cualitativa). Análisis de datos meteorológicos e índices de producción agrícola.',
    palabrasClave: ['cambio climático', 'cultivos', 'costa ecuatoriana', 'impacto'],
    presupuesto: { personal: 8400, materiales: 3200, campo: 1800, publicacion: 600 },
    fases: [
      { nombre: 'Marco teórico y bibliografía', mesesInicio: 1, mesesFin: 3, estado: 'completa' },
      { nombre: 'Recolección de datos de campo', mesesInicio: 4, mesesFin: 8, estado: 'completa' },
      { nombre: 'Análisis estadístico de datos', mesesInicio: 9, mesesFin: 14, estado: 'en_curso' },
      { nombre: 'Resultados y publicación', mesesInicio: 15, mesesFin: 24, estado: 'pendiente' },
    ],
    equipo: [
      { usuarioId: 'u3', rol: 'principal' },
    ],
    avances: [
      { id: 'a1', fecha: '2025-02-28', descripcion: 'Cierre de fase 1 — revisión bibliográfica completada. 240 fuentes indexadas.', fase: 'Fase 1' },
      { id: 'a2', fecha: '2025-08-15', descripcion: '1,240 encuestas y 180 muestras de suelo recolectadas en campo.', fase: 'Fase 2' },
      { id: 'a3', fecha: '2026-03-20', descripcion: 'Inicio del procesamiento estadístico. Base de datos estructurada.', fase: 'Fase 3' },
    ],
    evaluacionId: 'ev1', evaluacionScore: 9.1, fechaEvaluacion: '2024-12-10',
    publicaciones: [],
  },
  {
    id: 'p2', titulo: 'Sistema de IA para diagnóstico temprano en enfermedades tropicales',
    tipo: 'Aplicada', modalidad: 'Investigación aplicada', area: 'Sistemas',
    investigadorId: 'u2', fechaInicio: '2026-03-01', duracion: 18,
    estado: 'ejecucion', avance: 20,
    planteamiento: 'Las enfermedades tropicales representan un desafío crítico en Ecuador. El diagnóstico tardío incrementa la mortalidad.',
    objetivo: 'Desarrollar un sistema de inteligencia artificial para el diagnóstico temprano de enfermedades tropicales en la región costera ecuatoriana.',
    metodologia: 'Desarrollo de modelo de IA entrenado con datos clínicos regionales para detección temprana.',
    palabrasClave: ['inteligencia artificial', 'diagnóstico', 'enfermedades tropicales', 'machine learning'],
    presupuesto: { personal: 12000, materiales: 4500, campo: 800, publicacion: 1200 },
    fases: [
      { nombre: 'Recopilación de datos clínicos', mesesInicio: 1, mesesFin: 4, estado: 'en_curso' },
      { nombre: 'Entrenamiento del modelo', mesesInicio: 5, mesesFin: 10, estado: 'pendiente' },
      { nombre: 'Validación clínica', mesesInicio: 11, mesesFin: 15, estado: 'pendiente' },
      { nombre: 'Publicación y difusión', mesesInicio: 16, mesesFin: 18, estado: 'pendiente' },
    ],
    equipo: [
      { usuarioId: 'u2', rol: 'principal' },
    ],
    avances: [
      { id: 'a4', fecha: '2026-04-10', descripcion: 'Inicio de recopilación de datos clínicos con Hospital Regional Manta.', fase: 'Fase 1' },
    ],
    evaluacionId: 'ev2', evaluacionScore: 8.0, fechaEvaluacion: '2026-02-20',
    publicaciones: [],
  },
  {
    id: 'p3', titulo: 'Análisis socioeconómico de comunidades pesqueras de Manta',
    tipo: 'Aplicada', modalidad: 'Tesis pregrado', area: 'Ciencias Sociales y Económicas',
    investigadorId: 'u5', fechaInicio: '2026-04-01', duracion: 12,
    estado: 'planificacion', avance: 10,
    planteamiento: 'Las comunidades pesqueras de Manta enfrentan una disminución significativa en sus ingresos debido a factores climáticos y económicos que no han sido estudiados de forma integral.',
    objetivo: 'Analizar el impacto socioeconómico en comunidades pesqueras artesanales de la ciudad de Manta durante el período 2024-2026.',
    metodologia: 'Investigación mixta (cuantitativa-cualitativa). Encuestas, entrevistas y análisis estadístico de datos económicos de la región.',
    palabrasClave: ['pesca artesanal', 'Manta', 'economía costera', 'socioeconómico'],
    presupuesto: { personal: 3200, materiales: 800, campo: 600, publicacion: 400 },
    fases: [
      { nombre: 'Marco conceptual', mesesInicio: 1, mesesFin: 2, estado: 'en_curso' },
      { nombre: 'Trabajo de campo', mesesInicio: 3, mesesFin: 7, estado: 'pendiente' },
      { nombre: 'Análisis y resultados', mesesInicio: 8, mesesFin: 11, estado: 'pendiente' },
      { nombre: 'Defensa y publicación', mesesInicio: 12, mesesFin: 12, estado: 'pendiente' },
    ],
    equipo: [{ usuarioId: 'u5', rol: 'principal' }],
    avances: [],
    evaluacionId: null, evaluacionScore: null, fechaEvaluacion: null,
    publicaciones: [],
  },
]

const SEED_PROPUESTAS = [
  {
    id: 'prop1', titulo: 'Biodiversidad marina en la costa de Manta',
    tipo: 'Básica', modalidad: 'Proyecto institucional', area: 'Ciencias del Mar',
    investigadorId: 'u2', fechaEnvio: '2026-05-10', duracion: 12,
    estado: 'aprobada',
    planteamiento: 'La biodiversidad marina en el perfil costero de Manta ha sido poco estudiada.',
    objetivo: 'Catalogar las especies marinas del litoral de Manta.',
    metodologia: 'Muestreo sistemático, análisis biológico de muestras.',
    palabrasClave: ['biodiversidad', 'marina', 'Manta', 'litoral'],
    presupuesto: { personal: 5000, materiales: 2000, campo: 1500, publicacion: 500 },
    evaluacionId: 'ev3', evaluacionScore: 8.7,
    observaciones: 'Propuesta sólida. Se recomienda ampliar el área de estudio.',
  },
  {
    id: 'prop2', titulo: 'Redes neuronales para predicción sísmica',
    tipo: 'Básica', modalidad: 'Investigación aplicada', area: 'Sistemas',
    investigadorId: 'u2', fechaEnvio: '2026-05-10', duracion: 18,
    estado: 'correcciones',
    planteamiento: 'Los sismos en el litoral ecuatoriano causan pérdidas humanas y materiales.',
    objetivo: 'Predecir sismos mediante redes neuronales entrenadas con datos históricos del IGM.',
    metodologia: 'Machine learning, análisis de series temporales sísmicas.',
    palabrasClave: ['redes neuronales', 'sismos', 'predicción', 'machine learning'],
    presupuesto: { personal: 9000, materiales: 3000, campo: 0, publicacion: 1000 },
    evaluacionId: 'ev4', evaluacionScore: 6.1,
    observaciones: 'Se solicitan correcciones en el marco teórico y detalle de datos utilizados.',
  },
  {
    id: 'prop3', titulo: 'Análisis de microplásticos en aguas costeras del perfil litoral manabita',
    tipo: 'Aplicada', modalidad: 'Tesis doctoral', area: 'Ciencias Ambientales',
    investigadorId: 'u3', fechaEnvio: '2026-05-12', duracion: 24,
    estado: 'pendiente',
    planteamiento: 'Los microplásticos representan una amenaza creciente para los ecosistemas marinos.',
    objetivo: 'Cuantificar y caracterizar microplásticos en aguas costeras de Manabí.',
    metodologia: 'Muestreo costero, análisis espectroscópico de muestras de agua.',
    palabrasClave: ['microplásticos', 'aguas costeras', 'Manabí', 'contaminación'],
    presupuesto: { personal: 11000, materiales: 6000, campo: 2500, publicacion: 1500 },
    evaluacionId: null, evaluacionScore: null,
    observaciones: '',
  },
]

const SEED_EVALUACIONES = [
  { id: 'ev1', propuestaId: null, proyectoId: 'p1', evaluadorId: 'u4', fecha: '2024-12-10',
    criterios: { pertinencia: 9, viabilidad: 9, originalidad: 9, marco: 10 },
    puntuacion: 9.1, decision: 'aprobada', observaciones: 'Investigación relevante para la región.' },
  { id: 'ev2', propuestaId: null, proyectoId: 'p2', evaluadorId: 'u4', fecha: '2026-02-20',
    criterios: { pertinencia: 8, viabilidad: 8, originalidad: 8, marco: 8 },
    puntuacion: 8.0, decision: 'aprobada', observaciones: 'Propuesta sólida con alto impacto regional.' },
  { id: 'ev3', propuestaId: 'prop1', proyectoId: null, evaluadorId: 'u4', fecha: '2026-05-15',
    criterios: { pertinencia: 9, viabilidad: 9, originalidad: 8, marco: 9 },
    puntuacion: 8.7, decision: 'aprobada', observaciones: 'Propuesta sólida. Se recomienda ampliar el área de estudio.' },
  { id: 'ev4', propuestaId: 'prop2', proyectoId: null, evaluadorId: 'u4', fecha: '2026-05-18',
    criterios: { pertinencia: 6, viabilidad: 6, originalidad: 7, marco: 7 },
    puntuacion: 6.1, decision: 'correcciones', observaciones: 'Se solicitan correcciones en el marco teórico.' },
]

function seedIfEmpty() {
  if (!ls.get('sigproinv_seeded')) {
    ls.set('sigproinv_usuarios', SEED_USUARIOS)
    ls.set('sigproinv_proyectos', SEED_PROYECTOS)
    ls.set('sigproinv_propuestas', SEED_PROPUESTAS)
    ls.set('sigproinv_evaluaciones', SEED_EVALUACIONES)
    ls.set('sigproinv_seeded', true)
  }
}

// ── store ─────────────────────────────────────────────────
export const useStore = defineStore('main', () => {
  seedIfEmpty()

  const sesion = ref(ls.get('sigproinv_sesion') || null)
  const usuarios = ref(ls.get('sigproinv_usuarios') || [])
  const proyectos = ref(ls.get('sigproinv_proyectos') || [])
  const propuestas = ref(ls.get('sigproinv_propuestas') || [])
  const evaluaciones = ref(ls.get('sigproinv_evaluaciones') || [])

  function save() {
    ls.set('sigproinv_usuarios', usuarios.value)
    ls.set('sigproinv_proyectos', proyectos.value)
    ls.set('sigproinv_propuestas', propuestas.value)
    ls.set('sigproinv_evaluaciones', evaluaciones.value)
  }

  // AUTH
  function login(email, password) {
    const u = usuarios.value.find(x => x.email === email && x.password === password)
    if (!u) return false
    sesion.value = u
    ls.set('sigproinv_sesion', u)
    return true
  }
  function logout() {
    sesion.value = null
    localStorage.removeItem('sigproinv_sesion')
  }

  // COMPUTED
  const misProyectos = computed(() =>
    sesion.value ? proyectos.value.filter(p => p.investigadorId === sesion.value.id) : []
  )
  const misPropuestas = computed(() =>
    sesion.value ? propuestas.value.filter(p => p.investigadorId === sesion.value.id) : []
  )
  const propuestasPendientes = computed(() =>
    propuestas.value.filter(p => p.estado === 'pendiente')
  )

  function getUsuario(id) { return usuarios.value.find(u => u.id === id) }
  function getProyecto(id) { return proyectos.value.find(p => p.id === id) }
  function getPropuesta(id) { return propuestas.value.find(p => p.id === id) }
  function getEvaluacion(id) { return evaluaciones.value.find(e => e.id === id) }

  // ESTADOSDEBADGE
  const estadoLabel = { propuesta: 'Propuesta', pendiente: 'Pendiente', aprobada: 'Aprobada', correcciones: 'Correcciones', rechazada: 'Rechazada', planificacion: 'Planificación', ejecucion: 'Ejecución', resultados: 'Resultados', cierre: 'Cierre', finalizado: 'Finalizado' }
  const estadoColor = { propuesta: 'badge-gray', pendiente: 'badge-amber', aprobada: 'badge-green', correcciones: 'badge-purple', rechazada: 'badge-red', planificacion: 'badge-blue', ejecucion: 'badge-teal', resultados: 'badge-purple', cierre: 'badge-amber', finalizado: 'badge-green' }

  // PROPUESTAS CRUD
  function crearPropuesta(data) {
    const p = { id: uid(), ...data, investigadorId: sesion.value.id, fechaEnvio: new Date().toISOString().slice(0,10), estado: 'pendiente', evaluacionId: null, evaluacionScore: null, observaciones: '' }
    propuestas.value.push(p)
    save()
    return p
  }
  function editarPropuesta(id, data) {
    const i = propuestas.value.findIndex(p => p.id === id)
    if (i !== -1) { propuestas.value[i] = { ...propuestas.value[i], ...data }; save() }
  }
  function eliminarPropuesta(id) {
    propuestas.value = propuestas.value.filter(p => p.id !== id)
    save()
  }

  // PROYECTOS CRUD
  function crearProyecto(data) {
    const p = { id: uid(), ...data, investigadorId: sesion.value.id, estado: 'planificacion', avance: 0, avances: [], equipo: [{ usuarioId: sesion.value.id, rol: 'principal' }], publicaciones: [], evaluacionId: null, evaluacionScore: null }
    proyectos.value.push(p)
    save()
    return p
  }
  function editarProyecto(id, data) {
    const i = proyectos.value.findIndex(p => p.id === id)
    if (i !== -1) { proyectos.value[i] = { ...proyectos.value[i], ...data }; save() }
  }
  function eliminarProyecto(id) {
    proyectos.value = proyectos.value.filter(p => p.id !== id)
    save()
  }
  function registrarAvance(proyectoId, avance) {
    const p = proyectos.value.find(x => x.id === proyectoId)
    if (p) { p.avances.push({ id: uid(), fecha: new Date().toISOString().slice(0,10), ...avance }); save() }
  }

  // EVALUACIONES
  function evaluarPropuesta(propuestaId, data) {
    const ev = { id: uid(), propuestaId, proyectoId: null, evaluadorId: sesion.value.id, fecha: new Date().toISOString().slice(0,10), ...data }
    evaluaciones.value.push(ev)
    const i = propuestas.value.findIndex(p => p.id === propuestaId)
    if (i !== -1) {
      propuestas.value[i].evaluacionId = ev.id
      propuestas.value[i].evaluacionScore = ev.puntuacion
      propuestas.value[i].estado = ev.decision
      propuestas.value[i].observaciones = ev.observaciones

      // Si fue aprobada -> crear proyecto automaticamente
      if (ev.decision === 'aprobada') {
        const prop = propuestas.value[i]
        const nuevoProyecto = {
          id: uid(),
          titulo: prop.titulo,
          tipo: prop.tipo,
          modalidad: prop.modalidad,
          area: prop.area,
          investigadorId: prop.investigadorId,
          fechaInicio: new Date().toISOString().slice(0, 10),
          duracion: prop.duracion,
          estado: 'planificacion',
          avance: 0,
          planteamiento: prop.planteamiento,
          objetivo: prop.objetivo,
          metodologia: prop.metodologia,
          palabrasClave: prop.palabrasClave || [],
          presupuesto: prop.presupuesto || { personal: 0, materiales: 0, campo: 0, publicacion: 0 },
          fases: prop.fases || [
            { nombre: 'Planificacion inicial', mesesInicio: 1, mesesFin: 2, estado: 'pendiente' },
          ],
          equipo: [{ usuarioId: prop.investigadorId, rol: 'principal' }],
          avances: [],
          publicaciones: [],
          evaluacionId: ev.id,
          evaluacionScore: ev.puntuacion,
          fechaEvaluacion: ev.fecha,
          propuestaOrigenId: propuestaId,
        }
        proyectos.value.push(nuevoProyecto)
        ev.proyectoId = nuevoProyecto.id
        propuestas.value[i].proyectoId = nuevoProyecto.id
      }
    }
    save()
    return ev
  }

  // USUARIOS
  function registrarUsuario(data) {
    const u = { id: uid(), ...data }
    usuarios.value.push(u)
    save()
    return u
  }

  function actualizarPerfil(id, data) {
    const i = usuarios.value.findIndex(u => u.id === id)
    if (i !== -1) {
      usuarios.value[i] = { ...usuarios.value[i], ...data }
      // actualizar sesion activa
      if (sesion.value && sesion.value.id === id) {
        sesion.value = { ...sesion.value, ...data }
        ls.set('sigproinv_sesion', sesion.value)
      }
      save()
    }
  }

  function cambiarEstadoProyecto(id, nuevoEstado) {
    const i = proyectos.value.findIndex(p => p.id === id)
    if (i !== -1) {
      proyectos.value[i].estado = nuevoEstado
      if (nuevoEstado === 'finalizado') proyectos.value[i].avance = 100
      save()
    }
  }

  // RESET (para demo)
  function resetDatos() {
    localStorage.removeItem('sigproinv_seeded')
    seedIfEmpty()
    usuarios.value = ls.get('sigproinv_usuarios')
    proyectos.value = ls.get('sigproinv_proyectos')
    propuestas.value = ls.get('sigproinv_propuestas')
    evaluaciones.value = ls.get('sigproinv_evaluaciones')
  }

  // ── DOCUMENTOS DE AVANCE ─────────────────────────────────
const documentos = ref(ls.get('sigproinv_documentos') || [])

function subirDocumento(proyectoId, descripcion, nombre, dataUrl) {
  var doc = {
    id: uid(),
    proyectoId: proyectoId,
    investigadorId: sesion.value.id,
    descripcion: descripcion,
    nombre: nombre,
    fecha: new Date().toISOString().slice(0, 10),
    dataUrl: dataUrl,
    retroalimentacion: ''
  }
  documentos.value.push(doc)
  ls.set('sigproinv_documentos', documentos.value)
}

function enviarRetroalimentacion(docId, texto) {
  var i = documentos.value.findIndex(d => d.id === docId)
  if (i !== -1) {
    documentos.value[i].retroalimentacion = texto
    ls.set('sigproinv_documentos', documentos.value)
  }
}

  return {
    sesion, usuarios, proyectos, propuestas, evaluaciones,
    misProyectos, misPropuestas, propuestasPendientes,
    estadoLabel, estadoColor,
    login, logout,
    getUsuario, getProyecto, getPropuesta, getEvaluacion,
    crearPropuesta, editarPropuesta, eliminarPropuesta,
    crearProyecto, editarProyecto, eliminarProyecto, registrarAvance,
    evaluarPropuesta, registrarUsuario, actualizarPerfil, cambiarEstadoProyecto, resetDatos, save, uid,
    documentos, subirDocumento, enviarRetroalimentacion,
  }
})
// This file has an appended patch - registrarUsuario is added via the store replacement below
