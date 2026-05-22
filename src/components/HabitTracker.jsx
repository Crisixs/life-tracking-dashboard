import { useState } from 'react'
import { Flame, Plus, X, Droplet, BookOpen, Brain, Dumbbell, Heart, Coffee, Moon, Music, Pencil, Check } from 'lucide-react'
import Card, { CardHeader } from './Card'

const iconMap = {
  droplet: Droplet, book: BookOpen, brain: Brain, dumbbell: Dumbbell,
  heart: Heart, coffee: Coffee, moon: Moon, music: Music, flame: Flame,
}
const iconNames = Object.keys(iconMap)

function getStreak(habits, today) {
  let streak = 0
  let d = new Date(today)
  while (true) {
    const dateStr = d.toISOString().split('T')[0]
    const allDone = habits.every(h => h.history[dateStr])
    if (!allDone) break
    streak++
    d.setDate(d.getDate() - 1)
  }
  return streak
}

export default function HabitTracker({ habits, setHabits, today }) {
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [newIcon, setNewIcon] = useState('heart')
  const [newColor, setNewColor] = useState('var(--teal)')
  const [editId, setEditId] = useState(null)
  const [editName, setEditName] = useState('')
  const [editColor, setEditColor] = useState('')

  const streak = getStreak(habits, today)

  const toggleHabit = id => {
    setHabits(prev => prev.map(h => {
      if (h.id !== id) return h
      const history = { ...h.history }
      history[today] = !history[today]
      return { ...h, history }
    }))
  }

  const addHabit = () => {
    if (!newName.trim()) return
    setHabits(prev => [...prev, { id: Date.now(), name: newName.trim(), icon: newIcon, color: newColor, history: {} }])
    setNewName('')
    setShowAdd(false)
  }

  const removeHabit = id => setHabits(prev => prev.filter(h => h.id !== id))

  const startEdit = (h) => { setEditId(h.id); setEditName(h.name); setEditColor(h.color) }
  const saveEdit = () => {
    if (!editName.trim()) return
    setHabits(prev => prev.map(h => h.id === editId ? { ...h, name: editName.trim(), color: editColor } : h))
    setEditId(null)
  }

  const colors = ['var(--purple)', 'var(--teal)', 'var(--blue)', 'var(--coral)', 'var(--amber)']

  return (
    <Card>
      <CardHeader
        icon={<Flame size={16} />}
        title="Gewohnheiten"
        color="var(--teal)"
        right={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {streak > 0 && (
              <span style={{ fontSize: 12, color: 'var(--teal)', background: 'var(--teal-glow)', padding: '2px 10px', borderRadius: 10 }}>
                🔥 {streak} {streak === 1 ? 'Tag' : 'Tage'}
              </span>
            )}
            <button onClick={() => setShowAdd(!showAdd)} style={{
              width: 26, height: 26, borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)', background: 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            }}>
              {showAdd ? <X size={14} color="var(--text-secondary)" /> : <Plus size={14} color="var(--text-secondary)" />}
            </button>
          </div>
        }
      />

      {showAdd && (
        <div style={{ marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <input value={newName} onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addHabit()}
            placeholder="Neue Gewohnheit..." autoFocus
            style={{
              background: 'var(--bg-input)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)', padding: '8px 12px', color: 'var(--text-primary)',
              fontSize: 13, outline: 'none',
            }} />
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', marginRight: 4 }}>Farbe:</span>
            {colors.map(c => (
              <div key={c} onClick={() => setNewColor(c)} style={{
                width: 20, height: 20, borderRadius: '50%', background: c, cursor: 'pointer',
                border: newColor === c ? '2px solid #fff' : '2px solid transparent',
              }} />
            ))}
            <button onClick={addHabit} style={{
              marginLeft: 'auto', background: 'var(--teal-dim)', border: 'none',
              borderRadius: 'var(--radius-sm)', padding: '6px 14px', color: '#fff',
              fontSize: 12, cursor: 'pointer', fontWeight: 500,
            }}>Hinzufügen</button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {habits.map(h => {
          const Icon = iconMap[h.icon] || Heart
          const done = h.history[today]

          if (editId === h.id) {
            return (
              <div key={h.id} style={{
                padding: '8px 10px', borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-input)', border: '1.5px solid var(--teal-dim)',
                display: 'flex', flexDirection: 'column', gap: 6,
              }}>
                <input value={editName} onChange={e => setEditName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && saveEdit()} autoFocus
                  style={{
                    background: 'transparent', border: 'none', color: 'var(--text-primary)',
                    fontSize: 13, outline: 'none', padding: '2px 0',
                  }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {colors.map(c => (
                    <div key={c} onClick={() => setEditColor(c)} style={{
                      width: 16, height: 16, borderRadius: '50%', background: c, cursor: 'pointer',
                      border: editColor === c ? '2px solid #fff' : '2px solid transparent',
                    }} />
                  ))}
                  <button onClick={saveEdit} style={{
                    marginLeft: 'auto', background: 'var(--teal-dim)', border: 'none',
                    borderRadius: 'var(--radius-sm)', width: 26, height: 26,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                  }}><Check size={12} color="#fff" /></button>
                  <button onClick={() => setEditId(null)} style={{
                    background: 'transparent', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)', width: 26, height: 26,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                  }}><X size={12} color="var(--text-secondary)" /></button>
                </div>
              </div>
            )
          }

          return (
            <div key={h.id} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '9px 12px', borderRadius: 'var(--radius-sm)',
              background: done ? `${h.color}11` : 'var(--bg-input)',
              transition: 'background 0.2s',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Icon size={15} color={h.color} />
                <span style={{ fontSize: 13 }}>{h.name}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Pencil size={11} color="var(--text-muted)" style={{ cursor: 'pointer', opacity: 0.5 }}
                  onClick={() => startEdit(h)} />
                <X size={12} color="var(--text-muted)" style={{ cursor: 'pointer', opacity: 0.5 }}
                  onClick={() => removeHabit(h.id)} />
                <div onClick={() => toggleHabit(h.id)} style={{
                  width: 22, height: 22, borderRadius: '50%', cursor: 'pointer',
                  background: done ? h.color : 'transparent',
                  border: done ? 'none' : '1.5px solid var(--text-muted)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s',
                }}>
                  {done && <span style={{ color: '#fff', fontSize: 12 }}>✓</span>}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
