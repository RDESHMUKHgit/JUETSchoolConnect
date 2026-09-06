import React, { useState, useRef } from 'react';
import { supabase } from '../../utils/supabase.js';
import { apiRequest } from '../../api/client.js';
import { UploadCloud, X, Image as ImageIcon, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { Button } from './Button.js';

interface ImageUploadProps {
  bucket?: string;
  value?: string | null;
  onChange: (url: string) => void;
  label?: string;
  helperText?: string;
  aspectRatio?: 'square' | 'wide' | 'auto';
  maxWidth?: string;
}

const MAX_FILE_SIZE_BYTES = 300 * 1024; // 300 KB strictly enforced
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export const ImageUpload: React.FC<ImageUploadProps> = ({
  bucket = 'question-images',
  value,
  onChange,
  label = 'Upload Image',
  helperText = 'Maximum file size: 300 KB (JPEG, PNG, WebP)',
  aspectRatio = 'square',
  maxWidth = '100%',
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // 1. Client-Side Size Validation (Max 300 KB)
    if (file.size > MAX_FILE_SIZE_BYTES) {
      const actualKb = (file.size / 1024).toFixed(1);
      setError(`File size (${actualKb} KB) exceeds the strict 300 KB limit. Please compress or choose a smaller image.`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // 2. MIME Type Validation
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      setError('Unsupported file type. Only JPEG, PNG, WebP, and GIF images are permitted.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    try {
      setUploading(true);

      // Read file as Base64 Data URL
      const reader = new FileReader();
      const base64Data = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (e) => reject(e);
        reader.readAsDataURL(file);
      });

      // 1. Primary path: Upload via authenticated backend API (bypasses browser Supabase RLS restrictions)
      try {
        const res = await apiRequest('/admin/questions/upload-image', {
          method: 'POST',
          body: JSON.stringify({
            fileBase64: base64Data,
            fileName: file.name,
            mimeType: file.type,
          }),
        });

        if (res.success && res.publicUrl) {
          onChange(res.publicUrl);
          return;
        }
      } catch (serverErr: any) {
        // If server returned an explicit error message, rethrow it
        if (serverErr?.message && !serverErr.message.includes('404') && !serverErr.message.includes('Failed to fetch')) {
          throw serverErr;
        }
        console.warn('Backend upload unavailable, falling back to direct storage:', serverErr);
      }

      // 2. Fallback: Direct upload to Supabase Storage
      const fileExt = file.name.split('.').pop() || 'png';
      const cleanFileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = cleanFileName;

      const { data, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type,
        });

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      if (!urlData?.publicUrl) {
        throw new Error('Failed to obtain public URL from storage bucket.');
      }

      onChange(urlData.publicUrl);
    } catch (err: any) {
      console.error('[ImageUpload Error]', err);
      setError(err.message || 'Image upload failed. Please check your network and try again.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemove = () => {
    onChange('');
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const isSquare = aspectRatio === 'square';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', maxWidth }}>
      {label && (
        <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{label}</span>
          <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 500 }}>Max: 300 KB</span>
        </label>
      )}

      {/* Hidden native file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {/* Preview or Upload Dropzone */}
      {value ? (
        <div
          style={{
            position: 'relative',
            borderRadius: isSquare ? '16px' : '10px',
            overflow: 'hidden',
            border: '2px solid #E2E8F0',
            background: '#F8FAFC',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: isSquare ? '140px' : '100%',
            height: isSquare ? '140px' : '180px',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <img
            src={value}
            alt="Uploaded preview"
            style={{
              width: '100%',
              height: '100%',
              objectFit: isSquare ? 'cover' : 'contain',
              display: 'block',
            }}
          />

          {/* Action buttons on hover / overlay */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(15, 23, 42, 0.4)',
              opacity: uploading ? 1 : 0,
              transition: 'opacity 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
            onMouseEnter={(e) => {
              if (!uploading) e.currentTarget.style.opacity = '1';
            }}
            onMouseLeave={(e) => {
              if (!uploading) e.currentTarget.style.opacity = '0';
            }}
          >
            {uploading ? (
              <div style={{ color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600 }}>
                <RefreshCw size={16} className="animate-spin" />
                <span>Uploading...</span>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    backgroundColor: '#FFFFFF',
                    color: '#0F172A',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '6px 10px',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                  }}
                >
                  <RefreshCw size={12} />
                  <span>Replace</span>
                </button>
                <button
                  type="button"
                  onClick={handleRemove}
                  style={{
                    backgroundColor: '#EF4444',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '6px 10px',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                  }}
                >
                  <X size={12} />
                  <span>Remove</span>
                </button>
              </>
            )}
          </div>
        </div>
      ) : (
        <div
          onClick={() => !uploading && fileInputRef.current?.click()}
          style={{
            border: '2px dashed #CBD5E1',
            borderRadius: isSquare ? '16px' : '10px',
            padding: '24px 16px',
            textAlign: 'center',
            backgroundColor: '#F8FAFC',
            cursor: uploading ? 'wait' : 'pointer',
            transition: 'border-color 0.2s ease, background-color 0.2s ease',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            minHeight: isSquare ? '140px' : '110px',
            width: isSquare ? '140px' : '100%',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#9A751A';
            e.currentTarget.style.backgroundColor = '#FEFCE8';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#CBD5E1';
            e.currentTarget.style.backgroundColor = '#F8FAFC';
          }}
        >
          {uploading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
              <RefreshCw size={24} style={{ color: '#9A751A' }} className="animate-spin" />
              <span style={{ fontSize: '12px', color: '#9A751A', fontWeight: 600 }}>Uploading to Storage...</span>
            </div>
          ) : (
            <>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  color: '#9A751A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <UploadCloud size={20} />
              </div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A' }}>
                Select Image File
              </div>
              <div style={{ fontSize: '11px', color: '#64748B' }}>
                Strict &le; 300 KB
              </div>
            </>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: '#DC2626',
            fontSize: '12px',
            backgroundColor: '#FEF2F2',
            padding: '6px 10px',
            borderRadius: '6px',
            border: '1px solid #FECACA',
          }}
        >
          <AlertCircle size={14} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {helperText && !error && (
        <p style={{ fontSize: '11px', color: '#64748B', margin: 0 }}>
          {helperText}
        </p>
      )}
    </div>
  );
};
