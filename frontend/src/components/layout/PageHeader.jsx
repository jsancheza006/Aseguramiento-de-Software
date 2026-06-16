export default function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-[22px] font-semibold">{title}</h1>
        {subtitle && <p className="text-[13px] text-[var(--muted)] mt-1">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}
