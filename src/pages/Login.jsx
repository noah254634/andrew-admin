import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useThemeStore } from '../store/useThemeStore';
import StarfieldCanvas from '../components/StarfieldCanvas';
import { getApiBaseURL } from '../api/axios';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showApiConfig, setShowApiConfig] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [activeApiUrl, setActiveApiUrl] = useState('');

  const { login, error } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();

  useEffect(() => {
    setActiveApiUrl(getApiBaseURL());
    setCustomUrlInput(localStorage.getItem('custom_api_url') || '');
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const success = await login(email, password);
    setSubmitting(false);
    if (success) {
      navigate('/admin/dashboard');
    }
  };

  const handleSaveCustomApiUrl = (e) => {
    e.preventDefault();
    if (customUrlInput.trim()) {
      localStorage.setItem('custom_api_url', customUrlInput.trim());
    } else {
      localStorage.removeItem('custom_api_url');
    }
    window.location.reload();
  };

  return (
    <div style={styles.container}>
      <StarfieldCanvas />
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

          <button type="submit" disabled={submitting} style={styles.button}>
            {submitting ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div style={styles.footer}>
          <div style={styles.apiMetaRow}>
            <span style={styles.apiEndpointLabel}>Target API:</span>
            <code style={styles.apiEndpointUrl}>{activeApiUrl}</code>
            <button
              type="button"
              onClick={() => setShowApiConfig(!showApiConfig)}
              style={styles.configToggleBtn}
            >
              {showApiConfig ? 'Hide Config' : 'Change'}
            </button>
          </div>

          {showApiConfig && (
            <form onSubmit={handleSaveCustomApiUrl} style={styles.customApiForm}>
              <input
                type="text"
                value={customUrlInput}
                onChange={(e) => setCustomUrlInput(e.target.value)}
                placeholder="https://your-backend-name.onrender.com/api/v1"
                style={styles.customApiInput}
              />
              <div style={styles.customApiBtnGroup}>
                <button type="submit" style={styles.saveApiBtn}>
                  Save & Connect
                </button>
                {localStorage.getItem('custom_api_url') && (
                  <button
                    type="button"
                    onClick={() => {
                      localStorage.removeItem('custom_api_url');
                      window.location.reload();
                    }}
                    style={styles.resetApiBtn}
                  >
                    Reset
                  </button>
                )}
              </div>
            </form>
          )}

          <span style={styles.secNote}>Secured Session — Aiven PostgreSQL & Argon2</span>
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
    overflow: 'hidden',
  },
  topBar: {
    position: 'absolute',
    top: '24px',
    right: '24px',
    zIndex: 1,
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
    maxWidth: '420px',
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border-hairline)',
    borderRadius: '12px',
    padding: '44px 36px',
    boxShadow: 'var(--card-shadow)',
    position: 'relative',
    zIndex: 1,
  },
  header: {
    marginBottom: '32px',
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
    gap: '20px',
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
    marginTop: '28px',
    paddingTop: '20px',
    borderTop: '1px solid var(--border-hairline)',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    textAlign: 'center',
  },
  apiMetaRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    flexWrap: 'wrap',
  },
  apiEndpointLabel: {
    fontFamily: "var(--font-mono)",
    fontSize: '10px',
    color: 'var(--text-muted)',
  },
  apiEndpointUrl: {
    fontFamily: "var(--font-mono)",
    fontSize: '10.5px',
    color: 'var(--accent-bronze)',
    wordBreak: 'break-all',
  },
  configToggleBtn: {
    fontFamily: "var(--font-mono)",
    fontSize: '10px',
    color: 'var(--text-muted)',
    background: 'none',
    border: '1px solid var(--border-hairline)',
    borderRadius: '4px',
    padding: '1px 6px',
    cursor: 'pointer',
  },
  customApiForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    backgroundColor: 'var(--bg-canvas)',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid var(--border-hairline)',
  },
  customApiInput: {
    padding: '8px 10px',
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border-hairline)',
    borderRadius: '4px',
    fontSize: '12px',
    fontFamily: "var(--font-mono)",
    color: 'var(--text-charcoal)',
    outline: 'none',
  },
  customApiBtnGroup: {
    display: 'flex',
    gap: '8px',
  },
  saveApiBtn: {
    flex: 1,
    padding: '6px 12px',
    backgroundColor: 'var(--accent-bronze)',
    color: 'var(--accent-contrast)',
    border: 'none',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  resetApiBtn: {
    padding: '6px 12px',
    backgroundColor: 'transparent',
    border: '1px solid var(--border-hairline)',
    borderRadius: '4px',
    fontSize: '11px',
    color: 'var(--text-muted)',
    cursor: 'pointer',
  },
  secNote: {
    fontFamily: "var(--font-mono)",
    fontSize: '10px',
    color: 'var(--text-muted)',
    display: 'block',
  },
};