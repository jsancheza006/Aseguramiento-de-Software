import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react'
import Card from '../layout/Card'

const ICON = {
  critical: <XCircle     size={16} style={{ color: 'var(--critical)', flexShrink: 0 }} />,
  high:     <XCircle     size={16} style={{ color: 'var(--high)',     flexShrink: 0 }} />,
  medium:   <AlertCircle size={16} style={{ color: 'var(--medium)',   flexShrink: 0 }} />,
  low:      <Info        size={16} style={{ color: 'var(--low)',      flexShrink: 0 }} />,
}

const SEVERITY_COLOR = {
  critical: 'var(--critical)',
  high:     'var(--high)',
  medium:   'var(--medium)',
  low:      'var(--low)',
}

export default function ActivityList({ scanData }) {
  const vulns = scanData?.vulnerabilities ?? []

  if (!scanData) {
    return (
      <Card title="Recent Findings">
        <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>
          No scan data available. Run a scan to see results.
        </p>
      </Card>
    )
  }

  if (vulns.length === 0) {
    return (
      <Card title="Recent Findings">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 0', color: 'var(--safe)', fontSize: 13 }}>
          <CheckCircle size={16} />
          No vulnerabilities found — repository looks clean!
        </div>
      </Card>
    )
  }

  // Mostrar las primeras 8, ordenadas por severidad
  const ORDER = ['critical', 'high', 'medium', 'low']
  const sorted = [...vulns].sort(
    (a, b) => ORDER.indexOf(a.severity) - ORDER.indexOf(b.severity)
  ).slice(0, 8)

  return (
    <Card title="Recent Findings">
      <div className="flex flex-col gap-2">
        {sorted.map((vuln, i) => (
          <div
            key={vuln._id ?? i}
            className="flex items-center gap-3 p-3 rounded-md transition-colors"
            style={{ border: '1px solid var(--border)', background: 'var(--secondary)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--card)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--secondary)'}
          >
            {ICON[vuln.severity] ?? ICON['low']}
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-mono truncate">{vuln.title}</p>
              <p className="text-[12px] mt-0.5" style={{ color: 'var(--muted)' }}>
                {vuln.file_path}{vuln.line_start ? `:${vuln.line_start}` : ''}
              </p>
            </div>
            <div
              className="text-[11px] font-mono text-right whitespace-nowrap capitalize"
              style={{ color: SEVERITY_COLOR[vuln.severity] ?? 'var(--muted)' }}
            >
              {vuln.severity}
            </div>
          </div>
        ))}

        {vulns.length > 6 && (
          <p style={{ fontSize: 12, color: 'var(--muted)', textAlign: 'center', marginTop: 4 }}>
            +{vulns.length - 6} more vulnerabilities
          </p>
        )}
      </div>
    </Card>
  )
}