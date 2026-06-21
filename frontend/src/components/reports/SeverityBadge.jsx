const SEVERITY_STYLES = {
  critical: { bg: 'rgba(255,68,68,0.12)', fg: 'var(--critical)' },
  high:     { bg: 'rgba(255,136,0,0.12)', fg: 'var(--high)' },
  medium:   { bg: 'rgba(255,204,0,0.12)', fg: 'var(--medium)' },
  low:      { bg: 'rgba(0,204,255,0.12)', fg: 'var(--low)' },
}

export default function SeverityBadge({ level }) {
  const style = SEVERITY_STYLES[level] ?? SEVERITY_STYLES.low
  return (
    <span
      className="rounded px-2 py-0.5 font-mono text-[11px] font-medium uppercase"
      style={{ background: style.bg, color: style.fg }}
    >
      {level}
    </span>
  )
}