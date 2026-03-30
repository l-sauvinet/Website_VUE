<template>
  <div class="layout">

    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="sidebar-logo">
        <img :src="logoApp" alt="Logo" />
        <span>Classyn</span>
      </div>

      <nav class="sidebar-nav">
        <a
          v-for="item in navItems"
          :key="item.key"
          class="nav-item"
          :class="{ active: activeSection === item.key }"
          @click="activeSection = item.key"
        >
          <span class="nav-icon" v-html="item.icon"></span>
          <span>{{ item.label }}</span>
          <span v-if="item.badge" class="nav-badge">{{ item.badge }}</span>
        </a>
      </nav>

      <div class="sidebar-footer">
        <div class="user-info">
          <div class="user-avatar">{{ initials }}</div>
          <div class="user-details">
            <span class="user-name">{{ user.firstName }} {{ user.lastName }}</span>
            <span class="user-role">Étudiant</span>
          </div>
        </div>
        <button class="btn-logout" @click="logout" title="Se déconnecter">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        </button>
      </div>
    </aside>

    <!-- Main -->
    <main class="main">
      <header class="main-header">
        <div>
          <h1>{{ sectionMeta[activeSection].title }}</h1>
          <p>{{ today }}</p>
        </div>
      </header>

      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
      </div>

      <!-- Tableau de bord -->
      <div v-else-if="activeSection === 'dashboard'" class="content">

        <!-- Bannière classe -->
        <div class="class-banner">
          <div class="class-banner-left">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            <div>
              <span class="class-name">{{ data.student.className || '—' }}</span>
              <span class="class-sub">{{ data.student.level }} · {{ data.student.schoolYear }}</span>
            </div>
          </div>
        </div>

        <!-- Cartes absences -->
        <div class="section-title">Mes absences</div>
        <div class="cards-grid">
          <div class="card" @click="activeSection = 'absences'">
            <div class="card-icon bg-red">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <div class="card-body">
              <span class="card-value">{{ data.absences.total }}</span>
              <span class="card-label">Total absences</span>
            </div>
          </div>

          <div class="card" @click="activeSection = 'absences'">
            <div class="card-icon bg-green">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <div class="card-body">
              <span class="card-value">{{ data.absences.justified }}</span>
              <span class="card-label">Justifiées</span>
            </div>
          </div>

          <div class="card" @click="activeSection = 'absences'">
            <div class="card-icon bg-orange">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <div class="card-body">
              <span class="card-value">{{ data.absences.unjustified }}</span>
              <span class="card-label">Non justifiées</span>
            </div>
          </div>

          <div class="card" @click="activeSection = 'absences'">
            <div class="card-icon bg-blue">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <div class="card-body">
              <span class="card-value">{{ data.absences.lates }}</span>
              <span class="card-label">Retards</span>
            </div>
          </div>
        </div>

        <!-- Cartes score & classement -->
        <div class="section-title">Mon score</div>
        <div class="cards-grid">
          <div class="card">
            <div class="card-icon bg-purple">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            </div>
            <div class="card-body">
              <span class="card-value">{{ data.score.totalPoints ?? '—' }}</span>
              <span class="card-label">Points de pénalité</span>
            </div>
          </div>

          <div class="card">
            <div class="card-icon bg-teal">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="20" x2="18" y2="10"/>
                <line x1="12" y1="20" x2="12" y2="4"/>
                <line x1="6" y1="20" x2="6" y2="14"/>
              </svg>
            </div>
            <div class="card-body">
              <span class="card-value">{{ data.score.classRank != null ? '#' + data.score.classRank : '—' }}</span>
              <span class="card-label">Rang dans la classe</span>
            </div>
          </div>

          <div class="card">
            <div class="card-icon bg-indigo">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="8" r="6"/>
                <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
              </svg>
            </div>
            <div class="card-body">
              <span class="card-value">{{ data.score.establishmentRank != null ? '#' + data.score.establishmentRank : '—' }}</span>
              <span class="card-label">Rang établissement</span>
            </div>
          </div>

        </div>

      </div>

      <!-- Autres sections -->
      <AbsencesSection      v-else-if="activeSection === 'absences'" />
      <ProfileSection       v-else-if="activeSection === 'profil'" />

    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import logoApp from '@/assets/logo-app.svg'
import AbsencesSection from '@/sections/AbsencesSection.vue'
import ProfileSection from '@/sections/ProfileSection.vue'

const props = defineProps({ user: Object })
const emit = defineEmits(['logged-out'])

const activeSection = ref('dashboard')
const loading = ref(true)
const data = ref({
  student: { firstName: '', lastName: '', email: '', className: '', level: '', schoolYear: '' },
  absences: { total: 0, justified: 0, unjustified: 0, lates: 0 },
  score: { totalPoints: 0, classRank: null, establishmentRank: null },
  coursesToday: 0
})

const initials = computed(() => {
  const f = props.user.firstName?.[0] || ''
  const l = props.user.lastName?.[0] || ''
  return (f + l).toUpperCase()
})

const today = computed(() => new Date().toLocaleDateString('fr-FR', {
  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
}))

const navItems = computed(() => [
  {
    key: 'dashboard',
    label: 'Tableau de bord',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>'
  },
  {
    key: 'absences',
    label: 'Mes absences',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
    badge: data.value.absences.unjustified || null
  },
  {
    key: 'profil',
    label: 'Mon profil',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>'
  },
])

const sectionMeta = {
  dashboard:     { title: 'Tableau de bord', icon: '' },
  absences:      { title: 'Mes absences',     icon: '<svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#d1d5db" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>' },
  profil:        { title: 'Mon profil',        icon: '<svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#d1d5db" stroke-width="1.5"><circle cx="12" cy="7" r="4"/><path d="M4 20v-2a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v2"/></svg>' },
}

onMounted(async () => {
  try {
    const res = await fetch('/api/student/stats', { credentials: 'include' })
    if (res.ok) data.value = await res.json()
  } finally {
    loading.value = false
  }
})

async function logout() {
  await fetch('/api/logout', { method: 'POST', credentials: 'include' })
  emit('logged-out')
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap');

.layout {
  font-family: 'Montserrat', sans-serif;
  display: flex;
  min-height: 100vh;
  background: #f0f2f5;
}

/* ── Sidebar ── */
.sidebar {
  width: 240px;
  min-width: 240px;
  background: #263040;
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0; left: 0; bottom: 0;
}

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 24px 20px;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}

.sidebar-logo img {
  width: 34px;
  height: 34px;
  background: rgba(255,255,255,0.1);
  border-radius: 8px;
  padding: 4px;
}

.sidebar-logo span {
  color: #fff;
  font-size: 14px;
  font-weight: 700;
}

.sidebar-nav {
  flex: 1;
  padding: 12px 10px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  color: rgba(255,255,255,0.6);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  user-select: none;
}

.nav-item:hover { background: rgba(255,255,255,0.07); color: rgba(255,255,255,0.9); }
.nav-item.active { background: rgba(255,255,255,0.12); color: #fff; }

.nav-icon { width: 17px; height: 17px; flex-shrink: 0; display: flex; align-items: center; }
.nav-icon :deep(svg) { width: 17px; height: 17px; }

.nav-badge {
  margin-left: auto;
  background: #e53e3e;
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  border-radius: 10px;
  padding: 1px 6px;
  min-width: 18px;
  text-align: center;
}

.sidebar-footer {
  padding: 14px 12px;
  border-top: 1px solid rgba(255,255,255,0.08);
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-info { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0; }

.user-avatar {
  width: 34px; height: 34px; min-width: 34px;
  background: rgba(255,255,255,0.15);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  color: #fff; font-size: 12px; font-weight: 700;
}

.user-details { display: flex; flex-direction: column; min-width: 0; }
.user-name { color: #fff; font-size: 12px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.user-role { color: rgba(255,255,255,0.45); font-size: 11px; }

.btn-logout {
  background: none; border: none; cursor: pointer;
  color: rgba(255,255,255,0.45); padding: 6px; border-radius: 6px;
  display: flex; transition: color 0.15s, background 0.15s; flex-shrink: 0;
}
.btn-logout:hover { color: #fff; background: rgba(255,255,255,0.08); }
.btn-logout svg { width: 16px; height: 16px; }

/* ── Main ── */
.main { flex: 1; margin-left: 240px; display: flex; flex-direction: column; min-height: 100vh; }

.main-header {
  background: #fff;
  padding: 20px 32px;
  display: flex; align-items: center; justify-content: space-between;
  border-bottom: 1px solid #e8eaed;
  position: sticky; top: 0; z-index: 10;
}

.main-header h1 { font-size: 18px; font-weight: 700; color: #1a202c; }
.main-header p { font-size: 12px; color: #718096; margin-top: 2px; text-transform: capitalize; }

.header-notif {
  position: relative; cursor: pointer; color: #718096;
  padding: 8px; border-radius: 8px; background: none; border: none;
  transition: background 0.15s;
}
.header-notif:hover { background: #f0f2f5; }
.header-notif svg { width: 20px; height: 20px; }

.notif-dot {
  position: absolute; top: 4px; right: 4px;
  background: #e53e3e; color: #fff;
  font-size: 9px; font-weight: 700; border-radius: 10px;
  padding: 0 4px; min-width: 16px; text-align: center;
  line-height: 16px; height: 16px;
}

/* ── Content ── */
.content { padding: 28px 32px; }

.loading-state { flex: 1; display: flex; align-items: center; justify-content: center; padding: 80px; }
.spinner { width: 36px; height: 36px; border: 3px solid #e2e8f0; border-top-color: #263040; border-radius: 50%; animation: spin 0.7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Bannière classe ── */
.class-banner {
  background: #263040;
  border-radius: 12px;
  padding: 20px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 28px;
  color: #fff;
}

.class-banner-left { display: flex; align-items: center; gap: 14px; }
.class-banner-left svg { width: 28px; height: 28px; opacity: 0.7; flex-shrink: 0; }

.class-name { display: block; font-size: 18px; font-weight: 700; }
.class-sub { font-size: 12px; color: rgba(255,255,255,0.55); margin-top: 2px; display: block; }

.courses-today { font-size: 13px; color: rgba(255,255,255,0.75); }
.courses-today strong { font-size: 22px; font-weight: 700; color: #fff; display: block; text-align: right; }

/* ── Section title ── */
.section-title {
  font-size: 12px;
  font-weight: 700;
  color: #a0aec0;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 12px;
}

/* ── Cards ── */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
  gap: 14px;
  margin-bottom: 28px;
}

.card {
  background: #fff;
  border-radius: 12px;
  padding: 18px 20px;
  display: flex;
  align-items: center;
  gap: 14px;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}

.card:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.1); }

.card-icon {
  width: 44px; height: 44px; min-width: 44px;
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
}
.card-icon svg { width: 20px; height: 20px; }

.card-body { display: flex; flex-direction: column; gap: 2px; }
.card-value { font-size: 26px; font-weight: 700; color: #1a202c; line-height: 1; }
.card-label { font-size: 12px; color: #718096; font-weight: 500; }

.bg-red    { background: #fff5f5; color: #e53e3e; }
.bg-green  { background: #f0fff4; color: #38a169; }
.bg-orange { background: #fffaf0; color: #dd6b20; }
.bg-blue   { background: #ebf8ff; color: #3182ce; }
.bg-purple { background: #faf5ff; color: #805ad5; }
.bg-teal   { background: #e6fffa; color: #2c7a7b; }
.bg-indigo { background: #ebf4ff; color: #4c51bf; }
.bg-pink   { background: #fff5f7; color: #d53f8c; }

/* ── Placeholder ── */
.placeholder { flex: 1; display: flex; align-items: center; justify-content: center; }
.placeholder-box { text-align: center; display: flex; flex-direction: column; align-items: center; gap: 12px; }
.placeholder-box h2 { font-size: 18px; color: #2d3748; font-weight: 600; }
.placeholder-box p { font-size: 13px; color: #a0aec0; }
</style>
