const express = require('express')
const db = require('../db/database')
const authMiddleware = require('../middleware/auth')

const router = express.Router()
router.use(authMiddleware)

router.get('/', (req, res) => {
  const row = db.prepare('SELECT data FROM user_data WHERE user_id = ?').get(req.user.id)
  if (!row) return res.json({ data: {} })

  try {
    res.json({ data: JSON.parse(row.data) })
  } catch {
    res.json({ data: {} })
  }
})

router.put('/', (req, res) => {
  const { data } = req.body
  if (typeof data !== 'object' || data === null) {
    return res.status(400).json({ error: 'Ungültiges Datenformat' })
  }

  db.prepare(`
    INSERT INTO user_data (user_id, data, updated_at)
    VALUES (?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(user_id) DO UPDATE SET
      data = excluded.data,
      updated_at = excluded.updated_at
  `).run(req.user.id, JSON.stringify(data))

  res.json({ ok: true })
})

module.exports = router
