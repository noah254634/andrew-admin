import { useState, useRef } from 'react';
import api from '../api/axios';

export default function FileUpload({ onUploadSuccess, accept = "image/*,.pdf", label = "Upload Image or PDF" }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processUpload(file);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    await processUpload(file);
  };

  const processUpload = async (file) => {
    setError('');
    setUploading(true);

    // Generate local preview if image
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => setPreview(ev.target.result);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      // Omit Content-Type header so browser automatically injects proper multipart boundary
      const response = await api.post('/upload/', formData, {
        headers: {
          'Content-Type': undefined,
        },
      });

      const uploadedData = response.data;
      if (onUploadSuccess) {
        onUploadSuccess(uploadedData);
      }
    } catch (err) {
      console.error('FileUpload error:', err);
      setError(err.response?.data?.detail || 'File upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={styles.dropZone}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept={accept}
          style={{ display: 'none' }}
        />

        {uploading ? (
          <div style={styles.statusBox}>
            <div style={styles.spinner}></div>
            <span style={styles.statusText}>Uploading to Cloudflare R2...</span>
          </div>
        ) : preview ? (
          <div style={styles.previewBox}>
            <img src={preview} alt="Upload preview" style={styles.previewImage} />
            <span style={styles.changeText}>Click to change file</span>
          </div>
        ) : (
          <div style={styles.uploadPrompt}>
            <span style={styles.uploadArrow}>↑</span>
            <span style={styles.label}>{label}</span>
            <span style={styles.sublabel}>Drag & drop or click to browse (Max 25MB)</span>
          </div>
        )}
      </div>

      {error && <span style={styles.errorText}>{error}</span>}
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    width: '100%',
  },
  dropZone: {
    backgroundColor: 'var(--bg-surface)',
    border: '1px dashed var(--border-hairline)',
    borderRadius: '8px',
    padding: '20px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  uploadPrompt: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
  },
  uploadArrow: {
    fontFamily: "var(--font-mono)",
    fontSize: '18px',
    color: 'var(--accent-bronze)',
    fontWeight: '600',
  },
  label: {
    fontSize: '13px',
    fontWeight: '500',
    color: 'var(--text-charcoal)',
  },
  sublabel: {
    fontFamily: "var(--font-mono)",
    fontSize: '10px',
    color: 'var(--text-muted)',
  },
  statusBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
  },
  spinner: {
    width: '16px',
    height: '16px',
    border: '2px solid var(--border-hairline)',
    borderTop: '2px solid var(--accent-bronze)',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  statusText: {
    fontFamily: "var(--font-mono)",
    fontSize: '12px',
    color: 'var(--text-muted)',
  },
  previewBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
  },
  previewImage: {
    maxHeight: '100px',
    borderRadius: '4px',
    objectFit: 'contain',
  },
  changeText: {
    fontFamily: "var(--font-mono)",
    fontSize: '10px',
    color: 'var(--text-muted)',
  },
  errorText: {
    fontFamily: "var(--font-mono)",
    fontSize: '11px',
    color: '#ef4444',
  },
};
