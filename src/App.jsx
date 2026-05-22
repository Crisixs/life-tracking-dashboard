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
import { SparChallenge, AboManager, Wunschliste } from './components/BudgetExtended'
import HistoryView from './components/HistoryView'
import GermanComparison from './components/GermanComparison'
import SmartHomePanel from './components/SmartHomePanel'
import { WeatherWidget, SceneControl, AutomationLog, DEFAULT_SCENES } from './components/SmartHomeExtended'
import CloudPanel from './components/CloudPanel'
import SystemPanel from './components/SystemPanel'
import RewardSystem from './components/RewardSystem'

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
    income: 0, fixedExpenses: [], transactions: [],
    savingsGoal: 0, debtTotal: 0, debtPayments: [],
  },
  sparChallenge: { mode: 'ascending', weeklyAmount: 1, weeks: Array(52).fill(false) },
  abos: [
    { id: 1, name: 'Netflix', amount: 12.99, cycle: 'monthly' },
    { id: 2, name: 'Spotify', amount: 9.99, cycle: 'monthly' },
    { id: 3, name: 'ChatGPT Plus', amount: 20, cycle: 'monthly' },
    { id: 4, name: 'iCloud 200GB', amount: 2.99, cycle: 'monthly' },
    { id: 5, name: 'Fitnessstudio', amount: 29.90, cycle: 'monthly' },
  ],
  wishes: [
    { id: 1, name: 'NVMe SSD 512GB + M.2 HAT', price: 65, saved: 0, link: '' },
    { id: 2, name: 'Zigbee USB-Stick', price: 15, saved: 0, link: '' },
  ],
  sleepGoal: 8,
  scenes: [...DEFAULT_SCENES],
  smarthome: {
    rooms: [
      { id: 1, name: 'Wohnzimmer', temp: 21.5, targetTemp: 22, humidity: 45, lights: [{ id: 1, name: 'Deckenlampe', on: true, brightness: 80 }, { id: 2, name: 'Stehlampe', on: false, brightness: 50 }] },
      { id: 2, name: 'Schlafzimmer', temp: 19.2, targetTemp: 19, humidity: 52, lights: [{ id: 3, name: 'Nachttisch', on: true, brightness: 30 }] },
      { id: 3, name: 'Küche', temp: 22.1, targetTemp: 22, humidity: 38, lights: [{ id: 4, name: 'Küchenlampe', on: true, brightness: 100 }] },
      { id: 4, name: 'Bad', temp: 23.0, targetTemp: 23, humidity: 65, lights: [{ id: 5, name: 'Spiegellampe', on: false, brightness: 100 }] },
    ],
    energy: {
      stromDaily: [3.2,4.1,3.8,3.5,4.3,3.9,3.6,4.0,3.7,3.3,4.2,3.8,3.4,3.9,4.1,3.6,3.5,4.0,3.8,3.7,3.4,3.9,4.1,3.6,3.3,4.2,3.8,3.5,3.7,3.9],
      gasDaily: [2.1,2.5,2.3,1.9,2.6,2.2,2.0,2.4,2.1,1.8,2.5,2.3,2.0,2.4,2.6,2.1,2.0,2.3,2.2,2.1,1.9,2.4,2.5,2.0,1.8,2.6,2.3,2.1,2.2,2.4],
      stromMonthly: [98,105,95,88,92,85,82,88,95,102,110,108],
      gasMonthly: [120,115,85,55,30,15,10,12,25,60,95,118],
      stromPrice: 0.35, gasPrice: 0.12,
      devices: [
        { id: 1, name: 'PC & Monitor', watts: 350, hoursPerDay: 6 },
        { id: 2, name: 'Kühlschrank', watts: 100, hoursPerDay: 24 },
        { id: 3, name: 'Waschmaschine', watts: 500, hoursPerDay: 0.5 },
        { id: 4, name: 'Raspberry Pi', watts: 15, hoursPerDay: 24 },
      ],
    },
  },
  cloud: {
    totalGB: 4000, usedGB: 856,
    folders: [
      { name: 'Dokumente', sizeGB: 124, color: 'var(--purple)' },
      { name: 'Fotos', sizeGB: 380, color: 'var(--blue)' },
      { name: 'Videos', sizeGB: 215, color: 'var(--coral)' },
      { name: 'Musik', sizeGB: 67, color: 'var(--teal)' },
      { name: 'Backups', sizeGB: 45, color: 'var(--amber)' },
      { name: 'Sonstiges', sizeGB: 25, color: 'var(--text-muted)' },
    ],
    recentFiles: [
      { name: 'Präsentation_Q2.pptx', size: '4.2 MB', date: '21.05.2026', type: 'doc' },
      { name: 'Urlaub_2026.jpg', size: '12.8 MB', date: '20.05.2026', type: 'img' },
      { name: 'Budget_Mai.xlsx', size: '1.1 MB', date: '19.05.2026', type: 'doc' },
      { name: 'Podcast_EP42.mp3', size: '85 MB', date: '18.05.2026', type: 'audio' },
      { name: 'Pi_Backup_20260517.tar.gz', size: '2.3 GB', date: '17.05.2026', type: 'backup' },
    ],
    connectedDevices: [
      { name: 'Jonas PC', status: 'online', lastSync: 'Gerade eben' },
      { name: 'iPhone', status: 'online', lastSync: 'Vor 5 Min' },
      { name: 'Tablet', status: 'offline', lastSync: 'Vor 2 Tagen' },
    ],
  },
  rewards: {
    items: [
      { id: 1, name: 'Neues Spiel kaufen', cost: 500, emoji: '🎮' },
      { id: 2, name: 'Cheat Day', cost: 200, emoji: '🍕' },
      { id: 3, name: 'Kino-Abend', cost: 150, emoji: '🎬' },
      { id: 4, name: 'Neue Kopfhörer', cost: 1000, emoji: '🎧' },
      { id: 5, name: 'Hobby-Equipment', cost: 750, emoji: '🛹' },
    ],
    redeemed: [],
  },
}

function loadData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) { return { ...defaultData, ...JSON.parse(saved) } }
  } catch (e) {}
  return defaultData
}

function App() {
  const [data, setData] = useState(loadData)
  const [activeTab, setActiveTab] = useState('dashboard')

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) }, [data])

  const update = (key, value) => {
    setData(prev => ({ ...prev, [key]: typeof value === 'function' ? value(prev[key]) : value }))
  }

  const today = new Date().toISOString().split('T')[0]

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '◉' },
    { id: 'training', label: 'Training', icon: '◎' },
    { id: 'budget', label: 'Budget', icon: '◈' },
    { id: 'rewards', label: 'Rewards', icon: '★' },
    { id: 'smarthome', label: 'Smart Home', icon: '◆' },
    { id: 'cloud', label: 'Cloud', icon: '◇' },
    { id: 'system', label: 'System', icon: '⬡' },
    { id: 'history', label: 'Verlauf', icon: '◷' },
  ]

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '1.5rem 1rem 3rem' }}>
      <Header />

      <div style={{
        display: 'flex', gap: 3, marginBottom: 18,
        background: 'var(--bg-card)', borderRadius: 'var(--radius-md)',
        padding: 4, border: '1px solid var(--border)', overflowX: 'auto',
      }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            flex: 1, padding: '10px 2px', borderRadius: 'var(--radius-sm)',
            border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 500,
            fontFamily: 'var(--font-main)', whiteSpace: 'nowrap', minWidth: 0,
            background: activeTab === tab.id ? 'var(--purple-dim)' : 'transparent',
            color: activeTab === tab.id ? '#fff' : 'var(--text-secondary)',
            transition: 'all 0.2s',
          }}>
            <span style={{ marginRight: 3 }}>{tab.icon}</span>{tab.label}
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
        <TrainingPlan plan={data.trainingPlan} setPlan={v => update('trainingPlan', v)}
          log={data.trainingLog} setLog={v => update('trainingLog', v)} today={today} />
      )}

      {activeTab === 'budget' && (
        <>
          <BudgetTracker budget={data.budget} setBudget={v => update('budget', v)} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 14 }}>
            <AboManager abos={data.abos} setAbos={v => update('abos', v)} />
            <Wunschliste wishes={data.wishes} setWishes={v => update('wishes', v)} />
          </div>
          <div style={{ marginTop: 14 }}>
            <SparChallenge challenge={data.sparChallenge} setChallenge={v => update('sparChallenge', v)} />
          </div>
        </>
      )}

      {activeTab === 'rewards' && (
        <RewardSystem data={data} rewards={data.rewards} setRewards={v => update('rewards', v)} today={today} />
      )}

      {activeTab === 'smarthome' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <WeatherWidget />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <SceneControl scenes={data.scenes} setScenes={v => update('scenes', v)} />
              <AutomationLog />
            </div>
          </div>
          <SmartHomePanel smarthome={data.smarthome} setSmarthome={v => update('smarthome', v)} />
        </>
      )}

      {activeTab === 'cloud' && <CloudPanel cloud={data.cloud} />}

      {activeTab === 'system' && <SystemPanel />}

      {activeTab === 'history' && <HistoryView data={data} />}
    </div>
  )
}

export default App
