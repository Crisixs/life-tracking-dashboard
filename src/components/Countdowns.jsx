import { useState } from 'react'
import { Clock, Plus, X, Trash2, Pencil, Check, CalendarDays } from 'lucide-react'
import Card, { CardHeader } from './Card'

const CATEGORIES = [
  { value: 'vacation', label: 'Urlaub', color: 'var(--teal)' },
  { value: 'birthday', label: 'Geburtstag', color: 'var(--coral)' },
  { value: 'deadline', label: 'Deadline', color: 'var(--red)' },
  { value: 'event', label: 'Event', color: 'var(--purple)' },
  { value: 'other', label: 'Sonstiges', color: 'var(--blue)' },
]

function getDaysUntil(dateStr) {
  const target = new Date(dateStr)
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  target.setHours(0, 0, 0, 0)
  return Math.ceil((target - now) / (1000 * 60 * 60 * 24))
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' })
}

export default function Countdowns({ countdowns, setCountdowns }) {
  const [showAdd, setShowAdd] = useState(false)
  const [name, setName] = useState('')
  const [date, setDate] = useState('')
  const [category, setCategory] = useState('event')
  const [editId, setEditId] = useState(null)
  const [editName, setEditName] = useState('')
  const [editDate, setEditDate] = useState('')

  const addCountdown = () => {
    if (!name.trim() || !date) return
    setCountdowns(prev => [...prev, { id: Date.now(), name: name.trim(), date, category }])
    setName(''); setDate(''); setShowAdd(false)
  }

  const saveEdit = () => {
    if (!editName.trim()) return
    setCountdowns(prev => prev.map(c => c.id === editId ? { ...c, name: editName.trim(), date: editDate || c.date } : c))
    setEditId(null)
  }

  const sorted = [...countdowns]
    .map(c => ({ ...c, days: getDaysUntil(c.date) }))
    .sort((a, b) => a.days - b.days)

  const upcoming = sorted.filter(c => c.days >= 0)
  const passed = sorted.filter(c => c.days < 0)

  const inputStyle = {
    background: 'var(--bg-input)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)', padding: '8px 10px', color: 'var(--text-primary)',
    fontSize: 13, outline: 'none',
  }

  return (
    <Card>
      <CardHeader icon={<CalendarDays size={16} />} title="Countdowns" color="var(--purple)"
        right={
          <button onClick={() => setShowAdd(!showAdd)} style={{
            width: 26, height: 26, borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border)', background: 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}>
            {showAdd ? <X size={14} color="var(--text-secondary)" /> : <Plus size={14} color="var(--text-secondary)" />}
          </button>
        }
      />

      {showAdd && (
        <div style={{ marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Event-Name..."
            onKeyDown={e => e.key === 'Enter' && addCountdown()} style={inputStyle} />
          <div style={{ display: 'flex', gap: 6 }}>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ ...inputStyle, flex: 1 }} />
            <select value={category} onChange={e => setCategory(e.target.value)}
              style={{ ...inputStyle, cursor: 'pointer' }}>
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <button onClick={addCountdown} style={{
            background: 'var(--purple-dim)', border: 'none', borderRadius: 'var(--radius-sm)',
            padding: '8px', color: '#fff', fontSize: 12, cursor: 'pointer', fontWeight: 500,
          }}>Hinzufuegen</button>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {upcoming.map(c => {
          const cat = CATEGORIES.find(ct => ct.value === c.category) || CATEGORIES[4]
          const isToday = c.days === 0
          const isSoon = c.days <= 7 && c.days > 0

          if (editId === c.id) {
            return (
              <div key={c.id} style={{ display: 'flex', gap: 4, padding: '6px', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--purple-dim)' }}>
                <input value={editName} onChange={e => setEditName(e.target.value)} autoFocus
                  onKeyDown={e => e.key === 'Enter' && saveEdit()}
                  style={{ ...inputStyle, flex: 1, background: 'transparent', border: 'none', padding: '4px' }} />
                <input type="date" value={editDate} onChange={e => setEditDate(e.target.value)}
                  style={{ ...inputStyle, width: 130, background: 'transparent', border: '1px solid var(--border)', padding: '4px 6px' }} />
                <button onClick={saveEdit} style={{ background: 'var(--purple-dim)', border: 'none', borderRadius: 'var(--radius-sm)', width: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Check size={12} color="#fff" /></button>
                <button onClick={() => setEditId(null)} style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', width: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><X size={12} color="var(--text-secondary)" /></button>
              </div>
            )
          }

          return (
            <div key={c.id} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
              background: isToday ? `${cat.color}15` : 'var(--bg-input)',
              borderRadius: 'var(--radius-sm)',
              borderLeft: `3px solid ${cat.color}`,
            }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 500, margin: 0 }}>{c.name}</p>
                <p style={{ fontSize: 10, color: 'var(--text-muted)', margin: '2px 0 0' }}>
                  {formatDate(c.date)} {cat.label !== 'Sonstiges' ? `(${cat.label})` : ''}
                </p>
              </div>
              <div style={{ textAlign: 'right', marginRight: 4 }}>
                <p style={{
                  fontSize: isToday ? 16 : 20, fontWeight: 700, margin: 0,
                  fontFamily: 'var(--font-mono)',
                  color: isToday ? cat.color : isSoon ? 'var(--amber)' : cat.color,
                }}>
                  {isToday ? 'Heute!' : `${c.days}d`}
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <Pencil size={10} color="var(--text-muted)" style={{ cursor: 'pointer', opacity: 0.5 }}
                  onClick={() => { setEditId(c.id); setEditName(c.name); setEditDate(c.date) }} />
                <Trash2 size={10} color="var(--text-muted)" style={{ cursor: 'pointer', opacity: 0.5 }}
                  onClick={() => setCountdowns(prev => prev.filter(x => x.id !== c.id))} />
              </div>
            </div>
          )
        })}
        {upcoming.length === 0 && (
          <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: 16 }}>
            Keine anstehenden Events
          </p>
        )}
        {passed.length > 0 && (
          <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
            {passed.length} vergangene Events (werden nicht angezeigt)
          </p>
        )}
      </div>
    </Card>
  )
}
