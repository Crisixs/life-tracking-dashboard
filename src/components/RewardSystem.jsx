import { useState, useMemo } from 'react'
import {
  Trophy, Star, Gift, Plus, X, Trash2, Pencil, Check, Flame,
  Zap, Crown, Medal, Target, ChevronDown, ChevronUp, AlertTriangle,
  TrendingDown, ShieldAlert, SkullIcon,
} from 'lucide-react'
import Card, { CardHeader } from './Card'

/* ─── Coin Earning Rules ─── */
const COIN_RULES = [
  { id: 'todo', label: 'To-Do erledigt', coins: 10, icon: Check, color: 'var(--purple)', type: 'earn' },
  { id: 'todo_high', label: 'To-Do (hohe Prioritaet)', coins: 20, icon: Check, color: 'var(--purple)', type: 'earn' },
  { id: 'habit', label: 'Gewohnheit erfuellt', coins: 15, icon: Flame, color: 'var(--teal)', type: 'earn' },
  { id: 'all_habits', label: 'Alle Habits an einem Tag', coins: 50, icon: Crown, color: 'var(--amber)', type: 'earn' },
  { id: 'workout', label: 'Workout absolviert', coins: 30, icon: Zap, color: 'var(--coral)', type: 'earn' },
  { id: 'sleep_goal', label: 'Schlafziel erreicht', coins: 20, icon: Star, color: 'var(--blue)', type: 'earn' },
  { id: 'streak_3', label: '3-Tage Habit-Streak', coins: 50, icon: Flame, color: 'var(--teal)', type: 'earn' },
  { id: 'streak_7', label: '7-Tage Habit-Streak', coins: 150, icon: Flame, color: 'var(--amber)', type: 'earn' },
  { id: 'streak_14', label: '14-Tage Habit-Streak', coins: 350, icon: Trophy, color: 'var(--amber)', type: 'earn' },
  { id: 'streak_30', label: '30-Tage Habit-Streak', coins: 1000, icon: Crown, color: 'var(--purple)', type: 'earn' },
]

/* ─── Penalty Rules ─── */
const PENALTY_RULES = [
  { id: 'missed_habit', label: 'Habit nicht erfuellt', coins: -10, icon: AlertTriangle, color: 'var(--coral)', type: 'penalty' },
  { id: 'zero_habits', label: 'Kein einziger Habit am Tag', coins: -30, icon: TrendingDown, color: 'var(--red)', type: 'penalty' },
  { id: 'streak_broken', label: 'Streak gebrochen (war 3+)', coins: -50, icon: AlertTriangle, color: 'var(--coral)', type: 'penalty' },
  { id: 'streak_broken_7', label: 'Streak gebrochen (war 7+)', coins: -150, icon: ShieldAlert, color: 'var(--red)', type: 'penalty' },
  { id: 'no_workout_week', label: 'Ganze Woche kein Workout', coins: -40, icon: TrendingDown, color: 'var(--coral)', type: 'penalty' },
  { id: 'bad_sleep', label: 'Schlaf unter 5h', coins: -15, icon: AlertTriangle, color: 'var(--coral)', type: 'penalty' },
  { id: 'relapse', label: 'Rueckfall (manuell)', coins: -100, icon: ShieldAlert, color: 'var(--red)', type: 'penalty' },
]

const ALL_RULES = [...COIN_RULES, ...PENALTY_RULES]

/* ─── Calculate earned and lost coins ─── */
function calculateCoins(data, today) {
  let earned = 0
  let penalties = 0
  const breakdown = []
  const penaltyBreakdown = []

  // === EARNING ===

  // To-Dos
  const doneTodos = data.todos.filter(t => t.done)
  const highPrio = doneTodos.filter(t => t.priority === 'high').length
  const otherPrio = doneTodos.length - highPrio
  if (highPrio > 0) breakdown.push({ rule: 'todo_high', count: highPrio, coins: highPrio * 20 })
  if (otherPrio > 0) breakdown.push({ rule: 'todo', count: otherPrio, coins: otherPrio * 10 })
  earned += highPrio * 20 + otherPrio * 10

  // Habits completed
  let totalHabitChecks = 0
  let allHabitDays = 0
  const allDates = new Set()
  data.habits.forEach(h => {
    Object.keys(h.history).forEach(d => {
      allDates.add(d)
      if (h.history[d]) totalHabitChecks++
    })
  })
  allDates.forEach(d => {
    const allDone = data.habits.every(h => h.history[d])
    if (allDone && data.habits.length > 0) allHabitDays++
  })
  if (totalHabitChecks > 0) breakdown.push({ rule: 'habit', count: totalHabitChecks, coins: totalHabitChecks * 15 })
  if (allHabitDays > 0) breakdown.push({ rule: 'all_habits', count: allHabitDays, coins: allHabitDays * 50 })
  earned += totalHabitChecks * 15 + allHabitDays * 50

  // Workouts
  const workoutDays = data.workouts.length
  if (workoutDays > 0) breakdown.push({ rule: 'workout', count: workoutDays, coins: workoutDays * 30 })
  earned += workoutDays * 30

  // Sleep goals met
  const sleepGoalMet = data.sleep.filter(s => Math.abs(s.hours - (data.sleepGoal || 8)) <= 0.5).length
  if (sleepGoalMet > 0) breakdown.push({ rule: 'sleep_goal', count: sleepGoalMet, coins: sleepGoalMet * 20 })
  earned += sleepGoalMet * 20

  // Current streak
  let streak = 0
  const d = new Date(today)
  while (true) {
    const dateStr = d.toISOString().split('T')[0]
    const allDone = data.habits.length > 0 && data.habits.every(h => h.history[dateStr])
    if (!allDone) break
    streak++
    d.setDate(d.getDate() - 1)
  }

  // Streak bonuses
  const streakBonuses = [
    { threshold: 30, rule: 'streak_30', coins: 1000 },
    { threshold: 14, rule: 'streak_14', coins: 350 },
    { threshold: 7, rule: 'streak_7', coins: 150 },
    { threshold: 3, rule: 'streak_3', coins: 50 },
  ]
  streakBonuses.forEach(sb => {
    if (streak >= sb.threshold) {
      const times = Math.floor(streak / sb.threshold)
      breakdown.push({ rule: sb.rule, count: times, coins: times * sb.coins })
      earned += times * sb.coins
    }
  })

  // === PENALTIES ===

  // Missed habits (days where habits existed but weren't all done, excluding today)
  let missedHabitChecks = 0
  let zeroHabitDays = 0
  allDates.forEach(dt => {
    if (dt >= today) return // don't penalize today yet
    const doneCount = data.habits.filter(h => h.history[dt]).length
    const missedCount = data.habits.length - doneCount
    if (missedCount > 0) missedHabitChecks += missedCount
    if (doneCount === 0 && data.habits.length > 0) zeroHabitDays++
  })
  if (missedHabitChecks > 0) {
    const p = missedHabitChecks * 10
    penaltyBreakdown.push({ rule: 'missed_habit', count: missedHabitChecks, coins: -p })
    penalties += p
  }
  if (zeroHabitDays > 0) {
    const p = zeroHabitDays * 30
    penaltyBreakdown.push({ rule: 'zero_habits', count: zeroHabitDays, coins: -p })
    penalties += p
  }

  // Bad sleep (under 5h)
  const badSleepDays = data.sleep.filter(s => s.hours < 5).length
  if (badSleepDays > 0) {
    const p = badSleepDays * 15
    penaltyBreakdown.push({ rule: 'bad_sleep', count: badSleepDays, coins: -p })
    penalties += p
  }

  // No workout entire week check (look at past completed weeks)
  const weekStart = new Date(today)
  const jsDay = weekStart.getDay()
  weekStart.setDate(weekStart.getDate() - (jsDay === 0 ? 6 : jsDay - 1) - 7) // last week monday
  let lastWeekWorkouts = 0
  for (let i = 0; i < 7; i++) {
    const wd = new Date(weekStart)
    wd.setDate(wd.getDate() + i)
    const wds = wd.toISOString().split('T')[0]
    if (data.workouts.find(w => w.date === wds)) lastWeekWorkouts++
  }
  if (lastWeekWorkouts === 0 && data.workouts.length > 0) {
    penaltyBreakdown.push({ rule: 'no_workout_week', count: 1, coins: -40 })
    penalties += 40
  }

  // Manual relapses
  const relapses = data.rewards?.relapses || []
  if (relapses.length > 0) {
    const p = relapses.reduce((s, r) => s + (r.coins || 100), 0)
    penaltyBreakdown.push({ rule: 'relapse', count: relapses.length, coins: -p })
    penalties += p
  }

  const total = Math.max(0, earned - penalties)
  return { earned, penalties, total, breakdown, penaltyBreakdown, streak }
}

/* ─── Rank System ─── */
const RANKS = [
  { min: 0, name: 'Neuling', icon: '🌱', color: 'var(--text-muted)' },
  { min: 100, name: 'Anfaenger', icon: '🌿', color: 'var(--teal)' },
  { min: 500, name: 'Aufsteiger', icon: '⭐', color: 'var(--blue)' },
  { min: 1500, name: 'Fortgeschritten', icon: '🔥', color: 'var(--coral)' },
  { min: 3000, name: 'Profi', icon: '💎', color: 'var(--purple)' },
  { min: 5000, name: 'Elite', icon: '👑', color: 'var(--amber)' },
  { min: 10000, name: 'Legende', icon: '🏆', color: 'var(--amber)' },
]

function getRank(coins) {
  let rank = RANKS[0]
  for (const r of RANKS) { if (coins >= r.min) rank = r }
  const nextRank = RANKS.find(r => r.min > coins)
  return { ...rank, nextRank, progress: nextRank ? Math.round(((coins - rank.min) / (nextRank.min - rank.min)) * 100) : 100 }
}

/* ─── Main Component ─── */
export default function RewardSystem({ data, rewards, setRewards, today }) {
  const [showAddReward, setShowAddReward] = useState(false)
  const [showRules, setShowRules] = useState(false)
  const [showPenalties, setShowPenalties] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [showRelapse, setShowRelapse] = useState(false)
  const [newName, setNewName] = useState('')
  const [newCost, setNewCost] = useState('')
  const [newEmoji, setNewEmoji] = useState('🎮')
  const [editId, setEditId] = useState(null)
  const [editName, setEditName] = useState('')
  const [editCost, setEditCost] = useState('')
  const [relapseNote, setRelapseNote] = useState('')
  const [relapseCoins, setRelapseCoins] = useState('100')

  const rewardItems = rewards?.items || [
    { id: 1, name: 'Neues Spiel kaufen', cost: 500, emoji: '🎮' },
    { id: 2, name: 'Cheat Day', cost: 200, emoji: '🍕' },
    { id: 3, name: 'Kino-Abend', cost: 150, emoji: '🎬' },
    { id: 4, name: 'Neue Kopfhoerer', cost: 1000, emoji: '🎧' },
    { id: 5, name: 'Hobby-Equipment', cost: 750, emoji: '🛹' },
  ]
  const redeemedHistory = rewards?.redeemed || []
  const spentCoins = redeemedHistory.reduce((s, r) => s + r.cost, 0)

  const { earned, penalties, total: netCoins, breakdown, penaltyBreakdown, streak } = useMemo(
    () => calculateCoins(data, today), [data, today]
  )
  const availableCoins = Math.max(0, netCoins - spentCoins)
  const rank = getRank(netCoins)

  const addReward = () => {
    if (!newName.trim() || !newCost) return
    const items = [...rewardItems, { id: Date.now(), name: newName.trim(), cost: parseInt(newCost), emoji: newEmoji }]
    setRewards(prev => ({ ...prev, items }))
    setNewName(''); setNewCost(''); setShowAddReward(false)
  }

  const removeReward = (id) => setRewards(prev => ({ ...prev, items: rewardItems.filter(r => r.id !== id) }))

  const redeemReward = (reward) => {
    if (availableCoins < reward.cost) return
    const entry = { ...reward, date: new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) }
    setRewards(prev => ({ ...prev, redeemed: [...(prev?.redeemed || []), entry] }))
  }

  const saveEdit = () => {
    if (!editName.trim()) return
    const items = rewardItems.map(r => r.id === editId ? { ...r, name: editName.trim(), cost: parseInt(editCost) || r.cost } : r)
    setRewards(prev => ({ ...prev, items }))
    setEditId(null)
  }

  const logRelapse = () => {
    const entry = {
      note: relapseNote.trim() || 'Rueckfall',
      coins: parseInt(relapseCoins) || 100,
      date: new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    }
    setRewards(prev => ({ ...prev, relapses: [...(prev?.relapses || []), entry] }))
    setRelapseNote(''); setShowRelapse(false)
  }

  const emojis = ['🎮', '🍕', '🎬', '🎧', '🛹', '📚', '🎨', '✈️', '🏖️', '🧖', '☕', '🍫', '🎵', '👟', '🎁']

  const inputStyle = {
    background: 'var(--bg-input)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)', padding: '8px 10px', color: 'var(--text-primary)',
    fontSize: 13, outline: 'none',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Coin Balance & Rank */}
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ textAlign: 'center', flex: 1 }}>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 4 }}>Verfuegbar</p>
            <p style={{ fontSize: 38, fontWeight: 700, color: availableCoins > 0 ? 'var(--amber)' : 'var(--red)', fontFamily: 'var(--font-mono)', margin: 0 }}>
              {availableCoins}
            </p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Coins</p>
          </div>
          <div style={{ width: 1, height: 60, background: 'var(--border)' }} />
          <div style={{ textAlign: 'center', flex: 1 }}>
            <p style={{ fontSize: 28, margin: '0 0 4px' }}>{rank.icon}</p>
            <p style={{ fontSize: 14, fontWeight: 600, color: rank.color, margin: 0 }}>{rank.name}</p>
            {rank.nextRank && (
              <>
                <div style={{ height: 4, background: 'var(--bg-input)', borderRadius: 2, margin: '8px 0 4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${rank.progress}%`, background: rank.color, borderRadius: 2, transition: 'width 0.5s' }} />
                </div>
                <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                  {netCoins} / {rank.nextRank.min} Coins
                </p>
              </>
            )}
          </div>
          <div style={{ width: 1, height: 60, background: 'var(--border)' }} />
          <div style={{ textAlign: 'center', flex: 1 }}>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 4 }}>Streak</p>
            <p style={{ fontSize: 38, fontWeight: 700, color: streak > 0 ? 'var(--teal)' : 'var(--text-muted)', fontFamily: 'var(--font-mono)', margin: 0 }}>
              {streak}
            </p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Tage</p>
          </div>
        </div>

        {/* Summary with penalties */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginTop: 14 }}>
          {[
            { label: 'Verdient', value: `+${earned}`, color: 'var(--teal)' },
            { label: 'Strafen', value: `-${penalties}`, color: penalties > 0 ? 'var(--red)' : 'var(--text-muted)' },
            { label: 'Ausgegeben', value: `-${spentCoins}`, color: 'var(--coral)' },
            { label: 'Belohnungen', value: redeemedHistory.length, color: 'var(--purple)' },
          ].map(s => (
            <div key={s.label} style={{ padding: '8px', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
              <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>{s.label}</p>
              <p style={{ fontSize: 15, fontWeight: 600, color: s.color, fontFamily: 'var(--font-mono)' }}>{s.value}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Relapse Button */}
      <Card style={{ borderColor: 'rgba(226,75,74,0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ShieldAlert size={16} color="var(--red)" />
            <div>
              <p style={{ fontSize: 14, fontWeight: 500, margin: 0, color: 'var(--text-primary)' }}>Rueckfall melden</p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '2px 0 0' }}>Ehrlich sein = langfristig staerker werden</p>
            </div>
          </div>
          <button onClick={() => setShowRelapse(!showRelapse)} style={{
            padding: '6px 14px', borderRadius: 'var(--radius-sm)', fontSize: 12,
            border: '1px solid rgba(226,75,74,0.3)', background: showRelapse ? 'rgba(226,75,74,0.1)' : 'transparent',
            color: 'var(--red)', cursor: 'pointer', fontFamily: 'var(--font-main)', fontWeight: 500,
          }}>
            {showRelapse ? 'Abbrechen' : 'Melden'}
          </button>
        </div>

        {showRelapse && (
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <input value={relapseNote} onChange={e => setRelapseNote(e.target.value)}
              placeholder="Was ist passiert? (optional, fuer dich selbst)"
              style={inputStyle} />
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Strafe:</span>
              {['50', '100', '200', '500'].map(c => (
                <button key={c} onClick={() => setRelapseCoins(c)} style={{
                  padding: '4px 10px', borderRadius: 'var(--radius-sm)', fontSize: 11,
                  border: relapseCoins === c ? '1.5px solid var(--red)' : '1px solid var(--border)',
                  background: relapseCoins === c ? 'rgba(226,75,74,0.1)' : 'var(--bg-input)',
                  color: relapseCoins === c ? 'var(--red)' : 'var(--text-secondary)',
                  cursor: 'pointer', fontFamily: 'var(--font-mono)',
                }}>-{c}</button>
              ))}
            </div>
            <button onClick={logRelapse} style={{
              background: 'var(--red)', border: 'none', borderRadius: 'var(--radius-sm)',
              padding: '8px', color: '#fff', fontSize: 12, cursor: 'pointer', fontWeight: 500,
            }}>Rueckfall eintragen (-{relapseCoins} Coins)</button>
            <p style={{ fontSize: 10, color: 'var(--text-muted)', fontStyle: 'italic' }}>
              Rueckfaelle passieren. Wichtig ist, dass du weitermachst. Die Strafe motiviert, es beim naechsten Mal besser zu machen.
            </p>
          </div>
        )}
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {/* Rewards Shop */}
        <Card>
          <CardHeader icon={<Gift size={16} />} title="Belohnungen" color="var(--amber)"
            right={
              <button onClick={() => setShowAddReward(!showAddReward)} style={{
                width: 26, height: 26, borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)', background: 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              }}>
                {showAddReward ? <X size={14} color="var(--text-secondary)" /> : <Plus size={14} color="var(--text-secondary)" />}
              </button>
            }
          />

          {showAddReward && (
            <div style={{ marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', gap: 6 }}>
                <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Belohnung..." style={{ ...inputStyle, flex: 1 }} />
                <input type="number" value={newCost} onChange={e => setNewCost(e.target.value)} placeholder="Coins" style={{ ...inputStyle, width: 70 }} />
              </div>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {emojis.map(e => (
                  <button key={e} onClick={() => setNewEmoji(e)} style={{
                    width: 30, height: 30, borderRadius: 'var(--radius-sm)', fontSize: 16,
                    border: newEmoji === e ? '1.5px solid var(--amber)' : '1px solid var(--border)',
                    background: newEmoji === e ? 'rgba(239,159,39,0.12)' : 'var(--bg-input)', cursor: 'pointer',
                  }}>{e}</button>
                ))}
              </div>
              <button onClick={addReward} style={{
                background: 'var(--amber-dim)', border: 'none', borderRadius: 'var(--radius-sm)',
                padding: '8px', color: '#fff', fontSize: 12, cursor: 'pointer', fontWeight: 500,
              }}>Hinzufuegen</button>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {rewardItems.map(r => {
              const canAfford = availableCoins >= r.cost
              if (editId === r.id) {
                return (
                  <div key={r.id} style={{ display: 'flex', gap: 4, padding: '6px', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--amber-dim)' }}>
                    <input value={editName} onChange={e => setEditName(e.target.value)} autoFocus onKeyDown={e => e.key === 'Enter' && saveEdit()}
                      style={{ ...inputStyle, flex: 1, background: 'transparent', border: 'none', padding: '4px' }} />
                    <input type="number" value={editCost} onChange={e => setEditCost(e.target.value)}
                      style={{ ...inputStyle, width: 60, background: 'transparent', border: '1px solid var(--border)', padding: '4px 6px', textAlign: 'right' }} />
                    <button onClick={saveEdit} style={{ background: 'var(--amber-dim)', border: 'none', borderRadius: 'var(--radius-sm)', width: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Check size={12} color="#fff" /></button>
                    <button onClick={() => setEditId(null)} style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', width: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><X size={12} color="var(--text-secondary)" /></button>
                  </div>
                )
              }
              return (
                <div key={r.id} style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px',
                  background: canAfford ? 'rgba(239,159,39,0.05)' : 'var(--bg-input)',
                  borderRadius: 'var(--radius-sm)', border: canAfford ? '1px solid rgba(239,159,39,0.2)' : '1px solid transparent',
                }}>
                  <span style={{ fontSize: 20 }}>{r.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, margin: 0, fontWeight: 500 }}>{r.name}</p>
                    <p style={{ fontSize: 11, color: 'var(--amber)', fontFamily: 'var(--font-mono)', margin: '2px 0 0' }}>{r.cost} Coins</p>
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <Pencil size={11} color="var(--text-muted)" style={{ cursor: 'pointer', opacity: 0.5 }}
                      onClick={() => { setEditId(r.id); setEditName(r.name); setEditCost(String(r.cost)) }} />
                    <Trash2 size={11} color="var(--text-muted)" style={{ cursor: 'pointer', opacity: 0.5 }} onClick={() => removeReward(r.id)} />
                    <button onClick={() => redeemReward(r)} disabled={!canAfford} style={{
                      padding: '4px 10px', borderRadius: 'var(--radius-sm)', fontSize: 10, fontWeight: 500,
                      border: 'none', cursor: canAfford ? 'pointer' : 'not-allowed',
                      background: canAfford ? 'var(--amber)' : 'var(--bg-input)',
                      color: canAfford ? '#000' : 'var(--text-muted)', fontFamily: 'var(--font-main)',
                    }}>Einloesen</button>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Rules, Penalties, History */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Earning Rules */}
          <Card>
            <CardHeader icon={<Star size={16} />} title="Coins verdienen" color="var(--teal)"
              right={<button onClick={() => setShowRules(!showRules)} style={{ padding: '3px 8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', fontSize: 10, cursor: 'pointer', fontFamily: 'var(--font-main)' }}>{showRules ? 'Weniger' : 'Alle'}</button>}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {(showRules ? COIN_RULES : COIN_RULES.slice(0, 5)).map(r => {
                const Icon = r.icon
                return (
                  <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)' }}>
                    <Icon size={13} color={r.color} />
                    <span style={{ fontSize: 12, flex: 1, color: 'var(--text-secondary)' }}>{r.label}</span>
                    <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--teal)', fontWeight: 500 }}>+{r.coins}</span>
                  </div>
                )
              })}
            </div>
          </Card>

          {/* Penalty Rules */}
          <Card style={{ borderColor: 'rgba(226,75,74,0.15)' }}>
            <CardHeader icon={<AlertTriangle size={16} />} title="Strafen" color="var(--red)"
              right={<button onClick={() => setShowPenalties(!showPenalties)} style={{ padding: '3px 8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', fontSize: 10, cursor: 'pointer', fontFamily: 'var(--font-main)' }}>{showPenalties ? 'Weniger' : 'Alle'}</button>}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {(showPenalties ? PENALTY_RULES : PENALTY_RULES.slice(0, 4)).map(r => {
                const Icon = r.icon
                return (
                  <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', background: 'rgba(226,75,74,0.04)', borderRadius: 'var(--radius-sm)' }}>
                    <Icon size={13} color={r.color} />
                    <span style={{ fontSize: 12, flex: 1, color: 'var(--text-secondary)' }}>{r.label}</span>
                    <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--red)', fontWeight: 500 }}>{r.coins}</span>
                  </div>
                )
              })}
            </div>
          </Card>

          {/* Breakdown */}
          <Card>
            <CardHeader icon={<Target size={16} />} title="Dein Verdienst" color="var(--purple)" />
            {breakdown.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {breakdown.map((b, i) => {
                  const rule = COIN_RULES.find(r => r.id === b.rule)
                  if (!rule) return null
                  const Icon = rule.icon
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)' }}>
                      <Icon size={13} color={rule.color} />
                      <span style={{ fontSize: 12, flex: 1 }}>{rule.label}</span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>x{b.count}</span>
                      <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--teal)', fontWeight: 500 }}>+{b.coins}</span>
                    </div>
                  )
                })}
                {penaltyBreakdown.length > 0 && (
                  <>
                    <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
                    {penaltyBreakdown.map((b, i) => {
                      const rule = PENALTY_RULES.find(r => r.id === b.rule)
                      if (!rule) return null
                      const Icon = rule.icon
                      return (
                        <div key={`p${i}`} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', background: 'rgba(226,75,74,0.04)', borderRadius: 'var(--radius-sm)' }}>
                          <Icon size={13} color="var(--red)" />
                          <span style={{ fontSize: 12, flex: 1, color: 'var(--coral)' }}>{rule.label}</span>
                          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>x{b.count}</span>
                          <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--red)', fontWeight: 500 }}>{b.coins}</span>
                        </div>
                      )
                    })}
                  </>
                )}
              </div>
            ) : (
              <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: 16 }}>Noch keine Coins verdient</p>
            )}
          </Card>

          {/* Redemption History */}
          {redeemedHistory.length > 0 && (
            <Card>
              <CardHeader icon={<Medal size={16} />} title="Eingeloest" color="var(--coral)" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {redeemedHistory.slice().reverse().slice(0, showHistory ? 99 : 3).map((r, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)' }}>
                    <span style={{ fontSize: 16 }}>{r.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 12, margin: 0 }}>{r.name}</p>
                      <p style={{ fontSize: 10, color: 'var(--text-muted)', margin: '1px 0 0' }}>{r.date}</p>
                    </div>
                    <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--coral)' }}>-{r.cost}</span>
                  </div>
                ))}
                {redeemedHistory.length > 3 && (
                  <button onClick={() => setShowHistory(!showHistory)} style={{
                    padding: '4px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)',
                    background: 'transparent', color: 'var(--text-secondary)', fontSize: 10, cursor: 'pointer', fontFamily: 'var(--font-main)',
                  }}>{showHistory ? 'Weniger' : `Alle (${redeemedHistory.length})`}</button>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
