<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-header">
        <div class="login-logo">S</div>
        <h1>ULEAM — SigProInv</h1>
        <p>Sistema de gestión de proyectos de investigación</p>
      </div>

      <!-- Tabs -->
      <div class="login-tabs">
        <button :class="['ltab', { active: modo === 'login' }]" @click="modo='login'">Iniciar sesión</button>
        <button :class="['ltab', { active: modo === 'registro' }]" @click="modo='registro'">Registrarse</button>
      </div>

      <!-- LOGIN -->
      <form v-if="modo==='login'" @submit.prevent="handleLogin" class="login-form">
        <p class="subtitle">Ingresa tus credenciales institucionales</p>

        <div class="field">
          <label>Usuario</label>
          <input v-model="form.email" type="email" placeholder="usuario@uleam.edu.ec" :class="{ error: errors.email }" @input="errors.email=''" />
          <div v-if="errors.email" class="field-error">{{ errors.email }}</div>
        </div>

        <div class="field">
          <label>Contraseña</label>
          <div class="pass-wrap">
            <input v-model="form.password" :type="showPass ? 'text' : 'password'" placeholder="••••••••" :class="{ error: errors.password }" @input="errors.password=''" />
            <button type="button" class="pass-toggle" @click="showPass=!showPass">{{ showPass ? '🙈' : '👁' }}</button>
          </div>
          <div v-if="errors.password" class="field-error">{{ errors.password }}</div>
        </div>

        <div v-if="errors.general" class="alert alert-danger" style="margin-bottom:14px">{{ errors.general }}</div>

        <button type="submit" class="btn btn-primary" style="width:100%;justify-content:center;padding:11px">
          {{ loading ? 'Ingresando…' : 'Ingresar' }}
        </button>
      </form>

      <!-- REGISTRO -->
      <form v-if="modo==='registro'" @submit.prevent="handleRegistro" class="login-form">
        <p class="subtitle">Crea tu cuenta como investigador</p>

        <div class="field">
          <label>Nombre completo *</label>
          <input v-model="reg.nombre" placeholder="Ej. Mg. Juan Pérez" :class="{ error: rerr.nombre }" @input="rerr.nombre=''" />
          <div v-if="rerr.nombre" class="field-error">{{ rerr.nombre }}</div>
        </div>

        <div class="field">
          <label>Correo institucional *</label>
          <input v-model="reg.email" type="email" placeholder="usuario@uleam.edu.ec" :class="{ error: rerr.email }" @input="rerr.email=''" />
          <div v-if="rerr.email" class="field-error">{{ rerr.email }}</div>
        </div>

        <div class="field">
          <label>Facultad *</label>
          <select v-model="reg.facultad" :class="{ error: rerr.facultad }" @change="rerr.facultad=''">
            <option value="">Seleccionar...</option>
            <option>Facultad de Sistemas</option>
            <option>Facultad de Ciencias</option>
            <option>Ciencias Ambientales</option>
            <option>Ciencias Sociales y Económicas</option>
            <option>Facultad de Ingeniería</option>
            <option>Facultad de Educación</option>
            <option>Facultad de Derecho</option>
            <option>Ciencias de la Salud</option>
          </select>
          <div v-if="rerr.facultad" class="field-error">{{ rerr.facultad }}</div>
        </div>

        <div class="field">
          <label>Área de especialización</label>
          <input v-model="reg.area" placeholder="Ej. Inteligencia Artificial" />
        </div>

        <div class="field">
          <label>Contraseña *</label>
          <div class="pass-wrap">
            <input v-model="reg.password" :type="showPass ? 'text' : 'password'" placeholder="Mínimo 6 caracteres" :class="{ error: rerr.password }" @input="rerr.password=''" />
            <button type="button" class="pass-toggle" @click="showPass=!showPass">{{ showPass ? '🙈' : '👁' }}</button>
          </div>
          <div v-if="rerr.password" class="field-error">{{ rerr.password }}</div>
        </div>

        <div class="field">
          <label>Confirmar contraseña *</label>
          <input v-model="reg.confirm" :type="showPass ? 'text' : 'password'" placeholder="Repite la contraseña" :class="{ error: rerr.confirm }" @input="rerr.confirm=''" />
          <div v-if="rerr.confirm" class="field-error">{{ rerr.confirm }}</div>
        </div>

        <div v-if="rerr.general" class="alert alert-danger" style="margin-bottom:14px">{{ rerr.general }}</div>
        <div v-if="registroOk" class="alert alert-success" style="margin-bottom:14px">✓ Cuenta creada exitosamente. Ahora puedes iniciar sesión.</div>

        <button type="submit" class="btn btn-primary" style="width:100%;justify-content:center;padding:11px">
          Crear cuenta
        </button>
      </form>

      <p class="detect-note">El sistema detecta tu rol automáticamente y te redirige a tu panel</p>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from '@/stores/useStore.js'

const store = useStore()
const router = useRouter()
const loading = ref(false)
const showPass = ref(false)
const modo = ref('login')
const registroOk = ref(false)

const form = reactive({ email: '', password: '' })
const errors = reactive({ email: '', password: '', general: '' })

const reg = reactive({ nombre: '', email: '', facultad: '', area: '', password: '', confirm: '' })
const rerr = reactive({ nombre: '', email: '', facultad: '', password: '', confirm: '', general: '' })

function validateLogin() {
  let ok = true
  if (!form.email) { errors.email = 'El email es requerido'; ok = false }
  else if (!form.email.includes('@')) { errors.email = 'Email inválido'; ok = false }
  if (!form.password) { errors.password = 'La contraseña es requerida'; ok = false }
  return ok
}

async function handleLogin() {
  if (!validateLogin()) return
  loading.value = true
  await new Promise(r => setTimeout(r, 400))
  const ok = store.login(form.email, form.password)
  loading.value = false
  if (!ok) { errors.general = 'Credenciales incorrectas. Verifica tu email y contraseña.'; return }
  const dest = { director: '/director', investigador: '/investigador', comite: '/comite' }
  router.push(dest[store.sesion.rol])
}

function validateRegistro() {
  let ok = true
  if (!reg.nombre.trim()) { rerr.nombre = 'El nombre es requerido'; ok = false }
  if (!reg.email) { rerr.email = 'El email es requerido'; ok = false }
  else if (!reg.email.includes('@')) { rerr.email = 'Email inválido'; ok = false }
  else if (store.usuarios.find(u => u.email === reg.email)) { rerr.email = 'Este email ya está registrado'; ok = false }
  if (!reg.facultad) { rerr.facultad = 'Selecciona una facultad'; ok = false }
  if (!reg.password) { rerr.password = 'La contraseña es requerida'; ok = false }
  else if (reg.password.length < 6) { rerr.password = 'Mínimo 6 caracteres'; ok = false }
  if (!reg.confirm) { rerr.confirm = 'Confirma tu contraseña'; ok = false }
  else if (reg.confirm !== reg.password) { rerr.confirm = 'Las contraseñas no coinciden'; ok = false }
  return ok
}

function handleRegistro() {
  Object.keys(rerr).forEach(k => rerr[k] = '')
  registroOk.value = false
  if (!validateRegistro()) return
  store.registrarUsuario({
    nombre: reg.nombre,
    email: reg.email,
    password: reg.password,
    facultad: reg.facultad,
    area: reg.area,
    rol: 'investigador',
  })
  registroOk.value = true
  Object.keys(reg).forEach(k => reg[k] = '')
  setTimeout(() => { modo.value = 'login'; registroOk.value = false }, 2000)
}
</script>

<style scoped>
.login-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--bg); padding: 20px; }
.login-card { width: 100%; max-width: 400px; background: var(--bg2); border: 1px solid var(--border); border-radius: 14px; overflow: hidden; }
.login-header { background: var(--bg3); padding: 28px 28px 24px; text-align: center; border-bottom: 1px solid var(--border); }
.login-logo { width: 52px; height: 52px; background: var(--blue); border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 800; color: #fff; margin: 0 auto 14px; }
.login-header h1 { font-size: 16px; font-weight: 700; margin-bottom: 4px; }
.login-header p { font-size: 12px; color: var(--text2); }
.login-tabs { display: flex; border-bottom: 1px solid var(--border); }
.ltab { flex: 1; padding: 12px; font-size: 13px; font-weight: 600; color: var(--text3); background: transparent; border: none; cursor: pointer; transition: all 0.18s; border-bottom: 2px solid transparent; }
.ltab.active { color: var(--blue); border-bottom-color: var(--blue); background: var(--blue-dim); }
.login-form { padding: 24px 28px 0; }
.subtitle { font-size: 13px; color: var(--text2); margin-bottom: 20px; }
.pass-wrap { position: relative; }
.pass-wrap input { padding-right: 40px; }
.pass-toggle { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; font-size: 16px; color: var(--text2); padding: 0; }
.detect-note { text-align: center; font-size: 11px; color: var(--text3); padding: 14px 28px; border-top: 1px solid var(--border); margin-top: 16px; }
</style>
