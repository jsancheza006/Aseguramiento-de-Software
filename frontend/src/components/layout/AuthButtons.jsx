import { useState } from 'react'
import { LogIn, LogOut, User } from 'lucide-react'
import { logout } from '../../lib/firebase'
import AuthModal from './AuthModal'

/*
 * Drop this component just above the toggle button in Sidebar.jsx.
 *
 * Props:
 *   collapsed  – boolean (same `collapsed` state from the sidebar)
 *   user       – current user object or null
 *   setUser    – setter from whatever auth state you use (Context, Zustand, etc.)
 */
export default function AuthButtons({ collapsed, user, setUser }) {
  const [showModal, setShowModal] = useState(false)

  const handleLogout = async () => {
    try {
      if (user?.provider === 'google' || user?.provider === 'github') {
        await logout()
      }
    } finally {
      setUser(null)
    }
  }

  // ── Logged-in state ──────────────────────────────────────────────────────
  if (user) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: collapsed ? '10px 0' : '10px 10px',
        borderTop: '1px solid #1e2420',
        justifyContent: collapsed ? 'center' : 'flex-start',
        overflow: 'hidden',
      }}>
        {/* avatar */}
        {user.photo ? (
          <img
            src={user.photo}
            alt={user.username}
            style={{
              width: 26,
              height: 26,
              borderRadius: '50%',
              flexShrink: 0,
              objectFit: 'cover',
              border: '1px solid #1e2420',
            }}
          />
        ) : (
          <div style={{
            width: 26,
            height: 26,
            borderRadius: '50%',
            flexShrink: 0,
            background: 'rgba(34,197,94,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <User size={13} color="#22c55e" />
          </div>
        )}

        {!collapsed && (
          <>
            <span style={{
              fontSize: 12,
              color: '#a0b0a6',
              flex: 1,
              minWidth: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {user.username}
            </span>
            <LogoutBtn onClick={handleLogout} />
          </>
        )}
      </div>
    )
  }

  // ── Logged-out state ─────────────────────────────────────────────────────
  return (
    <>
      <div style={{
        padding: collapsed ? '10px 0' : '10px 8px',
        borderTop: '1px solid #1e2420',
        display: 'flex',
        justifyContent: collapsed ? 'center' : 'stretch',
      }}>
        <LoginBtn
          collapsed={collapsed}
          onClick={() => setShowModal(true)}
        />
      </div>

      {showModal && (
        <AuthModal
          onClose={() => setShowModal(false)}
          onSuccess={(u) => {
            setUser(u)
            setShowModal(false)
          }}
        />
      )}
    </>
  )
}

// ─── small internals ──────────────────────────────────────────────────────────

function LoginBtn({ collapsed, onClick }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'flex-start',
        gap: 9,
        width: collapsed ? 'auto' : '100%',
        padding: '7px 10px',
        borderRadius: 8,
        border: 'none',
        background: hovered ? 'rgba(255,255,255,0.05)' : 'transparent',
        color: hovered ? '#a0b0a6' : '#5a6b60',
        fontSize: 13,
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'background 0.12s, color 0.12s',
        whiteSpace: 'nowrap',
      }}
    >
      <LogIn size={17} style={{ flexShrink: 0 }} />
      {!collapsed && <span>Iniciar sesión</span>}
    </button>
  )
}

function LogoutBtn({ onClick }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      title="Cerrar sesión"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 26,
        height: 26,
        borderRadius: 7,
        border: 'none',
        background: hovered ? 'rgba(255,255,255,0.05)' : 'transparent',
        color: hovered ? '#a0b0a6' : '#5a6b60',
        cursor: 'pointer',
        flexShrink: 0,
        transition: 'background 0.12s, color 0.12s',
      }}
    >
      <LogOut size={14} />
    </button>
  )
}