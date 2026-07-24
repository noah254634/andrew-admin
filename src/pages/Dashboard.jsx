import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';

export default function Dashboard() {
  const [stats, setStats] = useState({
    projectsCount: 0,
    servicesCount: 0,
    inquiriesCount: 0,
    unreadInquiriesCount: 0,
  });
  const [recentInquiries, setRecentInquiries] = useState([]);
  const [recentProjects, setRecentProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [projRes, servRes, inqRes] = await Promise.all([
        api.get('/projects').catch(() => ({ data: [] })),
        api.get('/services').catch(() => ({ data: [] })),
        api.get('/inquiries').catch(() => ({ data: [] })),
      ]);

      const projects = projRes.data || [];
      const services = servRes.data || [];
      const inquiries = inqRes.data || [];
      const unreadInquiries = inquiries.filter((i) => !i.read).length;

      setStats({
        projectsCount: projects.length,
        servicesCount: services.length,
        inquiriesCount: inquiries.length,
        unreadInquiriesCount: unreadInquiries,
      });

      setRecentProjects(projects.slice(0, 4));
      setRecentInquiries(inquiries.slice(0, 5));
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.pageContainer}>
      <Navbar />

      <main style={styles.mainContent} className="responsive-padding">
        {/* Header Section */}
        <div style={styles.headerRow} className="responsive-header">
          <div>
            <span style={styles.monoCategory}>Portfolio Architecture</span>
            <h1 style={styles.title}>System Control Overview</h1>
          </div>
          <div style={styles.dbBadge}>
            <span style={styles.dbDot}></span>
            <span>Aiven Cloud DB Active</span>
          </div>
        </div>

        {/* Metrics Grid */}
        <div style={styles.metricsGrid}>
          <div style={styles.metricCard}>
            <span style={styles.metricLabel}>Selected Works</span>
            <div style={styles.metricValue}>{loading ? '—' : stats.projectsCount}</div>
            <Link to="/admin/projects" style={styles.metricLink}>
              View Showcase &rarr;
            </Link>
          </div>

          <div style={styles.metricCard}>
            <span style={styles.metricLabel}>Design Services</span>
            <div style={styles.metricValue}>{loading ? '—' : stats.servicesCount}</div>
            <Link to="/admin/services" style={styles.metricLink}>
              Manage Offerings &rarr;
            </Link>
          </div>

          <div style={styles.metricCard}>
            <span style={styles.metricLabel}>Client Inquiries</span>
            <div style={styles.metricValue}>{loading ? '—' : stats.inquiriesCount}</div>
            <span style={styles.subtext}>
              {stats.unreadInquiriesCount} unread submission(s)
            </span>
            <Link to="/admin/inquiries" style={styles.metricLink}>
              Open Inbox &rarr;
            </Link>
          </div>

          <div style={styles.metricCard}>
            <span style={styles.metricLabel}>API Health</span>
            <div style={{ ...styles.metricValue, fontSize: '26px' }}>
              Operational
            </div>
            <span style={styles.subtext}>FastAPI + JSONB Pool</span>
          </div>
        </div>

        {/* Two-column Content Section */}
        <div style={styles.columnsGrid} className="responsive-grid">
          {/* Recent Inquiries */}
          <div style={styles.sectionCard}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Recent Inquiries</h2>
              <Link to="/admin/inquiries" style={styles.viewAllBtn}>
                View All
              </Link>
            </div>

            {loading ? (
              <p style={styles.mutedText}>Loading messages...</p>
            ) : recentInquiries.length === 0 ? (
              <p style={styles.mutedText}>No inquiries received yet.</p>
            ) : (
              <div style={styles.list}>
                {recentInquiries.map((inq) => (
                  <div key={inq.id} style={styles.listItem}>
                    <div style={styles.itemMeta}>
                      <span style={styles.itemTitle}>{inq.sender_name}</span>
                      <span style={styles.itemSubtitle}>{inq.sender_email}</span>
                    </div>
                    <div>
                      {!inq.read && <span style={styles.unreadBadge}>New</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Projects */}
          <div style={styles.sectionCard}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Selected Works</h2>
              <Link to="/admin/projects" style={styles.viewAllBtn}>
                View All
              </Link>
            </div>

            {loading ? (
              <p style={styles.mutedText}>Loading projects...</p>
            ) : recentProjects.length === 0 ? (
              <p style={styles.mutedText}>No projects created yet.</p>
            ) : (
              <div style={styles.list}>
                {recentProjects.map((proj) => (
                  <div key={proj.id} style={styles.listItem}>
                    <div style={styles.itemMeta}>
                      <span style={styles.itemTitle}>{proj.title}</span>
                      <span style={styles.itemSubtitle}>
                        {proj.category} • {proj.year}
                      </span>
                    </div>
                    {proj.featured && <span style={styles.featuredBadge}>Featured</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

const styles = {
  pageContainer: {
    minHeight: '100vh',
    backgroundColor: 'var(--bg-canvas)',
    color: 'var(--text-charcoal)',
    fontFamily: "var(--font-sans)",
  },
  mainContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '40px 24px',
  },
  headerRow: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: '32px',
    flexWrap: 'wrap',
    gap: '16px',
    paddingBottom: '20px',
    borderBottom: '1px solid var(--border-hairline)',
  },
  monoCategory: {
    fontFamily: "var(--font-mono)",
    fontSize: '11px',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    display: 'block',
    marginBottom: '4px',
  },
  title: {
    fontFamily: "var(--font-serif)",
    fontSize: '32px',
    fontWeight: '400',
    color: 'var(--text-charcoal)',
    margin: 0,
    letterSpacing: '-0.01em',
  },
  dbBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border-hairline)',
    padding: '6px 14px',
    borderRadius: '20px',
    fontFamily: "var(--font-mono)",
    fontSize: '11px',
    color: 'var(--text-charcoal)',
  },
  dbDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: 'var(--accent-bronze)',
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '16px',
    marginBottom: '32px',
  },
  metricCard: {
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border-hairline)',
    borderRadius: '10px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
  },
  metricLabel: {
    fontFamily: "var(--font-mono)",
    fontSize: '10px',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    marginBottom: '10px',
  },
  metricValue: {
    fontFamily: "var(--font-serif)",
    fontSize: '38px',
    fontWeight: '400',
    color: 'var(--text-charcoal)',
    marginBottom: '4px',
    lineHeight: 1,
  },
  subtext: {
    fontFamily: "var(--font-mono)",
    fontSize: '10px',
    color: 'var(--text-muted)',
    marginBottom: '12px',
  },
  metricLink: {
    marginTop: 'auto',
    fontSize: '12px',
    color: 'var(--accent-bronze)',
    textDecoration: 'none',
    fontWeight: '500',
    letterSpacing: '0.02em',
  },
  columnsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '24px',
  },
  sectionCard: {
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border-hairline)',
    borderRadius: '10px',
    padding: '24px',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '16px',
    paddingBottom: '10px',
    borderBottom: '1px solid var(--border-hairline)',
  },
  sectionTitle: {
    fontFamily: "var(--font-serif)",
    fontSize: '22px',
    fontWeight: '400',
    margin: 0,
  },
  viewAllBtn: {
    fontFamily: "var(--font-mono)",
    fontSize: '11px',
    color: 'var(--text-muted)',
    textDecoration: 'none',
  },
  mutedText: {
    color: 'var(--text-muted)',
    fontSize: '13px',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  listItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 14px',
    backgroundColor: 'var(--bg-canvas)',
    borderRadius: '6px',
    border: '1px solid var(--border-hairline)',
  },
  itemMeta: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  itemTitle: {
    fontSize: '13px',
    fontWeight: '500',
    color: 'var(--text-charcoal)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  itemSubtitle: {
    fontFamily: "var(--font-mono)",
    fontSize: '10px',
    color: 'var(--text-muted)',
  },
  unreadBadge: {
    fontFamily: "var(--font-mono)",
    fontSize: '9px',
    backgroundColor: 'var(--accent-bronze)',
    color: 'var(--accent-contrast)',
    padding: '2px 6px',
    borderRadius: '3px',
  },
  featuredBadge: {
    fontFamily: "var(--font-mono)",
    fontSize: '9px',
    backgroundColor: 'var(--border-hairline)',
    color: 'var(--text-charcoal)',
    padding: '2px 6px',
    borderRadius: '3px',
  },
};
