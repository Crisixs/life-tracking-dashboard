export default function StatsRow({ data, today }) {
  const todosDone = data.todos.filter(t => t.done).length
  const todosTotal = data.todos.length
  const habitsDone = data.habits.filter(h => h.history[today]).length
  const habitsTotal = data.habits.length
  const todaySleep = data.sleep.find(s => s.date === today)
  const todayWorkout = data.workouts.find(w => w.date === today)

  const stats = [
    { label: 'Aufgaben', value: `${todosDone}/${todosTotal}`, color: 'var(--purple)' },
    { label: 'Habits', value: `${habitsDone}/${habitsTotal}`, color: 'var(--teal)' },
    { label: 'Schlaf', value: todaySleep ? `${todaySleep.hours}h` : '—', color: 'var(--blue)' },
    { label: 'Workout', value: todayWorkout ? `${todayWorkout.duration}min` : '—', color: 'var(--coral)' },
  ]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
      {stats.map(s => (
        <div key={s.label} style={{
          background: 'var(--bg-card)', borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border)', padding: '14px 16px',
        }}>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>{s.label}</p>
          <p style={{ fontSize: 24, fontWeight: 600, color: s.color, marginTop: 4, fontFamily: 'var(--font-mono)' }}>{s.value}</p>
        </div>
      ))}
    </div>
  )
}
