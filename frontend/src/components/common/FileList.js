// components/FileList.jsx
import React, { useState, useEffect } from 'react';
import FileItem from './FileItem';
import SearchBar from './SearchBar';

const FileList = ({ courseId }) => {
  const [files, setFiles] = useState([]);
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchFiles();
  }, [courseId]);

  useEffect(() => {
    filterFiles();
  }, [files, selectedCategory, searchTerm]);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/materials/course/${courseId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch files');
      }

      const fileList = await response.json();
      setFiles(fileList);
      setError(null);
    } catch (err) {
      console.error('Error fetching files:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filterFiles = () => {
    let filtered = files;

    // Filter by category
    if (selectedCategory !== 'ALL') {
      filtered = filtered.filter(file => file.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(file =>
        file.originalFilename.toLowerCase().includes(term) ||
        (file.description && file.description.toLowerCase().includes(term))
      );
    }

    setFilteredFiles(filtered);
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  const handleFileDeleted = (deletedFileId) => {
    setFiles(files.filter(file => file.id !== deletedFileId));
  };

  const categories = [
    { value: 'ALL', label: 'All Files' },
    { value: 'LECTURE_NOTES', label: 'Lecture Notes' },
    { value: 'ASSIGNMENTS', label: 'Assignments' },
    { value: 'CODE', label: 'Code/Lab Files' },
    { value: 'PRESENTATIONS', label: 'Presentations' },
    { value: 'DOCUMENTS', label: 'Documents' },
  ];

  if (loading) {
    return <div className="file-list-loading">Loading files...</div>;
  }

  if (error) {
    return (
      <div className="file-list-error">
        <p>Error loading files: {error}</p>
        <button onClick={fetchFiles} className="retry-button">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="file-list-container">
      <div className="file-list-header">
        <h3>Course Materials ({files.length} files)</h3>
        
        <div className="file-list-controls">
          <SearchBar onSearch={handleSearch} placeholder="Search files..." />
          
          <select
            value={selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="category-filter"
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredFiles.length === 0 ? (
        <div className="no-files">
          {searchTerm || selectedCategory !== 'ALL' 
            ? 'No files match your filter criteria' 
            : 'No files uploaded yet'}
        </div>
      ) : (
        <div className="file-list">
          {filteredFiles.map(file => (
            <FileItem
              key={file.id}
              file={file}
              onDelete={handleFileDeleted}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FileList;
