import { useMemo } from 'react'
import { TrendingUp, Award, Users } from 'lucide-react'
import Card, { CardHeader } from './Card'

/*
  Deutsche Durchschnittswerte (Quellen: Statistisches Bundesamt Zeitverwendungserhebung 2022, DKV-Report 2025)
  - Schlaf: 8h 20min (18-65 Jährige), ~8h 37min gesamt
  - Sport: 34 Min/Tag (~4h/Woche), nur ~46% treiben regelmäßig Sport
  - Sitzzeit: >10h pro Tag (DKV-Report 2025)
  - Empfehlung WHO: mind. 150 Min moderate Bewegung/Woche
*/
const DE_AVG = {
  sleepHours: 8.3,       // 18-65 Jährige
  sportMinWeek: 238,     // 34 min/Tag * 7
  sportDaysWeek: 2.5,    // Durchschnitt der aktiven Deutschen
  habitsConsistency: 30, // geschätzt: ~30% halten Gewohnheiten durch
  sitzStunden: 10,       // DKV-Report 2025
}

function CompareBar({ label, yourValue, avgValue, unit, color, higher = 'better' }) {
  const max = Math.max(yourValue, avgValue) * 1.3 || 1
  const yourPct = Math.round((yourValue / max) * 100)
  const avgPct = Math.round((avgValue / max) * 100)
  const diff = yourValue - avgValue
  const diffPct = avgValue > 0 ? Math.round((diff / avgValue) * 100) : 0
  const isBetter = higher === 'better' ? diff > 0 : diff < 0

  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{label}</span>
        <span style={{
          fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 10,
          background: isBetter ? 'rgba(93,202,165,0.15)' : 'rgba(240,153,123,0.15)',
          color: isBetter ? 'var(--teal)' : 'var(--coral)',
        }}>
          {diff > 0 ? '+' : ''}{Math.round(diff * 10) / 10}{unit} ({diff > 0 ? '+' : ''}{diffPct}%)
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 10, color: color, width: 24, textAlign: 'right', fontWeight: 500 }}>Du</span>
          <div style={{ flex: 1, height: 8, background: 'var(--bg-input)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${yourPct}%`, background: color, borderRadius: 4, transition: 'width 0.5s' }} />
          </div>
          <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color, width: 50, fontWeight: 500 }}>
            {Math.round(yourValue * 10) / 10}{unit}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 10, color: 'var(--text-muted)', width: 24, textAlign: 'right' }}>⌀ DE</span>
          <div style={{ flex: 1, height: 8, background: 'var(--bg-input)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${avgPct}%`, background: 'var(--text-muted)', borderRadius: 4, opacity: 0.5 }} />
          </div>
          <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', width: 50 }}>
            {Math.round(avgValue * 10) / 10}{unit}
          </span>
        </div>
      </div>
    </div>
  )
}

export default function GermanComparison({ data, today }) {
  const stats = useMemo(() => {
    // Calculate last 7 days averages
    const last7 = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      return d.toISOString().split('T')[0]
    })

    const sleepEntries = last7.map(d => data.sleep.find(s => s.date === d)?.hours || 0).filter(h => h > 0)
    const avgSleep = sleepEntries.length > 0 ? sleepEntries.reduce((s, h) => s + h, 0) / sleepEntries.length : 0

    const workoutDays = last7.filter(d => data.workouts.find(w => w.date === d)).length
    const totalWorkoutMin = last7.reduce((s, d) => {
      const w = data.workouts.find(w => w.date === d)
      return s + (w?.duration || 0)
    }, 0)

    const habitsDone = last7.reduce((s, d) => {
      const done = data.habits.filter(h => h.history[d]).length
      return s + done
    }, 0)
    const habitsTotal = data.habits.length * 7
    const habitsPct = habitsTotal > 0 ? Math.round((habitsDone / habitsTotal) * 100) : 0

    return { avgSleep, workoutDays, totalWorkoutMin, habitsPct }
  }, [data, today])

  const badges = useMemo(() => {
    const list = []
    if (stats.avgSleep >= 7 && stats.avgSleep <= 9) list.push({ label: 'Optimaler Schläfer', color: 'var(--blue)', icon: '😴' })
    if (stats.workoutDays >= 3) list.push({ label: 'Sportlicher als 54% der Deutschen', color: 'var(--coral)', icon: '💪' })
    if (stats.workoutDays >= 5) list.push({ label: 'Top 15% Fitness', color: 'var(--teal)', icon: '🏆' })
    if (stats.habitsPct >= 80) list.push({ label: 'Gewohnheits-Champion', color: 'var(--purple)', icon: '🔥' })
    if (stats.habitsPct >= 50) list.push({ label: 'Überdurchschnittlich konsistent', color: 'var(--amber)', icon: '⭐' })
    if (stats.totalWorkoutMin > DE_AVG.sportMinWeek) list.push({ label: 'Mehr Bewegung als ⌀ DE', color: 'var(--teal)', icon: '🚀' })
    return list.slice(0, 3)
  }, [stats])

  return (
    <Card>
      <CardHeader icon={<Users size={16} />} title="Du vs. Deutschland ⌀" color="var(--amber)" />

      <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 14 }}>
        Dein 7-Tage-Durchschnitt vs. deutscher Durchschnitt (Statistisches Bundesamt 2022, DKV-Report 2025)
      </p>

      <CompareBar label="Schlaf pro Nacht" yourValue={stats.avgSleep} avgValue={DE_AVG.sleepHours}
        unit="h" color="var(--blue)" higher="neutral" />

      <CompareBar label="Workout-Tage / Woche" yourValue={stats.workoutDays} avgValue={DE_AVG.sportDaysWeek}
        unit=" T" color="var(--coral)" higher="better" />

      <CompareBar label="Workout-Minuten / Woche" yourValue={stats.totalWorkoutMin} avgValue={DE_AVG.sportMinWeek}
        unit="m" color="var(--coral)" higher="better" />

      <CompareBar label="Gewohnheiten-Konsistenz" yourValue={stats.habitsPct} avgValue={DE_AVG.habitsConsistency}
        unit="%" color="var(--purple)" higher="better" />

      {/* Achievement Badges */}
      {badges.length > 0 && (
        <div style={{ marginTop: 10, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <Award size={13} color="var(--amber)" />
            <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Auszeichnungen</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {badges.map(b => (
              <span key={b.label} style={{
                fontSize: 11, padding: '4px 10px', borderRadius: 12,
                background: `${b.color}15`, color: b.color, fontWeight: 500,
              }}>
                {b.icon} {b.label}
              </span>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}
