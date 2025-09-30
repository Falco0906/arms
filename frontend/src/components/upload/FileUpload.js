import React, { useState } from 'react';

const FileUpload = ({ courseId, uploaderId, onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('OTHER');
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const materialTypes = [
    { value: 'NOTES', label: 'Lecture Notes' },
    { value: 'ASSIGNMENT', label: 'Assignment' },
    { value: 'CODE', label: 'Code/Lab Files' },
    { value: 'PPT', label: 'Presentation' },
    { value: 'DOC', label: 'Document' },
    { value: 'OTHER', label: 'Other' }
  ];

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert('Please select a file');
      return;
    }

    const currentUser = (() => { try { return JSON.parse(localStorage.getItem('user')); } catch (e) { return null; } })();
    const effectiveUploaderId = uploaderId || currentUser?.id;

    if (!courseId || !effectiveUploaderId) {
      alert('Missing course or user information');
      console.error('CourseId:', courseId, 'UploaderId:', effectiveUploaderId);
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('courseId', courseId);
    formData.append('uploaderId', effectiveUploaderId);
    formData.append('description', description);
    formData.append('category', category);

    try {
      const response = await fetch('/api/materials/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const result = await response.json();
      
      // Reset form
      setFile(null);
      setDescription('');
      setCategory('OTHER');
      
      // Notify parent component
      if (onUploadSuccess) {
        onUploadSuccess(result);
      }
      
      alert('File uploaded successfully!');
      
    } catch (error) {
      console.error('Upload failed:', error);
      alert(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Debug info */}
      <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded">
        Course ID: {courseId} | Uploader ID: {uploaderId}
      </div>

      {/* File Drop Zone */}
      <div 
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive 
            ? 'border-indigo-500 bg-indigo-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {!file ? (
          <div>
            <div className="text-4xl mb-4">📁</div>
            <p className="mb-2">Drag and drop files here, or</p>
            <input
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.docx,.pptx,.txt,.zip,.java,.py,.cpp,.html,.css,.js,.json,.xml,.md"
              className="hidden"
              id="file-input"
            />
            <label 
              htmlFor="file-input" 
              className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg cursor-pointer hover:bg-indigo-700"
            >
              Browse Files
            </label>
            <p className="mt-2 text-sm text-gray-500">Max file size: 50MB</p>
          </div>
        ) : (
          <div className="flex items-center justify-between bg-white p-4 rounded border">
            <div>
              <div className="font-medium">{file.name}</div>
              <div className="text-sm text-gray-500">{formatFileSize(file.size)}</div>
            </div>
            <button 
              onClick={() => setFile(null)}
              className="text-red-500 hover:text-red-700"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {file && (
        <div className="space-y-4">
          {/* Category Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              {materialTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description for this file..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              rows="3"
              maxLength="1000"
            />
          </div>

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={uploading}
            className={`w-full py-3 px-4 rounded-lg font-medium ${
              uploading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-700'
            } text-white transition-colors`}
          >
            {uploading ? 'Uploading...' : 'Upload File'}
          </button>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
