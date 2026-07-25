import { useState, useEffect } from 'react';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import FileUpload from '../components/FileUpload';

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTab, setFilterTab] = useState('all'); // all, published, draft, featured

  const [formData, setFormData] = useState({
    client_name: '',
    client_role: '',
    company_name: '',
    client_avatar: '',
    company_logo: '',
    content: '',
    rating: 5,
    project_tag: '',
    display_order: 0,
    is_featured: true,
    is_published: true,
  });

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await api.get('/reviews?all_status=true');
      setReviews(response.data);
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingReview(null);
    setFormData({
      client_name: '',
      client_role: '',
      company_name: '',
      client_avatar: '',
      company_logo: '',
      content: '',
      rating: 5,
      project_tag: 'Brand Identity & Strategy',
      display_order: reviews.length + 1,
      is_featured: true,
      is_published: true,
    });
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (rev) => {
    setEditingReview(rev);
    setFormData({
      client_name: rev.client_name || '',
      client_role: rev.client_role || '',
      company_name: rev.company_name || '',
      client_avatar: rev.client_avatar || '',
      company_logo: rev.company_logo || '',
      content: rev.content || '',
      rating: rev.rating || 5,
      project_tag: rev.project_tag || '',
      display_order: rev.display_order || 0,
      is_featured: rev.is_featured ?? true,
      is_published: rev.is_published ?? true,
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const payload = {
      ...formData,
      rating: parseInt(formData.rating, 10) || 5,
      display_order: parseInt(formData.display_order, 10) || 0,
    };

    try {
      if (editingReview) {
        await api.put(`/reviews/${editingReview.id}`, payload);
      } else {
        await api.post('/reviews', payload);
      }
      setIsModalOpen(false);
      fetchReviews();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save review endorsement.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this client endorsement?')) return;
    try {
      await api.delete(`/reviews/${id}`);
      fetchReviews();
    } catch (err) {
      alert('Failed to delete review.');
    }
  };

  const togglePublished = async (rev) => {
    try {
      await api.put(`/reviews/${rev.id}`, {
        is_published: !rev.is_published,
      });
      fetchReviews();
    } catch (err) {
      alert('Failed to update published status.');
    }
  };

  const toggleFeatured = async (rev) => {
    try {
      await api.put(`/reviews/${rev.id}`, {
        is_featured: !rev.is_featured,
      });
      fetchReviews();
    } catch (err) {
      alert('Failed to update featured status.');
    }
  };

  const filteredReviews = reviews.filter((rev) => {
    const matchesSearch =
      rev.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rev.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rev.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rev.project_tag?.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (filterTab === 'published') return rev.is_published;
    if (filterTab === 'draft') return !rev.is_published;
    if (filterTab === 'featured') return rev.is_featured;
    return true;
  });

  return (
    <div style={styles.pageContainer}>
      <Navbar />

      <main style={styles.mainContent} className="responsive-padding">
        {/* Header section */}
        <div style={styles.headerRow} className="responsive-header">
          <div>
            <span style={styles.monoCategory}>Client Feedback & Endorsements</span>
            <h1 style={styles.title}>Client Reviews</h1>
          </div>
          <button onClick={openAddModal} style={styles.addButton}>
            + Add Endorsement
          </button>
        </div>

        {/* Toolbar with Search & Filter Tabs */}
        <div style={styles.toolbarRow}>
          <div style={styles.tabGroup}>
            {['all', 'published', 'draft', 'featured'].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilterTab(tab)}
                style={{
                  ...styles.tabBtn,
                  ...(filterTab === tab ? styles.tabBtnActive : {}),
                }}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          <input
            type="text"
            placeholder="Search by client, company, or quote..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        {/* Main Content List / Grid */}
        {loading ? (
          <div style={styles.loadingBox}>Fetching client endorsements...</div>
        ) : filteredReviews.length === 0 ? (
          <div style={styles.emptyBox}>
            <p style={styles.emptyText}>No client reviews match your criteria.</p>
            <button onClick={openAddModal} style={styles.secondaryBtn}>
              Add First Review
            </button>
          </div>
        ) : (
          <div style={styles.grid}>
            {filteredReviews.map((rev) => (
              <div key={rev.id} style={styles.card}>
                <div style={styles.cardTopRow}>
                  <div style={styles.clientMetaHeader}>
                    {rev.client_avatar ? (
                      <img src={rev.client_avatar} alt={rev.client_name} style={styles.avatarImg} />
                    ) : (
                      <div style={styles.avatarPlaceholder}>
                        {rev.client_name?.charAt(0) || 'C'}
                      </div>
                    )}
                    <div>
                      <h3 style={styles.clientName}>{rev.client_name}</h3>
                      <span style={styles.clientRole}>
                        {rev.client_role} {rev.company_name && `• ${rev.company_name}`}
                      </span>
                    </div>
                  </div>

                  <div style={styles.badgeColumn}>
                    <button
                      onClick={() => togglePublished(rev)}
                      style={{
                        ...styles.statusBadgeBtn,
                        backgroundColor: rev.is_published ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                        color: rev.is_published ? '#10b981' : '#f59e0b',
                        borderColor: rev.is_published ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)',
                      }}
                      title="Click to toggle publication"
                    >
                      {rev.is_published ? 'Published' : 'Draft'}
                    </button>
                    {rev.is_featured && (
                      <span style={styles.featuredBadge} title="Featured on home page">
                        ★ Featured
                      </span>
                    )}
                  </div>
                </div>

                {/* Rating Stars */}
                <div style={styles.ratingRow}>
                  {'★'.repeat(rev.rating || 5).padEnd(5, '☆').split('').map((star, idx) => (
                    <span key={idx} style={{ color: star === '★' ? 'var(--accent-bronze)' : 'var(--border-hairline)', fontSize: '15px' }}>
                      {star}
                    </span>
                  ))}
                  {rev.project_tag && <span style={styles.projectTag}>{rev.project_tag}</span>}
                </div>

                {/* Content Quote */}
                <p style={styles.quoteText}>“{rev.content}”</p>

                {/* Card Actions */}
                <div style={styles.cardActions}>
                  <span style={styles.orderLabel}>Order: #{rev.display_order || 0}</span>
                  <div style={styles.actionBtnGroup}>
                    <button onClick={() => toggleFeatured(rev)} style={styles.iconActionBtn} title="Toggle featured state">
                      {rev.is_featured ? 'Unfeature' : 'Feature'}
                    </button>
                    <button onClick={() => openEditModal(rev)} style={styles.actionBtn}>
                      Edit
                    </button>
                    <button onClick={() => handleDelete(rev.id)} style={{ ...styles.actionBtn, color: '#ef4444' }}>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal Dialog */}
      {isModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent} className="responsive-modal">
            <h2 style={styles.modalTitle}>
              {editingReview ? 'Edit Client Endorsement' : 'Add Client Endorsement'}
            </h2>

            {error && <div style={styles.errorBanner}>{error}</div>}

            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.rowTwo} className="responsive-row-two">
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Client Name *</label>
                  <input
                    type="text"
                    value={formData.client_name}
                    onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                    required
                    placeholder="e.g. Sophia Vance"
                    style={styles.input}
                  />
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Role / Title</label>
                  <input
                    type="text"
                    value={formData.client_role}
                    onChange={(e) => setFormData({ ...formData, client_role: e.target.value })}
                    placeholder="e.g. Design Director"
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.rowTwo} className="responsive-row-two">
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Company Name</label>
                  <input
                    type="text"
                    value={formData.company_name}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    placeholder="e.g. Vance & Co Studio"
                    style={styles.input}
                  />
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Project Scope / Tag</label>
                  <input
                    type="text"
                    value={formData.project_tag}
                    onChange={(e) => setFormData({ ...formData, project_tag: e.target.value })}
                    placeholder="e.g. Brand Strategy & Identity"
                    style={styles.input}
                  />
                </div>
              </div>

              {/* Star Rating & Display Order */}
              <div style={styles.rowTwo} className="responsive-row-two">
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Star Rating (1 - 5)</label>
                  <div style={styles.starSelector}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFormData({ ...formData, rating: star })}
                        style={{
                          ...styles.starSelectBtn,
                          color: star <= formData.rating ? 'var(--accent-bronze)' : 'var(--text-muted)',
                        }}
                      >
                        ★
                      </button>
                    ))}
                    <span style={styles.ratingText}>{formData.rating} Stars</span>
                  </div>
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Display Order</label>
                  <input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: e.target.value })}
                    style={styles.input}
                  />
                </div>
              </div>

              {/* Review Content */}
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Testimonial Quote *</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  required
                  rows={4}
                  placeholder="Enter client quote or recommendation..."
                  style={{ ...styles.input, resize: 'vertical' }}
                />
              </div>

              {/* Client Avatar Upload & URL input */}
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Client Photo / Avatar</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <input
                    type="url"
                    value={formData.client_avatar}
                    onChange={(e) => setFormData({ ...formData, client_avatar: e.target.value })}
                    placeholder="Paste image URL (e.g. from Media Library) or upload below..."
                    style={styles.input}
                  />

                  {formData.client_avatar && (
                    <div style={styles.previewAvatarRow}>
                      <img src={formData.client_avatar} alt="Avatar preview" style={styles.smallAvatarPreview} />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, client_avatar: '' })}
                        style={styles.clearImgBtn}
                      >
                        Remove Photo
                      </button>
                    </div>
                  )}

                  <FileUpload
                    label="Or Upload New Client Photo File"
                    accept="image/*"
                    onUploadSuccess={(uploaded) => {
                      if (uploaded.url) {
                        setFormData((prev) => ({ ...prev, client_avatar: uploaded.url }));
                      }
                    }}
                  />
                </div>
              </div>


              {/* Toggles */}
              <div style={styles.toggleRow}>
                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={formData.is_published}
                    onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                    style={styles.checkbox}
                  />
                  <span>Published on Public Site</span>
                </label>

                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    style={styles.checkbox}
                  />
                  <span>Featured Endorsement</span>
                </label>
              </div>

              <div style={styles.modalButtons}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={styles.cancelBtn}>
                  Cancel
                </button>
                <button type="submit" style={styles.saveBtn}>
                  {editingReview ? 'Save Endorsement' : 'Create Endorsement'}
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
    marginBottom: '24px',
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
    backgroundColor: 'var(--accent-bronze)',
    color: 'var(--accent-contrast)',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  toolbarRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '12px',
  },
  tabGroup: {
    display: 'flex',
    gap: '4px',
    backgroundColor: 'var(--bg-surface)',
    padding: '4px',
    borderRadius: '6px',
    border: '1px solid var(--border-hairline)',
  },
  tabBtn: {
    padding: '6px 12px',
    borderRadius: '4px',
    border: 'none',
    backgroundColor: 'transparent',
    color: 'var(--text-muted)',
    fontSize: '12px',
    cursor: 'pointer',
    fontFamily: "var(--font-sans)",
  },
  tabBtnActive: {
    backgroundColor: 'var(--accent-bronze)',
    color: 'var(--accent-contrast)',
    fontWeight: '500',
  },
  searchInput: {
    padding: '8px 14px',
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border-hairline)',
    borderRadius: '6px',
    color: 'var(--text-charcoal)',
    fontSize: '12.5px',
    width: '280px',
    outline: 'none',
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
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '20px',
  },
  card: {
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border-hairline)',
    borderRadius: '10px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  cardTopRow: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '12px',
  },
  clientMetaHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  avatarImg: {
    width: '42px',
    height: '42px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '1px solid var(--border-hairline)',
  },
  avatarPlaceholder: {
    width: '42px',
    height: '42px',
    borderRadius: '50%',
    backgroundColor: 'var(--accent-bronze)',
    color: 'var(--accent-contrast)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    fontWeight: '500',
    fontFamily: "var(--font-serif)",
  },
  clientName: {
    fontFamily: "var(--font-serif)",
    fontSize: '18px',
    fontWeight: '400',
    color: 'var(--text-charcoal)',
    margin: 0,
    lineHeight: '1.2',
  },
  clientRole: {
    fontFamily: "var(--font-mono)",
    fontSize: '11px',
    color: 'var(--text-muted)',
    display: 'block',
    marginTop: '2px',
  },
  badgeColumn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '4px',
  },
  statusBadgeBtn: {
    padding: '3px 8px',
    borderRadius: '12px',
    border: '1px solid',
    fontSize: '10px',
    fontFamily: "var(--font-mono)",
    cursor: 'pointer',
  },
  featuredBadge: {
    fontFamily: "var(--font-mono)",
    fontSize: '10px',
    color: 'var(--accent-bronze)',
  },
  ratingRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
  },
  projectTag: {
    fontFamily: "var(--font-mono)",
    fontSize: '10px',
    color: 'var(--text-muted)',
    backgroundColor: 'var(--bg-canvas)',
    border: '1px solid var(--border-hairline)',
    padding: '2px 8px',
    borderRadius: '4px',
  },
  quoteText: {
    fontFamily: "var(--font-sans)",
    fontSize: '13.5px',
    lineHeight: '1.6',
    color: 'var(--text-charcoal)',
    fontStyle: 'italic',
    margin: 0,
    flex: 1,
  },
  cardActions: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTop: '1px solid var(--border-hairline)',
    paddingTop: '12px',
    marginTop: 'auto',
  },
  orderLabel: {
    fontFamily: "var(--font-mono)",
    fontSize: '11px',
    color: 'var(--text-muted)',
  },
  actionBtnGroup: {
    display: 'flex',
    gap: '6px',
  },
  iconActionBtn: {
    padding: '4px 8px',
    backgroundColor: 'var(--bg-canvas)',
    border: '1px solid var(--border-hairline)',
    borderRadius: '4px',
    color: 'var(--text-muted)',
    fontSize: '11px',
    cursor: 'pointer',
  },
  actionBtn: {
    padding: '4px 10px',
    backgroundColor: 'var(--bg-canvas)',
    border: '1px solid var(--border-hairline)',
    borderRadius: '4px',
    color: 'var(--text-charcoal)',
    fontSize: '11px',
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
    maxWidth: '520px',
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
    gridTemplateColumns: '1fr 1fr',
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
  starSelector: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border-hairline)',
    borderRadius: '6px',
    padding: '6px 10px',
  },
  starSelectBtn: {
    background: 'none',
    border: 'none',
    fontSize: '18px',
    cursor: 'pointer',
    padding: 0,
  },
  ratingText: {
    fontFamily: "var(--font-mono)",
    fontSize: '11px',
    color: 'var(--text-muted)',
    marginLeft: 'auto',
  },
  previewAvatarRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '6px',
  },
  smallAvatarPreview: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    objectFit: 'cover',
  },
  clearImgBtn: {
    fontSize: '11px',
    color: '#ef4444',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
  },
  toggleRow: {
    display: 'flex',
    gap: '20px',
    padding: '12px',
    backgroundColor: 'var(--bg-surface)',
    borderRadius: '6px',
    border: '1px solid var(--border-hairline)',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '12px',
    color: 'var(--text-charcoal)',
    cursor: 'pointer',
  },
  checkbox: {
    accentColor: 'var(--accent-bronze)',
    cursor: 'pointer',
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
