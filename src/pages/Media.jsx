import { useState, useEffect } from 'react';
import api, { formatImageUrl } from '../api/axios';
import Navbar from '../components/Navbar';
import FileUpload from '../components/FileUpload';

export default function Media() {
  const [mediaList, setMediaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedUrl, setCopiedUrl] = useState('');
  const [activeTab, setActiveTab] = useState('all');

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
      const saved = localStorage.getItem('saved_media_assets');
      if (saved) {
        setMediaList(JSON.parse(saved));
      }
    } finally {
      setLoading(false);
    }
  };

  const getMediaCategory = (asset) => {
    if (asset.media_category) return asset.media_category;

    const mime = asset.content_type || '';
    const url = asset.url || '';

    if (mime.startsWith('video/') || /\.(mp4|webm|mov|m4v|ogv)$/i.test(url)) return 'video';
    if (mime.startsWith('audio/') || /\.(mp3|wav|ogg|aac|flac|m4a)$/i.test(url)) return 'audio';
    if (mime.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp|svg|tiff|bmp)$/i.test(url)) return 'image';
    return 'document';
  };

  const handleUploadSuccess = (uploadedData) => {
    const newAsset = {
      ...uploadedData,
      media_category: uploadedData.media_category || getMediaCategory(uploadedData),
    };

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

  const copyToClipboard = (rawUrl) => {
    const fullPublicUrl = formatImageUrl(rawUrl);
    navigator.clipboard.writeText(fullPublicUrl);
    setCopiedUrl(fullPublicUrl);
    setTimeout(() => setCopiedUrl(''), 2500);
  };

  const filteredMedia = mediaList.filter((item) => {
    if (activeTab === 'all') return true;
    return getMediaCategory(item) === activeTab;
  });

  const categoryCounts = mediaList.reduce(
    (acc, item) => {
      const cat = getMediaCategory(item);
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    },
    { all: mediaList.length, image: 0, video: 0, audio: 0, document: 0 }
  );

  const renderMediaPreview = (item) => {
    const fullUrl = formatImageUrl(item.url);
    const category = getMediaCategory(item);

    switch (category) {
      case 'video':
        return (
          <video
            src={fullUrl}
            controls
            preload="metadata"
            style={styles.assetVideo}
          />
        );
      case 'audio':
        return (
          <div style={styles.audioContainer}>
            <span style={styles.mediaIcon}>🎵</span>
            <audio src={fullUrl} controls style={styles.audioPlayer} />
          </div>
        );
      case 'image':
        return <img src={fullUrl} alt={item.name} style={styles.assetImage} />;
      case 'document':
      default:
        return (
          <div style={styles.docPlaceholder}>
            <span style={styles.docIcon}>📄</span>
            <span style={styles.docLabel}>Document Asset</span>
            <a
              href={fullUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={styles.viewDocBtn}
            >
              Open File ↗
            </a>
          </div>
        );
    }
  };

  return (
    <div style={styles.pageContainer}>
      <Navbar />

      <main style={styles.mainContent} className="responsive-padding">
        <div style={styles.headerRow} className="responsive-header">
          <div>
            <span style={styles.monoCategory}>Universal Media & Asset CDN</span>
            <h1 style={styles.title}>Media Asset Manager</h1>
          </div>
        </div>

        {copiedUrl && (
          <div style={styles.toast}>
            ✓ Copied Generated Public Link to Clipboard!
          </div>
        )}

        {/* Upload Box */}
        <div style={styles.uploadCard}>
          <h2 style={styles.cardTitle}>Upload Designer Media</h2>
          <FileUpload
            accept="image/*,video/*,audio/*,.pdf,.svg,.ai,.psd,.zip"
            label="Upload High-Res Graphics, Videos, Motion Reels, Audio, SVGs, or Documents"
            onUploadSuccess={handleUploadSuccess}
          />
        </div>

        {/* Media Gallery */}
        <div style={styles.gallerySection}>
          <div style={styles.galleryHeader}>
            <h2 style={styles.cardTitle}>
              Asset Collection ({filteredMedia.length})
            </h2>
            <button onClick={fetchMediaAssets} style={styles.refreshBtn}>
              ↻ Refresh
            </button>
          </div>

          {/* Filter Tabs */}
          <div style={styles.tabContainer}>
            {[
              { key: 'all', label: `All (${categoryCounts.all || 0})` },
              { key: 'image', label: `Images & Vectors (${categoryCounts.image || 0})` },
              { key: 'video', label: `Videos (${categoryCounts.video || 0})` },
              { key: 'audio', label: `Audio (${categoryCounts.audio || 0})` },
              { key: 'document', label: `Documents (${categoryCounts.document || 0})` },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  ...styles.tabBtn,
                  ...(activeTab === tab.key ? styles.activeTabBtn : {}),
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={styles.loadingBox}>Loading persistent asset collection...</div>
          ) : filteredMedia.length === 0 ? (
            <div style={styles.emptyBox}>
              <p style={styles.emptyText}>
                No assets found in this view. Upload videos, motion graphics, audio, SVGs, or PDF case studies above!
              </p>
            </div>
          ) : (
            <div style={styles.grid}>
              {filteredMedia.map((item) => {
                const fullUrl = formatImageUrl(item.url);
                const category = getMediaCategory(item);

                return (
                  <div key={item.id} style={styles.assetCard}>
                    <div style={styles.previewBox}>
                      {renderMediaPreview(item)}
                      <span style={styles.categoryBadge}>{category}</span>
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
                          {copiedUrl === fullUrl ? '✓ Copied!' : 'Copy Asset Link'}
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
    fontFamily: 'var(--font-sans)',
  },
  mainContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '40px 24px',
  },
  headerRow: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyIn: 'space-between',
    marginBottom: '32px',
    paddingBottom: '20px',
    borderBottom: '1px solid var(--border-hairline)',
  },
  monoCategory: {
    fontFamily: 'var(--font-mono)',
    fontSize: '11px',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    display: 'block',
    marginBottom: '4px',
  },
  title: {
    fontFamily: 'var(--font-serif)',
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
    fontFamily: 'var(--font-serif)',
    fontSize: '22px',
    fontWeight: '400',
    color: 'var(--text-charcoal)',
    margin: 0,
  },
  refreshBtn: {
    fontFamily: 'var(--font-mono)',
    fontSize: '11px',
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border-hairline)',
    color: 'var(--text-charcoal)',
    padding: '6px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  tabContainer: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    marginBottom: '8px',
  },
  tabBtn: {
    fontFamily: 'var(--font-mono)',
    fontSize: '12px',
    padding: '6px 12px',
    borderRadius: '6px',
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border-hairline)',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  activeTabBtn: {
    backgroundColor: 'var(--text-charcoal)',
    color: 'var(--bg-canvas)',
    borderColor: 'var(--text-charcoal)',
  },
  loadingBox: {
    padding: '40px',
    textAlign: 'center',
    fontFamily: 'var(--font-mono)',
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
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
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
    position: 'relative',
    height: '170px',
    backgroundColor: 'var(--bg-canvas)',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  assetImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  assetVideo: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    backgroundColor: '#000',
  },
  audioContainer: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '12px',
    gap: '8px',
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
  },
  audioPlayer: {
    width: '90%',
    height: '36px',
  },
  mediaIcon: {
    fontSize: '28px',
  },
  docPlaceholder: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'var(--font-mono)',
    fontSize: '12px',
    color: 'var(--text-muted)',
    gap: '6px',
    padding: '12px',
  },
  docIcon: {
    fontSize: '28px',
  },
  docLabel: {
    fontSize: '12px',
  },
  viewDocBtn: {
    fontSize: '11px',
    color: 'var(--accent-bronze)',
    textDecoration: 'none',
    marginTop: '4px',
  },
  categoryBadge: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    color: '#fff',
    fontSize: '10px',
    fontFamily: 'var(--font-mono)',
    textTransform: 'uppercase',
    padding: '2px 6px',
    borderRadius: '4px',
    letterSpacing: '0.05em',
    pointerEvents: 'none',
  },
  assetContent: {
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  assetName: {
    fontFamily: 'var(--font-mono)',
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
    fontFamily: 'var(--font-mono)',
    fontSize: '12px',
    zIndex: 2000,
    boxShadow: 'var(--card-shadow)',
  },
};