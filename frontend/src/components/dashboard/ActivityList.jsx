import { CheckCircle, XCircle, AlertCircle, Info, Activity } from 'lucide-react'
import Card from '../layout/Card'

const ACTIVITIES = [
  { id: 1, repo: 'frontend-app',    status: 'completed', vulns: 3,    time: '2 min ago',   severity: 'high' },
  { id: 2, repo: 'api-service',     status: 'completed', vulns: 0,    time: '15 min ago',  severity: 'safe' },
  { id: 3, repo: 'auth-module',     status: 'failed',    vulns: null, time: '1 hour ago',  severity: 'error' },
  { id: 4, repo: 'payment-gateway', status: 'completed', vulns: 7,    time: '2 hours ago', severity: 'critical' },
  { id: 5, repo: 'user-service',    status: 'completed', vulns: 1,    time: '3 hours ago', severity: 'medium' },
]

const ICON = {
  critical: <XCircle     size={16} style={{ color: 'var(--critical)', flexShrink: 0 }} />,
  high:     <XCircle     size={16} style={{ color: 'var(--critical)', flexShrink: 0 }} />,
  medium:   <AlertCircle size={16} style={{ color: 'var(--medium)',   flexShrink: 0 }} />,
  low:      <Info        size={16} style={{ color: 'var(--low)',      flexShrink: 0 }} />,
  safe:     <CheckCircle size={16} style={{ color: 'var(--safe)',     flexShrink: 0 }} />,
  error:    <Activity    size={16} style={{ color: 'var(--muted)',    flexShrink: 0 }} />,
}

function Result({ status, vulns, severity }) {
  if (status !== 'completed') return <span className="text-[var(--muted)]">Failed</span>
  if (vulns === 0)            return <span style={{ color: 'var(--safe)' }}>Clean</span>
  const color = severity === 'critical' ? 'var(--critical)' : 'var(--high)'
  return <span style={{ color }}>{vulns} issues</span>
}

export default function ActivityList() {
  return (
    <Card title="Recent Activity">
      <div className="flex flex-col gap-2">
        {ACTIVITIES.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3 p-3 rounded-md border border-[var(--border)] bg-[var(--secondary)]/50 hover:bg-[var(--secondary)] transition-colors"
          >
            {ICON[item.severity]}
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-mono truncate">{item.repo}</p>
              <p className="text-[12px] text-[var(--muted)] mt-0.5">{item.time}</p>
            </div>
            <div className="text-[11px] font-mono text-right whitespace-nowrap">
              <Result {...item} />
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
