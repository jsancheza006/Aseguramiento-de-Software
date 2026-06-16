import Card from '../layout/Card'

export default function StatCard({ label, value, trend, icon: Icon }) {
  return (
    <Card className="min-w-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center justify-center w-9 h-9 rounded-md bg-[var(--secondary)] text-[var(--primary)]">
          <Icon size={18} />
        </div>
        <span className="text-[11px] font-mono text-[var(--safe)]">{trend}</span>
      </div>
      <p className="text-[24px] font-semibold font-mono mt-3">{value}</p>
      <p className="text-[12px] text-[var(--muted)] mt-0.5">{label}</p>
    </Card>
  )
}
