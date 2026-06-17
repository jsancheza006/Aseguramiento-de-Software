import { useState } from 'react'
import { createPortal } from 'react-dom'
import { X, Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react'
import { loginWithGoogle, loginWithGitHub } from '../../lib/firebase'

// ─── icons ───────────────────────────────────────────────────────────────────

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width={17} height={17} fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
)

const GitHubIcon = () => (
  <svg viewBox="0 0 24 24" width={17} height={17} fill="currentColor">
    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.604-3.369-1.34-3.369-1.34-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.087.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
  </svg>
)

// ─── styles ──────────────────────────────────────────────────────────────────

const S = {
  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 300,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(0,0,0,0.7)',
    padding: 16,
  },
  modal: {
    position: 'relative',
    width: '100%',
    maxWidth: 380,
    background: '#111714',
    border: '1px solid #1e2420',
    borderRadius: 14,
    overflow: 'hidden',
  },
  inner: {
    padding: '28px 28px 24px',
  },
  closeBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    borderRadius: 7,
    border: 'none',
    background: 'transparent',
    color: '#5a6b60',
    cursor: 'pointer',
  },
  logoRow: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
    marginBottom: 24,
  },
  logoIcon: {
    width: 34,
    height: 34,
    background: '#22c55e',
    borderRadius: 9,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    fontSize: 15,
    fontWeight: 600,
    color: '#e2e8e4',
    letterSpacing: '-0.2px',
  },
  subtitle: {
    fontSize: 12,
    color: '#5a6b60',
  },
  providerBtn: (hovered) => ({
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    padding: '9px 14px',
    borderRadius: 8,
    border: '1px solid #1e2420',
    background: hovered ? '#1a2018' : '#0d100e',
    color: '#a0b0a6',
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background 0.12s',
  }),
  providerGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    margin: '18px 0',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    background: '#1e2420',
  },
  dividerText: {
    fontSize: 11,
    color: '#3a4a3e',
  },
  fieldWrap: {
    position: 'relative',
  },
  fieldIcon: {
    position: 'absolute',
    left: 10,
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#3a4a3e',
    display: 'flex',
    pointerEvents: 'none',
  },
  input: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '9px 12px 9px 34px',
    borderRadius: 8,
    border: '1px solid #1e2420',
    background: '#0d100e',
    color: '#e2e8e4',
    fontSize: 13,
    outline: 'none',
  },
  fieldsGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  error: {
    fontSize: 12,
    color: '#f87171',
    background: 'rgba(248,113,113,0.08)',
    border: '1px solid rgba(248,113,113,0.18)',
    borderRadius: 7,
    padding: '7px 10px',
  },
  submitBtn: (hovered) => ({
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    padding: '9px 14px',
    borderRadius: 8,
    border: 'none',
    background: hovered ? '#16a34a' : '#22c55e',
    color: '#052010',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: 4,
    transition: 'background 0.12s',
  }),
  switchRow: {
    textAlign: 'center',
    fontSize: 12,
    color: '#5a6b60',
    marginTop: 18,
  },
  switchBtn: {
    background: 'none',
    border: 'none',
    color: '#22c55e',
    fontSize: 12,
    fontWeight: 500,
    cursor: 'pointer',
    padding: 0,
  },
}

// ─── sub-components ───────────────────────────────────────────────────────────

function ProviderButton({ icon, label, onClick, loading }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      style={S.providerBtn(hovered)}
      onClick={onClick}
      disabled={!!loading}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {loading ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : icon}
      {label}
    </button>
  )
}

function Field({ icon: Icon, inputRef, ...props }) {
  return (
    <div style={S.fieldWrap}>
      <span style={S.fieldIcon}>
        <Icon size={14} />
      </span>
      <input ref={inputRef} style={S.input} {...props} />
    </div>
  )
}

// ─── main component ───────────────────────────────────────────────────────────

export default function AuthModal({ onClose, onSuccess }) {
  const [mode, setMode]       = useState('login')   // 'login' | 'register'
  const [form, setForm]       = useState({ username: '', email: '', password: '' })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(null)      // 'google' | 'github' | 'local' | null
  const [submitHovered, setSubmitHovered] = useState(false)

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  // ── OAuth providers ──────────────────────────────────────────────────────
  const handleProvider = async (provider) => {
    setError('')
    setLoading(provider)
    try {
      const user = provider === 'google'
        ? await loginWithGoogle()
        : await loginWithGitHub()
      onSuccess?.(user)
      onClose?.()
    } catch (err) {
      // GitHub: when the email is already used by another provider
      if (err.code === 'auth/account-exists-with-different-credential') {
        setError('Este correo ya está asociado a otro proveedor. Usa Google o el acceso local.')
      } else {
        setError(err.message ?? 'Error al iniciar sesión.')
      }
    } finally {
      setLoading(null)
    }
  }

  // ── Local (email + password, no Firebase) ───────────────────────────────
  const handleLocal = async () => {
    setError('')
    if (!form.email.trim() || !form.password) {
      setError('Completa el correo y la contraseña.')
      return
    }
    if (mode === 'register' && !form.username.trim()) {
      setError('Elige un nombre de usuario.')
      return
    }

    setLoading('local')
    try {
      /*
       * Replace this block with your real backend call.
       * POST /api/auth/login  → { token, user }
       * POST /api/auth/register → { token, user }
       *
       * Example:
       *   const res = await fetch(`/api/auth/${mode}`, {
       *     method: 'POST',
       *     headers: { 'Content-Type': 'application/json' },
       *     body: JSON.stringify(form),
       *   })
       *   if (!res.ok) throw new Error((await res.json()).detail ?? 'Error')
       *   const { token, user } = await res.json()
       *   localStorage.setItem('token', token)
       *   onSuccess?.(user)
       */

      // ── placeholder: remove once you wire the real API ──────────────────
      await new Promise((r) => setTimeout(r, 800))
      const mockUser = {
        uid:      `local-${Date.now()}`,
        username: form.username || form.email.split('@')[0],
        email:    form.email,
        photo:    null,
        provider: 'local',
      }
      onSuccess?.(mockUser)
      onClose?.()
      // ────────────────────────────────────────────────────────────────────

    } catch (err) {
      setError(err.message ?? 'Error al iniciar sesión.')
    } finally {
      setLoading(null)
    }
  }

  const switchMode = () => {
    setMode((m) => (m === 'login' ? 'register' : 'login'))
    setError('')
    setForm({ username: '', email: '', password: '' })
  }

  return createPortal(
    <div
      style={S.overlay}
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
    >
      {/* spin keyframes */}
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>

      <div style={S.modal}>
        <div style={S.inner}>

          {/* close */}
          <button
            style={S.closeBtn}
            onClick={onClose}
            onMouseEnter={e => e.currentTarget.style.color = '#a0b0a6'}
            onMouseLeave={e => e.currentTarget.style.color = '#5a6b60'}
          >
            <X size={15} />
          </button>

          {/* logo */}
          <div style={S.logoRow}>
            <div style={S.logoIcon}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
                stroke="#052010" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <span style={S.brandName}>CodeGuard</span>
            <span style={S.subtitle}>
              {mode === 'login' ? 'Inicia sesión para continuar' : 'Crea tu cuenta'}
            </span>
          </div>

          {/* OAuth */}
          <div style={S.providerGroup}>
            <ProviderButton
              icon={<GoogleIcon />}
              label="Continuar con Google"
              onClick={() => handleProvider('google')}
              loading={loading === 'google' ? 'google' : null}
            />
            <ProviderButton
              icon={<GitHubIcon />}
              label="Continuar con GitHub"
              onClick={() => handleProvider('github')}
              loading={loading === 'github' ? 'github' : null}
            />
          </div>

          {/* divider */}
          <div style={S.divider}>
            <div style={S.dividerLine} />
            <span style={S.dividerText}>o continúa sin cuenta externa</span>
            <div style={S.dividerLine} />
          </div>

          {/* local fields */}
          <div style={S.fieldsGroup}>
            {mode === 'register' && (
              <Field
                icon={User}
                type="text"
                placeholder="Nombre de usuario"
                value={form.username}
                onChange={set('username')}
              />
            )}
            <Field
              icon={Mail}
              type="email"
              placeholder="Correo electrónico"
              value={form.email}
              onChange={set('email')}
            />
            <Field
              icon={Lock}
              type="password"
              placeholder="Contraseña"
              value={form.password}
              onChange={set('password')}
              onKeyDown={(e) => e.key === 'Enter' && handleLocal()}
            />

            {error && <p style={S.error}>{error}</p>}

            <button
              style={S.submitBtn(submitHovered)}
              onClick={handleLocal}
              disabled={!!loading}
              onMouseEnter={() => setSubmitHovered(true)}
              onMouseLeave={() => setSubmitHovered(false)}
            >
              {loading === 'local'
                ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />
                : (
                  <>
                    {mode === 'login' ? 'Iniciar sesión' : 'Registrarme'}
                    <ArrowRight size={14} />
                  </>
                )
              }
            </button>
          </div>

          {/* switch mode */}
          <p style={S.switchRow}>
            {mode === 'login' ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}{' '}
            <button style={S.switchBtn} onClick={switchMode}>
              {mode === 'login' ? 'Regístrate' : 'Inicia sesión'}
            </button>
          </p>

        </div>
      </div>
    </div>,
    document.body
  )
}