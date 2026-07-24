import { useState, useEffect } from 'react';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import FileUpload from '../components/FileUpload';

export default function Media() {
  const [mediaList, setMediaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedUrl, setCopiedUrl] = useState('');

  useEffect(() => {
    fetchMediaAssets();
  }, []);

  const fetchMediaAssets = async () => {
    setLoading(true);
    try {
      const response = await api.get('/upload/assets');
      if (Array.isArray(response.data)) {
        setMediaList(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch media assets from server:', err);
      // Fallback to local storage
      const saved = localStorage.getItem('saved_media_assets');
      if (saved) {
        setMediaList(JSON.parse(saved));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = (uploadedData) => {
    let newAsset;
    if (typeof uploadedData === 'object' && uploadedData.url) {
      newAsset = uploadedData;
    } else {
      const url = uploadedData;
      const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url);
      newAsset = {
        id: Date.now(),
        url,
        name: url.split('/').pop(),
        content_type: isImage ? 'image/png' : 'application/pdf',
      };
    }

    setMediaList((prev) => {
      const updated = [newAsset, ...prev];
      localStorage.setItem('saved_media_assets', JSON.stringify(updated));
      return updated;
    });

    fetchMediaAssets();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this asset from your Media Collection?')) return;

    try {
      await api.delete(`/upload/assets/${id}`);
    } catch (err) {
      console.warn('Could not delete from server, removing locally:', err);
    }

    setMediaList((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      localStorage.setItem('saved_media_assets', JSON.stringify(updated));
      return updated;
    });
  };

  const copyToClipboard = (url) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(''), 2500);
  };

  return (
    <div style={styles.pageContainer}>
      <Navbar />

      <main style={styles.mainContent} className="responsive-padding">
        <div style={styles.headerRow} className="responsive-header">
          <div>
            <span style={styles.monoCategory}>Cloud Storage (Cloudflare R2)</span>
            <h1 style={styles.title}>Media Asset Manager</h1>
          </div>
        </div>

        {copiedUrl && (
          <div style={styles.toast}>
            ✓ Copied CDN URL to clipboard!
          </div>
        )}

        {/* Upload Box */}
        <div style={styles.uploadCard}>
          <h2 style={styles.cardTitle}>Upload New Media Asset</h2>
          <FileUpload
            accept="image/*,.pdf"
            label="Upload Image or Document Asset to Cloudflare R2"
            onUploadSuccess={handleUploadSuccess}
          />
        </div>

        {/* Media Gallery */}
        <div style={styles.gallerySection}>
          <div style={styles.galleryHeader}>
            <h2 style={styles.cardTitle}>Asset Collection ({mediaList.length})</h2>
            <button onClick={fetchMediaAssets} style={styles.refreshBtn}>
              ↻ Refresh
            </button>
          </div>

          {loading ? (
            <div style={styles.loadingBox}>Loading persistent asset collection...</div>
          ) : mediaList.length === 0 ? (
            <div style={styles.emptyBox}>
              <p style={styles.emptyText}>
                No assets in collection yet. Upload brand headshots, showcase graphics, or PDF documents above!
              </p>
            </div>
          ) : (
            <div style={styles.grid}>
              {mediaList.map((item) => {
                const isImage =
                  item.content_type?.startsWith('image/') ||
                  /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(item.url);

                return (
                  <div key={item.id} style={styles.assetCard}>
                    <div style={styles.previewBox}>
                      {isImage ? (
                        <img src={item.url} alt={item.name} style={styles.assetImage} />
                      ) : (
                        <div style={styles.docPlaceholder}>
                          <span style={styles.docIcon}>📄</span>
                          <span>PDF Document</span>
                        </div>
                      )}
                    </div>

                    <div style={styles.assetContent}>
                      <span style={styles.assetName} title={item.name || item.url}>
                        {item.name || item.url.split('/').pop()}
                      </span>

                      <div style={styles.actionRow}>
                        <button
                          onClick={() => copyToClipboard(item.url)}
                          style={styles.copyBtn}
                        >
                          {copiedUrl === item.url ? '✓ Copied!' : 'Copy URL'}
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          style={styles.deleteBtn}
                          title="Delete Asset"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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
  uploadCard: {
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border-hairline)',
    borderRadius: '10px',
    padding: '24px',
    marginBottom: '32px',
  },
  gallerySection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  galleryHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontFamily: "var(--font-serif)",
    fontSize: '22px',
    fontWeight: '400',
    color: 'var(--text-charcoal)',
    margin: 0,
  },
  refreshBtn: {
    fontFamily: "var(--font-mono)",
    fontSize: '11px',
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border-hairline)',
    color: 'var(--text-charcoal)',
    padding: '6px 12px',
    borderRadius: '4px',
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
    fontSize: '13px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '16px',
  },
  assetCard: {
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border-hairline)',
    borderRadius: '10px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  previewBox: {
    height: '150px',
    backgroundColor: 'var(--bg-canvas)',
    overflow: 'hidden',
  },
  assetImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  docPlaceholder: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "var(--font-mono)",
    fontSize: '12px',
    color: 'var(--text-muted)',
    gap: '6px',
  },
  docIcon: {
    fontSize: '24px',
  },
  assetContent: {
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  assetName: {
    fontFamily: "var(--font-mono)",
    fontSize: '11px',
    color: 'var(--text-charcoal)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  actionRow: {
    display: 'flex',
    gap: '8px',
  },
  copyBtn: {
    flex: 1,
    padding: '6px 10px',
    backgroundColor: 'var(--accent-bronze)',
    border: 'none',
    borderRadius: '4px',
    color: 'var(--accent-contrast)',
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  deleteBtn: {
    padding: '6px 10px',
    backgroundColor: 'rgba(185, 28, 28, 0.1)',
    border: '1px solid rgba(185, 28, 28, 0.25)',
    borderRadius: '4px',
    color: '#ef4444',
    fontSize: '12px',
    cursor: 'pointer',
  },
  toast: {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    backgroundColor: 'var(--text-charcoal)',
    color: 'var(--bg-canvas)',
    padding: '12px 20px',
    borderRadius: '6px',
    fontFamily: "var(--font-mono)",
    fontSize: '12px',
    zIndex: 2000,
    boxShadow: 'var(--card-shadow)',
  },
};
