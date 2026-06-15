import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, GitBranch, Upload,
  FileText, MessageCircle, Settings,
  ChevronLeft, ChevronRight,
} from 'lucide-react'
import LogoIcon from './LogoIcon'

const NAV = [
  { href: '/',         label: 'Dashboard',       icon: LayoutDashboard },
  { href: '/scan',     label: 'Scan Repository', icon: GitBranch },
  { href: '/upload',   label: 'Upload Code',     icon: Upload },
  { href: '/reports',  label: 'Reports',         icon: FileText },
  { href: '/chat',     label: 'Chat Assistant',  icon: MessageCircle },
  { href: '/settings', label: 'Settings',        icon: Settings },
]

const S = {
  aside: (collapsed) => ({
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    width: collapsed ? 52 : 220,
    minWidth: collapsed ? 52 : 220,
    background: '#0d100e',
    borderRight: '1px solid #1e2420',
    transition: 'width 0.15s ease, min-width 0.15s ease',
    overflow: 'hidden',
    flexShrink: 0,
  }),
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '14px 14px',
    borderBottom: '1px solid #1e2420',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  },
  logo: {
    width: 30,
    height: 30,
    background: '#22c55e',
    borderRadius: 7,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  brandText: {
    fontSize: 14,
    fontWeight: 600,
    color: '#e2e8e4',
    letterSpacing: '-0.2px',
    whiteSpace: 'nowrap',
  },
  nav: {
    flex: 1,
    padding: '8px 8px',
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  link: (active) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '8px 10px',
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 500,
    textDecoration: 'none',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    background: active ? 'rgba(34,197,94,0.12)' : 'transparent',
    color: active ? '#22c55e' : '#5a6b60',
    transition: 'background 0.12s, color 0.12s',
  }),
  toggle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    border: 'none',
    borderTop: '1px solid #1e2420',
    background: 'transparent',
    color: '#5a6b60',
    cursor: 'pointer',
  },
}

export default function Sidebar() {
  const { pathname } = useLocation()
  const [collapsed, setCollapsed] = useState(false)
  const [hovered, setHovered] = useState(null)

  return (
    <aside style={S.aside(collapsed)}>
      {/* Header */}
      <div style={S.header}>
        <div style={S.logo}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#052010" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
        </div>
        {!collapsed && <span style={S.brandText}>CodeGuard</span>}
      </div>

      {/* Nav */}
      <nav style={S.nav}>
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          const isHovered = hovered === href
          return (
            <Link
              key={href}
              to={href}
              style={{
                ...S.link(active),
                ...(isHovered && !active ? { background: 'rgba(255,255,255,0.05)', color: '#a0b0a6' } : {}),
              }}
              onMouseEnter={() => setHovered(href)}
              onMouseLeave={() => setHovered(null)}
            >
              <Icon size={17} style={{ flexShrink: 0 }} />
              {!collapsed && <span>{label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Toggle */}
      <button
        style={S.toggle}
        onClick={() => setCollapsed(c => !c)}
        onMouseEnter={e => e.currentTarget.style.color = '#a0b0a6'}
        onMouseLeave={e => e.currentTarget.style.color = '#5a6b60'}
      >
        {collapsed ? <ChevronRight size={17} /> : <ChevronLeft size={17} />}
      </button>
    </aside>
  )
}