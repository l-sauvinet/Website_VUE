<template>
  <div v-if="checking" class="app-loading">
    <div class="app-spinner"></div>
  </div>
  <LoginView v-else-if="!currentUser" @logged-in="onLogin" />
  <DashboardView v-else :user="currentUser" @logged-out="onLogout" />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import LoginView from './views/LoginView.vue'
import DashboardView from './views/DashboardView.vue'

const currentUser = ref(null)
const checking = ref(true)

onMounted(async () => {
  try {
    const res = await fetch('/api/me', { credentials: 'include' })
    if (res.ok) {
      const data = await res.json()
      currentUser.value = data.user
    }
  } finally {
    checking.value = false
  }
})

function onLogin(user) {
  currentUser.value = user
}

function onLogout() {
  currentUser.value = null
}
</script>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.app-loading {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #263040;
}

.app-spinner {
  width: 36px;
  height: 36px;
  border: 3px solid rgba(255,255,255,0.2);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }
</style>
