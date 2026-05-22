export default function Card({ children, style = {} }) {
  return (
    <div style={{
      background: 'var(--bg-card)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border)',
      padding: '18px',
      transition: 'border-color 0.2s',
      ...style,
    }}>
      {children}
    </div>
  )
}

export function CardHeader({ icon, title, right, color = 'var(--purple)' }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ color, display: 'flex', alignItems: 'center' }}>{icon}</span>
        <span style={{ fontSize: 15, fontWeight: 500 }}>{title}</span>
      </div>
      {right}
    </div>
  )
}
