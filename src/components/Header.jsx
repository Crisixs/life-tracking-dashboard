import { Settings, Bell } from 'lucide-react'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 6) return 'Gute Nacht'
  if (h < 12) return 'Guten Morgen'
  if (h < 18) return 'Guten Tag'
  return 'Guten Abend'
}

function formatDate() {
  return new Date().toLocaleDateString('de-DE', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })
}

export default function Header() {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
      <div>
        <h1 style={{ fontSize: 26, fontWeight: 600, letterSpacing: '-0.5px' }}>
          {getGreeting()} <span style={{ opacity: 0.4 }}>👋</span>
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{formatDate()}</p>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        {[Bell, Settings].map((Icon, i) => (
          <button key={i} style={{
            width: 38, height: 38, borderRadius: '50%', background: 'var(--bg-card)',
            border: '1px solid var(--border)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-hover)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <Icon size={16} color="var(--text-secondary)" />
          </button>
        ))}
      </div>
    </div>
  )
}
