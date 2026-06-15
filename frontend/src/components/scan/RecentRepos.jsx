import Card from '../layout/Card'

const REPOS = [
  { name: 'vercel/next.js',          lastScanned: '2 days ago' },
  { name: 'facebook/react',          lastScanned: '5 days ago' },
  { name: 'microsoft/typescript',    lastScanned: '1 week ago' },
]

export default function RecentRepos({ onSelect }) {
  return (
    <Card title="Recent Repositories">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {REPOS.map(({ name, lastScanned }) => (
          <button
            key={name}
            onClick={() => onSelect(`https://github.com/${name}`)}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', textAlign: 'left', transition: 'background 0.12s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--secondary)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <span style={{ fontSize: 13, fontFamily: 'monospace', color: 'var(--fg)' }}>{name}</span>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>{lastScanned}</span>
          </button>
        ))}
      </div>
    </Card>
  )
}