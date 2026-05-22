import { useState } from 'react'
import {
  CloudSun, CloudRain, Sun, Cloud, Snowflake, Wind, Thermometer,
  Tv, Moon, Coffee, Home, Plus, X, Pencil, Check, Trash2,
  Clock, Zap, Lightbulb, ChevronDown, ChevronUp,
} from 'lucide-react'
import Card, { CardHeader } from './Card'

/* ─── Weather Widget ─── */
const DEMO_WEATHER = {
  current: { temp: 18, feelsLike: 16, condition: 'partly_cloudy', humidity: 62, wind: 12 },
  forecast: [
    { day: 'Mo', high: 20, low: 12, condition: 'sunny' },
    { day: 'Di', high: 18, low: 11, condition: 'cloudy' },
    { day: 'Mi', high: 15, low: 9, condition: 'rainy' },
    { day: 'Do', high: 17, low: 10, condition: 'partly_cloudy' },
    { day: 'Fr', high: 21, low: 13, condition: 'sunny' },
    { day: 'Sa', high: 22, low: 14, condition: 'sunny' },
    { day: 'So', high: 19, low: 12, condition: 'cloudy' },
  ],
  heatingTip: 'Mittwoch wird kalt (15°C) – Heizung rechtzeitig hochdrehen. Am Wochenende bis 22°C – Heizung runter.',
}

const weatherIcons = {
  sunny: Sun, partly_cloudy: CloudSun, cloudy: Cloud, rainy: CloudRain, snowy: Snowflake,
}
const weatherColors = {
  sunny: 'var(--amber)', partly_cloudy: 'var(--blue)', cloudy: 'var(--text-muted)',
  rainy: 'var(--blue)', snowy: '#c0d8f0',
}

function WeatherWidget() {
  const w = DEMO_WEATHER
  const CurrentIcon = weatherIcons[w.current.condition] || Cloud

  return (
    <Card>
      <CardHeader icon={<CloudSun size={16} />} title="Wetter – Regensburg" color="var(--blue)" />

      {/* Current */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
        <CurrentIcon size={48} color={weatherColors[w.current.condition]} />
        <div>
          <p style={{ fontSize: 36, fontWeight: 600, fontFamily: 'var(--font-mono)', margin: 0, color: 'var(--text-primary)' }}>
            {w.current.temp}°C
          </p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0' }}>
            Gefühlt {w.current.feelsLike}°C · {w.current.humidity}% Feuchte · {w.current.wind} km/h Wind
          </p>
        </div>
      </div>

      {/* 7 Day Forecast */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 14 }}>
        {w.forecast.map((d, i) => {
          const Icon = weatherIcons[d.condition] || Cloud
          return (
            <div key={i} style={{
              textAlign: 'center', padding: '8px 2px', background: 'var(--bg-input)',
              borderRadius: 'var(--radius-sm)',
            }}>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>{d.day}</p>
              <Icon size={18} color={weatherColors[d.condition]} style={{ margin: '6px 0' }} />
              <p style={{ fontSize: 12, fontFamily: 'var(--font-mono)', margin: 0 }}>
                <span style={{ color: 'var(--coral)' }}>{d.high}°</span>
                <span style={{ color: 'var(--text-muted)', margin: '0 2px' }}>/</span>
                <span style={{ color: 'var(--blue)' }}>{d.low}°</span>
              </p>
            </div>
          )
        })}
      </div>

      {/* Heating Tip */}
      <div style={{
        padding: '10px 12px', borderRadius: 'var(--radius-sm)',
        background: 'rgba(239,159,39,0.08)', border: '1px solid rgba(239,159,39,0.2)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
          <Thermometer size={13} color="var(--amber)" />
          <span style={{ fontSize: 11, color: 'var(--amber)', fontWeight: 500 }}>Heizungs-Tipp</span>
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4 }}>{w.heatingTip}</p>
      </div>
    </Card>
  )
}

/* ─── Scene Control ─── */
const DEFAULT_SCENES = [
  { id: 1, name: 'Guten Morgen', icon: 'coffee', color: 'var(--amber)', actions: ['Wohnzimmer Licht 80%', 'Heizung 22°C', 'Küche Licht an'] },
  { id: 2, name: 'Filmabend', icon: 'tv', color: 'var(--purple)', actions: ['Wohnzimmer Licht 15%', 'Stehlampe aus', 'Heizung 21°C'] },
  { id: 3, name: 'Gute Nacht', icon: 'moon', color: 'var(--blue)', actions: ['Alle Lichter aus', 'Heizung 18°C', 'Schlafzimmer Nachtlicht 5%'] },
  { id: 4, name: 'Abwesend', icon: 'home', color: 'var(--teal)', actions: ['Alle Lichter aus', 'Heizung 16°C', 'Sicherheitsmodus an'] },
]

const sceneIcons = { coffee: Coffee, tv: Tv, moon: Moon, home: Home, sun: Sun }

function SceneControl({ scenes, setScenes }) {
  const [activeScene, setActiveScene] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [newActions, setNewActions] = useState('')

  const activateScene = (scene) => {
    setActiveScene(scene.id === activeScene ? null : scene.id)
  }

  const addScene = () => {
    if (!newName.trim()) return
    const actions = newActions.split(',').map(a => a.trim()).filter(Boolean)
    setScenes(prev => [...prev, { id: Date.now(), name: newName.trim(), icon: 'sun', color: 'var(--teal)', actions }])
    setNewName(''); setNewActions(''); setShowAdd(false)
  }

  const removeScene = (id) => setScenes(prev => prev.filter(s => s.id !== id))

  return (
    <Card>
      <CardHeader icon={<Zap size={16} />} title="Szenen" color="var(--purple)"
        right={
          <button onClick={() => setShowAdd(!showAdd)} style={{
            width: 26, height: 26, borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border)', background: 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}>
            {showAdd ? <X size={14} color="var(--text-secondary)" /> : <Plus size={14} color="var(--text-secondary)" />}
          </button>
        }
      />

      {showAdd && (
        <div style={{ marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <input value={newName} onChange={e => setNewName(e.target.value)} placeholder='Name (z.B. "Gaming")'
            style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '8px 10px', color: 'var(--text-primary)', fontSize: 13, outline: 'none' }} />
          <input value={newActions} onChange={e => setNewActions(e.target.value)} placeholder='Aktionen (Komma-getrennt)'
            style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '8px 10px', color: 'var(--text-primary)', fontSize: 13, outline: 'none' }} />
          <button onClick={addScene} style={{
            background: 'var(--purple-dim)', border: 'none', borderRadius: 'var(--radius-sm)',
            padding: '8px', color: '#fff', fontSize: 12, cursor: 'pointer', fontWeight: 500,
          }}>Szene erstellen</button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
        {scenes.map(s => {
          const Icon = sceneIcons[s.icon] || Zap
          const isActive = activeScene === s.id
          return (
            <div key={s.id} style={{ position: 'relative' }}>
              <button onClick={() => activateScene(s)} style={{
                width: '100%', padding: '14px 12px', borderRadius: 'var(--radius-md)',
                border: isActive ? `2px solid ${s.color}` : '1px solid var(--border)',
                background: isActive ? `${s.color}15` : 'var(--bg-input)',
                cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--font-main)',
                transition: 'all 0.2s',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <Icon size={18} color={isActive ? s.color : 'var(--text-muted)'} />
                  <span style={{ fontSize: 13, fontWeight: 500, color: isActive ? s.color : 'var(--text-primary)' }}>{s.name}</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                  {s.actions.slice(0, 3).map((a, i) => (
                    <span key={i} style={{ fontSize: 9, padding: '1px 6px', borderRadius: 8, background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}>{a}</span>
                  ))}
                </div>
              </button>
              {s.id > 4 && (
                <Trash2 size={10} color="var(--text-muted)" style={{ position: 'absolute', top: 8, right: 8, cursor: 'pointer', opacity: 0.5 }}
                  onClick={() => removeScene(s.id)} />
              )}
            </div>
          )
        })}
      </div>
    </Card>
  )
}

/* ─── Automation Log ─── */
const DEMO_LOG = [
  { time: '07:00', action: 'Guten Morgen Szene aktiviert', trigger: 'Zeitplan', icon: 'coffee', color: 'var(--amber)' },
  { time: '07:15', action: 'Küche Licht an (Bewegung erkannt)', trigger: 'Bewegungsmelder', icon: 'lightbulb', color: 'var(--amber)' },
  { time: '08:30', action: 'Heizung Wohnzimmer auf 20°C (niemand zuhause)', trigger: 'Geofence', icon: 'thermometer', color: 'var(--blue)' },
  { time: '09:00', action: 'Alle Lichter aus (Abwesend-Modus)', trigger: 'Geofence', icon: 'home', color: 'var(--teal)' },
  { time: '17:45', action: 'Heizung Wohnzimmer auf 22°C (Ankunft erkannt)', trigger: 'Geofence', icon: 'thermometer', color: 'var(--coral)' },
  { time: '17:50', action: 'Flur Licht an (Tür geöffnet)', trigger: 'Türsensor', icon: 'lightbulb', color: 'var(--amber)' },
  { time: '22:00', action: 'Wohnzimmer Licht gedimmt auf 40%', trigger: 'Zeitplan', icon: 'moon', color: 'var(--purple)' },
  { time: '23:30', action: 'Gute Nacht Szene aktiviert', trigger: 'Zeitplan', icon: 'moon', color: 'var(--blue)' },
]

const logIcons = { coffee: Coffee, lightbulb: Lightbulb, thermometer: Thermometer, home: Home, moon: Moon, tv: Tv }

function AutomationLog() {
  const [expanded, setExpanded] = useState(false)
  const visibleLogs = expanded ? DEMO_LOG : DEMO_LOG.slice(0, 4)

  return (
    <Card>
      <CardHeader icon={<Clock size={16} />} title="Automatisierung heute" color="var(--teal)"
        right={<span style={{ fontSize: 12, color: 'var(--teal)', fontFamily: 'var(--font-mono)' }}>{DEMO_LOG.length} Aktionen</span>}
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {visibleLogs.map((log, i) => {
          const Icon = logIcons[log.icon] || Zap
          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px',
              background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)',
            }}>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', width: 38, flexShrink: 0 }}>{log.time}</span>
              <div style={{
                width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                background: `${log.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={12} color={log.color} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 12, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.action}</p>
                <p style={{ fontSize: 10, color: 'var(--text-muted)', margin: '1px 0 0' }}>{log.trigger}</p>
              </div>
            </div>
          )
        })}
      </div>
      {DEMO_LOG.length > 4 && (
        <button onClick={() => setExpanded(!expanded)} style={{
          width: '100%', padding: '6px', marginTop: 6, borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border)', background: 'transparent',
          color: 'var(--text-secondary)', fontSize: 11, cursor: 'pointer', fontFamily: 'var(--font-main)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
        }}>
          {expanded ? <><ChevronUp size={12} /> Weniger</> : <><ChevronDown size={12} /> Alle {DEMO_LOG.length} anzeigen</>}
        </button>
      )}
    </Card>
  )
}

export { WeatherWidget, SceneControl, AutomationLog, DEFAULT_SCENES }
