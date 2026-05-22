import { useState } from 'react'
import { Dumbbell, Plus, X, Trash2, Check, Calendar } from 'lucide-react'
import Card, { CardHeader } from './Card'

const WEEKDAYS = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag']

function getWeekday(dateStr) {
  const d = new Date(dateStr)
  const jsDay = d.getDay()
  return WEEKDAYS[jsDay === 0 ? 6 : jsDay - 1]
}

export default function WorkoutTracker({ workouts, setWorkouts, today, trainingPlan, trainingLog, setTrainingLog }) {
  const [showAdd, setShowAdd] = useState(false)
  const [exercise, setExercise] = useState('')
  const [sets, setSets] = useState('3')
  const [reps, setReps] = useState('10')
  const [weight, setWeight] = useState('')
  const [selectedDate, setSelectedDate] = useState(today)

  const weekday = getWeekday(today)
  const plannedToday = trainingPlan?.[weekday]
  const isRestDay = plannedToday?.isRest
  const plannedExercises = plannedToday?.exercises || []
  const todayCompleted = trainingLog?.[today]?.completed || false

  // Check if training was done on a different day
  const todaySwappedTo = trainingLog?.[today]?.swappedTo
  const todaySwappedFrom = trainingLog?.[today]?.swappedFrom

  const todayWorkout = workouts.find(w => w.date === selectedDate)
  const exercises = todayWorkout?.exercises || []

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    return d.toISOString().split('T')[0]
  })

  const addExercise = () => {
    if (!exercise.trim()) return
    const newEx = {
      id: Date.now(), name: exercise.trim(),
      sets: parseInt(sets) || 0, reps: parseInt(reps) || 0,
      weight: weight ? parseFloat(weight) : null,
    }
    if (workouts.find(w => w.date === selectedDate)) {
      setWorkouts(prev => prev.map(w =>
        w.date === selectedDate ? { ...w, exercises: [...w.exercises, newEx], duration: w.duration + 10 } : w
      ))
    } else {
      setWorkouts(prev => [...prev, { date: selectedDate, exercises: [newEx], duration: 10 }])
    }
    setExercise('')
    setWeight('')
  }

  const removeExercise = exId => {
    setWorkouts(prev => prev.map(w => {
      if (w.date !== selectedDate) return w
      const filtered = w.exercises.filter(e => e.id !== exId)
      return filtered.length ? { ...w, exercises: filtered, duration: Math.max(0, w.duration - 10) } : null
    }).filter(Boolean))
  }

  const markCompleted = (date) => {
    setTrainingLog(prev => ({
      ...prev,
      [date]: { ...prev?.[date], completed: !prev?.[date]?.completed }
    }))
  }

  const markSwapped = (fromDate, toDate) => {
    setTrainingLog(prev => ({
      ...prev,
      [fromDate]: { ...prev?.[fromDate], swappedTo: toDate },
      [toDate]: { ...prev?.[toDate], swappedFrom: fromDate, completed: true },
    }))
  }

  const inputStyle = {
    background: 'var(--bg-input)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)', padding: '8px 10px', color: 'var(--text-primary)',
    fontSize: 13, outline: 'none', width: '100%',
  }

  return (
    <Card>
      <CardHeader
        icon={<Dumbbell size={16} />}
        title="Workout"
        color="var(--coral)"
        right={
          <div style={{ display: 'flex', gap: 4 }}>
            {plannedExercises.length > 0 && !isRestDay && (
              <button onClick={() => markCompleted(today)} style={{
                height: 26, borderRadius: 'var(--radius-sm)', padding: '0 8px',
                border: todayCompleted ? '1.5px solid var(--teal)' : '1px solid var(--border)',
                background: todayCompleted ? 'rgba(93,202,165,0.15)' : 'transparent',
                display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer',
                fontSize: 11, color: todayCompleted ? 'var(--teal)' : 'var(--text-secondary)',
                fontFamily: 'var(--font-main)',
              }}>
                <Check size={12} /> {todayCompleted ? 'Erledigt' : 'Abhaken'}
              </button>
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

      {/* Show planned workout for today */}
      {plannedExercises.length > 0 && !isRestDay && (
        <div style={{ marginBottom: 12 }}>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Plan: {weekday}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {plannedExercises.map((ex, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', padding: '6px 10px',
                background: todayCompleted ? 'rgba(93,202,165,0.08)' : 'var(--bg-input)',
                borderRadius: 'var(--radius-sm)', fontSize: 12,
              }}>
                <span style={{ color: todayCompleted ? 'var(--teal)' : 'var(--text-primary)' }}>{ex.name}</span>
                <span style={{ color: 'var(--coral)', fontFamily: 'var(--font-mono)' }}>
                  {ex.sets}×{ex.reps}{ex.weight ? ` · ${ex.weight}kg` : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {isRestDay && (
        <div style={{
          padding: '12px', background: 'rgba(133,183,235,0.08)', borderRadius: 'var(--radius-sm)',
          marginBottom: 12, textAlign: 'center',
        }}>
          <p style={{ fontSize: 13, color: 'var(--blue)' }}>🧘 Ruhetag – Regeneration</p>
        </div>
      )}

      {showAdd && (
        <div style={{ marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div>
            <label style={{ fontSize: 10, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Datum</label>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {last7Days.map(d => {
                const dayLabel = d === today ? 'Heute' : new Date(d).toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit' })
                return (
                  <button key={d} onClick={() => setSelectedDate(d)} style={{
                    padding: '4px 8px', borderRadius: 'var(--radius-sm)', fontSize: 11,
                    border: selectedDate === d ? '1.5px solid var(--coral)' : '1px solid var(--border)',
                    background: selectedDate === d ? 'rgba(240,153,123,0.15)' : 'var(--bg-input)',
                    color: selectedDate === d ? 'var(--coral)' : 'var(--text-secondary)',
                    cursor: 'pointer', fontFamily: 'var(--font-main)',
                  }}>{dayLabel}</button>
                )
              })}
            </div>
          </div>
          <input value={exercise} onChange={e => setExercise(e.target.value)} placeholder="Übung..."
            onKeyDown={e => e.key === 'Enter' && addExercise()} style={inputStyle} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
            <div>
              <label style={{ fontSize: 10, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Sets</label>
              <input value={sets} onChange={e => setSets(e.target.value)} type="number" style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: 10, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Reps</label>
              <input value={reps} onChange={e => setReps(e.target.value)} type="number" style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: 10, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>kg</label>
              <input value={weight} onChange={e => setWeight(e.target.value)} type="number" placeholder="—" style={inputStyle} />
            </div>
          </div>
          <button onClick={addExercise} style={{
            background: 'var(--coral-dim)', border: 'none', borderRadius: 'var(--radius-sm)',
            padding: '8px', color: '#fff', fontSize: 12, cursor: 'pointer', fontWeight: 500,
          }}>Übung hinzufügen</button>
        </div>
      )}

      {/* Logged exercises for today */}
      {exercises.length > 0 && (
        <>
          {selectedDate !== today && (
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>
              Eingetragen: {new Date(selectedDate).toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit' })}
            </p>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {exercises.map(ex => (
              <div key={ex.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '9px 12px', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)',
              }}>
                <span style={{ fontSize: 13 }}>{ex.name}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 13, color: 'var(--coral)', fontFamily: 'var(--font-mono)', fontWeight: 500 }}>
                    {ex.sets}×{ex.reps}{ex.weight ? ` · ${ex.weight}kg` : ''}
                  </span>
                  <Trash2 size={12} color="var(--text-muted)" style={{ cursor: 'pointer' }} onClick={() => removeExercise(ex.id)} />
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {exercises.length === 0 && plannedExercises.length === 0 && !isRestDay && (
        <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: 20 }}>
          Kein Workout geplant – erstell deinen Plan im Training-Tab! 💪
        </p>
      )}
    </Card>
  )
}
