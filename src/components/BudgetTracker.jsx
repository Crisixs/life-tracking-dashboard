import { useState, useMemo } from 'react'
import { Wallet, Plus, X, Trash2, TrendingUp, TrendingDown, PiggyBank, CreditCard } from 'lucide-react'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts'
import Card, { CardHeader } from './Card'

const MONTHS = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez']

const CATEGORIES = [
  { value: 'food', label: 'Essen', color: '#F0997B' },
  { value: 'transport', label: 'Transport', color: '#85B7EB' },
  { value: 'entertainment', label: 'Freizeit', color: '#7F77DD' },
  { value: 'shopping', label: 'Shopping', color: '#5DCAA5' },
  { value: 'health', label: 'Gesundheit', color: '#EF9F27' },
  { value: 'bills', label: 'Rechnungen', color: '#E24B4A' },
  { value: 'savings', label: 'Sparen', color: '#5DCAA5' },
  { value: 'income', label: 'Einnahme', color: '#5DCAA5' },
  { value: 'other', label: 'Sonstiges', color: '#8888aa' },
]

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#1c1c35', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 14px', fontSize: 12 }}>
      <p style={{ color: '#8888aa', marginBottom: 4 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, fontWeight: 500 }}>{p.name}: {Math.round(p.value)}€</p>
      ))}
    </div>
  )
}

export default function BudgetTracker({ budget, setBudget }) {
  const [showAddTx, setShowAddTx] = useState(false)
  const [showAddFixed, setShowAddFixed] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [txDesc, setTxDesc] = useState('')
  const [txAmount, setTxAmount] = useState('')
  const [txCat, setTxCat] = useState('other')
  const [txType, setTxType] = useState('expense')
  const [txDate, setTxDate] = useState(new Date().toISOString().split('T')[0])
  const [fixedName, setFixedName] = useState('')
  const [fixedAmount, setFixedAmount] = useState('')

  const transactions = budget.transactions || []
  const fixedExpenses = budget.fixedExpenses || []

  const addTransaction = () => {
    if (!txDesc.trim() || !txAmount) return
    const tx = {
      id: Date.now(), desc: txDesc.trim(), amount: parseFloat(txAmount),
      category: txType === 'income' ? 'income' : txCat, type: txType, date: txDate,
    }
    setBudget(prev => ({ ...prev, transactions: [tx, ...(prev.transactions || [])] }))
    setTxDesc('')
    setTxAmount('')
    setShowAddTx(false)
  }

  const removeTx = id => setBudget(prev => ({ ...prev, transactions: prev.transactions.filter(t => t.id !== id) }))

  const addFixed = () => {
    if (!fixedName.trim() || !fixedAmount) return
    setBudget(prev => ({
      ...prev,
      fixedExpenses: [...(prev.fixedExpenses || []), { id: Date.now(), name: fixedName.trim(), amount: parseFloat(fixedAmount) }]
    }))
    setFixedName('')
    setFixedAmount('')
    setShowAddFixed(false)
  }

  const removeFixed = id => setBudget(prev => ({ ...prev, fixedExpenses: prev.fixedExpenses.filter(f => f.id !== id) }))

  // Calculations
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  const thisMonthTx = transactions.filter(t => {
    const d = new Date(t.date)
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear
  })

  const monthIncome = thisMonthTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0) + (budget.income || 0)
  const monthExpenses = thisMonthTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const totalFixed = fixedExpenses.reduce((s, f) => s + f.amount, 0)
  const available = monthIncome - monthExpenses - totalFixed
  const debtTotal = budget.debtTotal || 0
  const debtPaid = (budget.debtPayments || []).reduce((s, p) => s + p.amount, 0)
  const debtRemaining = Math.max(0, debtTotal - debtPaid)

  // Category breakdown
  const catBreakdown = useMemo(() => {
    const map = {}
    thisMonthTx.filter(t => t.type === 'expense').forEach(t => {
      map[t.category] = (map[t.category] || 0) + t.amount
    })
    return CATEGORIES.filter(c => map[c.value]).map(c => ({ ...c, amount: Math.round(map[c.value]) }))
  }, [thisMonthTx])

  // Monthly trend (last 6 months)
  const monthlyTrend = useMemo(() => {
    const data = []
    for (let i = 5; i >= 0; i--) {
      const m = new Date(currentYear, currentMonth - i, 1)
      const month = m.getMonth()
      const year = m.getFullYear()
      const mTx = transactions.filter(t => {
        const d = new Date(t.date)
        return d.getMonth() === month && d.getFullYear() === year
      })
      data.push({
        label: MONTHS[month],
        einnahmen: mTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0) + (budget.income || 0),
        ausgaben: mTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0) + totalFixed,
      })
    }
    return data
  }, [transactions, budget.income, totalFixed])

  // Net worth trend
  const netWorthTrend = useMemo(() => {
    let cumulative = 0
    return monthlyTrend.map(m => {
      cumulative += (m.einnahmen - m.ausgaben)
      return { label: m.label, vermögen: Math.round(cumulative) }
    })
  }, [monthlyTrend])

  const inputStyle = {
    background: 'var(--bg-input)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)', padding: '8px 10px', color: 'var(--text-primary)',
    fontSize: 13, outline: 'none', width: '100%',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Overview Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {[
          { label: 'Einnahmen', value: `${Math.round(monthIncome)}€`, color: 'var(--teal)', icon: TrendingUp },
          { label: 'Ausgaben', value: `${Math.round(monthExpenses + totalFixed)}€`, color: 'var(--coral)', icon: TrendingDown },
          { label: 'Verfügbar', value: `${Math.round(available)}€`, color: available >= 0 ? 'var(--blue)' : 'var(--red)', icon: Wallet },
          { label: 'Schulden', value: debtTotal > 0 ? `${Math.round(debtRemaining)}€` : '—', color: 'var(--amber)', icon: CreditCard },
        ].map(s => (
          <div key={s.label} style={{
            background: 'var(--bg-card)', borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)', padding: '14px 16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <s.icon size={13} color={s.color} />
              <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>{s.label}</p>
            </div>
            <p style={{ fontSize: 22, fontWeight: 600, color: s.color, fontFamily: 'var(--font-mono)' }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {/* Transactions */}
        <Card>
          <CardHeader icon={<Wallet size={16} />} title="Transaktionen" color="var(--blue)"
            right={
              <button onClick={() => setShowAddTx(!showAddTx)} style={{
                width: 26, height: 26, borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)', background: 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              }}>
                {showAddTx ? <X size={14} color="var(--text-secondary)" /> : <Plus size={14} color="var(--text-secondary)" />}
              </button>
            }
          />

          {showAddTx && (
            <div style={{ marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', gap: 4 }}>
                {['expense', 'income'].map(t => (
                  <button key={t} onClick={() => setTxType(t)} style={{
                    flex: 1, padding: '6px', borderRadius: 'var(--radius-sm)', fontSize: 12,
                    border: txType === t ? `1.5px solid ${t === 'income' ? 'var(--teal)' : 'var(--coral)'}` : '1px solid var(--border)',
                    background: txType === t ? (t === 'income' ? 'rgba(93,202,165,0.12)' : 'rgba(240,153,123,0.12)') : 'var(--bg-input)',
                    color: txType === t ? (t === 'income' ? 'var(--teal)' : 'var(--coral)') : 'var(--text-secondary)',
                    cursor: 'pointer', fontFamily: 'var(--font-main)',
                  }}>{t === 'income' ? 'Einnahme' : 'Ausgabe'}</button>
                ))}
              </div>
              <input value={txDesc} onChange={e => setTxDesc(e.target.value)} placeholder="Beschreibung..." style={inputStyle} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                <input value={txAmount} onChange={e => setTxAmount(e.target.value)} type="number" placeholder="Betrag €" style={inputStyle} />
                <input type="date" value={txDate} onChange={e => setTxDate(e.target.value)} style={inputStyle} />
              </div>
              {txType === 'expense' && (
                <select value={txCat} onChange={e => setTxCat(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                  {CATEGORIES.filter(c => c.value !== 'income' && c.value !== 'savings').map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              )}
              <button onClick={addTransaction} style={{
                background: txType === 'income' ? 'var(--teal-dim)' : 'var(--coral-dim)',
                border: 'none', borderRadius: 'var(--radius-sm)',
                padding: '8px', color: '#fff', fontSize: 12, cursor: 'pointer', fontWeight: 500,
              }}>Hinzufügen</button>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 280, overflowY: 'auto' }}>
            {transactions.slice(0, 15).map(tx => {
              const cat = CATEGORIES.find(c => c.value === tx.category)
              return (
                <div key={tx.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '8px 10px', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)',
                }}>
                  <div>
                    <p style={{ fontSize: 13, margin: 0 }}>{tx.desc}</p>
                    <p style={{ fontSize: 10, color: 'var(--text-muted)', margin: '2px 0 0' }}>
                      {new Date(tx.date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })} · {cat?.label}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      fontSize: 13, fontFamily: 'var(--font-mono)', fontWeight: 500,
                      color: tx.type === 'income' ? 'var(--teal)' : 'var(--coral)',
                    }}>
                      {tx.type === 'income' ? '+' : '-'}{Math.round(tx.amount)}€
                    </span>
                    <Trash2 size={11} color="var(--text-muted)" style={{ cursor: 'pointer' }} onClick={() => removeTx(tx.id)} />
                  </div>
                </div>
              )
            })}
            {transactions.length === 0 && (
              <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: 20 }}>Keine Transaktionen</p>
            )}
          </div>
        </Card>

        {/* Fixed Expenses & Settings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Card>
            <CardHeader icon={<CreditCard size={16} />} title="Fixkosten" color="var(--coral)"
              right={
                <button onClick={() => setShowAddFixed(!showAddFixed)} style={{
                  width: 26, height: 26, borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)', background: 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                }}>
                  {showAddFixed ? <X size={14} color="var(--text-secondary)" /> : <Plus size={14} color="var(--text-secondary)" />}
                </button>
              }
            />
            {showAddFixed && (
              <div style={{ marginBottom: 10, display: 'flex', gap: 6 }}>
                <input value={fixedName} onChange={e => setFixedName(e.target.value)} placeholder="Name..." style={{ ...inputStyle, flex: 1 }} />
                <input value={fixedAmount} onChange={e => setFixedAmount(e.target.value)} type="number" placeholder="€" style={{ ...inputStyle, width: 80 }} />
                <button onClick={addFixed} style={{
                  background: 'var(--coral-dim)', border: 'none', borderRadius: 'var(--radius-sm)',
                  padding: '8px 12px', color: '#fff', fontSize: 12, cursor: 'pointer',
                }}>+</button>
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {fixedExpenses.map(f => (
                <div key={f.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '7px 10px', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)',
                }}>
                  <span style={{ fontSize: 13 }}>{f.name}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 12, color: 'var(--coral)', fontFamily: 'var(--font-mono)' }}>-{Math.round(f.amount)}€</span>
                    <Trash2 size={11} color="var(--text-muted)" style={{ cursor: 'pointer' }} onClick={() => removeFixed(f.id)} />
                  </div>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', fontSize: 12, color: 'var(--text-secondary)' }}>
                <span>Gesamt</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--coral)' }}>-{Math.round(totalFixed)}€/Monat</span>
              </div>
            </div>
          </Card>

          {/* Income & Debt Settings */}
          <Card>
            <CardHeader icon={<PiggyBank size={16} />} title="Einstellungen" color="var(--amber)" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div>
                <label style={{ fontSize: 10, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Monatliches Einkommen (Gehalt etc.)</label>
                <input type="number" value={budget.income || ''} placeholder="0"
                  onChange={e => setBudget(prev => ({ ...prev, income: parseFloat(e.target.value) || 0 }))}
                  style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: 10, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Sparziel pro Monat</label>
                <input type="number" value={budget.savingsGoal || ''} placeholder="0"
                  onChange={e => setBudget(prev => ({ ...prev, savingsGoal: parseFloat(e.target.value) || 0 }))}
                  style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: 10, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Schulden gesamt</label>
                <input type="number" value={budget.debtTotal || ''} placeholder="0"
                  onChange={e => setBudget(prev => ({ ...prev, debtTotal: parseFloat(e.target.value) || 0 }))}
                  style={inputStyle} />
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {/* Monthly Trend */}
        <Card>
          <CardHeader icon={<TrendingUp size={16} />} title="Einnahmen vs Ausgaben" color="var(--teal)" />
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="label" tick={{ fill: '#8888aa', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#8888aa', fontSize: 11 }} axisLine={false} tickLine={false} width={40} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="einnahmen" name="Einnahmen" fill="#5DCAA5" radius={[4, 4, 0, 0]} />
              <Bar dataKey="ausgaben" name="Ausgaben" fill="#F0997B" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Net Worth / Savings Trend */}
        <Card>
          <CardHeader icon={<PiggyBank size={16} />} title="Vermögensaufbau" color="var(--purple)" />
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={netWorthTrend}>
              <defs>
                <linearGradient id="netGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7F77DD" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#7F77DD" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="label" tick={{ fill: '#8888aa', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#8888aa', fontSize: 11 }} axisLine={false} tickLine={false} width={50} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="vermögen" name="Vermögen" stroke="#7F77DD" strokeWidth={2} fill="url(#netGrad)" dot={{ fill: '#7F77DD', r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Category Breakdown */}
      {catBreakdown.length > 0 && (
        <Card>
          <CardHeader icon={<TrendingDown size={16} />} title="Ausgaben nach Kategorie" color="var(--coral)" />
          <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
            <div style={{ width: 160, height: 160 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={catBreakdown} dataKey="amount" nameKey="label" cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={2}>
                    {catBreakdown.map((c, i) => <Cell key={i} fill={c.color} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {catBreakdown.map(c => (
                <div key={c.value} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: c.color }} />
                    <span style={{ color: 'var(--text-secondary)' }}>{c.label}</span>
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{c.amount}€</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Debt Progress */}
      {debtTotal > 0 && (
        <Card>
          <CardHeader icon={<CreditCard size={16} />} title="Schuldenabbau" color="var(--amber)" />
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 24, fontWeight: 600, color: 'var(--amber)', fontFamily: 'var(--font-mono)' }}>
              {Math.round(debtRemaining)}€
            </span>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>von {Math.round(debtTotal)}€ übrig</span>
          </div>
          <div style={{ height: 8, background: 'var(--bg-input)', borderRadius: 4, overflow: 'hidden', marginBottom: 6 }}>
            <div style={{
              height: '100%', borderRadius: 4, transition: 'width 0.5s',
              width: `${debtTotal > 0 ? Math.round((debtPaid / debtTotal) * 100) : 0}%`,
              background: 'var(--amber)',
            }} />
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            {debtTotal > 0 ? Math.round((debtPaid / debtTotal) * 100) : 0}% abbezahlt
          </p>
        </Card>
      )}
    </div>
  )
}
