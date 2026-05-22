import { useState } from 'react'
import { Target, Plus, X, Trash2, Pencil, Check } from 'lucide-react'
import Card, { CardHeader } from './Card'

export default function Goals({ goals, setGoals }) {
  const [showAdd, setShowAdd] = useState(false)
  const [name, setName] = useState('')
  const [editId, setEditId] = useState(null)
  const [editName, setEditName] = useState('')

  const colors = ['var(--amber)', 'var(--teal)', 'var(--purple)', 'var(--coral)', 'var(--blue)']

  const addGoal = () => {
    if (!name.trim()) return
    const color = colors[goals.length % colors.length]
    setGoals(prev => [...prev, { id: Date.now(), name: name.trim(), progress: 0, color }])
    setName('')
    setShowAdd(false)
  }

  const updateProgress = (id, progress) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, progress: Math.max(0, Math.min(100, progress)) } : g))
  }

  const removeGoal = id => setGoals(prev => prev.filter(g => g.id !== id))

  const saveEdit = () => {
    if (!editName.trim()) return
    setGoals(prev => prev.map(g => g.id === editId ? { ...g, name: editName.trim() } : g))
    setEditId(null)
  }

  return (
    <Card>
      <CardHeader
        icon={<Target size={16} />}
        title="Ziele"
        color="var(--amber)"
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
        <div style={{ marginBottom: 12, display: 'flex', gap: 8 }}>
          <input value={name} onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addGoal()} placeholder="Neues Ziel..." autoFocus
            style={{
              flex: 1, background: 'var(--bg-input)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)', padding: '8px 12px', color: 'var(--text-primary)',
              fontSize: 13, outline: 'none',
            }} />
          <button onClick={addGoal} style={{
            background: 'var(--amber-dim)', border: 'none', borderRadius: 'var(--radius-sm)',
            padding: '8px 14px', color: '#fff', fontSize: 12, cursor: 'pointer', fontWeight: 500,
          }}>+</button>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {goals.map(g => (
          <div key={g.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              {editId === g.id ? (
                <div style={{ display: 'flex', gap: 4, flex: 1, marginRight: 8 }}>
                  <input value={editName} onChange={e => setEditName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && saveEdit()} autoFocus
                    style={{
                      flex: 1, background: 'var(--bg-input)', border: '1.5px solid var(--amber-dim)',
                      borderRadius: 'var(--radius-sm)', padding: '4px 8px', color: 'var(--text-primary)',
                      fontSize: 13, outline: 'none',
                    }} />
                  <button onClick={saveEdit} style={{
                    background: 'var(--amber-dim)', border: 'none', borderRadius: 'var(--radius-sm)',
                    width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                  }}><Check size={12} color="#fff" /></button>
                  <button onClick={() => setEditId(null)} style={{
                    background: 'transparent', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                    width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                  }}><X size={12} color="var(--text-secondary)" /></button>
                </div>
              ) : (
                <>
                  <span style={{ fontSize: 13 }}>{g.name}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 12, color: g.color, fontFamily: 'var(--font-mono)', fontWeight: 500 }}>
                      {Math.round(g.progress)}%
                    </span>
                    <Pencil size={11} color="var(--text-muted)" style={{ cursor: 'pointer', opacity: 0.6 }}
                      onClick={() => { setEditId(g.id); setEditName(g.name) }} />
                    <Trash2 size={12} color="var(--text-muted)" style={{ cursor: 'pointer' }} onClick={() => removeGoal(g.id)} />
                  </div>
                </>
              )}
            </div>
            <input type="range" min="0" max="100" step="5" value={g.progress}
              onChange={e => updateProgress(g.id, parseInt(e.target.value))}
              style={{
                width: '100%', height: 6, appearance: 'none', background: 'var(--bg-input)',
                borderRadius: 3, outline: 'none', cursor: 'pointer', accentColor: g.color,
              }} />
          </div>
        ))}
        {goals.length === 0 && (
          <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: 20 }}>
            Keine Ziele gesetzt – worauf arbeitest du hin?
          </p>
        )}
      </div>
    </Card>
  )
}
