<template>
  <div class="login-wrapper">
    <div class="login-card">
      <!-- Logo -->
      <div class="logo-container">
        <div class="logo-icon">
          <img :src="logoApp" alt="Logo" />
        </div>
        <p class="login-subtitle">Connectez-vous</p>
      </div>

      <!-- Form -->
      <div class="form-group">
        <label for="identifiant">Identifiant</label>
        <input
          id="identifiant"
          v-model="form.identifiant"
          type="text"
          placeholder="Entrez votre identifiant"
          :class="{ 'input-error': errors.identifiant }"
          @keyup.enter="handleSubmit"
        />
        <span v-if="errors.identifiant" class="error-msg">{{ errors.identifiant }}</span>
      </div>

      <div class="form-group">
        <label for="password">Mot de passe</label>
        <div class="input-wrapper">
          <input
            id="password"
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="Entrez votre mot de passe"
            :class="{ 'input-error': errors.password }"
            @keyup.enter="handleSubmit"
          />
          <button class="toggle-password" @click="showPassword = !showPassword" type="button">
            <svg v-if="!showPassword" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
              <line x1="1" y1="1" x2="23" y2="23"/>
            </svg>
          </button>
        </div>
        <span v-if="errors.password" class="error-msg">{{ errors.password }}</span>
      </div>

      <button
        class="btn-login"
        :class="{ loading: isLoading }"
        @click="handleSubmit"
        :disabled="isLoading"
      >
        <span v-if="!isLoading">Se connecter</span>
        <span v-else class="loader"></span>
      </button>

      <p v-if="loginError" class="global-error">{{ loginError }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import logoApp from '@/assets/logo-app.svg'

const form = reactive({
  identifiant: '',
  password: ''
})

const errors = reactive({
  identifiant: '',
  password: ''
})

const showPassword = ref(false)
const isLoading = ref(false)
const loginError = ref('')

function validate() {
  errors.identifiant = ''
  errors.password = ''
  let valid = true

  if (!form.identifiant.trim()) {
    errors.identifiant = 'Ce champ est requis.'
    valid = false
  }

  if (!form.password.trim()) {
    errors.password = 'Ce champ est requis.'
    valid = false
  }

  return valid
}

const emit = defineEmits(['logged-in'])

async function handleSubmit() {
  loginError.value = ''
  if (!validate()) return

  isLoading.value = true

  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ identifiant: form.identifiant, password: form.password })
    })

    const data = await res.json()

    if (!res.ok) {
      loginError.value = data.message || 'Erreur de connexion.'
    } else {
      emit('logged-in', data.user)
    }
  } catch {
    loginError.value = 'Impossible de contacter le serveur.'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap');

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.login-wrapper {
  font-family: 'Montserrat', sans-serif;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #263040;
}

.login-card {
  background: #f4f5f7;
  border-radius: 16px;
  padding: 56px 60px;
  width: 500px;
  height: 600px;
  max-width: 95vw;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  gap: 22px;
  justify-content: center;
}

/* Logo */
.logo-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.logo-icon {
  width: 72px;
  height: 72px;
  background-color: #263040;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
}

.logo-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.login-subtitle {
  font-size: 15px;
  color: #4a5568;
  font-weight: 500;
  letter-spacing: 0.01em;
}

/* Form */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

label {
  font-size: 13px;
  font-weight: 600;
  color: #2d3748;
  letter-spacing: 0.02em;
}

input {
  font-family: 'Montserrat', sans-serif;
  font-size: 14px;
  background: #eaecf0;
  border: 1.5px solid transparent;
  border-radius: 8px;
  padding: 12px 14px;
  color: #1a202c;
  transition: border-color 0.2s, background 0.2s;
  outline: none;
  width: 100%;
}

input::placeholder {
  color: #a0aec0;
}

input:focus {
  border-color: #263040;
  background: #fff;
}

input.input-error {
  border-color: #e53e3e;
}

.input-wrapper {
  position: relative;
}

.input-wrapper input {
  padding-right: 42px;
}

.toggle-password {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  color: #718096;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.toggle-password:hover {
  color: #263040;
}

.toggle-password svg {
  width: 17px;
  height: 17px;
}

.error-msg {
  font-size: 12px;
  color: #e53e3e;
  font-weight: 500;
}

.global-error {
  font-size: 13px;
  color: #e53e3e;
  text-align: center;
  background: #fff5f5;
  border: 1px solid #fed7d7;
  border-radius: 8px;
  padding: 10px 12px;
  font-weight: 500;
}

/* Button */
.btn-login {
  font-family: 'Montserrat', sans-serif;
  margin-top: 4px;
  background-color: #263040;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 14px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  letter-spacing: 0.02em;
  transition: background 0.2s, transform 0.1s;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
}

.btn-login:hover:not(:disabled) {
  background-color: #1a2334;
}

.btn-login:active:not(:disabled) {
  transform: scale(0.98);
}

.btn-login:disabled {
  cursor: not-allowed;
  opacity: 0.8;
}

/* Loader */
.loader {
  width: 18px;
  height: 18px;
  border: 2.5px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  display: inline-block;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>