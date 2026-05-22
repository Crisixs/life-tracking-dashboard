import { useState } from 'react'
import { Moon, Plus, X, Settings } from 'lucide-react'
import Card, { CardHeader } from './Card'

const qualityOptions = [
  { value: 'great', label: 'Super', color: 'var(--teal)' },
  { value: 'good', label: 'Gut', color: 'var(--blue)' },
  { value: 'ok', label: 'Okay', color: 'var(--amber)' },
  { value: 'bad', label: 'Schlecht', color: 'var(--coral)' },
]

// Optimal sleep: 7-9h for adults, configurable goal (default 8h)
// With training: 8-9h recommended for recovery
const SLEEP_TIPS = {
  under: 'Zu wenig Schlaf beeinträchtigt Regeneration, Hormonproduktion (HGH) und Immunsystem.',
  over: 'Leicht über dem Ziel – kann bei hoher Trainingsbelastung sogar förderlich sein.',
  optimal: 'Im optimalen Bereich! Perfekt für Regeneration und Muskelaufbau.',
}

export default function SleepTracker({ sleepData, setSleepData, today, sleepGoal = 8, setSleepGoal }) {
  const [showAdd, setShowAdd] = useState(false)
  const [showGoal, setShowGoal] = useState(false)
  const [bedtime, setBedtime] = useState('23:00')
  const [wakeup, setWakeup] = useState('07:00')
  const [quality, setQuality] = useState('good')
  const [selectedDate, setSelectedDate] = useState(today)

  const todaySleep = sleepData.find(s => s.date === today)
  const selectedSleep = sleepData.find(s => s.date === selectedDate)

  const calcHours = (bed, wake) => {
    const [bh, bm] = bed.split(':').map(Number)
    const [wh, wm] = wake.split(':').map(Number)
    let diff = (wh * 60 + wm) - (bh * 60 + bm)
    if (diff < 0) diff += 24 * 60
    return Math.round(diff / 6) / 10
  }

  const saveSleep = () => {
    const hours = calcHours(bedtime, wakeup)
    const entry = { date: selectedDate, bedtime, wakeup, hours, quality }
    setSleepData(prev => {
      const filtered = prev.filter(s => s.date !== selectedDate)
      return [...filtered, entry]
    })
    setShowAdd(false)
    setSelectedDate(today)
  }

  const displaySleep = selectedDate === today ? todaySleep : selectedSleep
  const yesterday = new Date(new Date(today).getTime() - 86400000).toISOString().split('T')[0]
  const yesterdaySleep = sleepData.find(s => s.date === yesterday)
  const diff = todaySleep && yesterdaySleep ? Math.round((todaySleep.hours - yesterdaySleep.hours) * 10) / 10 : null

  // Sleep vs goal calculation
  const sleepDiffFromGoal = todaySleep ? Math.round((todaySleep.hours - sleepGoal) * 10) / 10 : null
  const sleepPctOfGoal = todaySleep ? Math.round((todaySleep.hours / sleepGoal) * 100) : 0
  const sleepStatus = sleepDiffFromGoal !== null
    ? (sleepDiffFromGoal < -0.5 ? 'under' : sleepDiffFromGoal > 1 ? 'over' : 'optimal')
    : null

  const statusColor = sleepStatus === 'under' ? 'var(--coral)' : sleepStatus === 'over' ? 'var(--amber)' : 'var(--teal)'

  // Generate last 7 days for backfill
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    return d.toISOString().split('T')[0]
  })

  const inputStyle = {
    background: 'var(--bg-input)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)', padding: '8px 10px', color: 'var(--text-primary)',
    fontSize: 13, outline: 'none', width: '100%',
  }

  return (
    <Card>
      <CardHeader
        icon={<Moon size={16} />}
        title="Schlaf"
        color="var(--blue)"
        right={
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={() => setShowGoal(!showGoal)} style={{
              width: 26, height: 26, borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)', background: 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            }}>
              <Settings size={12} color="var(--text-secondary)" />
            </button>
            <button onClick={() => { setShowAdd(!showAdd); setSelectedDate(today) }} style={{
              width: 26, height: 26, borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)', background: 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            }}>
              {showAdd ? <X size={14} color="var(--text-secondary)" /> : <Plus size={14} color="var(--text-secondary)" />}
            </button>
          </div>
        }
      />

      {showGoal && (
        <div style={{ marginBottom: 12, padding: '10px 12px', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)' }}>
          <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
            Schlafziel (Empfehlung: 7–9h, bei Training 8–9h)
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input type="range" min="5" max="11" step="0.5" value={sleepGoal}
              onChange={e => setSleepGoal(parseFloat(e.target.value))}
              style={{ flex: 1, accentColor: 'var(--blue)' }} />
            <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--blue)', fontFamily: 'var(--font-mono)', minWidth: 36 }}>
              {sleepGoal}h
            </span>
          </div>
        </div>
      )}

      {showAdd && (
        <div style={{ marginBottom: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div>
            <label style={{ fontSize: 10, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Datum</label>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {last7Days.map(d => {
                const dayLabel = d === today ? 'Heute' : new Date(d).toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit' })
                const hasData = sleepData.some(s => s.date === d)
                return (
                  <button key={d} onClick={() => setSelectedDate(d)} style={{
                    padding: '4px 8px', borderRadius: 'var(--radius-sm)', fontSize: 11,
                    border: selectedDate === d ? '1.5px solid var(--blue)' : '1px solid var(--border)',
                    background: selectedDate === d ? 'rgba(133,183,235,0.15)' : 'var(--bg-input)',
                    color: selectedDate === d ? 'var(--blue)' : hasData ? 'var(--teal)' : 'var(--text-secondary)',
                    cursor: 'pointer', fontFamily: 'var(--font-main)',
                  }}>{dayLabel}</button>
                )
              })}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div>
              <label style={{ fontSize: 10, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Eingeschlafen</label>
              <input type="time" value={bedtime} onChange={e => setBedtime(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: 10, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Aufgewacht</label>
              <input type="time" value={wakeup} onChange={e => setWakeup(e.target.value)} style={inputStyle} />
            </div>
          </div>
          <div>
            <label style={{ fontSize: 10, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Qualität</label>
            <div style={{ display: 'flex', gap: 6 }}>
              {qualityOptions.map(q => (
                <button key={q.value} onClick={() => setQuality(q.value)} style={{
                  flex: 1, padding: '6px 0', borderRadius: 'var(--radius-sm)', fontSize: 12,
                  border: quality === q.value ? `1.5px solid ${q.color}` : '1px solid var(--border)',
                  background: quality === q.value ? `${q.color}22` : 'var(--bg-input)',
                  color: quality === q.value ? q.color : 'var(--text-secondary)',
                  cursor: 'pointer', fontWeight: 500, fontFamily: 'var(--font-main)',
                }}>{q.label}</button>
              ))}
            </div>
          </div>
          <button onClick={saveSleep} style={{
            background: 'var(--blue-dim)', border: 'none', borderRadius: 'var(--radius-sm)',
            padding: '8px', color: '#fff', fontSize: 12, cursor: 'pointer', fontWeight: 500,
          }}>Speichern {selectedDate !== today && `(${new Date(selectedDate).toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit' })})`}</button>
        </div>
      )}

      {todaySleep ? (
        <>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 30, fontWeight: 600, color: 'var(--blue)', fontFamily: 'var(--font-mono)' }}>
              {todaySleep.hours}h
            </span>
            {diff !== null && diff !== 0 && (
              <span style={{ fontSize: 12, color: diff > 0 ? 'var(--teal)' : 'var(--coral)' }}>
                {diff > 0 ? '↑' : '↓'} {Math.abs(diff)}h vs gestern
              </span>
            )}
          </div>

          {/* Optimal sleep comparison */}
          <div style={{
            padding: '8px 10px', borderRadius: 'var(--radius-sm)', marginBottom: 10,
            background: `${statusColor}11`, border: `1px solid ${statusColor}33`,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <span style={{ fontSize: 11, color: statusColor, fontWeight: 500 }}>
                {sleepPctOfGoal}% vom Ziel ({sleepGoal}h)
              </span>
              <span style={{ fontSize: 11, color: statusColor }}>
                {sleepDiffFromGoal > 0 ? '+' : ''}{sleepDiffFromGoal}h
              </span>
            </div>
            <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.min(100, sleepPctOfGoal)}%`, background: statusColor, borderRadius: 2, transition: 'width 0.5s' }} />
            </div>
            <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
              {SLEEP_TIPS[sleepStatus]}
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>
            <span>{todaySleep.bedtime} eingeschlafen</span>
            <span>{todaySleep.wakeup} aufgewacht</span>
          </div>
          {qualityOptions.find(q => q.value === todaySleep.quality) && (
            <p style={{ fontSize: 11, color: qualityOptions.find(q => q.value === todaySleep.quality).color, marginTop: 4 }}>
              Qualität: {qualityOptions.find(q => q.value === todaySleep.quality).label}
            </p>
          )}
        </>
      ) : (
        <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: 20 }}>
          Schlaf noch nicht eingetragen
        </p>
      )}
    </Card>
  )
}
