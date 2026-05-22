import { useState, useMemo } from 'react'
import { BookOpen, ChevronLeft, ChevronRight, Save, Trash2 } from 'lucide-react'
import Card, { CardHeader } from './Card'

function getWeekKey(date) {
  const d = new Date(date)
  const jsDay = d.getDay()
  const monday = new Date(d)
  monday.setDate(d.getDate() - (jsDay === 0 ? 6 : jsDay - 1))
  return monday.toISOString().split('T')[0]
}

function getWeekRange(weekKey) {
  const mon = new Date(weekKey)
  const sun = new Date(mon)
  sun.setDate(mon.getDate() + 6)
  const fmt = d => d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })
  return `${fmt(mon)} - ${fmt(sun)}`
}

function getWeekDates(weekKey) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekKey)
    d.setDate(d.getDate() + i)
    return d.toISOString().split('T')[0]
  })
}

function generateAutoSummary(data, weekDates) {
  const habits = data.habits || []
  const sleep = data.sleep || []
  const workouts = data.workouts || []

  let totalHabitsDone = 0
  let totalHabitsPossible = habits.length * 7
  let allHabitDays = 0
  weekDates.forEach(d => {
    const done = habits.filter(h => h.history?.[d]).length
    totalHabitsDone += done
    if (done === habits.length && habits.length > 0) allHabitDays++
  })
  const habitPct = totalHabitsPossible > 0 ? Math.round((totalHabitsDone / totalHabitsPossible) * 100) : 0

  const weekSleep = weekDates.map(d => sleep.find(s => s.date === d)).filter(Boolean)
  const avgSleep = weekSleep.length > 0 ? Math.round(weekSleep.reduce((s, e) => s + e.hours, 0) / weekSleep.length * 10) / 10 : 0
  const sleepTracked = weekSleep.length

  const weekWorkouts = weekDates.filter(d => workouts.find(w => w.date === d)).length
  const totalExercises = weekDates.reduce((s, d) => {
    const w = workouts.find(w => w.date === d)
    return s + (w?.exercises?.length || 0)
  }, 0)

  const todosDone = data.todos?.filter(t => t.done).length || 0
  const todosTotal = data.todos?.length || 0

  const lines = []
  lines.push(`Habits: ${habitPct}% (${totalHabitsDone}/${totalHabitsPossible}), ${allHabitDays} perfekte Tage`)
  if (avgSleep > 0) lines.push(`Schlaf: ${avgSleep}h Durchschnitt (${sleepTracked}/7 Tage getrackt)`)
  lines.push(`Workouts: ${weekWorkouts} Sessions, ${totalExercises} Uebungen`)
  lines.push(`To-Dos: ${todosDone}/${todosTotal} erledigt`)

  let rating = ''
  if (habitPct >= 80 && weekWorkouts >= 3 && avgSleep >= 7) rating = 'Starke Woche!'
  else if (habitPct >= 60 && weekWorkouts >= 2) rating = 'Solide Woche.'
  else if (habitPct >= 40) rating = 'Luft nach oben, aber drangeblieben.'
  else rating = 'Schwierige Woche. Naechste Woche neu angreifen.'

  return { lines, rating, habitPct, avgSleep, weekWorkouts }
}

export default function WeeklyReflection({ reflections, setReflections, data, today }) {
  const [weekOffset, setWeekOffset] = useState(0)

  const currentWeekKey = useMemo(() => {
    const d = new Date(today)
    d.setDate(d.getDate() + weekOffset * 7)
    return getWeekKey(d.toISOString().split('T')[0])
  }, [today, weekOffset])

  const weekDates = getWeekDates(currentWeekKey)
  const weekRange = getWeekRange(currentWeekKey)
  const isCurrentWeek = weekOffset === 0

  const existing = reflections?.[currentWeekKey] || {}
  const [good, setGood] = useState(existing.good || '')
  const [improve, setImprove] = useState(existing.improve || '')
  const [goals, setGoals] = useState(existing.goals || '')
  const [saved, setSaved] = useState(!!existing.good)

  // Load when week changes
  useMemo(() => {
    const e = reflections?.[currentWeekKey] || {}
    setGood(e.good || '')
    setImprove(e.improve || '')
    setGoals(e.goals || '')
    setSaved(!!e.good)
  }, [currentWeekKey, reflections])

  const autoSummary = useMemo(() => generateAutoSummary(data, weekDates), [data, weekDates])

  const saveReflection = () => {
    setReflections(prev => ({
      ...prev,
      [currentWeekKey]: { good, improve, goals, savedAt: new Date().toISOString() }
    }))
    setSaved(true)
  }

  const deleteReflection = () => {
    setReflections(prev => {
      const copy = { ...prev }
      delete copy[currentWeekKey]
      return copy
    })
    setGood(''); setImprove(''); setGoals(''); setSaved(false)
  }

  const textareaStyle = {
    width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)', padding: '10px 12px', color: 'var(--text-primary)',
    fontSize: 13, outline: 'none', resize: 'vertical', lineHeight: 1.5,
    fontFamily: 'var(--font-main)', boxSizing: 'border-box',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Week Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={() => setWeekOffset(o => o - 1)} style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)', width: 32, height: 32,
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        }}>
          <ChevronLeft size={16} color="var(--text-secondary)" />
        </button>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 15, fontWeight: 500, margin: 0 }}>KW {weekRange}</p>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '2px 0 0' }}>
            {isCurrentWeek ? 'Diese Woche' : `${Math.abs(weekOffset)} Woche${Math.abs(weekOffset) > 1 ? 'n' : ''} ${weekOffset < 0 ? 'zurueck' : 'voraus'}`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {weekOffset !== 0 && (
            <button onClick={() => setWeekOffset(0)} style={{
              background: 'none', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
              padding: '6px 10px', color: 'var(--text-secondary)', fontSize: 11, cursor: 'pointer',
              fontFamily: 'var(--font-main)',
            }}>Heute</button>
          )}
          <button onClick={() => setWeekOffset(o => Math.min(0, o + 1))} disabled={weekOffset >= 0} style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)', width: 32, height: 32,
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            opacity: weekOffset >= 0 ? 0.3 : 1,
          }}>
            <ChevronRight size={16} color="var(--text-secondary)" />
          </button>
        </div>
      </div>

      {/* Auto Summary */}
      <Card>
        <CardHeader icon={<BookOpen size={16} />} title="Wochen-Zusammenfassung" color="var(--teal)" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 12 }}>
          {[
            { label: 'Habits', value: `${autoSummary.habitPct}%`, color: autoSummary.habitPct >= 70 ? 'var(--teal)' : 'var(--amber)' },
            { label: 'Schlaf', value: autoSummary.avgSleep > 0 ? `${autoSummary.avgSleep}h` : '--', color: 'var(--blue)' },
            { label: 'Workouts', value: autoSummary.weekWorkouts, color: 'var(--coral)' },
            { label: 'Bewertung', value: autoSummary.habitPct >= 80 ? 'Stark' : autoSummary.habitPct >= 60 ? 'Solide' : 'Schwach', color: autoSummary.habitPct >= 80 ? 'var(--teal)' : autoSummary.habitPct >= 60 ? 'var(--amber)' : 'var(--coral)' },
          ].map(s => (
            <div key={s.label} style={{ padding: '8px', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
              <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>{s.label}</p>
              <p style={{ fontSize: 16, fontWeight: 600, color: s.color, fontFamily: 'var(--font-mono)', margin: '2px 0 0' }}>{s.value}</p>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {autoSummary.lines.map((line, i) => (
            <p key={i} style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0, padding: '3px 0' }}>{line}</p>
          ))}
        </div>
        <p style={{ fontSize: 13, fontWeight: 500, color: autoSummary.habitPct >= 80 ? 'var(--teal)' : autoSummary.habitPct >= 60 ? 'var(--amber)' : 'var(--coral)', marginTop: 8 }}>
          {autoSummary.rating}
        </p>
      </Card>

      {/* Reflection Journal */}
      <Card>
        <CardHeader icon={<BookOpen size={16} />} title="Reflexion" color="var(--purple)"
          right={saved && (
            <Trash2 size={13} color="var(--text-muted)" style={{ cursor: 'pointer', opacity: 0.5 }}
              onClick={deleteReflection} />
          )}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ fontSize: 11, color: 'var(--teal)', fontWeight: 500, display: 'block', marginBottom: 6 }}>
              Was lief gut diese Woche?
            </label>
            <textarea value={good} onChange={e => { setGood(e.target.value); setSaved(false) }}
              rows={3} placeholder="Erfolge, Fortschritte, positive Momente..."
              style={textareaStyle} />
          </div>

          <div>
            <label style={{ fontSize: 11, color: 'var(--amber)', fontWeight: 500, display: 'block', marginBottom: 6 }}>
              Was kann ich verbessern?
            </label>
            <textarea value={improve} onChange={e => { setImprove(e.target.value); setSaved(false) }}
              rows={3} placeholder="Herausforderungen, Hindernisse, Learnings..."
              style={textareaStyle} />
          </div>

          <div>
            <label style={{ fontSize: 11, color: 'var(--purple)', fontWeight: 500, display: 'block', marginBottom: 6 }}>
              Ziele fuer naechste Woche
            </label>
            <textarea value={goals} onChange={e => { setGoals(e.target.value); setSaved(false) }}
              rows={3} placeholder="Konkretes Vorhaben, Fokus-Themen..."
              style={textareaStyle} />
          </div>

          <button onClick={saveReflection} style={{
            background: saved ? 'rgba(93,202,165,0.15)' : 'var(--purple-dim)',
            border: saved ? '1px solid rgba(93,202,165,0.3)' : 'none',
            borderRadius: 'var(--radius-sm)', padding: '10px', color: saved ? 'var(--teal)' : '#fff',
            fontSize: 12, cursor: 'pointer', fontWeight: 500,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}>
            <Save size={14} /> {saved ? 'Gespeichert' : 'Reflexion speichern'}
          </button>
        </div>
      </Card>
    </div>
  )
}
