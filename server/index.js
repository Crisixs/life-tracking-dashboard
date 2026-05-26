require('dotenv').config({ path: require('path').join(__dirname, '../.env') })

const express = require('express')
const cors = require('cors')
const path = require('path')

const app = express()
const PORT = process.env.SERVER_PORT || 3001

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}))
app.use(express.json({ limit: '10mb' }))

app.use('/api/auth', require('./routes/auth'))
app.use('/api/data', require('./routes/data'))

app.get('/api/health', (req, res) => res.json({ ok: true }))

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')))
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist', 'index.html'))
  })
}

app.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`)
  console.log(`DB-Pfad: ${process.env.DB_PATH || 'data/dashboard.db'}`)
})
