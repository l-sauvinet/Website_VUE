<template>
  <div class="section">

    <!-- Navigation semaine -->
    <div class="week-nav">
      <button class="nav-btn" @click="changeWeek(-1)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <span class="week-label">{{ weekLabel }}</span>
      <button class="nav-btn" @click="changeWeek(1)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
      </button>
      <button v-if="weekOffset !== 0" class="today-btn" @click="weekOffset = 0; load()">Aujourd'hui</button>
    </div>

    <div v-if="loading" class="loading"><div class="spinner"></div></div>

    <div v-else-if="days.length === 0" class="empty">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
      <p>Aucun cours cette semaine</p>
    </div>

    <div v-else class="days-grid">
      <div v-for="day in days" :key="day.label" class="day-col">
        <div class="day-header" :class="{ today: day.isToday }">
          <span class="day-name">{{ day.name }}</span>
          <span class="day-date">{{ day.label }}</span>
        </div>
        <div class="courses-list">
          <div
            v-for="course in day.courses"
            :key="course.id"
            class="course-card"
            :class="'status-' + course.status"
          >
            <div class="course-time">{{ formatTime(course.start_datetime) }} – {{ formatTime(course.end_datetime) }}</div>
            <div class="course-subject">{{ course.subject_name }}</div>
            <div class="course-meta">
              <span>{{ course.teacher_first }} {{ course.teacher_last }}</span>
              <span v-if="course.room_name" class="course-room">{{ course.room_name }}</span>
            </div>
            <span v-if="course.status === 'cancelled'" class="course-badge cancelled">Annulé</span>
          </div>
          <div v-if="day.courses.length === 0" class="no-course">Pas de cours</div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const loading = ref(true)
const weekOffset = ref(0)
const courses = ref([])

const DAYS_FR = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi']

function getMondayOf(offset) {
  const d = new Date()
  const day = d.getDay() || 7
  d.setDate(d.getDate() - day + 1 + offset * 7)
  d.setHours(0, 0, 0, 0)
  return d
}

const weekLabel = computed(() => {
  const monday = getMondayOf(weekOffset.value)
  const friday = new Date(monday); friday.setDate(monday.getDate() + 4)
  const opts = { day: '2-digit', month: 'short' }
  return monday.toLocaleDateString('fr-FR', opts) + ' – ' + friday.toLocaleDateString('fr-FR', opts)
})

const days = computed(() => {
  const monday = getMondayOf(weekOffset.value)
  const today = new Date(); today.setHours(0,0,0,0)

  return DAYS_FR.map((name, i) => {
    const date = new Date(monday); date.setDate(monday.getDate() + i)
    const label = date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
    const isToday = date.getTime() === today.getTime()
    const dayCourses = courses.value.filter(c => {
      const cd = new Date(c.start_datetime); cd.setHours(0,0,0,0)
      return cd.getTime() === date.getTime()
    })
    return { name, label, isToday, courses: dayCourses }
  })
})

function formatTime(dt) {
  if (!dt) return ''
  return new Date(dt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

async function load() {
  loading.value = true
  try {
    const res = await fetch(`/api/student/schedule?week=${weekOffset.value}`, { credentials: 'include' })
    if (res.ok) courses.value = await res.json()
  } finally {
    loading.value = false
  }
}

function changeWeek(dir) {
  weekOffset.value += dir
  load()
}

onMounted(load)
</script>

<style scoped>
.section { padding: 28px 32px; }

.week-nav {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

.nav-btn {
  width: 34px; height: 34px;
  border-radius: 8px;
  border: 1.5px solid #e2e8f0;
  background: #fff;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  color: #4a5568;
  transition: all 0.15s;
}
.nav-btn:hover { border-color: #263040; color: #263040; }
.nav-btn svg { width: 16px; height: 16px; }

.week-label { font-size: 15px; font-weight: 600; color: #1a202c; }

.today-btn {
  margin-left: 4px;
  padding: 6px 14px;
  border-radius: 8px;
  border: 1.5px solid #263040;
  background: #fff;
  color: #263040;
  font-family: 'Montserrat', sans-serif;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}
.today-btn:hover { background: #263040; color: #fff; }

.loading { display: flex; justify-content: center; padding: 60px; }
.spinner { width: 32px; height: 32px; border: 3px solid #e2e8f0; border-top-color: #263040; border-radius: 50%; animation: spin 0.7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.empty {
  text-align: center; padding: 60px; color: #a0aec0;
  display: flex; flex-direction: column; align-items: center; gap: 12px;
}
.empty svg { width: 40px; height: 40px; }
.empty p { font-size: 14px; }

.days-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
}

.day-col { display: flex; flex-direction: column; gap: 8px; }

.day-header {
  text-align: center;
  padding: 8px;
  border-radius: 8px;
  background: #fff;
  border: 1.5px solid #e2e8f0;
}
.day-header.today { background: #263040; border-color: #263040; }
.day-header.today .day-name,
.day-header.today .day-date { color: #fff; }

.day-name { display: block; font-size: 12px; font-weight: 700; color: #4a5568; text-transform: uppercase; letter-spacing: 0.05em; }
.day-date { display: block; font-size: 12px; color: #718096; margin-top: 2px; }

.courses-list { display: flex; flex-direction: column; gap: 8px; }

.course-card {
  background: #fff;
  border-radius: 10px;
  padding: 12px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  border-left: 3px solid #263040;
  position: relative;
}

.status-cancelled { border-left-color: #e53e3e; opacity: 0.7; }

.course-time { font-size: 11px; font-weight: 700; color: #718096; margin-bottom: 4px; }
.course-subject { font-size: 13px; font-weight: 700; color: #1a202c; margin-bottom: 4px; }
.course-meta { font-size: 11px; color: #a0aec0; display: flex; flex-direction: column; gap: 2px; }
.course-room { color: #718096; }

.course-badge {
  position: absolute; top: 8px; right: 8px;
  font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px;
}
.cancelled { background: #fff5f5; color: #e53e3e; }

.no-course {
  text-align: center;
  font-size: 12px;
  color: #cbd5e0;
  padding: 16px 8px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1.5px dashed #e2e8f0;
}
</style>
