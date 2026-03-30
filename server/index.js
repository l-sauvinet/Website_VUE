const express = require('express')
const mysql = require('mysql2/promise')
const session = require('express-session')
const cors = require('cors')

// Charge le .env depuis la racine du projet (un niveau au-dessus de server/)
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') })

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}))
app.use(session({
  secret: process.env.SESSION_SECRET || 'changeme',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, httpOnly: true, sameSite: 'lax' }
}))

const db = mysql.createPool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT) || 3306,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  waitForConnections: true,
  connectionLimit: 10
})

// Test de connexion au démarrage
db.getConnection()
  .then(conn => {
    console.log('✓ Connexion MySQL établie')
    conn.release()
  })
  .catch(err => {
    console.error('✗ Connexion MySQL échouée:', err.message)
  })

// POST /api/login
app.post('/api/login', async (req, res) => {
  const { identifiant, password } = req.body
  if (!identifiant || !password) {
    return res.status(400).json({ message: 'Champs manquants.' })
  }

  try {
    const [rows] = await db.execute(
      'SELECT * FROM user WHERE login = ? AND password = ? AND is_active = 1 LIMIT 1',
      [identifiant, password]
    )

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Identifiant ou mot de passe incorrect.' })
    }

    const user = rows[0]

    // Vérifie que l'utilisateur est bien un étudiant
    const [students] = await db.execute(
      'SELECT id FROM student WHERE user_id = ? LIMIT 1',
      [user.id]
    )
    if (students.length === 0) {
      return res.status(403).json({ message: 'Accès réservé aux étudiants.' })
    }

    req.session.user = { id: user.id, login: user.login, firstName: user.first_name, lastName: user.last_name, roleId: user.role_id }

    res.json({ success: true, user: req.session.user })
  } catch (err) {
    console.error('Erreur DB:', err.message)
    res.status(500).json({ message: 'Erreur serveur. Détails : ' + err.message })
  }
})

// GET /api/student/absences
app.get('/api/student/absences', async (req, res) => {
  if (!req.session.user) return res.status(401).json({ message: 'Non connecté.' })
  try {
    const [students] = await db.execute('SELECT id FROM student WHERE user_id = ? LIMIT 1', [req.session.user.id])
    if (!students.length) return res.status(404).json({ message: 'Étudiant introuvable.' })
    const studentId = students[0].id
    const [rows] = await db.execute(`
      SELECT a.id, a.is_justified, a.reason, a.recorded_at, a.penalty_points, a.is_late,
             sub.name AS subject_name,
             t.first_name AS teacher_first, t.last_name AS teacher_last,
             c.start_datetime, c.end_datetime
      FROM absence a
      LEFT JOIN course c ON a.course_id = c.id
      LEFT JOIN subject sub ON c.subject_id = sub.id
      LEFT JOIN teacher t ON c.teacher_id = t.id
      WHERE a.student_id = ?
      ORDER BY a.recorded_at DESC
    `, [studentId])
    res.json(rows)
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// GET /api/student/schedule
app.get('/api/student/schedule', async (req, res) => {
  if (!req.session.user) return res.status(401).json({ message: 'Non connecté.' })
  try {
    const [students] = await db.execute('SELECT class_id FROM student WHERE user_id = ? LIMIT 1', [req.session.user.id])
    if (!students.length) return res.status(404).json({ message: 'Étudiant introuvable.' })
    const classId = students[0].class_id
    const weekOffset = parseInt(req.query.week) || 0
    const [rows] = await db.execute(`
      SELECT c.id, c.start_datetime, c.end_datetime, c.status,
             sub.name AS subject_name, sub.code AS subject_code,
             t.first_name AS teacher_first, t.last_name AS teacher_last,
             r.name AS room_name
      FROM course c
      LEFT JOIN subject sub ON c.subject_id = sub.id
      LEFT JOIN teacher t ON c.teacher_id = t.id
      LEFT JOIN room r ON c.room_id = r.id
      WHERE c.class_id = ?
        AND c.start_datetime >= DATE_ADD(DATE_FORMAT(NOW() - INTERVAL WEEKDAY(NOW()) DAY, '%Y-%m-%d'), INTERVAL ? WEEK)
        AND c.start_datetime <  DATE_ADD(DATE_FORMAT(NOW() - INTERVAL WEEKDAY(NOW()) DAY, '%Y-%m-%d'), INTERVAL (? + 1) WEEK)
      ORDER BY c.start_datetime ASC
    `, [classId, weekOffset, weekOffset])
    res.json(rows)
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// GET /api/student/notifications
app.get('/api/student/notifications', async (req, res) => {
  if (!req.session.user) return res.status(401).json({ message: 'Non connecté.' })
  try {
    const [rows] = await db.execute(
      'SELECT * FROM notification WHERE recipient_id = ? ORDER BY sent_at DESC',
      [req.session.user.id]
    )
    res.json(rows)
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// PATCH /api/student/notifications/:id/read
app.patch('/api/student/notifications/:id/read', async (req, res) => {
  if (!req.session.user) return res.status(401).json({ message: 'Non connecté.' })
  try {
    await db.execute(
      'UPDATE notification SET is_read = 1 WHERE id = ? AND recipient_id = ?',
      [req.params.id, req.session.user.id]
    )
    res.json({ success: true })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// GET /api/student/profile
app.get('/api/student/profile', async (req, res) => {
  if (!req.session.user) return res.status(401).json({ message: 'Non connecté.' })
  try {
    const [rows] = await db.execute(`
      SELECT s.first_name, s.last_name, s.email, s.birth_date,
             c.name AS class_name, c.level, c.school_year,
             u.login, u.created_at, u.role_id,
             e.name AS establishment_name
      FROM student s
      LEFT JOIN class c ON s.class_id = c.id
      LEFT JOIN user u ON s.user_id = u.id
      LEFT JOIN establishment e ON c.establishment_id = e.id
      WHERE s.user_id = ? LIMIT 1
    `, [req.session.user.id])
    if (!rows.length) return res.status(404).json({ message: 'Profil introuvable.' })
    res.json(rows[0])
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// GET /api/schema — liste les tables et colonnes (à supprimer en prod)
app.get('/api/schema', async (req, res) => {
  try {
    const [tables] = await db.execute('SHOW TABLES')
    const schema = {}
    for (const row of tables) {
      const tableName = Object.values(row)[0]
      const [columns] = await db.execute(`SHOW COLUMNS FROM \`${tableName}\``)
      schema[tableName] = columns.map(c => ({ name: c.Field, type: c.Type }))
    }
    res.json(schema)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/student/stats — infos personnelles de l'étudiant connecté
app.get('/api/student/stats', async (req, res) => {
  if (!req.session.user) return res.status(401).json({ message: 'Non connecté.' })

  try {
    // Récupère le profil étudiant lié au user connecté
    const [students] = await db.execute(
      'SELECT s.*, c.name AS class_name, c.level, c.school_year FROM student s LEFT JOIN class c ON s.class_id = c.id WHERE s.user_id = ? LIMIT 1',
      [req.session.user.id]
    )
    if (students.length === 0) return res.status(404).json({ message: 'Profil étudiant introuvable.' })
    const student = students[0]

    // Absences
    const [[{ totalAbsences }]]    = await db.execute('SELECT COUNT(*) AS totalAbsences FROM absence WHERE student_id = ?', [student.id])
    const [[{ justified }]]        = await db.execute('SELECT COUNT(*) AS justified FROM absence WHERE student_id = ? AND is_justified = 1', [student.id])
    const [[{ unjustified }]]      = await db.execute('SELECT COUNT(*) AS unjustified FROM absence WHERE student_id = ? AND is_justified = 0', [student.id])
    const [[{ lates }]]            = await db.execute('SELECT COUNT(*) AS lates FROM absence WHERE student_id = ? AND is_late = 1', [student.id])

    // Score & classement
    const [scores] = await db.execute('SELECT * FROM student_score WHERE student_id = ? LIMIT 1', [student.id])
    const score = scores[0] || { total_points: 0, class_rank: null, establishment_rank: null }

    // Cours aujourd'hui dans sa classe
    const [[{ coursesToday }]] = await db.execute(
      'SELECT COUNT(*) AS coursesToday FROM course WHERE class_id = ? AND DATE(start_datetime) = CURDATE()',
      [student.class_id]
    )

    // Notifications non lues
    const [[{ notifications }]] = await db.execute(
      'SELECT COUNT(*) AS notifications FROM notification WHERE recipient_id = ? AND is_read = 0',
      [req.session.user.id]
    )

    res.json({
      student: {
        firstName: student.first_name,
        lastName: student.last_name,
        email: student.email,
        className: student.class_name,
        level: student.level,
        schoolYear: student.school_year
      },
      absences: { total: totalAbsences, justified, unjustified, lates },
      score: {
        totalPoints: score.total_points,
        classRank: score.class_rank,
        establishmentRank: score.establishment_rank
      },
      coursesToday,
      notifications
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/me — vérifie si une session existe
app.get('/api/me', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: 'Non connecté.' })
  }
  res.json({ user: req.session.user })
})

// POST /api/logout
app.post('/api/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true })
  })
})

app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`)
})
