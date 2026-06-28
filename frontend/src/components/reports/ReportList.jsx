import { ShieldOff } from 'lucide-react'
import ReportCard from './ReportCard'

function SkeletonCard() {
  return (
    <div
      className="rounded-xl border p-5 flex flex-col gap-4 animate-pulse"
      style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-2 flex-1">
          <div className="h-4 w-2/3 rounded" style={{ background: 'var(--secondary)' }} />
          <div className="h-3 w-1/3 rounded" style={{ background: 'var(--secondary)' }} />
        </div>
        <div className="h-10 w-12 rounded-lg" style={{ background: 'var(--secondary)' }} />
      </div>
      <div className="h-3 w-1/2 rounded" style={{ background: 'var(--secondary)' }} />
      <div className="h-px w-full" style={{ background: 'var(--border)' }} />
      <div className="flex justify-between">
        <div className="h-3 w-24 rounded" style={{ background: 'var(--secondary)' }} />
        <div className="h-7 w-16 rounded-md" style={{ background: 'var(--secondary)' }} />
      </div>
    </div>
  )
}

export default function ReportList({ reports, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 @md:grid-cols-2 @xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    )
  }

  if (!reports || reports.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center gap-3 rounded-xl border py-16"
        style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
      >
        <ShieldOff size={32} style={{ color: 'var(--muted)' }} />
        <p className="text-[14px] font-medium">No scans yet</p>
        <p className="text-[13px]" style={{ color: 'var(--muted)' }}>
          Run your first scan to see reports here
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 @md:grid-cols-2 @xl:grid-cols-3">
      {reports.map((report) => (
        <ReportCard key={report.scan_id} report={report} />
      ))}
    </div>
  )
}