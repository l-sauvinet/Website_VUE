<template>
  <div class="section">
    <div v-if="loading" class="loading"><div class="spinner"></div></div>
    <div v-else class="profile-grid">

      <!-- Carte identité -->
      <div class="card full-width">
        <div class="card-avatar">{{ initials }}</div>
        <div class="card-identity">
          <h2>{{ profile.first_name }} {{ profile.last_name }}</h2>
          <span class="role-badge">Étudiant</span>
        </div>
      </div>

      <!-- Infos personnelles -->
      <div class="info-card">
        <div class="info-card-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          Informations personnelles
        </div>
        <div class="info-rows">
          <div class="info-row">
            <span class="info-label">Nom complet</span>
            <span class="info-value">{{ profile.first_name }} {{ profile.last_name }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Date de naissance</span>
            <span class="info-value">{{ formatDate(profile.birth_date) }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Email</span>
            <span class="info-value">{{ profile.email || '—' }}</span>
          </div>
        </div>
      </div>

      <!-- Infos scolaires -->
      <div class="info-card">
        <div class="info-card-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          Scolarité
        </div>
        <div class="info-rows">
          <div class="info-row">
            <span class="info-label">Établissement</span>
            <span class="info-value">{{ profile.establishment_name || '—' }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Classe</span>
            <span class="info-value">{{ profile.class_name || '—' }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Niveau</span>
            <span class="info-value">{{ profile.level || '—' }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Année scolaire</span>
            <span class="info-value">{{ profile.school_year || '—' }}</span>
          </div>
        </div>
      </div>

      <!-- Infos compte -->
      <div class="info-card">
        <div class="info-card-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          Compte
        </div>
        <div class="info-rows">
          <div class="info-row">
            <span class="info-label">Identifiant</span>
            <span class="info-value mono">{{ profile.login }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Compte créé le</span>
            <span class="info-value">{{ formatDate(profile.created_at) }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Statut</span>
            <span class="badge-active">Actif</span>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const loading = ref(true)
const profile = ref({})

const initials = computed(() => {
  const f = profile.value.first_name?.[0] || ''
  const l = profile.value.last_name?.[0] || ''
  return (f + l).toUpperCase()
})

function formatDate(dt) {
  if (!dt) return '—'
  return new Date(dt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
}

onMounted(async () => {
  try {
    const res = await fetch('/api/student/profile', { credentials: 'include' })
    if (res.ok) profile.value = await res.json()
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.section { padding: 28px 32px; }

.loading { display: flex; justify-content: center; padding: 60px; }
.spinner { width: 32px; height: 32px; border: 3px solid #e2e8f0; border-top-color: #263040; border-radius: 50%; animation: spin 0.7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.profile-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

/* Carte principale */
.card {
  background: #263040;
  border-radius: 14px;
  padding: 28px;
  display: flex;
  align-items: center;
  gap: 20px;
}

.full-width { grid-column: 1 / -1; }

.card-avatar {
  width: 64px; height: 64px;
  border-radius: 50%;
  background: rgba(255,255,255,0.15);
  display: flex; align-items: center; justify-content: center;
  color: #fff;
  font-size: 22px;
  font-weight: 700;
  flex-shrink: 0;
}

.card-identity h2 {
  color: #fff;
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 6px;
}

.role-badge {
  background: rgba(255,255,255,0.15);
  color: rgba(255,255,255,0.8);
  font-size: 11px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 20px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

/* Info cards */
.info-card {
  background: #fff;
  border-radius: 12px;
  padding: 22px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}

.info-card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #edf2f7;
}
.info-card-title svg { width: 16px; height: 16px; color: #263040; }

.info-rows { display: flex; flex-direction: column; gap: 12px; }

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.info-label {
  font-size: 12px;
  color: #a0aec0;
  font-weight: 500;
  flex-shrink: 0;
}

.info-value {
  font-size: 13px;
  color: #2d3748;
  font-weight: 600;
  text-align: right;
}

.info-value.mono {
  font-family: monospace;
  background: #f7fafc;
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 12px;
}

.badge-active {
  background: #f0fff4;
  color: #38a169;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 20px;
}
</style>
