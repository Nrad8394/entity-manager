/**
 * File Upload Field with Preview
 * 
 * Enhanced file upload component with image preview, progress, and drag & drop.
 */

'use client';

import React, { useState, useCallback, useRef } from 'react';
import { Upload, X, File as FileIcon, Image as ImageIcon, FileText, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FileUploadProps {
  /** Current file value */
  value?: File | string | null;
  /** Change handler */
  onChange: (file: File | null) => void;
  /** Blur handler */
  onBlur?: () => void;
  /** Accepted file types */
  accept?: string;
  /** Allow multiple files */
  multiple?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Max file size in bytes */
  maxSize?: number;
  /** Show preview for images */
  showPreview?: boolean;
  /** Custom className */
  className?: string;
  /** Error message */
  error?: string;
  /** Helper text */
  helpText?: string;
}

/**
 * Format file size for display
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Get file icon based on type
 */
function getFileIcon(file: File): React.ReactNode {
  if (file.type.startsWith('image/')) {
    return <ImageIcon className="h-8 w-8 text-blue-500" />;
  }
  if (file.type.startsWith('application/pdf')) {
    return <FileText className="h-8 w-8 text-red-500" />;
  }
  return <FileIcon className="h-8 w-8 text-muted-foreground" />;
}

/**
 * File Upload Component
 */
export function FileUpload({
  value,
  onChange,
  onBlur,
  accept,
  multiple = false,
  disabled = false,
  maxSize = 10 * 1024 * 1024, // 10MB default
  showPreview = true,
  className,
  error,
  helpText,
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get current file
  const currentFile = value instanceof File ? value : null;
  const currentFileUrl = typeof value === 'string' ? value : null;

  // Generate preview for image files
  React.useEffect(() => {
    if (currentFile && currentFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(currentFile);
    } else if (currentFileUrl) {
      setPreviewUrl(currentFileUrl);
    } else {
      setPreviewUrl(null);
    }

    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [currentFile, currentFileUrl, previewUrl]);

  /**
   * Validate file
   */
  const validateFile = (file: File): string | null => {
    if (maxSize && file.size > maxSize) {
      return `File size exceeds ${formatFileSize(maxSize)}`;
    }

    if (accept) {
      const acceptedTypes = accept.split(',').map(t => t.trim());
      const fileType = file.type;
      const fileName = file.name;
      
      const isAccepted = acceptedTypes.some(type => {
        if (type.startsWith('.')) {
          return fileName.endsWith(type);
        }
        if (type.endsWith('/*')) {
          return fileType.startsWith(type.replace('/*', ''));
        }
        return fileType === type;
      });

      if (!isAccepted) {
        return `File type not accepted. Accepted: ${accept}`;
      }
    }

    return null;
  };

  /**
   * Handle file selection
   */
  const handleFileChange = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0]; // For now, handle single file
    const validationError = validateFile(file);

    if (validationError) {
      alert(validationError); // In production, use toast notification
      return;
    }

    // Simulate upload progress (in real app, this would be actual upload)
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 100);

    onChange(file);
    setTimeout(() => setUploadProgress(0), 1500);
  }, [onChange, maxSize, accept, validateFile]);

  /**
   * Handle drag events
   */
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  /**
   * Handle drop
   */
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files);
    }
  }, [disabled, handleFileChange]);

  /**
   * Remove file
   */
  const handleRemove = useCallback(() => {
    onChange(null);
    setPreviewUrl(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }, [onChange]);

  /**
   * Open file picker
   */
  const handleClick = () => {
    if (!disabled) {
      inputRef.current?.click();
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      {/* Current file display */}
      {(currentFile || currentFileUrl) && (
        <div className="relative border rounded-lg overflow-hidden bg-card">
          {showPreview && previewUrl ? (
            <div className="relative">
              <img 
                src={previewUrl} 
                alt={currentFile?.name || 'Preview'}
                className="w-full h-48 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                <p className="text-sm font-medium truncate">{currentFile?.name || 'Existing image'}</p>
                {currentFile && (
                  <p className="text-xs opacity-90">{formatFileSize(currentFile.size)}</p>
                )}
              </div>
            </div>
          ) : (
            <div className="p-4 flex items-center gap-3">
              {currentFile ? getFileIcon(currentFile) : <ImageIcon className="h-8 w-8 text-blue-500" />}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{currentFile?.name || 'Image'}</p>
                {currentFile && (
                  <p className="text-xs text-muted-foreground">{formatFileSize(currentFile.size)}</p>
                )}
              </div>
              {uploadProgress === 100 && (
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
              )}
            </div>
          )}

          {/* Remove button */}
          {!disabled && (
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 p-1.5 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90 transition-colors shadow-lg"
              aria-label="Remove file"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          {/* Upload progress */}
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted">
              <div 
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}
        </div>
      )}

      {/* Upload area */}
      {!currentFile && !currentFileUrl && (
        <div
          onClick={handleClick}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={cn(
            'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
            dragActive 
              ? 'border-primary bg-primary/5' 
              : 'border-border hover:border-primary/50 hover:bg-muted/50',
            disabled && 'opacity-50 cursor-not-allowed hover:border-border hover:bg-transparent',
            error && 'border-destructive'
          )}
        >
          <input
            ref={inputRef}
            type="file"
            onChange={(e) => handleFileChange(e.target.files)}
            onBlur={onBlur}
            accept={accept}
            multiple={multiple}
            disabled={disabled}
            className="hidden"
            aria-describedby={error ? 'file-error' : helpText ? 'file-help' : undefined}
          />

          <Upload className={cn(
            'h-12 w-12 mx-auto mb-3',
            dragActive ? 'text-primary' : 'text-muted-foreground'
          )} />

          <p className="text-sm font-medium text-foreground mb-1">
            {dragActive ? 'Drop file here' : 'Click to upload or drag and drop'}
          </p>

          {helpText && !error && (
            <p id="file-help" className="text-xs text-muted-foreground">
              {helpText}
            </p>
          )}

          {accept && (
            <p className="text-xs text-muted-foreground mt-1">
              Accepted: {accept}
            </p>
          )}

          {maxSize && (
            <p className="text-xs text-muted-foreground">
              Max size: {formatFileSize(maxSize)}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
