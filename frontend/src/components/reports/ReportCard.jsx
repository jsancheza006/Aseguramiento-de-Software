import { GitBranch, Calendar, ShieldCheck, AlertTriangle, ChevronDown, Download, Clock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import SeverityBadge from './SeverityBadge'
import Button from '../ui/Button'
import { formatDate } from '../../lib/date'

const ORDER = ['critical', 'high', 'medium', 'low']

export default function ReportCard({ report }) {
  const navigate = useNavigate()
  const {
    scan_id,
    repo_name,
    branch       = 'main',
    status,
    security_score,
    total_issues = 0,
    severities   = [],
    completed_at,
    started_at,
  } = report

  const clean   = total_issues === 0 && status === 'completed'
  const running = status === 'running'
  const failed  = status === 'failed'

  const sortedSeverities = [...severities].sort(
    (a, b) => ORDER.indexOf(a) - ORDER.indexOf(b)
  )

  const handleViewDetails = () => {
    navigate(`/scan/${scan_id}/results`)
  }

  return (
    <div
      className="rounded-xl border p-5 flex flex-col gap-4"
      style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 overflow-hidden">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="truncate text-[15px] font-semibold">{repo_name}</p>
            <span
              className="flex items-center gap-1 font-mono text-xs shrink-0"
              style={{ color: 'var(--muted)' }}
            >
              <GitBranch size={12} />
              {branch}
            </span>
          </div>
          <p
            className="mt-1 flex items-center gap-1.5 text-xs"
            style={{ color: 'var(--muted)' }}
          >
            <Calendar size={12} />
            {formatDate(completed_at ?? started_at)}
          </p>
        </div>

        {/* Score badge */}
        {security_score !== null && security_score !== undefined && (
          <div
            className="shrink-0 rounded-lg px-2.5 py-1 text-center"
            style={{
              background: security_score >= 70
                ? 'rgba(0,204,100,0.1)'
                : security_score >= 40
                ? 'rgba(255,204,0,0.1)'
                : 'rgba(255,68,68,0.1)',
              border: '1px solid',
              borderColor: security_score >= 70
                ? 'rgba(0,204,100,0.25)'
                : security_score >= 40
                ? 'rgba(255,204,0,0.25)'
                : 'rgba(255,68,68,0.25)',
            }}
          >
            <p
              className="text-[18px] font-bold leading-none font-mono"
              style={{
                color: security_score >= 70
                  ? 'var(--safe)'
                  : security_score >= 40
                  ? 'var(--medium)'
                  : 'var(--critical)',
              }}
            >
              {security_score}
            </p>
            <p className="text-[10px] mt-0.5" style={{ color: 'var(--muted)' }}>
              /100
            </p>
          </div>
        )}
      </div>

      {/* Status / findings */}
      <div>
        {running && (
          <p
            className="flex items-center gap-2 text-[13px] font-medium"
            style={{ color: 'var(--muted)' }}
          >
            <Clock size={14} className="animate-spin" />
            Scan en progreso...
          </p>
        )}

        {failed && (
          <p
            className="flex items-center gap-2 text-[13px] font-medium"
            style={{ color: 'var(--destructive)' }}
          >
            <AlertTriangle size={14} />
            El scan falló
          </p>
        )}

        {clean && (
          <p
            className="flex items-center gap-2 text-[13px] font-medium"
            style={{ color: 'var(--safe)' }}
          >
            <ShieldCheck size={15} />
            No vulnerabilities found
          </p>
        )}

        {!clean && !running && !failed && (
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="flex items-center gap-1.5 text-[13px]"
              style={{ color: 'var(--fg)' }}
            >
              <AlertTriangle size={14} style={{ color: 'var(--high)' }} />
              {total_issues} {total_issues === 1 ? 'issue' : 'issues'}
            </span>
            {sortedSeverities.map((level) => (
              <SeverityBadge key={level} level={level} />
            ))}
          </div>
        )}
      </div>

      {/* Footer actions */}
      {!running && !failed && (
        <div className="flex items-center justify-between mt-auto pt-1 border-t" style={{ borderColor: 'var(--border)' }}>
          {total_issues > 0 ? (
            <button
              onClick={handleViewDetails}
              className="flex items-center gap-1 text-[13px] font-medium transition-opacity hover:opacity-80"
              style={{ color: 'var(--primary)' }}
            >
              <ChevronDown size={14} />
              View details
            </button>
          ) : (
            <span />
          )}
          <Button variant="ghost" size="sm">
            <Download size={13} />
            PDF
          </Button>
        </div>
      )}
    </div>
  )
}