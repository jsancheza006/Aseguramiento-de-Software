import { File, X, CheckCircle2, Loader2 } from 'lucide-react'

const QUEUED_FILES = [
  { id: 1, name: 'auth_service.py', size: '4.2 KB', status: 'done' },
  { id: 2, name: 'payment_controller.ts', size: '7.8 KB', status: 'done' },
  { id: 3, name: 'user_repository.go', size: '3.1 KB', status: 'uploading' },
]

function StatusIcon({ status }) {
  if (status === 'done') {
    return <CheckCircle2 size={16} style={{ color: 'var(--primary)' }} />
  }
  return <Loader2 size={16} className="spin" style={{ color: 'var(--muted)' }} />
}

export default function FileQueue({ files = QUEUED_FILES, onRemove }) {
  if (files.length === 0) {
    return (
      <div
        className="flex h-full min-h-[320px] flex-col items-center justify-center gap-2 rounded-lg border text-center"
        style={{ borderColor: 'var(--border)' }}
      >
        <p className="text-[13px]" style={{ color: 'var(--muted)' }}>
          No files selected yet
        </p>
      </div>
    )
  }

  return (
    <div
      className="flex h-full min-h-[320px] flex-col rounded-lg border"
      style={{ borderColor: 'var(--border)' }}
    >
      <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: 'var(--border)' }}>
        <p className="text-[13px] font-medium">Files to scan</p>
        <span className="font-mono text-xs" style={{ color: 'var(--muted)' }}>
          {files.length} {files.length === 1 ? 'file' : 'files'}
        </span>
      </div>

      <div className="flex-1 space-y-1 overflow-y-auto p-2">
        {files.map((file) => (
          <div
            key={file.id}
            className="group flex items-center justify-between rounded-md px-3 py-2.5 transition-colors hover:bg-[var(--card)]"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <File size={15} style={{ color: 'var(--muted)' }} className="shrink-0" />
              <div className="overflow-hidden">
                <p className="truncate font-mono text-[13px]">{file.name}</p>
                <p className="text-xs" style={{ color: 'var(--muted)' }}>{file.size}</p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <StatusIcon status={file.status} />
              <button
                onClick={() => onRemove?.(file.id)}
                className="opacity-0 transition-opacity group-hover:opacity-100"
              >
                <X size={14} style={{ color: 'var(--muted)' }} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}