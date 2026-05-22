import { useState, useMemo } from 'react'
import {
  Thermometer, Lightbulb, Droplets, Zap, Flame as GasIcon, Power,
  ChevronDown, ChevronUp, Sun, Moon, Settings, TrendingDown, BarChart3,
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, ReferenceLine,
} from 'recharts'
import Card, { CardHeader } from './Card'

const MONTHS = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez']

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#1c1c35', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 14px', fontSize: 12 }}>
      <p style={{ color: '#8888aa', marginBottom: 4 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, fontWeight: 500 }}>{p.name}: {typeof p.value === 'number' ? Math.round(p.value * 100) / 100 : p.value}</p>
      ))}
    </div>
  )
}

function RoomCard({ room, onUpdate }) {
  const [expanded, setExpanded] = useState(false)
  const lightsOn = room.lights.filter(l => l.on).length

  const toggleLight = (lightId) => {
    const updated = {
      ...room,
      lights: room.lights.map(l => l.id === lightId ? { ...l, on: !l.on } : l)
    }
    onUpdate(updated)
  }

  const setBrightness = (lightId, brightness) => {
    const updated = {
      ...room,
      lights: room.lights.map(l => l.id === lightId ? { ...l, brightness: parseInt(brightness) } : l)
    }
    onUpdate(updated)
  }

  const setTargetTemp = (temp) => {
    onUpdate({ ...room, targetTemp: Math.round(temp * 2) / 2 })
  }

  const tempDiff = room.temp - room.targetTemp
  const tempColor = Math.abs(tempDiff) < 0.5 ? 'var(--teal)' : tempDiff > 0 ? 'var(--coral)' : 'var(--blue)'

  return (
    <Card style={{ borderColor: expanded ? 'rgba(127,119,221,0.2)' : undefined }}>
      <div onClick={() => setExpanded(!expanded)}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
        <div>
          <p style={{ fontSize: 14, fontWeight: 500, margin: 0 }}>{room.name}</p>
          <div style={{ display: 'flex', gap: 12, marginTop: 6 }}>
            <span style={{ fontSize: 12, color: tempColor, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Thermometer size={13} /> {room.temp}°C
            </span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Droplets size={13} /> {room.humidity}%
            </span>
            <span style={{ fontSize: 12, color: lightsOn > 0 ? 'var(--amber)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Lightbulb size={13} /> {lightsOn}/{room.lights.length}
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 22, fontWeight: 600, color: tempColor, fontFamily: 'var(--font-mono)' }}>
            {room.temp}°
          </span>
          {expanded ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
        </div>
      </div>

      {expanded && (
        <div style={{ marginTop: 14 }}>
          {/* Thermostat */}
          <div style={{ padding: '12px', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)', marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Thermostat</span>
              <span style={{ fontSize: 12, color: tempColor, fontFamily: 'var(--font-mono)', fontWeight: 500 }}>
                Soll: {room.targetTemp}°C
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button onClick={(e) => { e.stopPropagation(); setTargetTemp(room.targetTemp - 0.5) }} style={{
                width: 28, height: 28, borderRadius: '50%', border: '1px solid var(--border)',
                background: 'transparent', color: 'var(--blue)', fontSize: 16, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>−</button>
              <input type="range" min="15" max="28" step="0.5" value={room.targetTemp}
                onClick={e => e.stopPropagation()}
                onChange={e => setTargetTemp(parseFloat(e.target.value))}
                style={{ flex: 1, accentColor: tempColor }} />
              <button onClick={(e) => { e.stopPropagation(); setTargetTemp(room.targetTemp + 0.5) }} style={{
                width: 28, height: 28, borderRadius: '50%', border: '1px solid var(--border)',
                background: 'transparent', color: 'var(--coral)', fontSize: 16, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>+</button>
            </div>
            {Math.abs(tempDiff) > 0.5 && (
              <p style={{ fontSize: 10, color: tempColor, marginTop: 6 }}>
                {tempDiff > 0 ? `${tempDiff.toFixed(1)}° über Ziel – Heizung aus` : `${Math.abs(tempDiff).toFixed(1)}° unter Ziel – heizt auf`}
              </p>
            )}
          </div>

          {/* Lights */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {room.lights.map(light => (
              <div key={light.id} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
                background: light.on ? 'rgba(239,159,39,0.06)' : 'var(--bg-input)',
                borderRadius: 'var(--radius-sm)',
              }}>
                <div onClick={(e) => { e.stopPropagation(); toggleLight(light.id) }} style={{
                  width: 32, height: 18, borderRadius: 9, cursor: 'pointer',
                  background: light.on ? 'var(--amber)' : 'var(--text-muted)',
                  position: 'relative', transition: 'background 0.2s',
                }}>
                  <div style={{
                    width: 14, height: 14, borderRadius: '50%', background: '#fff',
                    position: 'absolute', top: 2,
                    left: light.on ? 16 : 2, transition: 'left 0.2s',
                  }} />
                </div>
                <Lightbulb size={14} color={light.on ? 'var(--amber)' : 'var(--text-muted)'} />
                <span style={{ fontSize: 12, flex: 1, color: light.on ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                  {light.name}
                </span>
                {light.on && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, width: 120 }}>
                    <Moon size={10} color="var(--text-muted)" />
                    <input type="range" min="5" max="100" value={light.brightness}
                      onClick={e => e.stopPropagation()}
                      onChange={e => setBrightness(light.id, e.target.value)}
                      style={{ flex: 1, accentColor: 'var(--amber)' }} />
                    <Sun size={10} color="var(--amber)" />
                    <span style={{ fontSize: 10, color: 'var(--text-muted)', width: 28, textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                      {light.brightness}%
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}

export default function SmartHomePanel({ smarthome, setSmarthome }) {
  const [energyView, setEnergyView] = useState('daily')
  const energy = smarthome.energy

  const updateRoom = (updatedRoom) => {
    setSmarthome(prev => ({
      ...prev,
      rooms: prev.rooms.map(r => r.id === updatedRoom.id ? updatedRoom : r)
    }))
  }

  // Energy stats
  const avgStromDaily = energy.stromDaily.reduce((s, v) => s + v, 0) / energy.stromDaily.length
  const avgGasDaily = energy.gasDaily.reduce((s, v) => s + v, 0) / energy.gasDaily.length
  const totalStromMonth = energy.stromMonthly[new Date().getMonth()] || 0
  const totalGasMonth = energy.gasMonthly[new Date().getMonth()] || 0
  const stromCostMonth = Math.round(totalStromMonth * energy.stromPrice)
  const gasCostMonth = Math.round(totalGasMonth * energy.gasPrice)

  const stromPrevMonth = energy.stromMonthly[Math.max(0, new Date().getMonth() - 1)] || 0
  const gasPrevMonth = energy.gasMonthly[Math.max(0, new Date().getMonth() - 1)] || 0
  const stromDiff = totalStromMonth - stromPrevMonth
  const gasDiff = totalGasMonth - gasPrevMonth

  // Chart data
  const dailyChartData = energy.stromDaily.map((s, i) => ({
    tag: i + 1,
    strom: s,
    gas: energy.gasDaily[i] || 0,
  }))

  const monthlyChartData = MONTHS.map((m, i) => ({
    monat: m,
    strom: energy.stromMonthly[i] || 0,
    gas: energy.gasMonthly[i] || 0,
    kosten: Math.round((energy.stromMonthly[i] || 0) * energy.stromPrice + (energy.gasMonthly[i] || 0) * energy.gasPrice),
  }))

  // Device consumption
  const deviceData = energy.devices.map(d => ({
    ...d,
    dailyKWh: Math.round((d.watts * d.hoursPerDay / 1000) * 100) / 100,
    monthlyCost: Math.round((d.watts * d.hoursPerDay / 1000) * 30 * energy.stromPrice * 100) / 100,
  }))

  const totalLightsOn = smarthome.rooms.reduce((s, r) => s + r.lights.filter(l => l.on).length, 0)
  const totalLights = smarthome.rooms.reduce((s, r) => s + r.lights.length, 0)
  const avgTemp = Math.round(smarthome.rooms.reduce((s, r) => s + r.temp, 0) / smarthome.rooms.length * 10) / 10

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Quick Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {[
          { label: '⌀ Temperatur', value: `${avgTemp}°C`, color: 'var(--coral)' },
          { label: 'Lichter an', value: `${totalLightsOn}/${totalLights}`, color: 'var(--amber)' },
          { label: 'Strom/Monat', value: `${stromCostMonth}€`, color: 'var(--blue)', sub: stromDiff <= 0 ? `↓ ${Math.abs(stromDiff)}kWh` : `↑ ${stromDiff}kWh` },
          { label: 'Gas/Monat', value: `${gasCostMonth}€`, color: 'var(--teal)', sub: gasDiff <= 0 ? `↓ ${Math.abs(gasDiff)}kWh` : `↑ ${gasDiff}kWh` },
        ].map(s => (
          <div key={s.label} style={{
            background: 'var(--bg-card)', borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)', padding: '14px 16px',
          }}>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>{s.label}</p>
            <p style={{ fontSize: 22, fontWeight: 600, color: s.color, marginTop: 4, fontFamily: 'var(--font-mono)' }}>{s.value}</p>
            {s.sub && <p style={{ fontSize: 10, color: s.sub.startsWith('↓') ? 'var(--teal)' : 'var(--coral)', marginTop: 2 }}>{s.sub} vs. Vormonat</p>}
          </div>
        ))}
      </div>

      {/* Room Controls */}
      <div>
        <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Räume & Geräte
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {smarthome.rooms.map(room => (
            <RoomCard key={room.id} room={room} onUpdate={updateRoom} />
          ))}
        </div>
      </div>

      {/* Energy Charts */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Energieverbrauch
          </p>
          <div style={{ display: 'flex', gap: 2, background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', padding: 3, border: '1px solid var(--border)' }}>
            {['daily', 'monthly'].map(v => (
              <button key={v} onClick={() => setEnergyView(v)} style={{
                padding: '5px 12px', borderRadius: 'var(--radius-sm)', border: 'none',
                fontSize: 11, cursor: 'pointer', fontFamily: 'var(--font-main)',
                background: energyView === v ? 'var(--purple-dim)' : 'transparent',
                color: energyView === v ? '#fff' : 'var(--text-secondary)',
              }}>{v === 'daily' ? 'Täglich' : 'Monatlich'}</button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {/* Strom */}
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <Zap size={15} color="var(--blue)" />
              <span style={{ fontSize: 14, fontWeight: 500 }}>Strom (kWh)</span>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={energyView === 'daily' ? dailyChartData : monthlyChartData}>
                <defs>
                  <linearGradient id="stromGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#85B7EB" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#85B7EB" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey={energyView === 'daily' ? 'tag' : 'monat'} tick={{ fill: '#8888aa', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#8888aa', fontSize: 10 }} axisLine={false} tickLine={false} width={30} />
                <Tooltip content={<CustomTooltip />} />
                {energyView === 'daily' && <ReferenceLine y={avgStromDaily} stroke="#5DCAA5" strokeDasharray="4 4" strokeWidth={1} />}
                <Area type="monotone" dataKey="strom" name="Strom (kWh)" stroke="#85B7EB" strokeWidth={2} fill="url(#stromGrad)" dot={energyView !== 'daily' ? { fill: '#85B7EB', r: 3 } : false} />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          {/* Gas */}
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <GasIcon size={15} color="var(--coral)" />
              <span style={{ fontSize: 14, fontWeight: 500 }}>Gas (kWh)</span>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={energyView === 'daily' ? dailyChartData : monthlyChartData}>
                <defs>
                  <linearGradient id="gasGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F0997B" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#F0997B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey={energyView === 'daily' ? 'tag' : 'monat'} tick={{ fill: '#8888aa', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#8888aa', fontSize: 10 }} axisLine={false} tickLine={false} width={30} />
                <Tooltip content={<CustomTooltip />} />
                {energyView === 'daily' && <ReferenceLine y={avgGasDaily} stroke="#5DCAA5" strokeDasharray="4 4" strokeWidth={1} />}
                <Area type="monotone" dataKey="gas" name="Gas (kWh)" stroke="#F0997B" strokeWidth={2} fill="url(#gasGrad)" dot={energyView !== 'daily' ? { fill: '#F0997B', r: 3 } : false} />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>

      {/* Monthly Cost Overview */}
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <TrendingDown size={15} color="var(--teal)" />
          <span style={{ fontSize: 14, fontWeight: 500 }}>Energiekosten (€/Monat)</span>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={monthlyChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="monat" tick={{ fill: '#8888aa', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#8888aa', fontSize: 11 }} axisLine={false} tickLine={false} width={35} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="kosten" name="Kosten (€)" fill="#7F77DD" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Device Power Consumption */}
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <Power size={15} color="var(--amber)" />
          <span style={{ fontSize: 14, fontWeight: 500 }}>Geräteverbrauch</span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 'auto' }}>
            Geschätzt · {energy.stromPrice * 100} ct/kWh
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {deviceData.sort((a, b) => b.dailyKWh - a.dailyKWh).map(d => (
            <div key={d.id} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
              background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)',
            }}>
              <span style={{ fontSize: 13, flex: 1 }}>{d.name}</span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{d.watts}W</span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{d.hoursPerDay}h/Tag</span>
              <span style={{ fontSize: 12, color: 'var(--blue)', fontFamily: 'var(--font-mono)', fontWeight: 500, width: 65, textAlign: 'right' }}>{d.dailyKWh} kWh/d</span>
              <span style={{ fontSize: 12, color: 'var(--amber)', fontFamily: 'var(--font-mono)', fontWeight: 500, width: 65, textAlign: 'right' }}>{d.monthlyCost} €/Mo</span>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 8, fontStyle: 'italic' }}>
          ⚡ Später: Echte Verbrauchsdaten über smarte Steckdosen mit Home Assistant
        </p>
      </Card>

      {/* Info Banner */}
      <div style={{
        padding: '14px 18px', borderRadius: 'var(--radius-md)',
        background: 'rgba(127,119,221,0.08)', border: '1px solid rgba(127,119,221,0.2)',
      }}>
        <p style={{ fontSize: 13, color: 'var(--purple)', fontWeight: 500, marginBottom: 4 }}>🔌 Prototyp-Modus</p>
        <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          Die Daten sind aktuell Demo-Werte. Sobald dein Pi mit Home Assistant läuft, werden hier echte
          Live-Daten von deinen Sensoren, Thermostaten und smarten Steckdosen angezeigt.
          Zigbee-Stick + Sensoren → Home Assistant → Dashboard API.
        </p>
      </div>
    </div>
  )
}
