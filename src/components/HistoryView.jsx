import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Moon, Flame, Dumbbell, CheckSquare, Target } from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
} from 'recharts'
import Card from './Card'

const VIEWS = ['tag', 'woche', 'monat']
const VIEW_LABELS = { tag: 'Tag', woche: 'Woche', monat: 'Monat' }

function fmt(date) { return date.toISOString().split('T')[0] }
function fmtShort(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })
}
function fmtWeekday(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('de-DE', { weekday: 'short' })
}
function fmtFull(dateStr) {
  return new Date(dateStr).toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

function getDaysInRange(start, end) {
  const days = []
  const d = new Date(start)
  const e = new Date(end)
  while (d <= e) {
    days.push(fmt(d))
    d.setDate(d.getDate() + 1)
  }
  return days
}

function getWeekStart(date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  return fmt(d)
}

function getMonthStart(date) {
  const d = new Date(date)
  return fmt(new Date(d.getFullYear(), d.getMonth(), 1))
}

function getMonthEnd(date) {
  const d = new Date(date)
  return fmt(new Date(d.getFullYear(), d.getMonth() + 1, 0))
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: '#1c1c35', border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 8, padding: '10px 14px', fontSize: 12,
    }}>
      <p style={{ color: '#8888aa', marginBottom: 4 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, fontWeight: 500 }}>
          {p.name}: {typeof p.value === 'number' ? Math.round(p.value * 10) / 10 : p.value}
        </p>
      ))}
    </div>
  )
}

/* ─── Day Detail View ─── */
function DayDetail({ date, data }) {
  const dateStr = date
  const sleep = data.sleep.find(s => s.date === dateStr)
  const workout = data.workouts.find(w => w.date === dateStr)
  const habitsDone = data.habits.filter(h => h.history[dateStr]).map(h => h.name)
  const habitsMissed = data.habits.filter(h => !h.history[dateStr]).map(h => h.name)

  return (
    <div>
      <h3 style={{ fontSize: 16, fontWeight: 500, marginBottom: 16, color: 'var(--text-primary)' }}>
        {fmtFull(dateStr)}
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {/* Sleep */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Moon size={15} color="var(--blue)" />
            <span style={{ fontSize: 14, fontWeight: 500 }}>Schlaf</span>
          </div>
          {sleep ? (
            <>
              <p style={{ fontSize: 28, fontWeight: 600, color: 'var(--blue)', fontFamily: 'var(--font-mono)' }}>{sleep.hours}h</p>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>{sleep.bedtime} → {sleep.wakeup}</p>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                Qualität: {sleep.quality === 'great' ? 'Super' : sleep.quality === 'good' ? 'Gut' : sleep.quality === 'ok' ? 'Okay' : 'Schlecht'}
              </p>
            </>
          ) : <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Keine Daten</p>}
        </Card>

        {/* Workout */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Dumbbell size={15} color="var(--coral)" />
            <span style={{ fontSize: 14, fontWeight: 500 }}>Workout</span>
          </div>
          {workout ? (
            <>
              <p style={{ fontSize: 28, fontWeight: 600, color: 'var(--coral)', fontFamily: 'var(--font-mono)' }}>{workout.duration}min</p>
              <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                {workout.exercises.map(ex => (
                  <div key={ex.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-secondary)' }}>
                    <span>{ex.name}</span>
                    <span style={{ color: 'var(--coral)', fontFamily: 'var(--font-mono)' }}>{ex.sets}×{ex.reps}{ex.weight ? ` · ${ex.weight}kg` : ''}</span>
                  </div>
                ))}
              </div>
            </>
          ) : <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Kein Workout</p>}
        </Card>

        {/* Habits */}
        <Card style={{ gridColumn: 'span 2' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Flame size={15} color="var(--teal)" />
            <span style={{ fontSize: 14, fontWeight: 500 }}>Gewohnheiten</span>
            <span style={{ fontSize: 12, color: 'var(--teal)', fontFamily: 'var(--font-mono)', marginLeft: 'auto' }}>
              {habitsDone.length}/{data.habits.length}
            </span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {habitsDone.map(h => (
              <span key={h} style={{
                fontSize: 12, padding: '4px 12px', borderRadius: 20,
                background: 'rgba(93,202,165,0.15)', color: 'var(--teal)',
              }}>✓ {h}</span>
            ))}
            {habitsMissed.map(h => (
              <span key={h} style={{
                fontSize: 12, padding: '4px 12px', borderRadius: 20,
                background: 'rgba(136,136,170,0.1)', color: 'var(--text-muted)',
              }}>✗ {h}</span>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

/* ─── Main History View ─── */
export default function HistoryView({ data }) {
  const [view, setView] = useState('woche')
  const [offset, setOffset] = useState(0)
  const [selectedDay, setSelectedDay] = useState(null)

  const today = new Date()

  const { rangeLabel, days } = useMemo(() => {
    const ref = new Date(today)

    if (view === 'tag') {
      ref.setDate(ref.getDate() + offset)
      return { rangeLabel: fmtFull(fmt(ref)), days: [fmt(ref)] }
    }

    if (view === 'woche') {
      const weekRef = new Date(today)
      weekRef.setDate(weekRef.getDate() + offset * 7)
      const ws = getWeekStart(fmt(weekRef))
      const we = new Date(ws)
      we.setDate(we.getDate() + 6)
      const days = getDaysInRange(ws, fmt(we))
      return {
        rangeLabel: `${fmtShort(ws)} – ${fmtShort(fmt(we))}`,
        days,
      }
    }

    // monat
    const monthRef = new Date(today.getFullYear(), today.getMonth() + offset, 1)
    const ms = getMonthStart(fmt(monthRef))
    const me = getMonthEnd(fmt(monthRef))
    return {
      rangeLabel: new Date(ms).toLocaleDateString('de-DE', { month: 'long', year: 'numeric' }),
      days: getDaysInRange(ms, me),
    }
  }, [view, offset])

  // Build chart data
  const chartData = useMemo(() => {
    return days.map(d => {
      const sleep = data.sleep.find(s => s.date === d)
      const workout = data.workouts.find(w => w.date === d)
      const habitsDone = data.habits.filter(h => h.history[d]).length
      return {
        date: d,
        label: view === 'monat' ? new Date(d).getDate().toString() : fmtWeekday(d),
        schlaf: sleep?.hours || 0,
        workout: workout?.duration || 0,
        habits: habitsDone,
        habitsTotal: data.habits.length,
        habitsPct: data.habits.length > 0 ? Math.round((habitsDone / data.habits.length) * 100) : 0,
      }
    })
  }, [days, data])

  const avgSleep = chartData.filter(d => d.schlaf > 0).length > 0
    ? Math.round(chartData.filter(d => d.schlaf > 0).reduce((s, d) => s + d.schlaf, 0) / chartData.filter(d => d.schlaf > 0).length * 10) / 10
    : 0
  const totalWorkouts = chartData.filter(d => d.workout > 0).length
  const avgHabits = chartData.length > 0
    ? Math.round(chartData.reduce((s, d) => s + d.habitsPct, 0) / chartData.length)
    : 0

  if (selectedDay) {
    return (
      <div>
        <button onClick={() => setSelectedDay(null)} style={{
          background: 'none', border: 'none', color: 'var(--purple)',
          cursor: 'pointer', fontSize: 13, fontFamily: 'var(--font-main)',
          display: 'flex', alignItems: 'center', gap: 4, marginBottom: 16, padding: 0,
        }}>
          <ChevronLeft size={16} /> Zurück zum Verlauf
        </button>
        <DayDetail date={selectedDay} data={data} />
      </div>
    )
  }

  return (
    <div>
      {/* View Switcher */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{
          display: 'flex', gap: 2, background: 'var(--bg-card)',
          borderRadius: 'var(--radius-sm)', padding: 3, border: '1px solid var(--border)',
        }}>
          {VIEWS.map(v => (
            <button key={v} onClick={() => { setView(v); setOffset(0) }} style={{
              padding: '6px 16px', borderRadius: 'var(--radius-sm)', border: 'none',
              fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-main)',
              background: view === v ? 'var(--purple-dim)' : 'transparent',
              color: view === v ? '#fff' : 'var(--text-secondary)',
              transition: 'all 0.2s',
            }}>
              {VIEW_LABELS[v]}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => setOffset(o => o - 1)} style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)', width: 30, height: 30,
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}>
            <ChevronLeft size={16} color="var(--text-secondary)" />
          </button>
          <span style={{ fontSize: 13, fontWeight: 500, minWidth: 160, textAlign: 'center' }}>{rangeLabel}</span>
          <button onClick={() => setOffset(o => Math.min(0, o + 1))} style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)', width: 30, height: 30,
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            opacity: offset >= 0 ? 0.3 : 1,
          }} disabled={offset >= 0}>
            <ChevronRight size={16} color="var(--text-secondary)" />
          </button>
          {offset !== 0 && (
            <button onClick={() => setOffset(0)} style={{
              background: 'none', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)', padding: '4px 10px',
              color: 'var(--text-secondary)', fontSize: 11, cursor: 'pointer',
              fontFamily: 'var(--font-main)',
            }}>Heute</button>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
        <div style={{
          background: 'var(--bg-card)', borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border)', padding: '14px 16px',
        }}>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>⌀ Schlaf</p>
          <p style={{ fontSize: 22, fontWeight: 600, color: 'var(--blue)', marginTop: 4, fontFamily: 'var(--font-mono)' }}>
            {avgSleep > 0 ? `${avgSleep}h` : '—'}
          </p>
        </div>
        <div style={{
          background: 'var(--bg-card)', borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border)', padding: '14px 16px',
        }}>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Workouts</p>
          <p style={{ fontSize: 22, fontWeight: 600, color: 'var(--coral)', marginTop: 4, fontFamily: 'var(--font-mono)' }}>
            {totalWorkouts > 0 ? totalWorkouts : '—'}
          </p>
        </div>
        <div style={{
          background: 'var(--bg-card)', borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border)', padding: '14px 16px',
        }}>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>⌀ Habits</p>
          <p style={{ fontSize: 22, fontWeight: 600, color: 'var(--teal)', marginTop: 4, fontFamily: 'var(--font-mono)' }}>
            {avgHabits > 0 ? `${avgHabits}%` : '—'}
          </p>
        </div>
      </div>

      {/* Day view just shows detail */}
      {view === 'tag' && (
        <DayDetail date={days[0]} data={data} />
      )}

      {/* Week & Month Charts */}
      {view !== 'tag' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Sleep Chart */}
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Moon size={15} color="var(--blue)" />
              <span style={{ fontSize: 14, fontWeight: 500 }}>Schlaf</span>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="sleepGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#85B7EB" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#85B7EB" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="label" tick={{ fill: '#8888aa', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 12]} tick={{ fill: '#8888aa', fontSize: 11 }} axisLine={false} tickLine={false} width={30} />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={data.sleepGoal || 8} stroke="#5DCAA5" strokeDasharray="6 4" strokeWidth={1.5} label={{ value: `Ziel ${data.sleepGoal || 8}h`, fill: '#5DCAA5', fontSize: 10, position: 'right' }} />
                <Area type="monotone" dataKey="schlaf" name="Schlaf (h)" stroke="#85B7EB" strokeWidth={2} fill="url(#sleepGrad)" dot={{ fill: '#85B7EB', r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          {/* Workout Chart */}
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Dumbbell size={15} color="var(--coral)" />
              <span style={{ fontSize: 14, fontWeight: 500 }}>Workout (Minuten)</span>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="label" tick={{ fill: '#8888aa', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#8888aa', fontSize: 11 }} axisLine={false} tickLine={false} width={30} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="workout" name="Dauer (min)" fill="#F0997B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Habits Chart */}
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Flame size={15} color="var(--teal)" />
              <span style={{ fontSize: 14, fontWeight: 500 }}>Gewohnheiten (%)</span>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="label" tick={{ fill: '#8888aa', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: '#8888aa', fontSize: 11 }} axisLine={false} tickLine={false} width={30} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="habitsPct" name="Erledigt (%)" fill="#5DCAA5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Clickable Day Grid */}
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <CheckSquare size={15} color="var(--purple)" />
              <span style={{ fontSize: 14, fontWeight: 500 }}>Tage im Detail</span>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: view === 'monat' ? 'repeat(7, 1fr)' : `repeat(${days.length}, 1fr)`,
              gap: 4,
            }}>
              {view === 'monat' && ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map(d => (
                <div key={d} style={{ fontSize: 10, color: 'var(--text-muted)', textAlign: 'center', padding: '4px 0' }}>{d}</div>
              ))}
              {view === 'monat' && (() => {
                const firstDay = new Date(days[0])
                let dayOfWeek = firstDay.getDay()
                dayOfWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1
                return Array.from({ length: dayOfWeek }, (_, i) => <div key={`empty-${i}`} />)
              })()}
              {days.map(d => {
                const cd = chartData.find(c => c.date === d)
                const hasData = cd && (cd.schlaf > 0 || cd.workout > 0 || cd.habits > 0)
                const allHabits = cd && cd.habits === cd.habitsTotal && cd.habitsTotal > 0
                const isToday = d === fmt(new Date())
                return (
                  <button key={d} onClick={() => setSelectedDay(d)} style={{
                    padding: view === 'monat' ? '6px 2px' : '10px 4px',
                    borderRadius: 'var(--radius-sm)',
                    border: isToday ? '1.5px solid var(--purple)' : '1px solid var(--border)',
                    background: allHabits ? 'rgba(93,202,165,0.12)' : hasData ? 'rgba(127,119,221,0.08)' : 'var(--bg-input)',
                    cursor: 'pointer', textAlign: 'center', fontFamily: 'var(--font-main)',
                    transition: 'all 0.15s',
                  }}>
                    <p style={{ fontSize: view === 'monat' ? 12 : 11, color: 'var(--text-muted)', margin: 0 }}>
                      {view === 'monat' ? new Date(d).getDate() : fmtWeekday(d)}
                    </p>
                    {view !== 'monat' && (
                      <p style={{ fontSize: 10, color: 'var(--text-muted)', margin: '2px 0 0' }}>{fmtShort(d)}</p>
                    )}
                    {hasData && (
                      <div style={{ display: 'flex', justifyContent: 'center', gap: 3, marginTop: 4 }}>
                        {cd.schlaf > 0 && <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--blue)' }} />}
                        {cd.workout > 0 && <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--coral)' }} />}
                        {cd.habits > 0 && <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--teal)' }} />}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
            <div style={{ display: 'flex', gap: 16, marginTop: 12, justifyContent: 'center' }}>
              {[
                { color: 'var(--blue)', label: 'Schlaf' },
                { color: 'var(--coral)', label: 'Workout' },
                { color: 'var(--teal)', label: 'Habits' },
              ].map(l => (
                <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: l.color }} />
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{l.label}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
