'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, CheckCircle2, Loader2, X, Image as ImageIcon, Camera, RefreshCw } from 'lucide-react';
import { uploadImageToCloudinaryAction } from '@/app/actions';
import { toast } from 'sonner';

interface CloudinaryUploadProps {
  value?: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
  variant?: 'dropzone' | 'avatar' | 'compact' | 'banner' | 'watermark';
  className?: string;
  placeholder?: string;
  aspectRatio?: 'square' | 'video' | 'banner' | 'auto';
}

export default function CloudinaryUpload({
  value,
  onChange,
  folder = 'uploads',
  label,
  variant = 'dropzone',
  className = '',
  placeholder = 'Click or drag image to upload',
  aspectRatio = 'auto',
}: CloudinaryUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string>(value || '');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync with value prop if changed from outside
  React.useEffect(() => {
    if (value !== undefined) {
      setPreview(value);
    }
  }, [value]);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file (PNG, JPG, WEBP, SVG)');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      toast.error('File size exceeds 15MB limit');
      return;
    }

    // Create immediate local preview
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);
    setIsUploading(true);

    try {
      // Read file to base64
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        try {
          const res = await uploadImageToCloudinaryAction(base64, folder);
          if (res.success && res.url) {
            setPreview(res.url);
            onChange(res.url);
            toast.success('Image uploaded to Cloudinary successfully!');
          } else {
            toast.error(res.error || 'Failed to upload image');
            setPreview(value || '');
          }
        } catch (err: any) {
          console.error(err);
          toast.error(err?.message || 'Upload failed');
          setPreview(value || '');
        } finally {
          setIsUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setIsUploading(false);
      toast.error('Error processing image');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview('');
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // --- AVATAR / LOGO CIRCLE VARIANT ---
  if (variant === 'avatar') {
    return (
      <div className={`flex flex-col items-center gap-2 ${className}`}>
        {label && <label className="text-xs font-bold text-gray-700 dark:text-gray-300">{label}</label>}
        <div
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className="relative w-24 h-24 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-[#e50914] bg-gray-50 dark:bg-[#1a1d24] flex items-center justify-center cursor-pointer overflow-hidden group transition-all shadow-sm"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleInputChange}
            className="hidden"
          />

          {preview ? (
            <>
              <img src={preview} alt="Avatar Preview" className="w-full h-full object-cover rounded-full" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity text-[10px] font-bold">
                <Camera className="w-4 h-4 mb-0.5" />
                <span>Change</span>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-400 group-hover:text-[#e50914] transition-colors p-2 text-center">
              <Camera className="w-6 h-6 mb-1" />
              <span className="text-[10px] font-bold">Upload</span>
            </div>
          )}

          {isUploading && (
            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white z-20">
              <Loader2 className="w-6 h-6 animate-spin text-[#e50914]" />
              <span className="text-[9px] font-bold mt-1">Uploading...</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- BANNER / LANDSCAPE VARIANT ---
  if (variant === 'banner') {
    return (
      <div className={`flex flex-col items-center gap-1.5 w-full ${className}`}>
        {label && <label className="text-xs font-bold text-gray-700 dark:text-gray-300 self-start">{label}</label>}
        <div
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className="relative w-full h-24 sm:h-28 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-[#e50914] bg-gray-50 dark:bg-[#1a1d24] flex items-center justify-center cursor-pointer overflow-hidden group transition-all shadow-sm"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleInputChange}
            className="hidden"
          />

          {preview ? (
            <>
              <img src={preview} alt="Banner Preview" className="w-full h-full object-cover rounded-2xl" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity text-[11px] font-bold">
                <Camera className="w-4 h-4 mb-0.5" />
                <span>Change Banner</span>
              </div>
              <button
                type="button"
                onClick={handleRemove}
                className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-black/60 hover:bg-red-600 text-white flex items-center justify-center text-[10px] transition-colors z-10"
                title="Remove Banner"
              >
                <X className="w-3 h-3" />
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-400 group-hover:text-[#e50914] transition-colors p-2 text-center">
              <ImageIcon className="w-6 h-6 mb-1" />
              <span className="text-[11px] font-bold">Upload Banner</span>
            </div>
          )}

          {isUploading && (
            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white z-20">
              <Loader2 className="w-6 h-6 animate-spin text-[#e50914]" />
              <span className="text-[9px] font-bold mt-1">Uploading...</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- WATERMARK / TRANSPARENT PNG VARIANT ---
  if (variant === 'watermark') {
    return (
      <div className={`flex flex-col items-center gap-1.5 w-full ${className}`}>
        {label && <label className="text-xs font-bold text-gray-700 dark:text-gray-300 self-start">{label}</label>}
        <div
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className="relative w-full h-24 sm:h-28 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-[#e50914] bg-gray-100/60 dark:bg-black/40 flex items-center justify-center cursor-pointer overflow-hidden group transition-all shadow-sm"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleInputChange}
            className="hidden"
          />

          {preview ? (
            <>
              <div className="w-full h-full flex items-center justify-center p-2">
                <img src={preview} alt="Watermark Preview" className="max-h-20 max-w-[85%] object-contain drop-shadow-sm" />
              </div>
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity text-[11px] font-bold">
                <Camera className="w-4 h-4 mb-0.5" />
                <span>Change Watermark</span>
              </div>
              <button
                type="button"
                onClick={handleRemove}
                className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-black/60 hover:bg-red-600 text-white flex items-center justify-center text-[10px] transition-colors z-10"
                title="Remove Watermark"
              >
                <X className="w-3 h-3" />
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-400 group-hover:text-[#e50914] transition-colors p-2 text-center">
              <Camera className="w-6 h-6 mb-1" />
              <span className="text-[11px] font-bold">Upload PNG</span>
            </div>
          )}

          {isUploading && (
            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white z-20">
              <Loader2 className="w-6 h-6 animate-spin text-[#e50914]" />
              <span className="text-[9px] font-bold mt-1">Uploading...</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- COMPACT BUTTON / INPUT ROW VARIANT ---
  if (variant === 'compact') {
    return (
      <div className={`space-y-1.5 ${className}`}>
        {label && <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">{label}</label>}
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleInputChange}
            className="hidden"
          />

          {preview && (
            <div className="relative w-11 h-11 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shrink-0 bg-gray-50">
              <img src={preview} alt="Thumb" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={handleRemove}
                className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px] hover:scale-110 transition-transform"
                title="Remove"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
          )}

          <div className="relative flex-1">
            <input
              type="text"
              value={preview}
              onChange={(e) => {
                setPreview(e.target.value);
                onChange(e.target.value);
              }}
              placeholder="Paste image URL or click Upload"
              className="w-full bg-gray-50 dark:bg-[#1a1d24] border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#e50914] truncate font-mono"
            />
          </div>

          <button
            type="button"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-bold transition-all shrink-0 active:scale-95 cursor-pointer disabled:opacity-50"
          >
            {isUploading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#e50914]" />
            ) : (
              <UploadCloud className="w-3.5 h-3.5 text-[#e50914]" />
            )}
            <span>{isUploading ? 'Uploading...' : 'Cloudinary Upload'}</span>
          </button>
        </div>
      </div>
    );
  }

  // --- STANDARD DROPZONE VARIANT (DEFAULT FOR PAYMENTS / MOODBOARDS) ---
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">{label}</label>}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
      />

      {preview ? (
        <div className="relative rounded-3xl border border-emerald-200 dark:border-emerald-950 bg-emerald-50/70 dark:bg-emerald-950/20 p-4 flex items-center justify-between shadow-xs animate-fade-in">
          <div className="flex items-center gap-3.5 min-w-0 pr-2">
            <div className="relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-emerald-500/40 bg-white shrink-0 shadow-sm">
              <img src={preview} alt="Uploaded Image" className="w-full h-full object-cover" />
              {isUploading && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                </div>
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <h4 className="text-xs sm:text-[13px] font-extrabold text-emerald-950 dark:text-emerald-200 truncate">
                  Cloudinary Image Attached
                </h4>
              </div>
              <p className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400/80 truncate max-w-xs sm:max-w-md mt-0.5">
                {preview}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1 px-3 py-1.5 text-[11px] font-bold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Replace</span>
            </button>

            <button
              type="button"
              onClick={handleRemove}
              className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer"
              title="Remove Image"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-3xl p-6 transition-all duration-200 flex flex-col items-center justify-center text-center cursor-pointer group ${
            isDragOver
              ? 'border-[#e50914] bg-red-50/50 dark:bg-red-950/20 scale-[1.01]'
              : 'border-gray-300 dark:border-gray-700 hover:border-[#e50914] dark:hover:border-[#e50914] bg-gray-50/50 dark:bg-[#15181e]/50 hover:bg-white dark:hover:bg-[#1a1d24]'
          }`}
        >
          <div className="w-14 h-14 rounded-2xl bg-white dark:bg-[#1e2229] border border-gray-200 dark:border-gray-700 text-[#e50914] flex items-center justify-center shadow-md mb-3 group-hover:scale-110 transition-transform">
            {isUploading ? (
              <Loader2 className="w-7 h-7 animate-spin" />
            ) : (
              <UploadCloud className="w-7 h-7" />
            )}
          </div>

          <h4 className="text-xs sm:text-[13.5px] font-extrabold text-gray-800 dark:text-gray-200 group-hover:text-[#e50914] transition-colors">
            {isUploading ? 'Uploading to Cloudinary...' : placeholder}
          </h4>
          <p className="text-[11px] text-gray-400 dark:text-gray-500 font-semibold mt-1">
            Drag & drop or browse from gallery (PNG, JPG, WEBP, SVG up to 15MB)
          </p>
        </div>
      )}
    </div>
  );
}
