import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useThemeStore } from '../store/useThemeStore';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const navItems = [
    { label: 'Overview', path: '/admin/dashboard' },
    { label: 'Selected Works', path: '/admin/projects' },
    { label: 'Services', path: '/admin/services' },
    { label: 'Inquiries', path: '/admin/inquiries' },
    { label: 'Profile & CV', path: '/admin/profile' },
    { label: 'Media Library', path: '/admin/media' },
  ];

  return (
    <header style={styles.headerContainer}>
      <nav style={styles.nav}>
        <div style={styles.brandContainer}>
          <span style={styles.brandMonogram}>AW</span>
          <div>
            <h2 style={styles.brandTitle}>Andrew Wanjala</h2>
            <span style={styles.brandSubtitle}>Graphic Design Control</span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <div className="desktop-only" style={styles.linksContainer}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  ...styles.link,
                  ...(isActive ? styles.activeLink : {}),
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        <div style={styles.rightActions}>
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            style={styles.themeToggleBtn}
            title="Toggle design theme"
          >
            <span style={styles.themeDot}>◐</span>
            <span className="desktop-only">{theme === 'light' ? 'Obsidian' : 'Porcelain'}</span>
          </button>

          <div className="desktop-only" style={styles.userInfo}>
            <span style={styles.userEmail}>{user?.email || 'admin'}</span>
            <span style={styles.statusBadge}>● System Active</span>
          </div>

          <button onClick={handleLogout} className="desktop-only" style={styles.logoutButton}>
            Sign Out
          </button>

          {/* Mobile Menu Open Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            style={styles.mobileMenuBtn}
            className="mobile-only"
            aria-label="Open Mobile Navigation"
          >
            ☰
          </button>
        </div>
      </nav>

      {/* Full-Screen Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div style={styles.fullScreenMobileOverlay} className="mobile-only">
          <div style={styles.mobileHeaderRow}>
            <div style={styles.brandContainer}>
              <span style={styles.brandMonogram}>AW</span>
              <div>
                <h2 style={styles.brandTitle}>Andrew Wanjala</h2>
                <span style={styles.brandSubtitle}>Graphic Design Control</span>
              </div>
            </div>

            <button
              onClick={() => setMobileMenuOpen(false)}
              style={styles.mobileCloseBtn}
              aria-label="Close Mobile Navigation"
            >
              ✕
            </button>
          </div>

          <div style={styles.mobileLinksSection}>
            <span style={styles.mobileSectionTitle}>Navigation Menu</span>
            <div style={styles.mobileLinksList}>
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      ...styles.mobileLink,
                      ...(isActive ? styles.mobileActiveLink : {}),
                    }}
                  >
                    <span>{item.label}</span>
                    {isActive && <span style={styles.activeDot}>•</span>}
                  </Link>
                );
              })}
            </div>
          </div>

          <div style={styles.mobileFooterSection}>
            <div style={styles.mobileThemeRow}>
              <span style={styles.mobileThemeLabel}>Appearance Theme</span>
              <button onClick={toggleTheme} style={styles.mobileThemeBtn}>
                ◐ {theme === 'light' ? 'Obsidian Dark' : 'Porcelain Warm'} Mode
              </button>
            </div>

            <div style={styles.mobileUserRow}>
              <div style={styles.mobileUserInfo}>
                <span style={styles.userEmail}>{user?.email || 'admin'}</span>
                <span style={styles.statusBadge}>● System Connected</span>
              </div>
              <button onClick={handleLogout} style={styles.mobileLogoutBtn}>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

const styles = {
  headerContainer: {
    backgroundColor: 'var(--bg-canvas)',
    borderBottom: '1px solid var(--border-hairline)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    fontFamily: "var(--font-sans)",
  },
  nav: {
    height: '72px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 24px',
    maxWidth: '1300px',
    margin: '0 auto',
  },
  brandContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  brandMonogram: {
    width: '34px',
    height: '34px',
    borderRadius: '4px',
    backgroundColor: 'var(--accent-bronze)',
    color: 'var(--accent-contrast)',
    fontFamily: "var(--font-serif)",
    fontWeight: '400',
    fontSize: '17px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  brandTitle: {
    fontFamily: "var(--font-serif)",
    fontSize: '18px',
    fontWeight: '400',
    color: 'var(--text-charcoal)',
    margin: 0,
    lineHeight: '1.1',
  },
  brandSubtitle: {
    fontFamily: "var(--font-mono)",
    fontSize: '9px',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  linksContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
    backgroundColor: 'var(--bg-surface)',
    padding: '4px',
    borderRadius: '6px',
    border: '1px solid var(--border-hairline)',
  },
  link: {
    padding: '7px 12px',
    borderRadius: '4px',
    color: 'var(--text-muted)',
    textDecoration: 'none',
    fontSize: '12px',
    fontWeight: '400',
    transition: 'all 0.15s ease',
  },
  activeLink: {
    backgroundColor: 'var(--accent-bronze)',
    color: 'var(--accent-contrast)',
    fontWeight: '500',
  },
  rightActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  themeToggleBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border-hairline)',
    borderRadius: '6px',
    color: 'var(--text-charcoal)',
    fontSize: '12px',
    fontFamily: "var(--font-mono)",
    cursor: 'pointer',
  },
  themeDot: {
    color: 'var(--accent-bronze)',
    fontSize: '12px',
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  userEmail: {
    fontFamily: "var(--font-mono)",
    fontSize: '11px',
    fontWeight: '400',
    color: 'var(--text-charcoal)',
  },
  statusBadge: {
    fontFamily: "var(--font-mono)",
    fontSize: '9px',
    color: 'var(--text-muted)',
  },
  logoutButton: {
    padding: '6px 12px',
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border-hairline)',
    borderRadius: '4px',
    color: 'var(--text-charcoal)',
    fontSize: '11px',
    fontWeight: '400',
    cursor: 'pointer',
  },
  mobileMenuBtn: {
    padding: '8px 14px',
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border-hairline)',
    borderRadius: '6px',
    color: 'var(--text-charcoal)',
    fontSize: '18px',
    cursor: 'pointer',
  },
  fullScreenMobileOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'var(--bg-canvas)',
    color: 'var(--text-charcoal)',
    zIndex: 2000,
    display: 'flex',
    flexDirection: 'column',
    padding: '24px',
    overflowY: 'auto',
  },
  mobileHeaderRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: '20px',
    borderBottom: '1px solid var(--border-hairline)',
  },
  mobileCloseBtn: {
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border-hairline)',
    color: 'var(--text-charcoal)',
    fontSize: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  mobileLinksSection: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '36px 0',
  },
  mobileSectionTitle: {
    fontFamily: "var(--font-mono)",
    fontSize: '11px',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    marginBottom: '16px',
  },
  mobileLinksList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  mobileLink: {
    padding: '16px 20px',
    borderRadius: '8px',
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border-hairline)',
    color: 'var(--text-charcoal)',
    textDecoration: 'none',
    fontSize: '20px',
    fontFamily: "var(--font-serif)",
    fontWeight: '400',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mobileActiveLink: {
    backgroundColor: 'var(--accent-bronze)',
    color: 'var(--accent-contrast)',
    borderColor: 'var(--accent-bronze)',
  },
  activeDot: {
    fontSize: '14px',
  },
  mobileFooterSection: {
    borderTop: '1px solid var(--border-hairline)',
    paddingTop: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  mobileThemeRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mobileThemeLabel: {
    fontFamily: "var(--font-mono)",
    fontSize: '12px',
    color: 'var(--text-muted)',
  },
  mobileThemeBtn: {
    padding: '8px 14px',
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border-hairline)',
    borderRadius: '6px',
    color: 'var(--text-charcoal)',
    fontFamily: "var(--font-mono)",
    fontSize: '12px',
    cursor: 'pointer',
  },
  mobileUserRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mobileUserInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  mobileLogoutBtn: {
    padding: '8px 16px',
    backgroundColor: 'rgba(185, 28, 28, 0.1)',
    border: '1px solid rgba(185, 28, 28, 0.25)',
    borderRadius: '6px',
    color: '#ef4444',
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'pointer',
  },
};

// Inject CSS media queries for desktop vs mobile toggle
if (typeof document !== 'undefined' && !document.getElementById('navbar-responsive-styles')) {
  const style = document.createElement('style');
  style.id = 'navbar-responsive-styles';
  style.innerHTML = `
    @media (min-width: 901px) {
      .mobile-only { display: none !important; }
    }
    @media (max-width: 900px) {
      .desktop-only { display: none !important; }
    }
  `;
  document.head.appendChild(style);
}
