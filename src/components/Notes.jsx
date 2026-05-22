import { useState } from 'react'
import { StickyNote, Plus, X, Trash2 } from 'lucide-react'
import Card, { CardHeader } from './Card'

export default function Notes({ notes, setNotes }) {
  const [showAdd, setShowAdd] = useState(false)
  const [text, setText] = useState('')

  const addNote = () => {
    if (!text.trim()) return
    setNotes(prev => [
      { id: Date.now(), text: text.trim(), date: new Date().toLocaleString('de-DE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) },
      ...prev,
    ])
    setText('')
    setShowAdd(false)
  }

  const removeNote = id => setNotes(prev => prev.filter(n => n.id !== id))

  return (
    <Card>
      <CardHeader
        icon={<StickyNote size={16} />}
        title="Notizen"
        color="var(--purple)"
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
        <div style={{ marginBottom: 12 }}>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) addNote() }}
            placeholder="Gedanke festhalten... (Ctrl+Enter zum Speichern)"
            autoFocus
            rows={3}
            style={{
              width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)', padding: '10px 12px', color: 'var(--text-primary)',
              fontSize: 13, outline: 'none', resize: 'vertical', lineHeight: 1.5,
            }}
          />
          <button onClick={addNote} style={{
            marginTop: 6, background: 'var(--purple-dim)', border: 'none',
            borderRadius: 'var(--radius-sm)', padding: '8px 14px', color: '#fff',
            fontSize: 12, cursor: 'pointer', fontWeight: 500, width: '100%',
          }}>Speichern</button>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 240, overflowY: 'auto' }}>
        {notes.map(n => (
          <div key={n.id} style={{
            padding: '10px 12px', background: 'var(--bg-input)',
            borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--purple-dim)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
              <p style={{ fontSize: 13, lineHeight: 1.5, flex: 1, whiteSpace: 'pre-wrap' }}>{n.text}</p>
              <Trash2 size={12} color="var(--text-muted)" style={{ cursor: 'pointer', flexShrink: 0, marginTop: 2 }} onClick={() => removeNote(n.id)} />
            </div>
            <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 6 }}>{n.date}</p>
          </div>
        ))}
        {notes.length === 0 && (
          <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: 20 }}>
            Noch keine Notizen
          </p>
        )}
      </div>
    </Card>
  )
}
