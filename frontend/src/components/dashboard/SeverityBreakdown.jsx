import Card from '../layout/Card'

const DATA = [
  { label: 'Critical', count: 12,  color: 'var(--critical)' },
  { label: 'High',     count: 48,  color: 'var(--high)' },
  { label: 'Medium',   count: 156, color: 'var(--medium)' },
  { label: 'Low',      count: 284, color: 'var(--low)' },
]

export default function SeverityBreakdown() {
  return (
    <Card title="Vulnerability Breakdown">
      <div className="flex flex-col gap-3.5">
        {DATA.map(({ label, count, color }) => (
          <div key={label} className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color }} />
            <div className="flex-1">
              <div className="flex justify-between mb-1">
                <span className="text-[13px]">{label}</span>
                <span className="text-[11px] font-mono" style={{ color }}>{count}</span>
              </div>
              <div className="h-1.5 bg-[var(--secondary)] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${(count / 500) * 100}%`, background: color }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
