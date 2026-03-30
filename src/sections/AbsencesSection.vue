<template>
  <div class="section">

    <!-- Filtres -->
    <div class="filters">
      <button
        v-for="f in filters"
        :key="f.key"
        class="filter-btn"
        :class="{ active: activeFilter === f.key }"
        @click="activeFilter = f.key"
      >
        {{ f.label }}
        <span class="filter-count">{{ counts[f.key] }}</span>
      </button>
    </div>

    <!-- Chargement -->
    <div v-if="loading" class="loading"><div class="spinner"></div></div>

    <!-- Vide -->
    <div v-else-if="filtered.length === 0" class="empty">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      <p>Aucune absence dans cette catégorie</p>
    </div>

    <!-- Table -->
    <div v-else class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Matière</th>
            <th>Professeur</th>
            <th>Type</th>
            <th>Statut</th>
            <th>Motif</th>
            <th>Points</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in filtered" :key="row.id">
            <td class="td-date">
              <span class="date-main">{{ formatDate(row.start_datetime || row.recorded_at) }}</span>
              <span class="date-sub">{{ formatTime(row.start_datetime) }}{{ row.end_datetime ? ' – ' + formatTime(row.end_datetime) : '' }}</span>
            </td>
            <td><span class="subject-tag">{{ row.subject_name || '—' }}</span></td>
            <td class="td-teacher">{{ row.teacher_first ? row.teacher_first + ' ' + row.teacher_last : '—' }}</td>
            <td>
              <span class="badge" :class="row.is_late ? 'badge-late' : 'badge-absent'">
                {{ row.is_late ? 'Retard' : 'Absence' }}
              </span>
            </td>
            <td>
              <span class="badge" :class="row.is_justified ? 'badge-ok' : 'badge-ko'">
                {{ row.is_justified ? 'Justifiée' : 'Non justifiée' }}
              </span>
            </td>
            <td class="td-reason">{{ row.reason || '—' }}</td>
            <td class="td-points">
              <span v-if="row.penalty_points" class="points">-{{ row.penalty_points }}</span>
              <span v-else class="no-points">0</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const loading = ref(true)
const absences = ref([])
const activeFilter = ref('all')

const filters = [
  { key: 'all',         label: 'Toutes' },
  { key: 'unjustified', label: 'Non justifiées' },
  { key: 'justified',   label: 'Justifiées' },
  { key: 'late',        label: 'Retards' },
]

const counts = computed(() => ({
  all:         absences.value.length,
  unjustified: absences.value.filter(a => !a.is_justified && !a.is_late).length,
  justified:   absences.value.filter(a => a.is_justified).length,
  late:        absences.value.filter(a => a.is_late).length,
}))

const filtered = computed(() => {
  if (activeFilter.value === 'all')         return absences.value
  if (activeFilter.value === 'unjustified') return absences.value.filter(a => !a.is_justified && !a.is_late)
  if (activeFilter.value === 'justified')   return absences.value.filter(a => a.is_justified)
  if (activeFilter.value === 'late')        return absences.value.filter(a => a.is_late)
  return absences.value
})

function formatDate(dt) {
  if (!dt) return '—'
  return new Date(dt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}
function formatTime(dt) {
  if (!dt) return ''
  return new Date(dt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

onMounted(async () => {
  try {
    const res = await fetch('/api/student/absences', { credentials: 'include' })
    if (res.ok) absences.value = await res.json()
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.section { padding: 28px 32px; }

.filters {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: 8px;
  border: 1.5px solid #e2e8f0;
  background: #fff;
  font-family: 'Montserrat', sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: #4a5568;
  cursor: pointer;
  transition: all 0.15s;
}
.filter-btn:hover { border-color: #263040; color: #263040; }
.filter-btn.active { background: #263040; border-color: #263040; color: #fff; }

.filter-count {
  background: rgba(0,0,0,0.1);
  border-radius: 10px;
  padding: 0 6px;
  font-size: 11px;
  font-weight: 700;
}
.filter-btn.active .filter-count { background: rgba(255,255,255,0.2); }

.loading { display: flex; justify-content: center; padding: 60px; }
.spinner { width: 32px; height: 32px; border: 3px solid #e2e8f0; border-top-color: #263040; border-radius: 50%; animation: spin 0.7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.empty {
  text-align: center;
  padding: 60px;
  color: #a0aec0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}
.empty svg { width: 40px; height: 40px; }
.empty p { font-size: 14px; }

.table-wrap {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  overflow: hidden;
}

table { width: 100%; border-collapse: collapse; }

thead tr { background: #f8fafc; }
th {
  padding: 12px 16px;
  text-align: left;
  font-size: 11px;
  font-weight: 700;
  color: #a0aec0;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  border-bottom: 1px solid #edf2f7;
}

tbody tr { transition: background 0.1s; }
tbody tr:hover { background: #f8fafc; }
tbody tr:not(:last-child) { border-bottom: 1px solid #edf2f7; }

td { padding: 13px 16px; font-size: 13px; color: #2d3748; vertical-align: middle; }

.td-date { min-width: 120px; }
.date-main { display: block; font-weight: 600; font-size: 13px; }
.date-sub { display: block; font-size: 11px; color: #a0aec0; margin-top: 2px; }

.subject-tag {
  background: #edf2f7;
  color: #4a5568;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.td-teacher { color: #4a5568; }
.td-reason { color: #718096; font-style: italic; max-width: 160px; }

.badge {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
}
.badge-absent  { background: #fff5f5; color: #e53e3e; }
.badge-late    { background: #fffaf0; color: #dd6b20; }
.badge-ok      { background: #f0fff4; color: #38a169; }
.badge-ko      { background: #fff5f5; color: #e53e3e; }

.points { color: #e53e3e; font-weight: 700; font-size: 13px; }
.no-points { color: #a0aec0; }
</style>
