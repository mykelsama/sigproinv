<template>
  <NavBar>
    <div class="main-content">
      <div class="page-header">
        <h1>Mi perfil</h1>
        <p>Gestiona tu información personal e institucional</p>
      </div>
      <div class="page-body">
        <div style="max-width:700px">

          <!-- Avatar + info -->
          <div class="card" style="margin-bottom:16px;display:flex;align-items:center;gap:20px;padding:24px">
            <div class="perfil-avatar">{{ iniciales }}</div>
            <div>
              <div style="font-size:18px;font-weight:700">{{ store.sesion?.nombre }}</div>
              <div style="font-size:13px;color:var(--text2);margin-top:2px">{{ store.sesion?.email }}</div>
              <span :class="['badge', rolBadge]" style="margin-top:8px">{{ rolLabel }}</span>
            </div>
          </div>

          <!-- Form editar -->
          <div class="card" style="margin-bottom:16px">
            <div class="section-title" style="margin-bottom:18px">Información personal</div>

            <div v-if="guardado" class="alert alert-success" style="margin-bottom:16px">✓ Perfil actualizado correctamente</div>
            <div v-if="errMsg" class="alert alert-danger" style="margin-bottom:16px">{{ errMsg }}</div>

            <div class="field">
              <label>Nombre completo *</label>
              <input v-model="form.nombre" placeholder="Tu nombre completo" :class="{ error: err.nombre }" />
              <div v-if="err.nombre" class="field-error">{{ err.nombre }}</div>
            </div>

            <div class="field">
              <label>Correo institucional</label>
              <input :value="form.email" disabled style="opacity:0.5;cursor:not-allowed" />
              <div style="font-size:11px;color:var(--text3);margin-top:4px">El correo no puede modificarse</div>
            </div>

            <div class="grid-2">
              <div class="field">
                <label>Facultad *</label>
                <select v-model="form.facultad" :class="{ error: err.facultad }">
                  <option value="">Seleccionar...</option>
                  <option>Facultad de Sistemas</option>
                  <option>Facultad de Ciencias</option>
                  <option>Ciencias Ambientales</option>
                  <option>Ciencias Sociales y Económicas</option>
                  <option>Facultad de Ingeniería</option>
                  <option>Facultad de Educación</option>
                  <option>Facultad de Derecho</option>
                  <option>Ciencias de la Salud</option>
                  <option>Dirección de Investigación</option>
                </select>
                <div v-if="err.facultad" class="field-error">{{ err.facultad }}</div>
              </div>
              <div class="field">
                <label>Área de especialización</label>
                <input v-model="form.area" placeholder="Ej. Inteligencia Artificial" />
              </div>
            </div>

            <div class="field">
              <label>ORCID</label>
              <input v-model="form.orcid" placeholder="0000-0000-0000-0000" />
            </div>

            <div style="display:flex;justify-content:flex-end;margin-top:4px">
              <button class="btn btn-primary" @click="guardar">Guardar cambios</button>
            </div>
          </div>

          <!-- Cambiar contraseña -->
          <div class="card">
            <div class="section-title" style="margin-bottom:18px">Cambiar contraseña</div>

            <div v-if="passGuardado" class="alert alert-success" style="margin-bottom:16px">✓ Contraseña actualizada</div>
            <div v-if="passErr" class="alert alert-danger" style="margin-bottom:16px">{{ passErr }}</div>

            <div class="field">
              <label>Contraseña actual *</label>
              <input v-model="pass.actual" type="password" placeholder="••••••••" />
            </div>
            <div class="grid-2">
              <div class="field">
                <label>Nueva contraseña *</label>
                <input v-model="pass.nueva" type="password" placeholder="Mínimo 6 caracteres" />
              </div>
              <div class="field">
                <label>Confirmar nueva contraseña *</label>
                <input v-model="pass.confirmar" type="password" placeholder="Repite la nueva contraseña" />
              </div>
            </div>
            <div style="display:flex;justify-content:flex-end">
              <button class="btn btn-secondary" @click="cambiarPass">Actualizar contraseña</button>
            </div>
          </div>

        </div>
      </div>
    </div>
  </NavBar>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue'
import NavBar from '@/components/NavBar.vue'
import { useStore } from '@/stores/useStore.js'

const store = useStore()
const guardado = ref(false)
const errMsg = ref('')
const passGuardado = ref(false)
const passErr = ref('')

const form = reactive({ nombre: '', email: '', facultad: '', area: '', orcid: '' })
const err = reactive({ nombre: '', facultad: '' })
const pass = reactive({ actual: '', nueva: '', confirmar: '' })

onMounted(() => {
  const u = store.sesion
  if (u) { form.nombre = u.nombre; form.email = u.email; form.facultad = u.facultad || ''; form.area = u.area || ''; form.orcid = u.orcid || '' }
})

const iniciales = computed(() => form.nombre?.split(' ').map(w => w[0]).slice(0, 2).join('') || '')
const rolLabel = computed(() => ({ director: 'Director', investigador: 'Investigador', comite: 'Comité Evaluador' }[store.sesion?.rol] || ''))
const rolBadge = computed(() => ({ director: 'badge-purple', investigador: 'badge-teal', comite: 'badge-amber' }[store.sesion?.rol] || 'badge-gray'))

function guardar() {
  err.nombre = ''; err.facultad = ''; errMsg.value = ''; guardado.value = false
  if (!form.nombre.trim()) { err.nombre = 'El nombre es requerido'; return }
  if (!form.facultad) { err.facultad = 'La facultad es requerida'; return }
  store.actualizarPerfil(store.sesion.id, { nombre: form.nombre, facultad: form.facultad, area: form.area, orcid: form.orcid })
  guardado.value = true
  setTimeout(() => guardado.value = false, 3000)
}

function cambiarPass() {
  passErr.value = ''; passGuardado.value = false
  if (!pass.actual) { passErr.value = 'Ingresa tu contraseña actual'; return }
  if (pass.actual !== store.sesion.password) { passErr.value = 'La contraseña actual es incorrecta'; return }
  if (!pass.nueva || pass.nueva.length < 6) { passErr.value = 'La nueva contraseña debe tener al menos 6 caracteres'; return }
  if (pass.nueva !== pass.confirmar) { passErr.value = 'Las contraseñas no coinciden'; return }
  store.actualizarPerfil(store.sesion.id, { password: pass.nueva })
  pass.actual = ''; pass.nueva = ''; pass.confirmar = ''
  passGuardado.value = true
  setTimeout(() => passGuardado.value = false, 3000)
}
</script>

<style scoped>
.perfil-avatar { width: 70px; height: 70px; border-radius: 50%; background: var(--purple-dim); border: 2px solid var(--purple); display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 700; color: var(--purple); flex-shrink: 0; }
</style>
