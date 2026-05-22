import { useState } from 'react'
import { Dumbbell, Plus, X, Trash2, Check, Calendar, ChevronDown, ChevronUp } from 'lucide-react'
import Card, { CardHeader } from './Card'

const WEEKDAYS = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag']
const SHORT_DAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']

function getWeekday(dateStr) {
  const d = new Date(dateStr)
  const jsDay = d.getDay()
  return WEEKDAYS[jsDay === 0 ? 6 : jsDay - 1]
}

export default function TrainingPlan({ plan, setPlan, log, setLog, today }) {
  const [editDay, setEditDay] = useState(null)
  const [exercise, setExercise] = useState('')
  const [sets, setSets] = useState('3')
  const [reps, setReps] = useState('10')
  const [weight, setWeight] = useState('')
  const [expandedDay, setExpandedDay] = useState(getWeekday(today))
  const [showWeekLog, setShowWeekLog] = useState(false)

  const currentWeekday = getWeekday(today)

  const addExercise = (day) => {
    if (!exercise.trim()) return
    const ex = { name: exercise.trim(), sets: parseInt(sets) || 0, reps: parseInt(reps) || 0, weight: weight ? parseFloat(weight) : null }
    setPlan(prev => ({
      ...prev,
      [day]: { ...prev[day], exercises: [...(prev[day]?.exercises || []), ex] }
    }))
    setExercise('')
    setWeight('')
  }

  const removeExercise = (day, idx) => {
    setPlan(prev => ({
      ...prev,
      [day]: { ...prev[day], exercises: prev[day].exercises.filter((_, i) => i !== idx) }
    }))
  }

  const toggleRest = (day) => {
    setPlan(prev => ({
      ...prev,
      [day]: { ...prev[day], isRest: !prev[day]?.isRest, exercises: prev[day]?.isRest ? prev[day].exercises : [] }
    }))
  }

  const markDayCompleted = (date) => {
    setLog(prev => ({
      ...prev,
      [date]: { ...prev?.[date], completed: !prev?.[date]?.completed }
    }))
  }

  // Nachträgliches eintragen: markiere Training von anderem Tag als erledigt
  const swapTraining = (missedDate, doneDate) => {
    setLog(prev => ({
      ...prev,
      [missedDate]: { ...prev?.[missedDate], swappedTo: doneDate },
      [doneDate]: { ...prev?.[doneDate], swappedFrom: missedDate, completed: true }
    }))
  }

  // Get this week's dates
  const getWeekDates = () => {
    const d = new Date(today)
    const jsDay = d.getDay()
    const mondayOffset = jsDay === 0 ? -6 : 1 - jsDay
    return WEEKDAYS.map((_, i) => {
      const date = new Date(d)
      date.setDate(d.getDate() + mondayOffset + i)
      return date.toISOString().split('T')[0]
    })
  }
  const weekDates = getWeekDates()

  const inputStyle = {
    background: 'var(--bg-input)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)', padding: '8px 10px', color: 'var(--text-primary)',
    fontSize: 13, outline: 'none', width: '100%',
  }

  // Week overview - compact
  const totalPlanned = WEEKDAYS.filter(d => !plan[d]?.isRest && plan[d]?.exercises?.length > 0).length
  const completedThisWeek = weekDates.filter(d => log?.[d]?.completed).length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Week Overview */}
      <Card>
        <CardHeader icon={<Calendar size={16} />} title="Wochenübersicht" color="var(--coral)" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, marginBottom: 12 }}>
          {WEEKDAYS.map((day, i) => {
            const date = weekDates[i]
            const isToday = date === today
            const isPast = date < today
            const dayPlan = plan[day]
            const isRest = dayPlan?.isRest
            const hasExercises = dayPlan?.exercises?.length > 0
            const completed = log?.[date]?.completed
            const swapped = log?.[date]?.swappedTo

            return (
              <button key={day} onClick={() => setExpandedDay(expandedDay === day ? null : day)} style={{
                padding: '8px 4px', borderRadius: 'var(--radius-md)', textAlign: 'center',
                border: isToday ? '1.5px solid var(--purple)' : '1px solid var(--border)',
                background: completed ? 'rgba(93,202,165,0.1)' : swapped ? 'rgba(239,159,39,0.1)' : 'var(--bg-input)',
                cursor: 'pointer', fontFamily: 'var(--font-main)',
              }}>
                <p style={{ fontSize: 11, color: isToday ? 'var(--purple)' : 'var(--text-muted)', fontWeight: isToday ? 500 : 400 }}>
                  {SHORT_DAYS[i]}
                </p>
                <p style={{ fontSize: 16, marginTop: 2 }}>
                  {completed ? '✅' : isRest ? '🧘' : swapped ? '↔️' : hasExercises ? '🏋️' : '—'}
                </p>
                {isPast && hasExercises && !isRest && !completed && !swapped && (
                  <p style={{ fontSize: 8, color: 'var(--coral)', marginTop: 2 }}>verpasst</p>
                )}
              </button>
            )
          })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-secondary)' }}>
          <span>{completedThisWeek}/{totalPlanned} Trainings erledigt</span>
          <span style={{ color: completedThisWeek >= totalPlanned && totalPlanned > 0 ? 'var(--teal)' : 'var(--text-muted)' }}>
            {totalPlanned > 0 ? Math.round(completedThisWeek / totalPlanned * 100) : 0}%
          </span>
        </div>
      </Card>

      {/* Day Plans */}
      {WEEKDAYS.map((day, i) => {
        const dayPlan = plan[day] || { exercises: [], isRest: false }
        const isExpanded = expandedDay === day
        const date = weekDates[i]
        const isToday = day === currentWeekday
        const isPast = date < today
        const completed = log?.[date]?.completed

        return (
          <Card key={day} style={{ borderColor: isToday ? 'rgba(127,119,221,0.3)' : undefined }}>
            <div
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
              onClick={() => setExpandedDay(isExpanded ? null : day)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 14, fontWeight: 500, color: isToday ? 'var(--purple)' : 'var(--text-primary)' }}>
                  {day} {isToday && <span style={{ fontSize: 11, color: 'var(--purple)' }}>(heute)</span>}
                </span>
                {dayPlan.isRest && <span style={{ fontSize: 11, color: 'var(--blue)', background: 'rgba(133,183,235,0.15)', padding: '2px 8px', borderRadius: 10 }}>Ruhetag</span>}
                {completed && <span style={{ fontSize: 11, color: 'var(--teal)', background: 'rgba(93,202,165,0.15)', padding: '2px 8px', borderRadius: 10 }}>Erledigt</span>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{dayPlan.exercises?.length || 0} Übungen</span>
                {isExpanded ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
              </div>
            </div>

            {isExpanded && (
              <div style={{ marginTop: 14 }}>
                {/* Rest day toggle */}
                <button onClick={() => toggleRest(day)} style={{
                  padding: '6px 12px', borderRadius: 'var(--radius-sm)', fontSize: 11,
                  border: dayPlan.isRest ? '1.5px solid var(--blue)' : '1px solid var(--border)',
                  background: dayPlan.isRest ? 'rgba(133,183,235,0.12)' : 'transparent',
                  color: dayPlan.isRest ? 'var(--blue)' : 'var(--text-secondary)',
                  cursor: 'pointer', marginBottom: 10, fontFamily: 'var(--font-main)',
                }}>
                  {dayPlan.isRest ? '🧘 Ruhetag (klick zum Ändern)' : '🧘 Als Ruhetag markieren'}
                </button>

                {!dayPlan.isRest && (
                  <>
                    {/* Exercises list */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 10 }}>
                      {dayPlan.exercises?.map((ex, idx) => (
                        <div key={idx} style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          padding: '8px 12px', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)',
                        }}>
                          <span style={{ fontSize: 13 }}>{ex.name}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 12, color: 'var(--coral)', fontFamily: 'var(--font-mono)' }}>
                              {ex.sets}×{ex.reps}{ex.weight ? ` · ${ex.weight}kg` : ''}
                            </span>
                            <Trash2 size={12} color="var(--text-muted)" style={{ cursor: 'pointer' }} onClick={() => removeExercise(day, idx)} />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Add exercise */}
                    {editDay === day ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <input value={exercise} onChange={e => setExercise(e.target.value)} placeholder="Übung..."
                          autoFocus onKeyDown={e => e.key === 'Enter' && addExercise(day)} style={inputStyle} />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
                          <div>
                            <label style={{ fontSize: 10, color: 'var(--text-muted)' }}>Sets</label>
                            <input value={sets} onChange={e => setSets(e.target.value)} type="number" style={inputStyle} />
                          </div>
                          <div>
                            <label style={{ fontSize: 10, color: 'var(--text-muted)' }}>Reps</label>
                            <input value={reps} onChange={e => setReps(e.target.value)} type="number" style={inputStyle} />
                          </div>
                          <div>
                            <label style={{ fontSize: 10, color: 'var(--text-muted)' }}>kg</label>
                            <input value={weight} onChange={e => setWeight(e.target.value)} type="number" placeholder="—" style={inputStyle} />
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => { addExercise(day) }} style={{
                            flex: 1, background: 'var(--coral-dim)', border: 'none', borderRadius: 'var(--radius-sm)',
                            padding: '8px', color: '#fff', fontSize: 12, cursor: 'pointer', fontWeight: 500,
                          }}>Hinzufügen</button>
                          <button onClick={() => setEditDay(null)} style={{
                            background: 'transparent', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                            padding: '8px 14px', color: 'var(--text-secondary)', fontSize: 12, cursor: 'pointer',
                          }}>Fertig</button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => { setEditDay(day); setExercise(''); setWeight('') }} style={{
                        width: '100%', padding: '8px', borderRadius: 'var(--radius-sm)',
                        border: '1px dashed var(--border)', background: 'transparent',
                        color: 'var(--text-secondary)', fontSize: 12, cursor: 'pointer',
                        fontFamily: 'var(--font-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                      }}>
                        <Plus size={14} /> Übung hinzufügen
                      </button>
                    )}
                  </>
                )}

                {/* Mark completed / swap for past days */}
                {(isPast || isToday) && dayPlan.exercises?.length > 0 && !dayPlan.isRest && (
                  <div style={{ marginTop: 10, display: 'flex', gap: 6 }}>
                    <button onClick={() => markDayCompleted(date)} style={{
                      flex: 1, padding: '7px', borderRadius: 'var(--radius-sm)', fontSize: 11,
                      border: completed ? '1.5px solid var(--teal)' : '1px solid var(--border)',
                      background: completed ? 'rgba(93,202,165,0.12)' : 'transparent',
                      color: completed ? 'var(--teal)' : 'var(--text-secondary)',
                      cursor: 'pointer', fontFamily: 'var(--font-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                    }}>
                      <Check size={12} /> {completed ? 'Erledigt ✓' : 'Als erledigt markieren'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </Card>
        )
      })}
    </div>
  )
}
