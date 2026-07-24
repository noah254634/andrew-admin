import { useState, useEffect } from 'react';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import FileUpload from '../components/FileUpload';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    category: '',
    year: new Date().getFullYear(),
    summary: '',
    cover_image_url: '',
    featured: true,
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await api.get('/projects');
      setProjects(response.data);
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingProject(null);
    setFormData({
      title: '',
      slug: '',
      category: '',
      year: new Date().getFullYear(),
      summary: '',
      cover_image_url: '',
      featured: true,
    });
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (proj) => {
    setEditingProject(proj);
    setFormData({
      title: proj.title || '',
      slug: proj.slug || '',
      category: proj.category || '',
      year: proj.year || new Date().getFullYear(),
      summary: proj.summary || '',
      cover_image_url: proj.cover_image_url || '',
      featured: proj.featured ?? true,
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (editingProject) {
        await api.put(`/projects/${editingProject.id}`, formData);
      } else {
        await api.post('/projects', formData);
      }
      setIsModalOpen(false);
      fetchProjects();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save project.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this project?')) return;
    try {
      await api.delete(`/projects/${id}`);
      fetchProjects();
    } catch (err) {
      alert('Failed to delete project.');
    }
  };

  return (
    <div style={styles.pageContainer}>
      <Navbar />

      <main style={styles.mainContent} className="responsive-padding">
        <div style={styles.headerRow} className="responsive-header">
          <div>
            <span style={styles.monoCategory}>Graphic Design Portfolio</span>
            <h1 style={styles.title}>Selected Works</h1>
          </div>
          <button onClick={openAddModal} style={styles.addButton}>
            + Add New Work
          </button>
        </div>

        {loading ? (
          <div style={styles.loadingBox}>Loading catalogue...</div>
        ) : projects.length === 0 ? (
          <div style={styles.emptyBox}>
            <p style={styles.emptyText}>No showcase works found.</p>
            <button onClick={openAddModal} style={styles.secondaryBtn}>
              Add First Project
            </button>
          </div>
        ) : (
          <div style={styles.grid}>
            {projects.map((proj) => (
              <div key={proj.id} style={styles.card}>
                <div style={styles.imageWrapper}>
                  {proj.cover_image_url ? (
                    <img
                      src={proj.cover_image_url}
                      alt={proj.title}
                      style={styles.cardImage}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div style={styles.cardImagePlaceholder}>
                      <span>{proj.category || 'Design'}</span>
                    </div>
                  )}
                </div>

                <div style={styles.cardContent}>
                  <div style={styles.cardHeader}>
                    <span style={styles.categoryBadge}>{proj.category || 'General'}</span>
                    <span style={styles.yearBadge}>{proj.year}</span>
                  </div>

                  <h3 style={styles.cardTitle}>{proj.title}</h3>
                  <p style={styles.cardSummary}>
                    {proj.summary || 'No overview summary provided.'}
                  </p>

                  <div style={styles.cardActions}>
                    <button
                      onClick={() => openEditModal(proj)}
                      style={styles.actionBtn}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(proj.id)}
                      style={{ ...styles.actionBtn, color: '#ef4444' }}
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

      {/* Modal */}
      {isModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent} className="responsive-modal">
            <h2 style={styles.modalTitle}>
              {editingProject ? 'Edit Project' : 'New Design Work'}
            </h2>

            {error && <div style={styles.errorBanner}>{error}</div>}

            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Project Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      title: e.target.value,
                      slug: e.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, '-'),
                    })
                  }
                  required
                  placeholder="e.g. Northlight Brand Identity"
                  style={styles.input}
                />
              </div>

              <div style={styles.rowTwo} className="responsive-row-two">
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    required
                    placeholder="e.g. Editorial Design"
                    style={styles.input}
                  />
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Year</label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) =>
                      setFormData({ ...formData, year: parseInt(e.target.value) || 2025 })
                    }
                    required
                    style={styles.input}
                  />
                </div>
              </div>

              {/* Cloudflare R2 Cover Image Upload */}
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Cover Image Asset</label>
                <FileUpload
                  accept="image/*"
                  label="Upload Cover Image to R2"
                  onUploadSuccess={(url) =>
                    setFormData((prev) => ({ ...prev, cover_image_url: url }))
                  }
                />
                <input
                  type="url"
                  value={formData.cover_image_url}
                  onChange={(e) =>
                    setFormData({ ...formData, cover_image_url: e.target.value })
                  }
                  placeholder="Or paste external image URL..."
                  style={{ ...styles.input, marginTop: '6px' }}
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Summary / Concept</label>
                <textarea
                  value={formData.summary}
                  onChange={(e) =>
                    setFormData({ ...formData, summary: e.target.value })
                  }
                  rows={3}
                  placeholder="Brief overview of project statement..."
                  style={{ ...styles.input, resize: 'vertical' }}
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
                  {editingProject ? 'Save Changes' : 'Create Project'}
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
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  imageWrapper: {
    backgroundColor: 'var(--border-hairline)',
    height: '180px',
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  cardImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: 'var(--bg-surface)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "var(--font-mono)",
    fontSize: '12px',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  cardContent: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '8px',
  },
  categoryBadge: {
    fontFamily: "var(--font-mono)",
    fontSize: '10px',
    color: 'var(--accent-bronze)',
    backgroundColor: 'var(--badge-bg)',
    padding: '3px 8px',
    borderRadius: '3px',
  },
  yearBadge: {
    fontFamily: "var(--font-mono)",
    fontSize: '11px',
    color: 'var(--text-muted)',
  },
  cardTitle: {
    fontFamily: "var(--font-serif)",
    fontSize: '22px',
    fontWeight: '400',
    color: 'var(--text-charcoal)',
    margin: '0 0 6px 0',
    lineHeight: 1.2,
  },
  cardSummary: {
    fontSize: '13px',
    color: 'var(--text-muted)',
    lineHeight: '1.5',
    marginBottom: '16px',
    flex: 1,
  },
  cardActions: {
    display: 'flex',
    gap: '8px',
    borderTop: '1px solid var(--border-hairline)',
    paddingTop: '14px',
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
