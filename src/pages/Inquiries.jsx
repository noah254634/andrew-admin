import { useState, useEffect } from 'react';
import api from '../api/axios';
import Navbar from '../components/Navbar';

export default function Inquiries() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' | 'unread'

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const response = await api.get('/inquiries');
      setInquiries(response.data);
    } catch (err) {
      console.error('Failed to fetch inquiries:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleRead = async (id) => {
    try {
      const response = await api.patch(`/inquiries/${id}/read`);
      setInquiries((prev) =>
        prev.map((item) => (item.id === id ? response.data : item))
      );
    } catch (err) {
      alert('Failed to update inquiry status.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this inquiry message?')) return;
    try {
      await api.delete(`/inquiries/${id}`);
      setInquiries((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      alert('Failed to delete inquiry.');
    }
  };

  const filteredInquiries = inquiries.filter((item) => {
    if (filter === 'unread') return !item.read;
    return true;
  });

  return (
    <div style={styles.pageContainer}>
      <Navbar />

      <main style={styles.mainContent}>
        <div style={styles.headerRow}>
          <div>
            <span style={styles.monoCategory}>Client Correspondence</span>
            <h1 style={styles.title}>Inquiries Inbox</h1>
          </div>

          <div style={styles.filterGroup}>
            <button
              onClick={() => setFilter('all')}
              style={{
                ...styles.filterBtn,
                ...(filter === 'all' ? styles.activeFilter : {}),
              }}
            >
              All ({inquiries.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              style={{
                ...styles.filterBtn,
                ...(filter === 'unread' ? styles.activeFilter : {}),
              }}
            >
              Unread ({inquiries.filter((i) => !i.read).length})
            </button>
          </div>
        </div>

        {loading ? (
          <div style={styles.loadingBox}>Loading messages...</div>
        ) : filteredInquiries.length === 0 ? (
          <div style={styles.emptyBox}>
            <p style={styles.emptyText}>
              {filter === 'unread'
                ? 'No unread inquiries!'
                : 'No contact inquiries received yet.'}
            </p>
          </div>
        ) : (
          <div style={styles.inquiriesList}>
            {filteredInquiries.map((inq) => (
              <div
                key={inq.id}
                style={{
                  ...styles.inquiryCard,
                  ...(inq.read ? styles.readCard : styles.unreadCard),
                }}
              >
                <div style={styles.cardHeader}>
                  <div style={styles.senderMeta}>
                    <span style={styles.senderName}>{inq.sender_name}</span>
                    <a
                      href={`mailto:${inq.sender_email}`}
                      style={styles.senderEmail}
                    >
                      {inq.sender_email}
                    </a>
                  </div>

                  <div style={styles.badgesRow}>
                    {inq.project_type && (
                      <span style={styles.projectTypeBadge}>
                        {inq.project_type}
                      </span>
                    )}
                    <span
                      style={{
                        ...styles.statusBadge,
                        ...(inq.read ? styles.readBadge : styles.newBadge),
                      }}
                    >
                      {inq.read ? 'Read' : 'Unread'}
                    </span>
                  </div>
                </div>

                <div style={styles.messageBox}>{inq.message}</div>

                <div style={styles.cardFooter}>
                  <span style={styles.timeText}>
                    {inq.created_at
                      ? new Date(inq.created_at).toLocaleString()
                      : 'Received recently'}
                  </span>

                  <div style={styles.actionsGroup}>
                    <button
                      onClick={() => toggleRead(inq.id)}
                      style={styles.toggleBtn}
                    >
                      {inq.read ? 'Mark Unread' : 'Mark Read'}
                    </button>
                    <button
                      onClick={() => handleDelete(inq.id)}
                      style={styles.deleteBtn}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '48px 32px',
  },
  headerRow: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: '40px',
    flexWrap: 'wrap',
    gap: '20px',
    paddingBottom: '24px',
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
    fontSize: '38px',
    fontWeight: '400',
    color: 'var(--text-charcoal)',
    margin: 0,
    letterSpacing: '-0.01em',
  },
  filterGroup: {
    display: 'flex',
    gap: '4px',
    backgroundColor: 'var(--bg-surface)',
    padding: '4px',
    borderRadius: '6px',
    border: '1px solid var(--border-hairline)',
  },
  filterBtn: {
    padding: '6px 14px',
    borderRadius: '4px',
    border: 'none',
    backgroundColor: 'transparent',
    color: 'var(--text-muted)',
    fontSize: '12px',
    fontWeight: '400',
    cursor: 'pointer',
    fontFamily: "var(--font-sans)",
  },
  activeFilter: {
    backgroundColor: 'var(--accent-bronze)',
    color: 'var(--accent-contrast)',
    fontWeight: '500',
  },
  loadingBox: {
    padding: '40px',
    textAlign: 'center',
    fontFamily: "var(--font-mono)",
    fontSize: '13px',
    color: 'var(--text-muted)',
  },
  emptyBox: {
    padding: '60px',
    textAlign: 'center',
    backgroundColor: 'var(--bg-surface)',
    borderRadius: '10px',
    border: '1px solid var(--border-hairline)',
  },
  emptyText: {
    color: 'var(--text-muted)',
    fontSize: '14px',
  },
  inquiriesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  inquiryCard: {
    backgroundColor: 'var(--bg-surface)',
    borderRadius: '10px',
    padding: '24px',
    transition: 'all 0.15s ease',
  },
  unreadCard: {
    border: '1px solid var(--accent-bronze)',
    boxShadow: 'var(--card-shadow)',
  },
  readCard: {
    border: '1px solid var(--border-hairline)',
    opacity: 0.9,
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '16px',
    flexWrap: 'wrap',
    gap: '10px',
  },
  senderMeta: {
    display: 'flex',
    flexDirection: 'column',
  },
  senderName: {
    fontFamily: "var(--font-serif)",
    fontSize: '22px',
    fontWeight: '400',
    color: 'var(--text-charcoal)',
  },
  senderEmail: {
    fontFamily: "var(--font-mono)",
    fontSize: '12px',
    color: 'var(--text-muted)',
    textDecoration: 'none',
  },
  badgesRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  projectTypeBadge: {
    fontFamily: "var(--font-mono)",
    fontSize: '11px',
    backgroundColor: 'var(--border-hairline)',
    color: 'var(--text-charcoal)',
    padding: '3px 8px',
    borderRadius: '3px',
  },
  statusBadge: {
    fontFamily: "var(--font-mono)",
    fontSize: '10px',
    padding: '3px 8px',
    borderRadius: '3px',
  },
  newBadge: {
    backgroundColor: 'var(--accent-bronze)',
    color: 'var(--accent-contrast)',
  },
  readBadge: {
    backgroundColor: 'var(--border-hairline)',
    color: 'var(--text-muted)',
  },
  messageBox: {
    backgroundColor: 'var(--bg-canvas)',
    border: '1px solid var(--border-hairline)',
    borderRadius: '6px',
    padding: '18px',
    fontSize: '14px',
    lineHeight: '1.6',
    color: 'var(--text-charcoal)',
    marginBottom: '16px',
    whiteSpace: 'pre-wrap',
  },
  cardFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeText: {
    fontFamily: "var(--font-mono)",
    fontSize: '11px',
    color: 'var(--text-muted)',
  },
  actionsGroup: {
    display: 'flex',
    gap: '8px',
  },
  toggleBtn: {
    padding: '6px 12px',
    backgroundColor: 'var(--bg-canvas)',
    border: '1px solid var(--border-hairline)',
    borderRadius: '4px',
    color: 'var(--text-charcoal)',
    fontSize: '12px',
    fontWeight: '400',
    cursor: 'pointer',
  },
  deleteBtn: {
    padding: '6px 12px',
    backgroundColor: 'rgba(185, 28, 28, 0.08)',
    border: '1px solid rgba(185, 28, 28, 0.25)',
    borderRadius: '4px',
    color: '#ef4444',
    fontSize: '12px',
    fontWeight: '400',
    cursor: 'pointer',
  },
};
