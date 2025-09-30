// components/FileItem.jsx
import React, { useState } from 'react';

const FileItem = ({ file, onDelete }) => {
  const [deleting, setDeleting] = useState(false);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getFileIcon = (filename, fileType) => {
    const extension = filename.split('.').pop().toLowerCase();
    
    if (['pdf'].includes(extension)) return '📄';
    if (['doc', 'docx'].includes(extension)) return '📝';
    if (['ppt', 'pptx'].includes(extension)) return '📊';
    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) return '🖼️';
    if (['zip', 'rar', '7z'].includes(extension)) return '📦';
    if (['js', 'html', 'css', 'java', 'py', 'cpp'].includes(extension)) return '💻';
    if (['txt', 'md'].includes(extension)) return '📋';
    
    return '📁';
  };

  const getCategoryColor = (category) => {
    const colors = {
      'LECTURE_NOTES': '#4CAF50',
      'ASSIGNMENTS': '#FF9800', 
      'CODE': '#2196F3',
      'PRESENTATIONS': '#9C27B0',
      'DOCUMENTS': '#607D8B',
    };
    return colors[category] || '#757575';
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = file.downloadUrl;
    link.download = file.originalFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePreview = () => {
    const previewUrl = `/api/materials/${file.id}/view`;
    window.open(previewUrl, '_blank');
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete "${file.originalFilename}"?`)) {
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch(`/api/materials/${file.id}?userId=${file.uploaderId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Delete failed');
      }

      if (onDelete) {
        onDelete(file.id);
      }
    } catch (error) {
      console.error('Delete failed:', error);
      alert(`Failed to delete file: ${error.message}`);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="file-item">
      <div className="file-main">
        <div className="file-icon">
          {getFileIcon(file.originalFilename, file.fileType)}
        </div>
        
        <div className="file-details">
          <div className="file-name" title={file.originalFilename}>
            {file.originalFilename}
          </div>
          
          {file.description && (
            <div className="file-description">{file.description}</div>
          )}
          
          <div className="file-meta">
            <span className="file-size">{formatFileSize(file.fileSize)}</span>
            <span className="file-date">{formatDate(file.uploadTimestamp)}</span>
            <span 
              className="file-category"
              style={{ backgroundColor: getCategoryColor(file.category) }}
            >
              {file.category.replace('_', ' ')}
            </span>
          </div>
        </div>
      </div>

      <div className="file-actions">
        <button
          onClick={handleDownload}
          className="action-button download"
          title="Download"
        >
          ⬇️
        </button>
        
        <button
          onClick={handlePreview}
          className="action-button preview"
          title="Preview"
        >
          👁️
        </button>
        
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="action-button delete"
          title="Delete"
        >
          {deleting ? '⏳' : '🗑️'}
        </button>
      </div>
    </div>
  );
};

export default FileItem;
