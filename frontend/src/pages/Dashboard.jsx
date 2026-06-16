import { Link } from 'react-router-dom'
import { Shield, AlertTriangle, GitBranch, Clock, Zap } from 'lucide-react'
import StatCard from '../components/dashboard/StatCard'
import SeverityBreakdown from '../components/dashboard/SeverityBreakdown'
import ActivityList from '../components/dashboard/ActivityList'
import Button from '../components/ui/Button'

const STATS = [
  { label: 'Total Scans',           value: '1,284', icon: Shield,        trend: '+12%'  },
  { label: 'Vulnerabilities Found', value: '3,421', icon: AlertTriangle, trend: '-8%'   },
  { label: 'Repositories',          value: '47',    icon: GitBranch,     trend: '+3'    },
  { label: 'Avg Scan Time',         value: '2.4s',  icon: Clock,         trend: '-0.3s' },
]

export default function Dashboard() {
  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 24, width: '100%', boxSizing: 'border-box' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600 }}>Dashboard</h1>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>Security overview and recent activity</p>
        </div>
        <Link to="/scan">
          <Button><Zap size={14} /> Quick Scan</Button>
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {STATS.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <SeverityBreakdown />
        <ActivityList />
      </div>

    </div>
  )
}