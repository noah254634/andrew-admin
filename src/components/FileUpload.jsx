import { useState, useRef } from 'react';
import api from '../api/axios';

// High-speed browser Canvas image compressor: reduces multi-megabyte photos to ~300KB WebP in <50ms
const compressImageIfNeeded = (file) => {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/') || file.type === 'image/svg+xml' || file.size <= 800 * 1024) {
      resolve(file);
      return;
    }

    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target.result;
    };

    img.onload = () => {
      const canvas = document.createElement('canvas');
      let { width, height } = img;
      const MAX_DIM = 2000;

      if (width > MAX_DIM || height > MAX_DIM) {
        if (width > height) {
          height = Math.round((height * MAX_DIM) / width);
          width = MAX_DIM;
        } else {
          width = Math.round((width * MAX_DIM) / height);
          height = MAX_DIM;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }
          const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, ".webp"), {
            type: 'image/webp',
            lastModified: Date.now(),
          });
          console.log(`[Image Compress] Original: ${(file.size / 1024).toFixed(0)}KB -> Compressed: ${(compressedFile.size / 1024).toFixed(0)}KB`);
          resolve(compressedFile);
        },
        'image/webp',
        0.85
      );
    };

    img.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
};

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

  const processUpload = async (fileToUpload) => {
    setError('');
    setUploading(true);

    // Compress high-resolution images client-side before sending to prevent timeouts
    const file = await compressImageIfNeeded(fileToUpload);

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

    let uploadedData = null;
    try {
      // 45-second extended timeout for network resilience
      const response = await api.post('/upload/', formData, {
        timeout: 45000,
        headers: {
          'Content-Type': undefined,
        },
      });

      uploadedData = response.data;
    } catch (err) {
      console.error('FileUpload error details:', err.response?.data || err);
      const detail = err.response?.data?.detail;
      const statusText = err.response?.status ? `[HTTP ${err.response.status}] ` : '';
      const fullErrorMsg = typeof detail === 'object' ? JSON.stringify(detail) : (detail || err.message || 'File upload failed.');
      setError(`${statusText}${fullErrorMsg}`);
    } finally {
      setUploading(false);
    }

    // Safely trigger parent callback OUTSIDE the upload try/catch block
    if (uploadedData && onUploadSuccess) {
      try {
        onUploadSuccess(uploadedData);
      } catch (parentErr) {
        console.warn('Parent onUploadSuccess callback handler warning:', parentErr);
      }
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
