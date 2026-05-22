import { useState, useEffect } from 'react'
import './index.css'
import Header from './components/Header'
import StatsRow from './components/StatsRow'
import TodoList from './components/TodoList'
import HabitTracker from './components/HabitTracker'
import WorkoutTracker from './components/WorkoutTracker'
import SleepTracker from './components/SleepTracker'
import Goals from './components/Goals'
import Notes from './components/Notes'
import TrainingPlan from './components/TrainingPlan'
import BudgetTracker from './components/BudgetTracker'
import HistoryView from './components/HistoryView'
import GermanComparison from './components/GermanComparison'

const STORAGE_KEY = 'dashboard_data'

const WEEKDAYS = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag']

const defaultData = {
  todos: [
    { id: 1, text: 'Raspberry Pi Setup starten', done: false, priority: 'high' },
    { id: 2, text: 'VS Code einrichten', done: true, priority: 'medium' },
    { id: 3, text: 'Dashboard personalisieren', done: false, priority: 'low' },
  ],
  habits: [
    { id: 1, name: '2L Wasser', icon: 'droplet', color: 'var(--blue)', history: {} },
    { id: 2, name: '30 Min lesen', icon: 'book', color: 'var(--coral)', history: {} },
    { id: 3, name: 'Meditieren', icon: 'brain', color: 'var(--purple)', history: {} },
    { id: 4, name: 'Workout', icon: 'dumbbell', color: 'var(--teal)', history: {} },
  ],
  workouts: [],
  sleep: [],
  goals: [
    { id: 1, name: 'Raspberry Pi Setup', progress: 25, color: 'var(--amber)' },
    { id: 2, name: '10km unter 50 Min', progress: 60, color: 'var(--teal)' },
  ],
  notes: [],
  trainingPlan: Object.fromEntries(WEEKDAYS.map(d => [d, { exercises: [], isRest: false }])),
  trainingLog: {},
  budget: {
    income: 0,
    fixedExpenses: [],
    transactions: [],
    savingsGoal: 0,
    debtTotal: 0,
    debtPayments: [],
  },
  sleepGoal: 8,
}

function loadData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      return { ...defaultData, ...parsed }
    }
  } catch (e) { /* ignore */ }
  return defaultData
}

function App() {
  const [data, setData] = useState(loadData)
  const [activeTab, setActiveTab] = useState('dashboard')

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }, [data])

  const update = (key, value) => {
    setData(prev => ({ ...prev, [key]: typeof value === 'function' ? value(prev[key]) : value }))
  }

  const today = new Date().toISOString().split('T')[0]

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '◉' },
    { id: 'training', label: 'Training', icon: '◎' },
    { id: 'budget', label: 'Budget', icon: '◈' },
    { id: 'history', label: 'Verlauf', icon: '◷' },
  ]

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '1.5rem 1rem 3rem' }}>
      <Header />

      <div style={{
        display: 'flex', gap: 4, marginBottom: 18,
        background: 'var(--bg-card)', borderRadius: 'var(--radius-md)',
        padding: 4, border: '1px solid var(--border)',
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1, padding: '10px 0', borderRadius: 'var(--radius-sm)',
              border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500,
              fontFamily: 'var(--font-main)',
              background: activeTab === tab.id ? 'var(--purple-dim)' : 'transparent',
              color: activeTab === tab.id ? '#fff' : 'var(--text-secondary)',
              transition: 'all 0.2s',
            }}
          >
            <span style={{ marginRight: 6 }}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'dashboard' && (
        <>
          <StatsRow data={data} today={today} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 14 }}>
            <TodoList todos={data.todos} setTodos={v => update('todos', v)} />
            <HabitTracker habits={data.habits} setHabits={v => update('habits', v)} today={today} />
            <WorkoutTracker workouts={data.workouts} setWorkouts={v => update('workouts', v)} today={today}
              trainingPlan={data.trainingPlan} trainingLog={data.trainingLog} setTrainingLog={v => update('trainingLog', v)} />
            <SleepTracker sleepData={data.sleep} setSleepData={v => update('sleep', v)} today={today}
              sleepGoal={data.sleepGoal} setSleepGoal={v => update('sleepGoal', v)} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 14 }}>
            <Goals goals={data.goals} setGoals={v => update('goals', v)} />
            <Notes notes={data.notes} setNotes={v => update('notes', v)} />
          </div>
          <div style={{ marginTop: 14 }}>
            <GermanComparison data={data} today={today} />
          </div>
        </>
      )}

      {activeTab === 'training' && (
        <TrainingPlan
          plan={data.trainingPlan}
          setPlan={v => update('trainingPlan', v)}
          log={data.trainingLog}
          setLog={v => update('trainingLog', v)}
          today={today}
        />
      )}

      {activeTab === 'budget' && (
        <BudgetTracker
          budget={data.budget}
          setBudget={v => update('budget', v)}
        />
      )}

      {activeTab === 'history' && (
        <HistoryView data={data} />
      )}
    </div>
  )
}

export default App
