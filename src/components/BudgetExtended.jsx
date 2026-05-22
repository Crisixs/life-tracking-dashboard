import { useState } from 'react'
import { Trophy, Repeat, Star, Plus, X, Trash2, Pencil, Check, Gift } from 'lucide-react'
import Card, { CardHeader } from './Card'

/* ─── 52 Week Challenge ─── */
function SparChallenge({ challenge, setChallenge }) {
  const [showSetup, setShowSetup] = useState(false)
  const [weeklyAmount, setWeeklyAmount] = useState(challenge?.weeklyAmount || 1)
  const [mode, setMode] = useState(challenge?.mode || 'ascending') // ascending, fixed, random

  const weeks = challenge?.weeks || Array(52).fill(false)
  const currentWeek = Math.ceil((Date.now() - new Date(new Date().getFullYear(), 0, 1)) / (7 * 24 * 60 * 60 * 1000))

  const getWeekAmount = (weekNum) => {
    if (challenge?.mode === 'fixed') return challenge.weeklyAmount
    if (challenge?.mode === 'random') return challenge.randomAmounts?.[weekNum] || weekNum
    return weekNum * (challenge?.weeklyAmount || 1) // ascending
  }

  const totalSaved = weeks.reduce((s, done, i) => done ? s + getWeekAmount(i + 1) : s, 0)
  const totalTarget = Array.from({ length: 52 }, (_, i) => getWeekAmount(i + 1)).reduce((s, v) => s + v, 0)
  const pct = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0

  const toggleWeek = (idx) => {
    const newWeeks = [...weeks]
    newWeeks[idx] = !newWeeks[idx]
    setChallenge(prev => ({ ...prev, weeks: newWeeks }))
  }

  const startChallenge = () => {
    const randomAmounts = mode === 'random'
      ? Array.from({ length: 52 }, () => Math.floor(Math.random() * 50) + 1)
      : undefined
    setChallenge({ mode, weeklyAmount: parseFloat(weeklyAmount) || 1, weeks: Array(52).fill(false), randomAmounts })
    setShowSetup(false)
  }

  return (
    <Card>
      <CardHeader icon={<Trophy size={16} />} title="52-Wochen Spar-Challenge" color="var(--amber)"
        right={
          <button onClick={() => setShowSetup(!showSetup)} style={{
            width: 26, height: 26, borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border)', background: 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}>
            {showSetup ? <X size={14} color="var(--text-secondary)" /> : <Pencil size={12} color="var(--text-secondary)" />}
          </button>
        }
      />

      {showSetup && (
        <div style={{ marginBottom: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', gap: 4 }}>
            {[
              { v: 'ascending', l: 'Aufsteigend (1€,2€,3€...)' },
              { v: 'fixed', l: 'Fix pro Woche' },
              { v: 'random', l: 'Zufällig (1-50€)' },
            ].map(m => (
              <button key={m.v} onClick={() => setMode(m.v)} style={{
                flex: 1, padding: '6px 4px', borderRadius: 'var(--radius-sm)', fontSize: 10,
                border: mode === m.v ? '1.5px solid var(--amber)' : '1px solid var(--border)',
                background: mode === m.v ? 'rgba(239,159,39,0.12)' : 'var(--bg-input)',
                color: mode === m.v ? 'var(--amber)' : 'var(--text-secondary)',
                cursor: 'pointer', fontFamily: 'var(--font-main)',
              }}>{m.l}</button>
            ))}
          </div>
          {mode !== 'random' && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{mode === 'fixed' ? 'Betrag/Woche:' : 'Faktor:'}</span>
              <input type="number" value={weeklyAmount} onChange={e => setWeeklyAmount(e.target.value)}
                style={{ width: 80, background: 'var(--bg-input)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)', padding: '6px 10px', color: 'var(--text-primary)',
                  fontSize: 13, outline: 'none' }} />
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>€</span>
            </div>
          )}
          <button onClick={startChallenge} style={{
            background: 'var(--amber-dim)', border: 'none', borderRadius: 'var(--radius-sm)',
            padding: '8px', color: '#fff', fontSize: 12, cursor: 'pointer', fontWeight: 500,
          }}>Challenge {challenge?.weeks ? 'neu starten' : 'starten'}</button>
        </div>
      )}

      {/* Progress */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 26, fontWeight: 600, color: 'var(--amber)', fontFamily: 'var(--font-mono)' }}>{Math.round(totalSaved)}€</span>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>von {Math.round(totalTarget)}€ ({pct}%)</span>
      </div>
      <div style={{ height: 6, background: 'var(--bg-input)', borderRadius: 3, overflow: 'hidden', marginBottom: 12 }}>
        <div style={{ height: '100%', width: `${pct}%`, background: 'var(--amber)', borderRadius: 3, transition: 'width 0.5s' }} />
      </div>

      {/* Week Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(13, 1fr)', gap: 3 }}>
        {weeks.map((done, i) => {
          const isPast = i + 1 <= currentWeek
          const isCurrent = i + 1 === currentWeek
          const amount = getWeekAmount(i + 1)
          return (
            <button key={i} onClick={() => toggleWeek(i)} title={`Woche ${i + 1}: ${amount}€`} style={{
              aspectRatio: '1', borderRadius: 3, border: isCurrent ? '1.5px solid var(--purple)' : 'none',
              background: done ? 'var(--amber)' : isPast && !done ? 'rgba(226,75,74,0.3)' : 'var(--bg-input)',
              cursor: 'pointer', fontSize: 0, transition: 'all 0.15s',
            }} />
          )
        })}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 10, color: 'var(--text-muted)' }}>
        <span>Woche 1</span>
        <span>Woche {currentWeek} (jetzt)</span>
        <span>Woche 52</span>
      </div>
    </Card>
  )
}

/* ─── Abo Manager ─── */
function AboManager({ abos, setAbos }) {
  const [showAdd, setShowAdd] = useState(false)
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [cycle, setCycle] = useState('monthly')
  const [editId, setEditId] = useState(null)
  const [editName, setEditName] = useState('')
  const [editAmount, setEditAmount] = useState('')

  const monthlyTotal = abos.reduce((s, a) => {
    if (a.cycle === 'yearly') return s + a.amount / 12
    if (a.cycle === 'quarterly') return s + a.amount / 3
    return s + a.amount
  }, 0)
  const yearlyTotal = monthlyTotal * 12

  const addAbo = () => {
    if (!name.trim() || !amount) return
    setAbos(prev => [...prev, { id: Date.now(), name: name.trim(), amount: parseFloat(amount), cycle }])
    setName(''); setAmount(''); setShowAdd(false)
  }

  const saveEdit = () => {
    if (!editName.trim()) return
    setAbos(prev => prev.map(a => a.id === editId ? { ...a, name: editName.trim(), amount: parseFloat(editAmount) || a.amount } : a))
    setEditId(null)
  }

  const cycleLabels = { monthly: '/Mo', quarterly: '/Q', yearly: '/Jahr' }

  return (
    <Card>
      <CardHeader icon={<Repeat size={16} />} title="Abo-Manager" color="var(--coral)"
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

      {/* Monthly summary */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
        <div style={{ flex: 1, padding: '10px', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
          <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>Pro Monat</p>
          <p style={{ fontSize: 18, fontWeight: 600, color: 'var(--coral)', fontFamily: 'var(--font-mono)' }}>{Math.round(monthlyTotal)}€</p>
        </div>
        <div style={{ flex: 1, padding: '10px', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
          <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>Pro Jahr</p>
          <p style={{ fontSize: 18, fontWeight: 600, color: 'var(--amber)', fontFamily: 'var(--font-mono)' }}>{Math.round(yearlyTotal)}€</p>
        </div>
      </div>

      {showAdd && (
        <div style={{ marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Name (z.B. Netflix)"
            style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '8px 10px', color: 'var(--text-primary)', fontSize: 13, outline: 'none' }} />
          <div style={{ display: 'flex', gap: 6 }}>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Betrag €"
              style={{ flex: 1, background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '8px 10px', color: 'var(--text-primary)', fontSize: 13, outline: 'none' }} />
            <select value={cycle} onChange={e => setCycle(e.target.value)}
              style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '8px', color: 'var(--text-primary)', fontSize: 12, outline: 'none', cursor: 'pointer' }}>
              <option value="monthly">Monatlich</option>
              <option value="quarterly">Quartalsweise</option>
              <option value="yearly">Jährlich</option>
            </select>
          </div>
          <button onClick={addAbo} style={{
            background: 'var(--coral-dim)', border: 'none', borderRadius: 'var(--radius-sm)',
            padding: '8px', color: '#fff', fontSize: 12, cursor: 'pointer', fontWeight: 500,
          }}>Hinzufügen</button>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {abos.map(a => (
          <div key={a.id} style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
            background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)',
          }}>
            {editId === a.id ? (
              <>
                <input value={editName} onChange={e => setEditName(e.target.value)} autoFocus
                  onKeyDown={e => e.key === 'Enter' && saveEdit()}
                  style={{ flex: 1, background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: 13, outline: 'none' }} />
                <input type="number" value={editAmount} onChange={e => setEditAmount(e.target.value)}
                  style={{ width: 60, background: 'transparent', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '2px 6px', color: 'var(--text-primary)', fontSize: 12, outline: 'none', textAlign: 'right' }} />
                <button onClick={saveEdit} style={{ background: 'var(--coral-dim)', border: 'none', borderRadius: 'var(--radius-sm)', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Check size={12} color="#fff" /></button>
                <button onClick={() => setEditId(null)} style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><X size={12} color="var(--text-secondary)" /></button>
              </>
            ) : (
              <>
                <span style={{ fontSize: 13, flex: 1 }}>{a.name}</span>
                <span style={{ fontSize: 12, color: 'var(--coral)', fontFamily: 'var(--font-mono)', fontWeight: 500 }}>
                  {Math.round(a.amount)}€{cycleLabels[a.cycle]}
                </span>
                <Pencil size={11} color="var(--text-muted)" style={{ cursor: 'pointer', opacity: 0.6 }}
                  onClick={() => { setEditId(a.id); setEditName(a.name); setEditAmount(String(a.amount)) }} />
                <Trash2 size={12} color="var(--text-muted)" style={{ cursor: 'pointer' }}
                  onClick={() => setAbos(prev => prev.filter(x => x.id !== a.id))} />
              </>
            )}
          </div>
        ))}
        {abos.length === 0 && (
          <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: 16 }}>Keine Abos eingetragen</p>
        )}
      </div>
    </Card>
  )
}

/* ─── Wunschliste ─── */
function Wunschliste({ wishes, setWishes }) {
  const [showAdd, setShowAdd] = useState(false)
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [link, setLink] = useState('')

  const addWish = () => {
    if (!name.trim() || !price) return
    setWishes(prev => [...prev, { id: Date.now(), name: name.trim(), price: parseFloat(price), saved: 0, link: link.trim() }])
    setName(''); setPrice(''); setLink(''); setShowAdd(false)
  }

  const updateSaved = (id, saved) => {
    setWishes(prev => prev.map(w => w.id === id ? { ...w, saved: Math.max(0, Math.min(w.price, saved)) } : w))
  }

  return (
    <Card>
      <CardHeader icon={<Gift size={16} />} title="Wunschliste" color="var(--purple)"
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
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Was willst du?"
            style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '8px 10px', color: 'var(--text-primary)', fontSize: 13, outline: 'none' }} />
          <div style={{ display: 'flex', gap: 6 }}>
            <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="Preis €"
              style={{ flex: 1, background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '8px 10px', color: 'var(--text-primary)', fontSize: 13, outline: 'none' }} />
            <input value={link} onChange={e => setLink(e.target.value)} placeholder="Link (optional)"
              style={{ flex: 2, background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '8px 10px', color: 'var(--text-primary)', fontSize: 13, outline: 'none' }} />
          </div>
          <button onClick={addWish} style={{
            background: 'var(--purple-dim)', border: 'none', borderRadius: 'var(--radius-sm)',
            padding: '8px', color: '#fff', fontSize: 12, cursor: 'pointer', fontWeight: 500,
          }}>Hinzufügen</button>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {wishes.map(w => {
          const pct = Math.round((w.saved / w.price) * 100)
          const done = pct >= 100
          return (
            <div key={w.id} style={{ padding: '10px 12px', background: done ? 'rgba(93,202,165,0.08)' : 'var(--bg-input)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: 13, textDecoration: done ? 'line-through' : 'none' }}>{w.name}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: done ? 'var(--teal)' : 'var(--purple)', fontWeight: 500 }}>
                    {Math.round(w.saved)}€ / {Math.round(w.price)}€
                  </span>
                  <Trash2 size={11} color="var(--text-muted)" style={{ cursor: 'pointer' }}
                    onClick={() => setWishes(prev => prev.filter(x => x.id !== w.id))} />
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="range" min="0" max={w.price} step="1" value={w.saved}
                  onChange={e => updateSaved(w.id, parseInt(e.target.value))}
                  style={{ flex: 1, accentColor: done ? 'var(--teal)' : 'var(--purple)' }} />
                <span style={{ fontSize: 11, color: done ? 'var(--teal)' : 'var(--text-muted)', fontFamily: 'var(--font-mono)', width: 36, textAlign: 'right' }}>
                  {pct}%
                </span>
              </div>
            </div>
          )
        })}
        {wishes.length === 0 && (
          <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: 16 }}>Noch keine Wünsche – träum mal! ✨</p>
        )}
      </div>
    </Card>
  )
}

/* ─── Export Combined ─── */
export { SparChallenge, AboManager, Wunschliste }
