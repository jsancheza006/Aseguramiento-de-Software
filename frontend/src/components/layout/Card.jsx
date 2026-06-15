export default function Card({ title, description, titleIcon: Icon, children, className = '' }) {
  return (
    <div className={`bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 ${className}`}>
      {(title || description) && (
        <div className="mb-4 flex flex-col gap-1">
          {title && (
            <div className="flex items-center gap-2">
              {Icon && <Icon size={17} />}
              <span className="text-[14px] font-medium">{title}</span>
            </div>
          )}
          {description && <p className="text-[13px] text-[var(--muted)]">{description}</p>}
        </div>
      )}
      {children}
    </div>
  )
}
