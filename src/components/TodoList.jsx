import { useState } from 'react'
import { CheckSquare, Plus, Trash2, X } from 'lucide-react'
import Card, { CardHeader } from './Card'

const priorityColors = {
  high: { bg: 'rgba(127,119,221,0.15)', text: 'var(--purple)' },
  medium: { bg: 'rgba(93,202,165,0.15)', text: 'var(--teal)' },
  low: { bg: 'rgba(136,136,170,0.15)', text: 'var(--text-secondary)' },
}
const priorityLabels = { high: 'Hoch', medium: 'Mittel', low: 'Niedrig' }

export default function TodoList({ todos, setTodos }) {
  const [input, setInput] = useState('')
  const [priority, setPriority] = useState('medium')
  const [showAdd, setShowAdd] = useState(false)

  const addTodo = () => {
    if (!input.trim()) return
    setTodos(prev => [...prev, { id: Date.now(), text: input.trim(), done: false, priority }])
    setInput('')
    setShowAdd(false)
  }

  const toggle = id => setTodos(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t))
  const remove = id => setTodos(prev => prev.filter(t => t.id !== id))

  return (
    <Card>
      <CardHeader
        icon={<CheckSquare size={16} />}
        title="To-Do"
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
        <div style={{ marginBottom: 12, display: 'flex', gap: 8 }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addTodo()}
            placeholder="Neue Aufgabe..."
            autoFocus
            style={{
              flex: 1, background: 'var(--bg-input)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)', padding: '8px 12px', color: 'var(--text-primary)',
              fontSize: 13, outline: 'none',
            }}
          />
          <select
            value={priority}
            onChange={e => setPriority(e.target.value)}
            style={{
              background: 'var(--bg-input)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)', padding: '8px', color: 'var(--text-primary)',
              fontSize: 12, outline: 'none', cursor: 'pointer',
            }}
          >
            <option value="high">Hoch</option>
            <option value="medium">Mittel</option>
            <option value="low">Niedrig</option>
          </select>
          <button onClick={addTodo} style={{
            background: 'var(--purple-dim)', border: 'none', borderRadius: 'var(--radius-sm)',
            padding: '8px 14px', color: '#fff', fontSize: 12, cursor: 'pointer', fontWeight: 500,
          }}>+</button>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {todos.sort((a, b) => a.done - b.done).map(todo => (
          <div key={todo.id} style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
            background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)',
            opacity: todo.done ? 0.5 : 1, transition: 'opacity 0.2s',
          }}>
            <div
              onClick={() => toggle(todo.id)}
              style={{
                width: 18, height: 18, borderRadius: 4, cursor: 'pointer',
                border: todo.done ? 'none' : '1.5px solid var(--text-muted)',
                background: todo.done ? 'var(--purple)' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s', flexShrink: 0,
              }}
            >
              {todo.done && <span style={{ color: '#fff', fontSize: 11 }}>✓</span>}
            </div>
            <span style={{
              fontSize: 13, flex: 1,
              textDecoration: todo.done ? 'line-through' : 'none',
              color: todo.done ? 'var(--text-muted)' : 'var(--text-primary)',
            }}>{todo.text}</span>
            {!todo.done && (
              <span style={{
                fontSize: 10, padding: '2px 8px', borderRadius: 10,
                background: priorityColors[todo.priority].bg,
                color: priorityColors[todo.priority].text,
                fontWeight: 500,
              }}>{priorityLabels[todo.priority]}</span>
            )}
            <Trash2
              size={13}
              color="var(--text-muted)"
              style={{ cursor: 'pointer', flexShrink: 0 }}
              onClick={() => remove(todo.id)}
            />
          </div>
        ))}
        {todos.length === 0 && (
          <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: 20 }}>
            Keine Aufgaben – klick + um eine hinzuzufügen
          </p>
        )}
      </div>
    </Card>
  )
}
