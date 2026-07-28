import { useState, useCallback, useRef, useEffect } from 'react';
import api from '../api/axios';

const PART_SIZE = 10 * 1024 * 1024; // 10MB per chunk
const MAX_CONCURRENT_UPLOADS = 4;   // parallel part workers

export default function FileUpload({
  accept,
  label = 'Drag & drop a file here, or click to select',
  maxSizeBytes,
  onUploadSuccess,
  onUploadError,
}) {
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [fileName, setFileName] = useState('');
  const [isDragActive, setIsDragActive] = useState(false);

  const abortControllerRef = useRef(null);
  const isMountedRef = useRef(true);
  const fileInputRef = useRef(null);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const uploadFile = async (file) => {
    if (!file) return;

    if (maxSizeBytes && file.size > maxSizeBytes) {
      const sizeMb = (maxSizeBytes / (1024 * 1024)).toFixed(0);
      const errMsg = `File exceeds maximum allowed size of ${sizeMb}MB.`;
      setError(errMsg);
      if (onUploadError) onUploadError(errMsg);
      return;
    }

    setIsUploading(true);
    setError(null);
    setFileName(file.name);
    setProgress(0);

    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;

    let uploadId = null;
    let r2Key = null;
    let storedFilename = null;

    try {
      // 1. Initiate multipart upload — server returns upload_id + presigned part URLs
      const startResponse = await api.post('/upload/start-upload', {
        filename: file.name,
        content_type: file.type || 'application/octet-stream',
        size: file.size,
      }, { signal });

      const { upload_id, r2_key, stored_filename, parts } = startResponse.data;
      uploadId = upload_id;
      r2Key = r2_key;
      storedFilename = stored_filename;

      // 2. Upload each part via presigned URL using XHR (for progress tracking)
      const partProgress = {};
      const uploadedParts = [];
      let currentPartIdx = 0;

      const worker = async () => {
        while (currentPartIdx < parts.length) {
          if (signal.aborted) throw new Error('Upload aborted');

          const index = currentPartIdx++;
          const part = parts[index];
          if (!part) break;

          const partNumber = part.part_number;
          const start = (partNumber - 1) * PART_SIZE;
          const end = Math.min(start + PART_SIZE, file.size);
          const chunk = file.slice(start, end);

          // Use XHR (not fetch/axios) so we get upload progress events on presigned URLs
          const etagHeader = await new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('PUT', part.url);

            if (file.type) {
              xhr.setRequestHeader('Content-Type', file.type);
            }

            xhr.upload.onprogress = (event) => {
              if (event.lengthComputable) {
                partProgress[partNumber] = event.loaded;
                const totalLoaded = Object.values(partProgress).reduce((a, b) => a + b, 0);
                const percent = Math.min(99, Math.round((totalLoaded / file.size) * 100));
                if (isMountedRef.current) setProgress(percent);
              }
            };

            xhr.onload = () => {
              if (xhr.status >= 200 && xhr.status < 300) {
                resolve(xhr.getResponseHeader('ETag') || '');
              } else {
                reject(new Error(`Chunk upload failed with status ${xhr.status}`));
              }
            };

            xhr.onerror = () => reject(new Error('Network error uploading chunk'));
            xhr.onabort = () => reject(new Error('Upload aborted'));
            signal.addEventListener('abort', () => xhr.abort());
            xhr.send(chunk);
          });

          if (!etagHeader) {
            throw new Error(`ETag header missing for part ${partNumber}`);
          }

          uploadedParts.push({
            PartNumber: partNumber,
            ETag: etagHeader.replace(/"/g, ''),
          });
        }
      };

      // Run parallel workers
      const workers = Array(Math.min(MAX_CONCURRENT_UPLOADS, parts.length))
        .fill(null)
        .map(() => worker());

      await Promise.all(workers);

      // 3. Tell the server to assemble all parts into the final file
      const completeResponse = await api.post('/upload/complete-upload', {
        upload_id: uploadId,
        r2_key: r2Key,
        stored_filename: storedFilename,
        original_filename: file.name,
        content_type: file.type,
        size: file.size,
        parts: uploadedParts.sort((a, b) => a.PartNumber - b.PartNumber),
      }, { signal });

      if (isMountedRef.current) {
        setProgress(100);
        if (onUploadSuccess) onUploadSuccess(completeResponse.data);
      }
    } catch (err) {
      if (err.name === 'CanceledError' || err.message === 'Upload aborted') {
        console.log('Upload canceled by user/unmount.');
        return;
      }

      const errorMessage = err.response?.data?.detail || err.message || 'Upload failed';
      console.error('Upload error:', err);

      if (isMountedRef.current) {
        setError(errorMessage);
        if (onUploadError) onUploadError(errorMessage);
      }

      // Clean up the incomplete multipart session on R2
      if (uploadId && storedFilename) {
        try {
          await api.post('/upload/abort-upload', {
            upload_id: uploadId,
            r2_key: r2Key,
            stored_filename: storedFilename,
          });
        } catch (abortError) {
          console.error('Failed to abort upload on server:', abortError);
        }
      }
    } finally {
      if (isMountedRef.current) {
        setIsUploading(false);
      }
    }
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  }, []);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = () => setIsDragActive(false);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  };

  const acceptAttr = accept
    ? (typeof accept === 'object' ? Object.keys(accept).join(',') : accept)
    : undefined;

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={() => !isUploading && fileInputRef.current?.click()}
      style={styles.dropzone(isDragActive, !!error, isUploading)}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptAttr}
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />

      {isUploading ? (
        <div style={styles.progressContainer}>
          <div style={styles.fileName}>{fileName}</div>
          <div style={styles.progressBar}>
            <div style={{ ...styles.progressFill, width: `${progress}%` }} />
          </div>
          <div style={styles.progressText}>{progress}%</div>
        </div>
      ) : error ? (
        <div style={styles.textContainer}>
          <p style={{ ...styles.mainText, color: '#ef4444' }}>Upload Failed</p>
          <p style={styles.subText}>{error}</p>
        </div>
      ) : progress === 100 ? (
        <div style={styles.textContainer}>
          <p style={{ ...styles.mainText, color: '#10b981' }}>✅ Upload Complete</p>
          <p style={styles.subText}>{fileName}</p>
        </div>
      ) : (
        <div style={styles.textContainer}>
          <p style={styles.mainText}>{label}</p>
          <p style={styles.subText}>Drag and drop a file or click to browse.</p>
        </div>
      )}
    </div>
  );
}

const styles = {
  dropzone: (isActive, isError, isUploading) => ({
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    borderWidth: 2,
    borderRadius: '8px',
    borderColor: isError ? '#ef4444' : isActive ? '#2196f3' : 'var(--border-hairline)',
    borderStyle: 'dashed',
    backgroundColor: 'var(--bg-canvas)',
    color: 'var(--text-muted)',
    outline: 'none',
    transition: 'border .24s ease-in-out',
    cursor: isUploading ? 'default' : 'pointer',
    minHeight: '120px',
    textAlign: 'center',
  }),
  textContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  mainText: {
    margin: 0,
    color: 'var(--text-charcoal)',
    fontSize: '14px',
    fontWeight: '500',
  },
  subText: {
    margin: 0,
    fontSize: '12px',
    color: 'var(--text-muted)',
  },
  progressContainer: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
  },
  fileName: {
    fontFamily: 'var(--font-mono)',
    fontSize: '12px',
    color: 'var(--text-charcoal)',
  },
  progressBar: {
    width: '80%',
    height: '8px',
    backgroundColor: 'var(--border-hairline)',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'var(--accent-bronze)',
    transition: 'width 0.3s ease-in-out',
  },
  progressText: {
    fontFamily: 'var(--font-mono)',
    fontSize: '12px',
    color: 'var(--text-muted)',
  },
};
