import { GitBranch, ChevronRight, Loader2 } from 'lucide-react'

export default function RecentRepos({ repos, loading, hasGithub, onSelect }) {
  return (
    <div style={{ background: '#0d100e', border: '1px solid #1e2420', borderRadius: 12, padding: 24 }}>
      <p style={{ fontSize: 11, fontWeight: 600, color: '#3a4a3f', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 12, marginTop: 0 }}>
        {hasGithub ? 'Your repositories' : 'Recent repositories'}
      </p>

      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 0', color: '#5a6b60', fontSize: 13 }}>
          <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
          Loading repositories...
        </div>
      )}

      {!loading && !hasGithub && (
        <p style={{ fontSize: 13, color: '#3a4a3f', margin: 0 }}>
          Conectá tu cuenta de GitHub para ver tus repositorios.
        </p>
      )}

      {!loading && repos.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {repos.map(({ full_name, name, private: isPrivate, updated_at, clone_url }) => (
            <button
              key={full_name}
              onClick={() => onSelect(full_name, clone_url)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '11px 12px', borderRadius: 8, border: '1px solid transparent', background: 'transparent', cursor: 'pointer', textAlign: 'left', transition: 'background 0.12s, border-color 0.12s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(34,197,94,0.06)'; e.currentTarget.style.borderColor = '#1e2420' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <GitBranch size={14} style={{ color: '#3a4a3f', flexShrink: 0 }} />
                <span style={{ fontSize: 13, fontWeight: 500, color: '#c8d8cc', fontFamily: 'monospace' }}>{full_name}</span>
                {isPrivate && (
                  <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: 'rgba(255,255,255,0.05)', color: '#5a6b60', border: '1px solid #1e2420' }}>
                    private
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 12, color: '#3a4a3f' }}>
                  {new Date(updated_at).toLocaleDateString()}
                </span>
                <ChevronRight size={13} style={{ color: '#3a4a3f' }} />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}