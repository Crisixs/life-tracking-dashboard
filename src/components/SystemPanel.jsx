import { useState, useEffect } from 'react'
import {
  Cpu, MemoryStick, Thermometer, Clock, Wifi, Shield, Activity,
  Monitor, Smartphone, Tablet, HardDrive, Router, ChevronDown, ChevronUp,
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, PieChart, Pie, Cell,
} from 'recharts'
import Card, { CardHeader } from './Card'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#1c1c35', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 14px', fontSize: 12 }}>
      <p style={{ color: '#8888aa', marginBottom: 4 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, fontWeight: 500 }}>{p.name}: {typeof p.value === 'number' ? Math.round(p.value * 10) / 10 : p.value}</p>
      ))}
    </div>
  )
}

/* Demo data generators */
function generateCpuHistory() {
  return Array.from({ length: 60 }, (_, i) => ({
    time: `${60 - i}s`,
    cpu: Math.round((15 + Math.random() * 30 + (i > 40 ? Math.random() * 20 : 0)) * 10) / 10,
  }))
}

function generateTempHistory() {
  return Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    temp: Math.round((42 + Math.sin(i / 4) * 8 + Math.random() * 3) * 10) / 10,
  }))
}

const DEMO_SYSTEM = {
  cpu: { usage: 23, cores: 4, model: 'BCM2712 (ARM Cortex-A76)', freq: '2.4 GHz' },
  ram: { total: 8192, used: 3240, cached: 1800 },
  temp: 48.5,
  uptime: { days: 12, hours: 7, minutes: 42 },
  disk: { total: 32, used: 14.2, label: 'SD-Karte' },
  os: 'Raspberry Pi OS (Bookworm) 64-bit',
  kernel: 'Linux 6.6.x aarch64',
  hostname: 'raspberrypi.local',
}

const DEMO_NETWORK = [
  { name: 'Jonas PC', ip: '192.168.1.100', mac: 'A4:83:E7:xx:xx:01', type: 'pc', status: 'online', lastSeen: 'Jetzt' },
  { name: 'iPhone', ip: '192.168.1.101', mac: 'F0:D4:E2:xx:xx:02', type: 'phone', status: 'online', lastSeen: 'Jetzt' },
  { name: 'Raspberry Pi', ip: '192.168.1.50', mac: 'D8:3A:DD:xx:xx:03', type: 'server', status: 'online', lastSeen: 'Jetzt' },
  { name: 'Smart TV', ip: '192.168.1.110', mac: 'B4:F7:A1:xx:xx:04', type: 'tv', status: 'online', lastSeen: 'Vor 10 Min' },
  { name: 'Tablet', ip: '192.168.1.102', mac: 'C8:21:58:xx:xx:05', type: 'tablet', status: 'offline', lastSeen: 'Vor 2 Tagen' },
  { name: 'PS5', ip: '192.168.1.120', mac: 'A4:FC:77:xx:xx:06', type: 'gaming', status: 'offline', lastSeen: 'Gestern' },
  { name: 'Echo Dot', ip: '192.168.1.130', mac: 'F0:F0:A4:xx:xx:07', type: 'iot', status: 'online', lastSeen: 'Jetzt' },
  { name: 'Zigbee Gateway', ip: '192.168.1.200', mac: 'CC:86:EC:xx:xx:08', type: 'iot', status: 'online', lastSeen: 'Jetzt' },
]

const DEMO_PIHOLE = {
  totalQueries: 48523,
  blockedQueries: 12847,
  blockedPct: 26.5,
  domainsOnBlocklist: 142567,
  topBlocked: [
    { domain: 'graph.facebook.com', count: 1842 },
    { domain: 'ads.google.com', count: 1234 },
    { domain: 'tracking.amazon.de', count: 987 },
    { domain: 'telemetry.microsoft.com', count: 756 },
    { domain: 'analytics.tiktok.com', count: 623 },
  ],
  hourlyBlocked: Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    blocked: Math.round(200 + Math.sin(i / 3) * 150 + Math.random() * 100),
    allowed: Math.round(800 + Math.cos(i / 4) * 300 + Math.random() * 200),
  })),
}

const deviceIcons = {
  pc: Monitor, phone: Smartphone, tablet: Tablet, server: HardDrive,
  tv: Monitor, gaming: Activity, iot: Router,
}

/* ─── Usage Gauge ─── */
function Gauge({ value, max, label, unit, color, size = 80 }) {
  const pct = Math.round((value / max) * 100)
  const radius = (size / 2) - 6
  const circumference = Math.PI * radius // half circle
  const offset = circumference - (pct / 100) * circumference
  const statusColor = pct > 85 ? 'var(--red)' : pct > 60 ? 'var(--amber)' : color

  return (
    <div style={{ textAlign: 'center' }}>
      <svg width={size} height={size / 2 + 10} viewBox={`0 0 ${size} ${size / 2 + 10}`}>
        <path d={`M ${size * 0.1} ${size / 2} A ${radius} ${radius} 0 0 1 ${size * 0.9} ${size / 2}`}
          fill="none" stroke="var(--bg-input)" strokeWidth={8} strokeLinecap="round" />
        <path d={`M ${size * 0.1} ${size / 2} A ${radius} ${radius} 0 0 1 ${size * 0.9} ${size / 2}`}
          fill="none" stroke={statusColor} strokeWidth={8} strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.5s' }} />
      </svg>
      <p style={{ fontSize: 18, fontWeight: 600, color: statusColor, fontFamily: 'var(--font-mono)', margin: '-8px 0 2px' }}>
        {Math.round(value)}{unit}
      </p>
      <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>{label}</p>
    </div>
  )
}

export default function SystemPanel() {
  const [showAllDevices, setShowAllDevices] = useState(false)
  const sys = DEMO_SYSTEM
  const net = DEMO_NETWORK
  const pihole = DEMO_PIHOLE

  const cpuHistory = generateCpuHistory()
  const tempHistory = generateTempHistory()

  const ramUsedPct = Math.round((sys.ram.used / sys.ram.total) * 100)
  const diskUsedPct = Math.round((sys.disk.used / sys.disk.total) * 100)

  const onlineDevices = net.filter(d => d.status === 'online').length
  const visibleDevices = showAllDevices ? net : net.filter(d => d.status === 'online')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* System Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {[
          { label: 'CPU', value: `${sys.cpu.usage}%`, color: sys.cpu.usage > 60 ? 'var(--coral)' : 'var(--teal)' },
          { label: 'RAM', value: `${ramUsedPct}%`, color: ramUsedPct > 80 ? 'var(--coral)' : 'var(--blue)' },
          { label: 'Temperatur', value: `${sys.temp}°C`, color: sys.temp > 70 ? 'var(--red)' : sys.temp > 55 ? 'var(--amber)' : 'var(--teal)' },
          { label: 'Uptime', value: `${sys.uptime.days}d ${sys.uptime.hours}h`, color: 'var(--purple)' },
        ].map(s => (
          <div key={s.label} style={{
            background: 'var(--bg-card)', borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)', padding: '14px 16px',
          }}>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>{s.label}</p>
            <p style={{ fontSize: 22, fontWeight: 600, color: s.color, marginTop: 4, fontFamily: 'var(--font-mono)' }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {/* System Gauges */}
        <Card>
          <CardHeader icon={<Cpu size={16} />} title="Systemauslastung" color="var(--teal)" />
          <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: 12 }}>
            <Gauge value={sys.cpu.usage} max={100} label="CPU" unit="%" color="var(--teal)" />
            <Gauge value={ramUsedPct} max={100} label="RAM" unit="%" color="var(--blue)" />
            <Gauge value={sys.temp} max={85} label="Temp" unit="°C" color="var(--coral)" />
            <Gauge value={diskUsedPct} max={100} label="Disk" unit="%" color="var(--purple)" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {[
              { label: 'CPU', detail: `${sys.cpu.model} · ${sys.cpu.cores} Kerne · ${sys.cpu.freq}` },
              { label: 'RAM', detail: `${(sys.ram.used / 1024).toFixed(1)} / ${(sys.ram.total / 1024).toFixed(0)} GB (${(sys.ram.cached / 1024).toFixed(1)} GB Cache)` },
              { label: 'Disk', detail: `${sys.disk.used} / ${sys.disk.total} GB (${sys.disk.label})` },
              { label: 'OS', detail: sys.os },
            ].map(r => (
              <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, padding: '4px 0' }}>
                <span style={{ color: 'var(--text-muted)' }}>{r.label}</span>
                <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{r.detail}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Uptime & System Info */}
        <Card>
          <CardHeader icon={<Clock size={16} />} title="Uptime & Info" color="var(--purple)" />
          <div style={{ textAlign: 'center', padding: '10px 0 16px' }}>
            <p style={{ fontSize: 42, fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--purple)', margin: 0 }}>
              {sys.uptime.days}<span style={{ fontSize: 16, color: 'var(--text-muted)' }}>d </span>
              {sys.uptime.hours}<span style={{ fontSize: 16, color: 'var(--text-muted)' }}>h </span>
              {sys.uptime.minutes}<span style={{ fontSize: 16, color: 'var(--text-muted)' }}>m</span>
            </p>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Ununterbrochene Laufzeit</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              { label: 'Hostname', value: sys.hostname },
              { label: 'Kernel', value: sys.kernel },
              { label: 'IP (lokal)', value: '192.168.1.50' },
              { label: 'Dashboard', value: 'http://raspberrypi.local:3000' },
            ].map(r => (
              <div key={r.label} style={{
                display: 'flex', justifyContent: 'space-between', padding: '7px 10px',
                background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)', fontSize: 12,
              }}>
                <span style={{ color: 'var(--text-muted)' }}>{r.label}</span>
                <span style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{r.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* CPU & Temp History */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <Card>
          <CardHeader icon={<Cpu size={16} />} title="CPU-Verlauf (60s)" color="var(--teal)" />
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={cpuHistory}>
              <defs>
                <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#5DCAA5" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#5DCAA5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="time" tick={{ fill: '#8888aa', fontSize: 9 }} axisLine={false} tickLine={false} interval={9} />
              <YAxis domain={[0, 100]} tick={{ fill: '#8888aa', fontSize: 10 }} axisLine={false} tickLine={false} width={30} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="cpu" name="CPU (%)" stroke="#5DCAA5" strokeWidth={1.5} fill="url(#cpuGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <CardHeader icon={<Thermometer size={16} />} title="Temperatur (24h)" color="var(--coral)" />
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={tempHistory}>
              <defs>
                <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F0997B" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#F0997B" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="time" tick={{ fill: '#8888aa', fontSize: 9 }} axisLine={false} tickLine={false} interval={3} />
              <YAxis domain={[30, 80]} tick={{ fill: '#8888aa', fontSize: 10 }} axisLine={false} tickLine={false} width={30} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="temp" name="Temp (°C)" stroke="#F0997B" strokeWidth={1.5} fill="url(#tempGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Network Monitor */}
      <Card>
        <CardHeader icon={<Wifi size={16} />} title="Netzwerk" color="var(--blue)"
          right={<span style={{ fontSize: 12, color: 'var(--teal)', fontFamily: 'var(--font-mono)' }}>{onlineDevices} online</span>}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {visibleDevices.map(d => {
            const Icon = deviceIcons[d.type] || Monitor
            const isOnline = d.status === 'online'
            return (
              <div key={d.name} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
                background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)',
              }}>
                <div style={{
                  width: 30, height: 30, borderRadius: 'var(--radius-sm)', flexShrink: 0,
                  background: isOnline ? 'rgba(93,202,165,0.1)' : 'rgba(136,136,170,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={14} color={isOnline ? 'var(--teal)' : 'var(--text-muted)'} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, margin: 0, fontWeight: 500 }}>{d.name}</p>
                  <p style={{ fontSize: 10, color: 'var(--text-muted)', margin: '1px 0 0', fontFamily: 'var(--font-mono)' }}>
                    {d.ip} · {d.mac}
                  </p>
                </div>
                <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{d.lastSeen}</span>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                  background: isOnline ? 'var(--teal)' : 'var(--text-muted)',
                }} />
              </div>
            )
          })}
        </div>
        <button onClick={() => setShowAllDevices(!showAllDevices)} style={{
          width: '100%', padding: '6px', marginTop: 6, borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border)', background: 'transparent',
          color: 'var(--text-secondary)', fontSize: 11, cursor: 'pointer', fontFamily: 'var(--font-main)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
        }}>
          {showAllDevices ? <><ChevronUp size={12} /> Nur Online</> : <><ChevronDown size={12} /> Alle {net.length} Geräte</>}
        </button>
      </Card>

      {/* Pi-hole Stats */}
      <Card>
        <CardHeader icon={<Shield size={16} />} title="Pi-hole Werbeblocker" color="var(--teal)" />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 }}>
          {[
            { label: 'Anfragen', value: pihole.totalQueries.toLocaleString('de-DE'), color: 'var(--blue)' },
            { label: 'Geblockt', value: pihole.blockedQueries.toLocaleString('de-DE'), color: 'var(--coral)' },
            { label: 'Blockrate', value: `${pihole.blockedPct}%`, color: 'var(--teal)' },
            { label: 'Blockliste', value: pihole.domainsOnBlocklist.toLocaleString('de-DE'), color: 'var(--text-secondary)' },
          ].map(s => (
            <div key={s.label} style={{ padding: '10px', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
              <p style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</p>
              <p style={{ fontSize: 16, fontWeight: 600, color: s.color, fontFamily: 'var(--font-mono)', margin: '4px 0 0' }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Hourly Chart */}
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>Anfragen pro Stunde</p>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={pihole.hourlyBlocked}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="hour" tick={{ fill: '#8888aa', fontSize: 9 }} axisLine={false} tickLine={false} interval={3} />
            <YAxis tick={{ fill: '#8888aa', fontSize: 10 }} axisLine={false} tickLine={false} width={35} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="allowed" name="Erlaubt" fill="rgba(133,183,235,0.4)" stackId="a" radius={[0, 0, 0, 0]} />
            <Bar dataKey="blocked" name="Geblockt" fill="#E24B4A" stackId="a" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>

        {/* Top Blocked */}
        <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '14px 0 8px' }}>Top geblockte Domains</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {pihole.topBlocked.map((d, i) => (
            <div key={d.domain} style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px',
              background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)',
            }}>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', width: 18 }}>#{i + 1}</span>
              <span style={{ fontSize: 12, flex: 1, fontFamily: 'var(--font-mono)', color: 'var(--coral)' }}>{d.domain}</span>
              <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{d.count.toLocaleString('de-DE')}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Prototyp Banner */}
      <div style={{
        padding: '14px 18px', borderRadius: 'var(--radius-md)',
        background: 'rgba(127,119,221,0.08)', border: '1px solid rgba(127,119,221,0.2)',
      }}>
        <p style={{ fontSize: 13, color: 'var(--purple)', fontWeight: 500, marginBottom: 4 }}>🖥️ Prototyp-Modus</p>
        <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          Demo-Daten. Sobald der Pi läuft, zeigt dieses Panel Live-Systemdaten über eine API. Pi-hole
          hat ebenfalls eine REST-API die wir direkt anbinden. Netzwerk-Scan erfolgt über ARP/nmap.
        </p>
      </div>
    </div>
  )
}
