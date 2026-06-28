import Card from '../layout/Card'

const SEVERITY_CONFIG = [
  { key: 'critical', label: 'Critical', color: 'var(--critical)' },
  { key: 'high',     label: 'High',     color: 'var(--high)'     },
  { key: 'medium',   label: 'Medium',   color: 'var(--medium)'   },
  { key: 'low',      label: 'Low',      color: 'var(--low)'      },
]

export default function SeverityBreakdown({ metrics = {} }) {
  const data = SEVERITY_CONFIG.map(cfg => ({
    ...cfg,
    count: metrics[cfg.key] ?? 0,
  }))

  const maxCount = Math.max(...data.map(d => d.count), 1)

  return (
    <Card title="Vulnerability Breakdown">
      <div className="flex flex-col gap-3.5">
        {data.map(({ key, label, count, color }) => (
          <div key={key} className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color }} />
            <div className="flex-1">
              <div className="flex justify-between mb-1">
                <span className="text-[13px]">{label}</span>
                <span className="text-[11px] font-mono" style={{ color }}>{count}</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--secondary)' }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${(count / maxCount) * 100}%`, background: color }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}