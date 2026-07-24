import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useThemeStore } from '../store/useThemeStore';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, error, isLoading } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) {
      navigate('/admin/dashboard');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.topBar}>
        <button onClick={toggleTheme} style={styles.themeToggleBtn}>
          ◐ {theme === 'light' ? 'Obsidian' : 'Porcelain'} Mode
        </button>
      </div>

      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logoBadge}>AW</div>
          <h1 style={styles.title}>Andrew Wanjala</h1>
          <p style={styles.subtitle}>Graphic Design & Direction Control</p>
        </div>

        {error && <div style={styles.errorBanner}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Admin Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@example.com"
              style={styles.input}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••••••"
              style={styles.input}
            />
          </div>

          <button type="submit" disabled={isLoading} style={styles.button}>
            {isLoading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div style={styles.footer}>
          <span>Secured Session — Aiven PostgreSQL & Argon2</span>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'var(--bg-canvas)',
    color: 'var(--text-charcoal)',
    fontFamily: "var(--font-sans)",
    padding: '24px',
    position: 'relative',
  },
  topBar: {
    position: 'absolute',
    top: '24px',
    right: '24px',
  },
  themeToggleBtn: {
    padding: '8px 16px',
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border-hairline)',
    borderRadius: '6px',
    color: 'var(--text-charcoal)',
    fontSize: '12px',
    fontFamily: "var(--font-mono)",
    cursor: 'pointer',
  },
  card: {
    width: '100%',
    maxWidth: '400px',
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border-hairline)',
    borderRadius: '12px',
    padding: '48px 36px',
    boxShadow: 'var(--card-shadow)',
  },
  header: {
    marginBottom: '36px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  logoBadge: {
    width: '44px',
    height: '44px',
    borderRadius: '6px',
    backgroundColor: 'var(--accent-bronze)',
    color: 'var(--accent-contrast)',
    fontFamily: "var(--font-serif)",
    fontWeight: '400',
    fontSize: '22px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '20px',
  },
  title: {
    fontFamily: "var(--font-serif)",
    fontSize: '32px',
    fontWeight: '400',
    margin: '0 0 4px 0',
    color: 'var(--text-charcoal)',
    letterSpacing: '-0.01em',
  },
  subtitle: {
    fontFamily: "var(--font-sans)",
    fontSize: '13px',
    color: 'var(--text-muted)',
    margin: 0,
    fontWeight: '300',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '22px',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '12px',
    fontWeight: '500',
    color: 'var(--text-charcoal)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  input: {
    padding: '12px 14px',
    backgroundColor: 'var(--bg-canvas)',
    border: '1px solid var(--border-hairline)',
    borderRadius: '6px',
    color: 'var(--text-charcoal)',
    fontSize: '14px',
    outline: 'none',
  },
  button: {
    marginTop: '8px',
    padding: '14px',
    backgroundColor: 'var(--text-charcoal)',
    color: 'var(--bg-canvas)',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '500',
    letterSpacing: '0.03em',
    cursor: 'pointer',
  },
  errorBanner: {
    backgroundColor: 'rgba(185, 28, 28, 0.1)',
    border: '1px solid rgba(185, 28, 28, 0.2)',
    color: '#ef4444',
    padding: '10px 14px',
    borderRadius: '6px',
    fontSize: '13px',
    marginBottom: '20px',
    textAlign: 'center',
  },
  footer: {
    marginTop: '32px',
    textAlign: 'center',
    fontFamily: "var(--font-mono)",
    fontSize: '11px',
    color: 'var(--text-muted)',
  },
};