import { useState, useEffect } from 'react';
import api from '../api/axios';
import Navbar from '../components/Navbar';

export default function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    icon: '01',
    featuresText: '',
    display_order: 0,
    is_active: true,
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const response = await api.get('/services');
      setServices(response.data);
    } catch (err) {
      console.error('Failed to fetch services:', err);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingService(null);
    setFormData({
      title: '',
      description: '',
      icon: '0' + (services.length + 1),
      featuresText: '',
      display_order: services.length + 1,
      is_active: true,
    });
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (serv) => {
    setEditingService(serv);
    setFormData({
      title: serv.title || '',
      description: serv.description || '',
      icon: serv.icon || '01',
      featuresText: Array.isArray(serv.features) ? serv.features.join(', ') : '',
      display_order: serv.display_order || 0,
      is_active: serv.is_active ?? true,
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const payload = {
      title: formData.title,
      description: formData.description,
      icon: formData.icon,
      features: formData.featuresText
        .split(',')
        .map((f) => f.trim())
        .filter(Boolean),
      display_order: parseInt(formData.display_order) || 0,
      is_active: formData.is_active,
    };

    try {
      if (editingService) {
        await api.put(`/services/${editingService.id}`, payload);
      } else {
        await api.post('/services', payload);
      }
      setIsModalOpen(false);
      fetchServices();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save service.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this service offering?')) return;
    try {
      await api.delete(`/services/${id}`);
      fetchServices();
    } catch (err) {
      alert('Failed to delete service.');
    }
  };

  return (
    <div style={styles.pageContainer}>
      <Navbar />

      <main style={styles.mainContent} className="responsive-padding">
        <div style={styles.headerRow} className="responsive-header">
          <div>
            <span style={styles.monoCategory}>Capabilities & Offerings</span>
            <h1 style={styles.title}>Design Services</h1>
          </div>
          <button onClick={openAddModal} style={styles.addButton}>
            + Add Service
          </button>
        </div>

        {loading ? (
          <div style={styles.loadingBox}>Loading service offerings...</div>
        ) : services.length === 0 ? (
          <div style={styles.emptyBox}>
            <p style={styles.emptyText}>No services listed yet.</p>
            <button onClick={openAddModal} style={styles.secondaryBtn}>
              Create First Offering
            </button>
          </div>
        ) : (
          <div style={styles.grid}>
            {services.map((serv, index) => (
              <div key={serv.id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <span style={styles.iconTag}>{serv.icon || `0${index + 1}`}</span>
                  <span style={styles.orderBadge}>0{serv.display_order || index + 1}</span>
                </div>

                <h3 style={styles.cardTitle}>{serv.title}</h3>
                <p style={styles.cardDescription}>{serv.description}</p>

                {Array.isArray(serv.features) && serv.features.length > 0 && (
                  <div style={styles.featuresBox}>
                    <span style={styles.featuresLabel}>Deliverables & Scope:</span>
                    <div style={styles.tagList}>
                      {serv.features.map((feat, idx) => (
                        <span key={idx} style={styles.tag}>
                          {feat}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div style={styles.cardActions}>
                  <button
                    onClick={() => openEditModal(serv)}
                    style={styles.actionBtn}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(serv.id)}
                    style={{ ...styles.actionBtn, color: '#ef4444' }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal */}
      {isModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent} className="responsive-modal">
            <h2 style={styles.modalTitle}>
              {editingService ? 'Edit Service' : 'Add Design Offering'}
            </h2>

            {error && <div style={styles.errorBanner}>{error}</div>}

            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.rowTwo} className="responsive-row-two">
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Service Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                    placeholder="e.g. Brand Identity & Strategy"
                    style={styles.input}
                  />
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Index Tag</label>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) =>
                      setFormData({ ...formData, icon: e.target.value })
                    }
                    placeholder="e.g. 01"
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  required
                  rows={3}
                  placeholder="Detailed description of creative scope..."
                  style={{ ...styles.input, resize: 'vertical' }}
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Deliverables (Comma-separated)</label>
                <input
                  type="text"
                  value={formData.featuresText}
                  onChange={(e) =>
                    setFormData({ ...formData, featuresText: e.target.value })
                  }
                  placeholder="e.g. Logo Suite, Typography Guidelines, Brandbook"
                  style={styles.input}
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Display Order</label>
                <input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) =>
                    setFormData({ ...formData, display_order: e.target.value })
                  }
                  style={styles.input}
                />
              </div>

              <div style={styles.modalButtons}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={styles.cancelBtn}
                >
                  Cancel
                </button>
                <button type="submit" style={styles.saveBtn}>
                  {editingService ? 'Save Changes' : 'Create Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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
  addButton: {
    padding: '10px 18px',
    backgroundColor: 'var(--text-charcoal)',
    color: 'var(--bg-canvas)',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  loadingBox: {
    padding: '40px',
    textAlign: 'center',
    fontFamily: "var(--font-mono)",
    fontSize: '13px',
    color: 'var(--text-muted)',
  },
  emptyBox: {
    padding: '48px 24px',
    textAlign: 'center',
    backgroundColor: 'var(--bg-surface)',
    borderRadius: '10px',
    border: '1px solid var(--border-hairline)',
  },
  emptyText: {
    color: 'var(--text-muted)',
    fontSize: '14px',
  },
  secondaryBtn: {
    marginTop: '16px',
    padding: '8px 16px',
    backgroundColor: 'var(--bg-canvas)',
    color: 'var(--text-charcoal)',
    border: '1px solid var(--border-hairline)',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '13px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '20px',
  },
  card: {
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border-hairline)',
    borderRadius: '10px',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '14px',
  },
  iconTag: {
    fontFamily: "var(--font-mono)",
    fontSize: '12px',
    color: 'var(--accent-bronze)',
    fontWeight: '500',
  },
  orderBadge: {
    fontFamily: "var(--font-mono)",
    fontSize: '11px',
    color: 'var(--text-muted)',
  },
  cardTitle: {
    fontFamily: "var(--font-serif)",
    fontSize: '24px',
    fontWeight: '400',
    color: 'var(--text-charcoal)',
    margin: '0 0 8px 0',
    lineHeight: 1.2,
  },
  cardDescription: {
    fontSize: '13px',
    color: 'var(--text-muted)',
    lineHeight: '1.6',
    marginBottom: '18px',
  },
  featuresBox: {
    marginBottom: '20px',
    flex: 1,
  },
  featuresLabel: {
    fontFamily: "var(--font-mono)",
    fontSize: '10px',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    display: 'block',
    marginBottom: '8px',
  },
  tagList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
  },
  tag: {
    fontFamily: "var(--font-sans)",
    fontSize: '12px',
    backgroundColor: 'var(--bg-canvas)',
    border: '1px solid var(--border-hairline)',
    color: 'var(--text-charcoal)',
    padding: '3px 8px',
    borderRadius: '4px',
  },
  cardActions: {
    display: 'flex',
    gap: '8px',
    borderTop: '1px solid var(--border-hairline)',
    paddingTop: '14px',
    marginTop: 'auto',
  },
  actionBtn: {
    flex: 1,
    padding: '6px 12px',
    backgroundColor: 'var(--bg-canvas)',
    border: '1px solid var(--border-hairline)',
    borderRadius: '4px',
    color: 'var(--text-charcoal)',
    fontSize: '12px',
    fontWeight: '400',
    cursor: 'pointer',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '16px',
  },
  modalContent: {
    width: '100%',
    maxWidth: '480px',
    backgroundColor: 'var(--bg-canvas)',
    border: '1px solid var(--border-hairline)',
    borderRadius: '12px',
    padding: '28px 24px',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: 'var(--card-shadow)',
  },
  modalTitle: {
    fontFamily: "var(--font-serif)",
    fontSize: '24px',
    fontWeight: '400',
    color: 'var(--text-charcoal)',
    marginBottom: '20px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  rowTwo: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '12px',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '11px',
    fontWeight: '500',
    color: 'var(--text-charcoal)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  input: {
    padding: '10px 12px',
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border-hairline)',
    borderRadius: '6px',
    color: 'var(--text-charcoal)',
    fontSize: '13px',
    outline: 'none',
  },
  modalButtons: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '12px',
  },
  cancelBtn: {
    padding: '8px 16px',
    backgroundColor: 'transparent',
    border: '1px solid var(--border-hairline)',
    borderRadius: '6px',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    fontSize: '13px',
  },
  saveBtn: {
    padding: '8px 16px',
    backgroundColor: 'var(--accent-bronze)',
    border: 'none',
    borderRadius: '6px',
    color: 'var(--accent-contrast)',
    fontWeight: '500',
    cursor: 'pointer',
    fontSize: '13px',
  },
  errorBanner: {
    backgroundColor: 'rgba(185, 28, 28, 0.1)',
    color: '#ef4444',
    padding: '10px 14px',
    borderRadius: '6px',
    fontSize: '13px',
    marginBottom: '16px',
  },
};
