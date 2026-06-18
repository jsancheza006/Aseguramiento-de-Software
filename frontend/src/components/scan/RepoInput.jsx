import { Search, GitBranch, Loader2, Zap } from 'lucide-react'

function getScanStatus(p) {
  if (p < 30) return 'Cloning repository...'
  if (p < 60) return 'Analyzing dependencies...'
  if (p < 90) return 'Scanning for vulnerabilities...'
  return 'Generating report...'
}

export default function RepoInput({ url, onUrlChange, branch, onBranchChange, branches = ['main'], scanning, progress, onScan }) {
  return (
    <div style={{ background: '#0d100e', border: '1px solid #1e2420', borderRadius: 12, padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>

      <div style={{ display: 'flex', gap: 10 }}>
        <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search size={16} style={{ position: 'absolute', left: 14, color: '#4a5c50', pointerEvents: 'none' }} />
          <input
            style={{ width: '100%', height: 46, background: '#0a0d0b', border: '1px solid #1e2420', borderRadius: 8, color: '#c8d8cc', fontSize: 14, paddingLeft: 42, paddingRight: 14, outline: 'none', fontFamily: 'monospace', boxSizing: 'border-box' }}
            placeholder="https://github.com/owner/repository"
            value={url}
            onChange={(e) => onUrlChange(e.target.value)}
          />
        </div>

        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <GitBranch size={14} style={{ position: 'absolute', left: 11, color: '#22c55e', pointerEvents: 'none', zIndex: 1 }} />
          <select
            style={{ height: 46, background: '#0a0d0b', border: '1px solid #1e2420', borderRadius: 8, color: '#8fa894', fontSize: 13, paddingLeft: 32, paddingRight: 28, outline: 'none', cursor: 'pointer', appearance: 'none', minWidth: 130 }}
            value={branch}
            onChange={(e) => onBranchChange(e.target.value)}
          >
            {branches.map(b => <option key={b}>{b}</option>)}
          </select>
          <svg style={{ position: 'absolute', right: 10, color: '#4a5c50', pointerEvents: 'none' }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
      </div>

      {scanning && (
        <div style={{ background: '#0a0d0b', border: '1px solid #1e2420', borderRadius: 8, padding: '14px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 13, color: '#8fa894' }}>{getScanStatus(progress)}</span>
            <span style={{ fontSize: 13, fontWeight: 500, color: '#22c55e' }}>{Math.round(progress)}%</span>
          </div>
          <div style={{ height: 4, background: '#1e2420', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${Math.min(progress, 100)}%`, background: '#22c55e', borderRadius: 2, transition: 'width 0.3s ease' }} />
          </div>
        </div>
      )}

      <button
        disabled={!url || scanning}
        onClick={onScan}
        style={{ width: '100%', height: 46, background: !url || scanning ? 'rgba(34,197,94,0.12)' : '#22c55e', border: 'none', borderRadius: 8, color: !url || scanning ? '#2d5c35' : '#052010', fontSize: 14, fontWeight: 600, cursor: !url || scanning ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'background 0.15s' }}
      >
        {scanning
          ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Scanning...</>
          : <><Zap size={15} /> Start scan</>
        }
      </button>

    </div>
  )
}