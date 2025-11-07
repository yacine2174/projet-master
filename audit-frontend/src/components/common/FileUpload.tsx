import React, { useState, useRef, useCallback } from 'react';
import { useNotificationHelper } from '../../utils/notificationHelper';

export interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onFileUpload: (file: File) => Promise<string>;
  acceptedTypes?: string[];
  maxSize?: number; // in MB
  multiple?: boolean;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  showPreview?: boolean;
  existingFiles?: Array<{
    id: string;
    name: string;
    type: string;
    size: number;
    url?: string;
  }>;
  onFileRemove?: (fileId: string) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  onFileUpload,
  acceptedTypes = ['*/*'],
  maxSize = 10, // 10MB default
  multiple = false,
  disabled = false,
  className = '',
  placeholder = 'Cliquez pour sélectionner un fichier ou glissez-déposez ici',
  showPreview = true,
  existingFiles = [],
  onFileRemove
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewFiles, setPreviewFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { notifySuccess, notifyError, notifyWarning } = useNotificationHelper();

  const validateFile = useCallback((file: File): string | null => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      return `Le fichier "${file.name}" est trop volumineux. Taille maximale autorisée: ${maxSize}MB`;
    }

    // Check file type
    if (acceptedTypes.length > 0 && !acceptedTypes.includes('*/*')) {
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      const mimeType = file.type;
      
      const isAccepted = acceptedTypes.some(type => {
        if (type.startsWith('.')) {
          return fileExtension === type;
        }
        return mimeType.match(type.replace('*', '.*'));
      });

      if (!isAccepted) {
        return `Le type de fichier "${file.name}" n'est pas autorisé. Types acceptés: ${acceptedTypes.join(', ')}`;
      }
    }

    return null;
  }, [acceptedTypes, maxSize]);

  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    
    // Validate files
    for (const file of fileArray) {
      const error = validateFile(file);
      if (error) {
        notifyError('Fichier invalide', error);
        return;
      }
    }

    // Handle single file
    if (!multiple && fileArray.length > 1) {
      notifyWarning('Un seul fichier autorisé', 'Veuillez sélectionner un seul fichier.');
      return;
    }

    // Add to preview
    if (showPreview) {
      setPreviewFiles(prev => multiple ? [...prev, ...fileArray] : fileArray);
    }

    // Process files
    for (const file of fileArray) {
      try {
        onFileSelect(file);
        
        if (onFileUpload) {
          setUploading(true);
          setUploadProgress(0);
          
          // Simulate upload progress
          const progressInterval = setInterval(() => {
            setUploadProgress(prev => {
              if (prev >= 90) {
                clearInterval(progressInterval);
                return prev;
              }
              return prev + Math.random() * 10;
            });
          }, 200);

          const result = await onFileUpload(file);
          
          clearInterval(progressInterval);
          setUploadProgress(100);
          
          notifySuccess('Fichier uploadé', `Le fichier "${file.name}" a été uploadé avec succès.`);
          
          setTimeout(() => {
            setUploading(false);
            setUploadProgress(0);
            if (showPreview) {
              setPreviewFiles(prev => prev.filter(f => f !== file));
            }
          }, 1000);
        }
      } catch (error: any) {
        setUploading(false);
        setUploadProgress(0);
        notifyError('Erreur d\'upload', `Impossible d'uploader le fichier "${file.name}": ${error.message}`);
      }
    }
  }, [validateFile, multiple, showPreview, onFileSelect, onFileUpload, notifySuccess, notifyError, notifyWarning]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    if (disabled) return;
    
    const files = e.dataTransfer.files;
    handleFileSelect(files);
  }, [disabled, handleFileSelect]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
  }, [handleFileSelect]);

  const handleClick = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string): string => {
    if (type.startsWith('image/')) return '🖼️';
    if (type.startsWith('video/')) return '🎥';
    if (type.startsWith('audio/')) return '🎵';
    if (type.includes('pdf')) return '📄';
    if (type.includes('word') || type.includes('document')) return '📝';
    if (type.includes('excel') || type.includes('spreadsheet')) return '📊';
    if (type.includes('powerpoint') || type.includes('presentation')) return '📽️';
    if (type.includes('zip') || type.includes('rar') || type.includes('archive')) return '📦';
    return '📁';
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragOver ? 'border-blue-500 bg-blue-50' : 'border-slate-600 hover:border-slate-500'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-900'}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={acceptedTypes.join(',')}
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled}
        />
        
        <div className="space-y-2">
          <div className="text-4xl">📁</div>
          <p className="text-sm text-slate-400">{placeholder}</p>
          <p className="text-xs text-gray-500">
            Types acceptés: {acceptedTypes.join(', ')} • Taille max: {maxSize}MB
          </p>
        </div>

        {uploading && (
          <div className="absolute inset-0 bg-slate-800 bg-opacity-90 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-slate-400">Upload en cours...</p>
              <div className="w-32 bg-slate-700 rounded-full h-2 mt-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">{Math.round(uploadProgress)}%</p>
            </div>
          </div>
        )}
      </div>

      {/* Preview Files */}
      {showPreview && (previewFiles.length > 0 || existingFiles.length > 0) && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-slate-300">Fichiers sélectionnés:</h4>
          
          {/* New files */}
          {previewFiles.map((file, index) => (
            <div key={`preview-${index}`} className="flex items-center justify-between p-3 bg-slate-900 rounded-lg">
              <div className="flex items-center space-x-3">
                <span className="text-lg">{getFileIcon(file.type)}</span>
                <div>
                  <p className="text-sm font-medium text-white">{file.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <button
                onClick={() => setPreviewFiles(prev => prev.filter((_, i) => i !== index))}
                className="text-red-500 hover:text-red-700"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}

          {/* Existing files */}
          {existingFiles.map((file) => (
            <div key={file.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <span className="text-lg">{getFileIcon(file.type)}</span>
                <div>
                  <p className="text-sm font-medium text-white">{file.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {file.url && (
                  <a
                    href={file.url}
                    download={file.name}
                    className="text-blue-500 hover:text-blue-700"
                    title="Télécharger"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </a>
                )}
                {onFileRemove && (
                  <button
                    onClick={() => onFileRemove(file.id)}
                    className="text-red-500 hover:text-red-700"
                    title="Supprimer"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
