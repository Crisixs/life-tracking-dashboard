const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const db = require('../db/database')

const router = express.Router()
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production'
const SALT_ROUNDS = 12

router.post('/register', async (req, res) => {
  const { username, password } = req.body

  if (!username?.trim() || !password) {
    return res.status(400).json({ error: 'Benutzername und Passwort erforderlich' })
  }
  if (username.trim().length < 3) {
    return res.status(400).json({ error: 'Benutzername muss mindestens 3 Zeichen haben' })
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Passwort muss mindestens 8 Zeichen haben' })
  }

  try {
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)
    const user = db
      .prepare('INSERT INTO users (username, password_hash) VALUES (?, ?) RETURNING id, username, created_at')
      .get(username.trim(), passwordHash)

    db.prepare('INSERT INTO user_data (user_id, data) VALUES (?, ?)').run(user.id, '{}')

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '30d' })
    res.json({ token, user: { id: user.id, username: user.username } })
  } catch (err) {
    if (err.message?.includes('UNIQUE')) {
      return res.status(409).json({ error: 'Benutzername bereits vergeben' })
    }
    console.error('Register error:', err)
    res.status(500).json({ error: 'Serverfehler' })
  }
})

router.post('/login', async (req, res) => {
  const { username, password } = req.body

  if (!username?.trim() || !password) {
    return res.status(400).json({ error: 'Benutzername und Passwort erforderlich' })
  }

  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username.trim())
  if (!user) {
    return res.status(401).json({ error: 'Ungültige Anmeldedaten' })
  }

  const valid = await bcrypt.compare(password, user.password_hash)
  if (!valid) {
    return res.status(401).json({ error: 'Ungültige Anmeldedaten' })
  }

  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '30d' })
  res.json({ token, user: { id: user.id, username: user.username } })
})

module.exports = router
