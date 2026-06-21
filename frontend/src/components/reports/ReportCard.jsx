import { GitBranch, Calendar, ChevronDown, Download, ShieldCheck, AlertTriangle } from 'lucide-react'
import SeverityBadge from './SeverityBadge'
import Button from '../ui/Button'

export default function ReportCard({ report }) {
  const { repoName, branch, date, totalIssues, severities } = report
  const clean = totalIssues === 0

  return (
    <div
      className="rounded-xl border p-5"
      style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 overflow-hidden">
          <div className="flex items-center gap-2">
            <p className="truncate text-[15px] font-semibold">{repoName}</p>
            <span className="flex items-center gap-1 font-mono text-xs" style={{ color: 'var(--muted)' }}>
              <GitBranch size={12} />
              {branch}
            </span>
          </div>
          <p className="mt-1 flex items-center gap-1.5 text-xs" style={{ color: 'var(--muted)' }}>
            <Calendar size={12} />
            {date}
          </p>
        </div>

        <Button variant="ghost" size="sm" className="shrink-0">
          <Download size={13} />
          PDF
        </Button>
      </div>

      <div className="mt-4">
        {clean ? (
          <p className="flex items-center gap-2 text-[13px] font-medium" style={{ color: 'var(--safe)' }}>
            <ShieldCheck size={15} />
            No vulnerabilities found
          </p>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5 text-[13px]" style={{ color: 'var(--fg)' }}>
              <AlertTriangle size={14} style={{ color: 'var(--high)' }} />
              {totalIssues} {totalIssues === 1 ? 'issue' : 'issues'}
            </span>
            {severities.map((level) => (
              <SeverityBadge key={level} level={level} />
            ))}
          </div>
        )}
      </div>

      {!clean && (
        <button
          className="mt-3 flex items-center gap-1 text-[13px] font-medium transition-opacity hover:opacity-80"
          style={{ color: 'var(--primary)' }}
        >
          <ChevronDown size={14} />
          View details
        </button>
      )}
    </div>
  )
}