import { useState, useRef } from 'react'
import { Settings, Download, Upload, Trash2, AlertTriangle, Check, Palette, Database, Info } from 'lucide-react'
import Card, { CardHeader } from './Card'

const STORAGE_KEY = 'dashboard_data'

export default function SettingsPanel({ data, setData }) {
  const [showReset, setShowReset] = useState(false)
  const [resetConfirm, setResetConfirm] = useState('')
  const [importStatus, setImportStatus] = useState(null)
  const [exportDone, setExportDone] = useState(false)
  const fileRef = useRef(null)

  // Data export
  const exportData = () => {
    const json = JSON.stringify(data, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `dashboard-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    setExportDone(true)
    setTimeout(() => setExportDone(false), 3000)
  }

  // Data import
  const importData = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const imported = JSON.parse(ev.target.result)
        if (imported && typeof imported === 'object') {
          setData(imported)
          localStorage.setItem(STORAGE_KEY, JSON.stringify(imported))
          setImportStatus('success')
        } else {
          setImportStatus('error')
        }
      } catch {
        setImportStatus('error')
      }
      setTimeout(() => setImportStatus(null), 3000)
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  // Reset
  const handleReset = () => {
    if (resetConfirm !== 'RESET') return
    localStorage.removeItem(STORAGE_KEY)
    window.location.reload()
  }

  // Stats
  const dataSize = new Blob([JSON.stringify(data)]).size
  const dataSizeKB = Math.round(dataSize / 1024 * 10) / 10
  const todoCount = data.todos?.length || 0
  const habitCount = data.habits?.length || 0
  const workoutCount = data.workouts?.length || 0
  const sleepCount = data.sleep?.length || 0
  const noteCount = data.notes?.length || 0
  const txCount = data.budget?.transactions?.length || 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {/* Data Management */}
        <Card>
          <CardHeader icon={<Database size={16} />} title="Daten verwalten" color="var(--blue)" />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {/* Export */}
            <button onClick={exportData} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '12px',
              background: exportDone ? 'rgba(93,202,165,0.1)' : 'var(--bg-input)',
              border: exportDone ? '1px solid rgba(93,202,165,0.3)' : '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)', cursor: 'pointer', width: '100%', textAlign: 'left',
              fontFamily: 'var(--font-main)',
            }}>
              {exportDone ? <Check size={18} color="var(--teal)" /> : <Download size={18} color="var(--blue)" />}
              <div>
                <p style={{ fontSize: 13, fontWeight: 500, margin: 0, color: exportDone ? 'var(--teal)' : 'var(--text-primary)' }}>
                  {exportDone ? 'Exportiert!' : 'Daten exportieren'}
                </p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '2px 0 0' }}>
                  JSON-Backup herunterladen ({dataSizeKB} KB)
                </p>
              </div>
            </button>

            {/* Import */}
            <button onClick={() => fileRef.current?.click()} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '12px',
              background: importStatus === 'success' ? 'rgba(93,202,165,0.1)' : importStatus === 'error' ? 'rgba(226,75,74,0.1)' : 'var(--bg-input)',
              border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
              cursor: 'pointer', width: '100%', textAlign: 'left', fontFamily: 'var(--font-main)',
            }}>
              {importStatus === 'success' ? <Check size={18} color="var(--teal)" /> :
               importStatus === 'error' ? <AlertTriangle size={18} color="var(--red)" /> :
               <Upload size={18} color="var(--teal)" />}
              <div>
                <p style={{ fontSize: 13, fontWeight: 500, margin: 0, color: importStatus === 'success' ? 'var(--teal)' : importStatus === 'error' ? 'var(--red)' : 'var(--text-primary)' }}>
                  {importStatus === 'success' ? 'Import erfolgreich!' : importStatus === 'error' ? 'Ungueltige Datei' : 'Daten importieren'}
                </p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '2px 0 0' }}>
                  JSON-Backup wiederherstellen
                </p>
              </div>
            </button>
            <input ref={fileRef} type="file" accept=".json" onChange={importData} style={{ display: 'none' }} />

            {/* Reset */}
            <div style={{
              padding: '12px', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)',
              border: showReset ? '1px solid rgba(226,75,74,0.3)' : '1px solid var(--border)',
            }}>
              <button onClick={() => setShowReset(!showReset)} style={{
                display: 'flex', alignItems: 'center', gap: 10, background: 'none',
                border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left',
                fontFamily: 'var(--font-main)', padding: 0,
              }}>
                <Trash2 size={18} color="var(--red)" />
                <div>
                  <p style={{ fontSize: 13, fontWeight: 500, margin: 0, color: 'var(--red)' }}>Alle Daten loeschen</p>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '2px 0 0' }}>Setzt alles auf Werkseinstellungen zurueck</p>
                </div>
              </button>

              {showReset && (
                <div style={{ marginTop: 10 }}>
                  <p style={{ fontSize: 11, color: 'var(--coral)', marginBottom: 6 }}>
                    Diese Aktion kann nicht rueckgaengig gemacht werden. Erstelle vorher ein Backup!
                  </p>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <input value={resetConfirm} onChange={e => setResetConfirm(e.target.value)}
                      placeholder='Tippe "RESET" zum Bestaetigen'
                      style={{
                        flex: 1, background: 'var(--bg-deep)', border: '1px solid rgba(226,75,74,0.3)',
                        borderRadius: 'var(--radius-sm)', padding: '8px 10px', color: 'var(--text-primary)',
                        fontSize: 12, outline: 'none',
                      }} />
                    <button onClick={handleReset} disabled={resetConfirm !== 'RESET'} style={{
                      background: resetConfirm === 'RESET' ? 'var(--red)' : 'var(--bg-input)',
                      border: 'none', borderRadius: 'var(--radius-sm)', padding: '8px 14px',
                      color: resetConfirm === 'RESET' ? '#fff' : 'var(--text-muted)',
                      fontSize: 12, cursor: resetConfirm === 'RESET' ? 'pointer' : 'not-allowed',
                      fontWeight: 500,
                    }}>Loeschen</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Data Stats */}
        <Card>
          <CardHeader icon={<Info size={16} />} title="Daten-Statistik" color="var(--purple)" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {[
              { label: 'Speicherverbrauch', value: `${dataSizeKB} KB` },
              { label: 'To-Dos', value: todoCount },
              { label: 'Gewohnheiten', value: habitCount },
              { label: 'Workout-Eintraege', value: workoutCount },
              { label: 'Schlaf-Eintraege', value: sleepCount },
              { label: 'Notizen', value: noteCount },
              { label: 'Transaktionen', value: txCount },
              { label: 'Speicherort', value: 'localStorage' },
            ].map(s => (
              <div key={s.label} style={{
                display: 'flex', justifyContent: 'space-between', padding: '8px 10px',
                background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)',
              }}>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{s.label}</span>
                <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{s.value}</span>
              </div>
            ))}
          </div>

          <div style={{
            marginTop: 12, padding: '10px 12px', borderRadius: 'var(--radius-sm)',
            background: 'rgba(133,183,235,0.08)', border: '1px solid rgba(133,183,235,0.2)',
          }}>
            <p style={{ fontSize: 11, color: 'var(--blue)', fontWeight: 500, margin: '0 0 4px' }}>Hinweis</p>
            <p style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
              Daten werden aktuell im Browser gespeichert. Bei Cache-Leerung gehen sie verloren.
              Regelmaessige Backups per Export empfohlen. Sobald der Pi laeuft, werden die Daten
              in einer Datenbank gespeichert.
            </p>
          </div>
        </Card>
      </div>

      {/* App Info */}
      <Card>
        <CardHeader icon={<Settings size={16} />} title="App Info" color="var(--text-secondary)" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {[
            { label: 'Version', value: '1.6.0' },
            { label: 'Framework', value: 'React 19 + Vite' },
            { label: 'Repository', value: 'github.com/Crisixs' },
          ].map(s => (
            <div key={s.label} style={{ padding: '10px 12px', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)' }}>
              <p style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</p>
              <p style={{ fontSize: 13, fontWeight: 500, margin: '4px 0 0' }}>{s.value}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
