import { useState, useEffect } from 'react';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import FileUpload from '../components/FileUpload';

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  const [mediaAssets, setMediaAssets] = useState([]);
  const [showMediaPicker, setShowMediaPicker] = useState(null); // 'avatar' | 'cv' | null

  const [profile, setProfile] = useState({
    name: '',
    title: '',
    bio: '',
    avatar_url: '',
    cv_url: '',
    availability_status: '',
    email: '',
    location: '',
    social_links: {
      behance: '',
      dribbble: '',
      instagram: '',
      linkedin: '',
      github: '',
      twitter: '',
    },
  });

  useEffect(() => {
    fetchProfile();
    fetchMediaAssets();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await api.get('/profile');
      if (response.data) {
        setProfile({
          ...response.data,
          social_links: response.data.social_links || {},
        });
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMediaAssets = async () => {
    try {
      const response = await api.get('/upload/assets');
      if (Array.isArray(response.data)) {
        setMediaAssets(response.data);
      }
    } catch (err) {
      const saved = localStorage.getItem('saved_media_assets');
      if (saved) {
        setMediaAssets(JSON.parse(saved));
      }
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      const response = await api.put('/profile', profile);
      setProfile(response.data);
      setMessage('Profile & CV settings saved successfully.');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const selectAssetForField = (url, targetField) => {
    setProfile((prev) => ({ ...prev, [targetField]: url }));
    setShowMediaPicker(null);
  };

  return (
    <div style={styles.pageContainer}>
      <Navbar />

      <main style={styles.mainContent} className="responsive-padding">
        <div style={styles.headerRow} className="responsive-header">
          <div>
            <span style={styles.monoCategory}>Public Portfolio Identity</span>
            <h1 style={styles.title}>Profile & Resume Settings</h1>
          </div>
          <button onClick={handleSave} disabled={saving} style={styles.saveBtn}>
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>

        {message && <div style={styles.successBanner}>{message}</div>}
        {error && <div style={styles.errorBanner}>{error}</div>}

        {loading ? (
          <div style={styles.loadingBox}>Loading profile data...</div>
        ) : (
          <form onSubmit={handleSave} style={styles.formGrid} className="responsive-grid">
            {/* Left Column: Personal Identity & Bio */}
            <div style={styles.columnCard}>
              <h2 style={styles.cardTitle}>Designer Identity</h2>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Full Name</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  required
                  style={styles.input}
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Professional Title</label>
                <input
                  type="text"
                  value={profile.title}
                  onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                  required
                  placeholder="e.g. Senior Brand & Art Director"
                  style={styles.input}
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Bio / Artist Statement</label>
                <textarea
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  rows={4}
                  placeholder="Describe your design philosophy and background..."
                  style={{ ...styles.input, resize: 'vertical' }}
                />
              </div>

              <div style={styles.rowTwo} className="responsive-row-two">
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Contact Email</label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    style={styles.input}
                  />
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Base Location</label>
                  <input
                    type="text"
                    value={profile.location}
                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                    placeholder="e.g. Nairobi, Kenya / Remote"
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Availability Status Badge</label>
                <input
                  type="text"
                  value={profile.availability_status}
                  onChange={(e) => setProfile({ ...profile, availability_status: e.target.value })}
                  placeholder="e.g. Available for Q1/Q2 Design Projects"
                  style={styles.input}
                />
              </div>
            </div>

            {/* Right Column: Avatar & CV Uploads + Social Links */}
            <div style={styles.columnGroup}>
              {/* Headshot / Avatar Card */}
              <div style={styles.columnCard}>
                <div style={styles.cardHeaderFlex}>
                  <h2 style={styles.cardTitle}>Headshot / Profile Image</h2>
                  <button
                    type="button"
                    onClick={() => setShowMediaPicker(showMediaPicker === 'avatar_url' ? null : 'avatar_url')}
                    style={styles.pickerToggleBtn}
                  >
                    📂 Select from Media Library
                  </button>
                </div>

                {profile.avatar_url && (
                  <div style={styles.avatarPreviewBox}>
                    <img src={profile.avatar_url} alt="Profile Avatar" style={styles.avatarImage} />
                  </div>
                )}

                {/* Quick Asset Selector Drawer */}
                {showMediaPicker === 'avatar_url' && (
                  <div style={styles.mediaPickerDrawer}>
                    <span style={styles.pickerTitle}>Choose Image from Media Assets:</span>
                    <div style={styles.pickerGrid}>
                      {mediaAssets.map((asset) => (
                        <div
                          key={asset.id}
                          onClick={() => selectAssetForField(asset.url, 'avatar_url')}
                          style={styles.pickerItem}
                          title={asset.name}
                        >
                          <img src={asset.url} alt={asset.name} style={styles.pickerImg} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <FileUpload
                  accept="image/*"
                  label="Upload Headshot Image to R2"
                  onUploadSuccess={(res) => {
                    const url = typeof res === 'object' ? res.url : res;
                    setProfile((prev) => ({ ...prev, avatar_url: url }));
                    fetchMediaAssets();
                  }}
                />
              </div>

              {/* CV / Resume Card */}
              <div style={styles.columnCard}>
                <div style={styles.cardHeaderFlex}>
                  <h2 style={styles.cardTitle}>Curriculum Vitae (CV) PDF</h2>
                  <button
                    type="button"
                    onClick={() => setShowMediaPicker(showMediaPicker === 'cv_url' ? null : 'cv_url')}
                    style={styles.pickerToggleBtn}
                  >
                    📄 Select from Media Library
                  </button>
                </div>

                {profile.cv_url && (
                  <div style={styles.cvBox}>
                    <span style={styles.cvIcon}>📄</span>
                    <a
                      href={profile.cv_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={styles.cvLink}
                    >
                      View Current CV PDF &rarr;
                    </a>
                  </div>
                )}

                {/* Quick Asset Selector Drawer */}
                {showMediaPicker === 'cv_url' && (
                  <div style={styles.mediaPickerDrawer}>
                    <span style={styles.pickerTitle}>Choose Document from Media Assets:</span>
                    <div style={styles.pickerList}>
                      {mediaAssets.map((asset) => (
                        <button
                          key={asset.id}
                          type="button"
                          onClick={() => selectAssetForField(asset.url, 'cv_url')}
                          style={styles.pickerDocItem}
                        >
                          📄 {asset.name || asset.url.split('/').pop()}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <FileUpload
                  accept=".pdf"
                  label="Upload CV PDF Document to R2"
                  onUploadSuccess={(res) => {
                    const url = typeof res === 'object' ? res.url : res;
                    setProfile((prev) => ({ ...prev, cv_url: url }));
                    fetchMediaAssets();
                  }}
                />
              </div>

              {/* Social Links Card */}
              <div style={styles.columnCard}>
                <h2 style={styles.cardTitle}>Social & Portfolio Profiles</h2>

                <div style={styles.socialGrid} className="responsive-row-two">
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Behance URL</label>
                    <input
                      type="url"
                      value={profile.social_links?.behance || ''}
                      onChange={(e) =>
                        setProfile({
                          ...profile,
                          social_links: { ...profile.social_links, behance: e.target.value },
                        })
                      }
                      placeholder="https://behance.net/..."
                      style={styles.input}
                    />
                  </div>

                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Dribbble URL</label>
                    <input
                      type="url"
                      value={profile.social_links?.dribbble || ''}
                      onChange={(e) =>
                        setProfile({
                          ...profile,
                          social_links: { ...profile.social_links, dribbble: e.target.value },
                        })
                      }
                      placeholder="https://dribbble.com/..."
                      style={styles.input}
                    />
                  </div>

                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Instagram URL</label>
                    <input
                      type="url"
                      value={profile.social_links?.instagram || ''}
                      onChange={(e) =>
                        setProfile({
                          ...profile,
                          social_links: { ...profile.social_links, instagram: e.target.value },
                        })
                      }
                      placeholder="https://instagram.com/..."
                      style={styles.input}
                    />
                  </div>

                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>LinkedIn URL</label>
                    <input
                      type="url"
                      value={profile.social_links?.linkedin || ''}
                      onChange={(e) =>
                        setProfile({
                          ...profile,
                          social_links: { ...profile.social_links, linkedin: e.target.value },
                        })
                      }
                      placeholder="https://linkedin.com/in/..."
                      style={styles.input}
                    />
                  </div>
                </div>
              </div>
            </div>
          </form>
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
  saveBtn: {
    padding: '10px 20px',
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
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '24px',
  },
  columnCard: {
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border-hairline)',
    borderRadius: '10px',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  columnGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  cardHeaderFlex: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: '8px',
    borderBottom: '1px solid var(--border-hairline)',
  },
  cardTitle: {
    fontFamily: "var(--font-serif)",
    fontSize: '22px',
    fontWeight: '400',
    color: 'var(--text-charcoal)',
    margin: 0,
  },
  pickerToggleBtn: {
    fontFamily: "var(--font-mono)",
    fontSize: '11px',
    backgroundColor: 'var(--bg-canvas)',
    border: '1px solid var(--border-hairline)',
    color: 'var(--text-charcoal)',
    padding: '4px 8px',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  mediaPickerDrawer: {
    backgroundColor: 'var(--bg-canvas)',
    padding: '12px',
    borderRadius: '6px',
    border: '1px solid var(--border-hairline)',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  pickerTitle: {
    fontFamily: "var(--font-mono)",
    fontSize: '10px',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
  },
  pickerGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))',
    gap: '8px',
  },
  pickerItem: {
    width: '60px',
    height: '60px',
    borderRadius: '4px',
    overflow: 'hidden',
    border: '1px solid var(--border-hairline)',
    cursor: 'pointer',
  },
  pickerImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  pickerList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  pickerDocItem: {
    padding: '6px 10px',
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border-hairline)',
    borderRadius: '4px',
    fontSize: '12px',
    color: 'var(--text-charcoal)',
    textAlign: 'left',
    cursor: 'pointer',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  rowTwo: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
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
    backgroundColor: 'var(--bg-canvas)',
    border: '1px solid var(--border-hairline)',
    borderRadius: '6px',
    color: 'var(--text-charcoal)',
    fontSize: '13px',
    outline: 'none',
  },
  avatarPreviewBox: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '8px',
  },
  avatarImage: {
    width: '90px',
    height: '90px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '2px solid var(--border-hairline)',
  },
  cvBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: 'var(--bg-canvas)',
    padding: '12px 14px',
    borderRadius: '6px',
    border: '1px solid var(--border-hairline)',
  },
  cvIcon: {
    fontSize: '18px',
  },
  cvLink: {
    fontFamily: "var(--font-mono)",
    fontSize: '12px',
    color: 'var(--accent-bronze)',
    textDecoration: 'none',
  },
  socialGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
  },
  successBanner: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    color: '#10b981',
    padding: '12px 16px',
    borderRadius: '6px',
    fontSize: '13px',
    marginBottom: '20px',
  },
  errorBanner: {
    backgroundColor: 'rgba(185, 28, 28, 0.1)',
    border: '1px solid rgba(185, 28, 28, 0.3)',
    color: '#ef4444',
    padding: '12px 16px',
    borderRadius: '6px',
    fontSize: '13px',
    marginBottom: '20px',
  },
};
