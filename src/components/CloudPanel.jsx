import { useMemo } from 'react'
import {
  HardDrive, Cloud, Folder, FileText, Image, Music, Film, Archive,
  Monitor, Smartphone, Tablet, Wifi, WifiOff, RefreshCw, Upload, Download,
} from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import Card, { CardHeader } from './Card'

const fileIcons = {
  doc: FileText,
  img: Image,
  audio: Music,
  video: Film,
  backup: Archive,
}

const deviceIcons = {
  'Jonas PC': Monitor,
  'iPhone': Smartphone,
  'Tablet': Tablet,
}

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const d = payload[0]
  return (
    <div style={{ background: '#1c1c35', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 14px', fontSize: 12 }}>
      <p style={{ color: d.payload.color || '#8888aa', fontWeight: 500 }}>{d.name}: {Math.round(d.value)} GB</p>
    </div>
  )
}

function StorageRing({ used, total }) {
  const pct = Math.round((used / total) * 100)
  const radius = 60
  const stroke = 10
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (pct / 100) * circumference
  const color = pct > 90 ? 'var(--red)' : pct > 70 ? 'var(--amber)' : 'var(--teal)'

  return (
    <div style={{ position: 'relative', width: 140, height: 140 }}>
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={radius} fill="none" stroke="var(--bg-input)" strokeWidth={stroke} />
        <circle cx="70" cy="70" r={radius} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round" transform="rotate(-90 70 70)"
          style={{ transition: 'stroke-dashoffset 0.5s' }} />
      </svg>
      <div style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        textAlign: 'center',
      }}>
        <p style={{ fontSize: 24, fontWeight: 600, color, fontFamily: 'var(--font-mono)', margin: 0 }}>{pct}%</p>
        <p style={{ fontSize: 10, color: 'var(--text-muted)', margin: '2px 0 0' }}>belegt</p>
      </div>
    </div>
  )
}

export default function CloudPanel({ cloud }) {
  const freeGB = cloud.totalGB - cloud.usedGB
  const freePct = Math.round((freeGB / cloud.totalGB) * 100)

  const pieData = cloud.folders.map(f => ({
    name: f.name,
    value: f.sizeGB,
    color: f.color,
  }))

  // Add free space to pie
  pieData.push({ name: 'Frei', value: freeGB, color: 'rgba(255,255,255,0.06)' })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Storage Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {[
          { label: 'Gesamt', value: `${(cloud.totalGB / 1000).toFixed(1)} TB`, color: 'var(--purple)' },
          { label: 'Belegt', value: `${cloud.usedGB} GB`, color: 'var(--coral)' },
          { label: 'Frei', value: `${(freeGB / 1000).toFixed(1)} TB`, color: 'var(--teal)' },
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
        {/* Storage Breakdown */}
        <Card>
          <CardHeader icon={<HardDrive size={16} />} title="Speicherverteilung" color="var(--purple)" />
          <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
            <StorageRing used={cloud.usedGB} total={cloud.totalGB} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {cloud.folders.map(f => {
                const pct = Math.round((f.sizeGB / cloud.totalGB) * 100)
                return (
                  <div key={f.name}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 8, height: 8, borderRadius: 2, background: f.color }} />
                        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{f.name}</span>
                      </div>
                      <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{f.sizeGB} GB</span>
                    </div>
                    <div style={{ height: 3, background: 'var(--bg-input)', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${Math.min(100, pct * 5)}%`, background: f.color, borderRadius: 2 }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </Card>

        {/* Connected Devices */}
        <Card>
          <CardHeader icon={<Cloud size={16} />} title="Verbundene Geräte" color="var(--blue)" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {cloud.connectedDevices.map(d => {
              const DeviceIcon = deviceIcons[d.name] || Monitor
              const isOnline = d.status === 'online'
              return (
                <div key={d.name} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '12px',
                  background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)',
                }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 'var(--radius-sm)',
                    background: isOnline ? 'rgba(93,202,165,0.1)' : 'rgba(136,136,170,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <DeviceIcon size={18} color={isOnline ? 'var(--teal)' : 'var(--text-muted)'} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 500, margin: 0 }}>{d.name}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '2px 0 0' }}>
                      Letzte Sync: {d.lastSync}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    {isOnline ? <Wifi size={14} color="var(--teal)" /> : <WifiOff size={14} color="var(--text-muted)" />}
                    <span style={{
                      fontSize: 10, padding: '2px 8px', borderRadius: 10,
                      background: isOnline ? 'rgba(93,202,165,0.15)' : 'rgba(136,136,170,0.1)',
                      color: isOnline ? 'var(--teal)' : 'var(--text-muted)',
                    }}>{isOnline ? 'Online' : 'Offline'}</span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Sync Stats */}
          <div style={{
            display: 'flex', gap: 12, marginTop: 12, padding: '10px 12px',
            background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)',
          }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Upload size={13} color="var(--teal)" />
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Upload: </span>
              <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--teal)' }}>2.4 GB/heute</span>
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Download size={13} color="var(--blue)" />
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Download: </span>
              <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--blue)' }}>856 MB/heute</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Files */}
      <Card>
        <CardHeader icon={<FileText size={16} />} title="Zuletzt synchronisiert" color="var(--teal)"
          right={
            <button style={{
              display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px',
              borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)',
              background: 'transparent', color: 'var(--text-secondary)', fontSize: 11,
              cursor: 'pointer', fontFamily: 'var(--font-main)',
            }}>
              <RefreshCw size={12} /> Sync
            </button>
          }
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {cloud.recentFiles.map((f, i) => {
            const Icon = fileIcons[f.type] || FileText
            const iconColor = f.type === 'img' ? 'var(--blue)' : f.type === 'audio' ? 'var(--purple)' :
              f.type === 'backup' ? 'var(--amber)' : 'var(--teal)'
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
                background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)',
              }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 'var(--radius-sm)',
                  background: `${iconColor}15`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={16} color={iconColor} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</p>
                  <p style={{ fontSize: 10, color: 'var(--text-muted)', margin: '2px 0 0' }}>{f.date}</p>
                </div>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>{f.size}</span>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Nextcloud Info */}
      <Card>
        <CardHeader icon={<Cloud size={16} />} title="Nextcloud Status" color="var(--blue)" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {[
            { label: 'Server', value: 'Raspberry Pi 5', sub: 'ARM64 · 8GB RAM' },
            { label: 'Speicher', value: 'Seagate 4TB', sub: 'USB 3.0 · HDD' },
            { label: 'Nextcloud', value: 'v29.x', sub: 'Docker Container' },
          ].map(s => (
            <div key={s.label} style={{
              padding: '10px 12px', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)',
            }}>
              <p style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</p>
              <p style={{ fontSize: 14, fontWeight: 500, margin: '4px 0 2px' }}>{s.value}</p>
              <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>{s.sub}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Storage Bar */}
      <div style={{
        padding: '14px 18px', borderRadius: 'var(--radius-md)',
        background: 'var(--bg-card)', border: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Gesamtbelegung</span>
          <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
            {cloud.usedGB} GB / {(cloud.totalGB / 1000).toFixed(0)} TB
          </span>
        </div>
        <div style={{ height: 10, background: 'var(--bg-input)', borderRadius: 5, overflow: 'hidden', display: 'flex' }}>
          {cloud.folders.map((f, i) => (
            <div key={i} style={{
              height: '100%', width: `${(f.sizeGB / cloud.totalGB) * 100}%`,
              background: f.color, transition: 'width 0.5s',
            }} />
          ))}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 8 }}>
          {cloud.folders.map(f => (
            <div key={f.name} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 6, height: 6, borderRadius: 2, background: f.color }} />
              <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{f.name}</span>
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 6, height: 6, borderRadius: 2, background: 'rgba(255,255,255,0.06)' }} />
            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Frei ({freePct}%)</span>
          </div>
        </div>
      </div>

      {/* Prototyp Banner */}
      <div style={{
        padding: '14px 18px', borderRadius: 'var(--radius-md)',
        background: 'rgba(127,119,221,0.08)', border: '1px solid rgba(127,119,221,0.2)',
      }}>
        <p style={{ fontSize: 13, color: 'var(--purple)', fontWeight: 500, marginBottom: 4 }}>☁️ Prototyp-Modus</p>
        <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          Demo-Daten. Sobald Nextcloud auf deinem Pi läuft, zeigt dieses Panel echte Speicherauslastung,
          Sync-Status und zuletzt hochgeladene Dateien. Die 4TB Seagate HDD wird als externer Speicher eingebunden.
        </p>
      </div>
    </div>
  )
}
