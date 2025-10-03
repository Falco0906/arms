import React, { useState, useEffect } from 'react';
import { examPackService } from '../../firebase/services/exam-pack.service';
import { materialService } from '../../firebase/services/material.service';

const CustomZipBuilder = ({ courseId, onClose }) => {
  const [materials, setMaterials] = useState([]);
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [packName, setPackName] = useState('Custom Study Pack');
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadMaterials();
  }, [courseId]);

  const loadMaterials = async () => {
    try {
      setLoading(true);
      const courseMaterials = await materialService.getMaterialsByCourse(courseId);
      setMaterials(courseMaterials);
    } catch (error) {
      console.error('Error loading materials:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMaterials = materials.filter(material => {
    const matchesType = filterType === 'all' || material.type === filterType;
    const matchesSearch = material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         material.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const toggleMaterialSelection = (material) => {
    setSelectedMaterials(prev => {
      const isSelected = prev.some(m => m.id === material.id);
      if (isSelected) {
        return prev.filter(m => m.id !== material.id);
      } else {
        return [...prev, material];
      }
    });
  };

  const selectAll = () => {
    setSelectedMaterials(filteredMaterials);
  };

  const clearSelection = () => {
    setSelectedMaterials([]);
  };

  const generateCustomZip = async () => {
    if (selectedMaterials.length === 0) {
      alert('Please select at least one material');
      return;
    }

    try {
      setGenerating(true);
      await examPackService.generateCustomPack(selectedMaterials, packName);
      onClose();
    } catch (error) {
      console.error('Error generating custom ZIP:', error);
      alert('Failed to generate ZIP file. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const materialTypes = [...new Set(materials.map(m => m.type).filter(Boolean))];

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const calculateTotalSize = () => {
    return selectedMaterials.reduce((total, material) => total + (material.size || 0), 0);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading materials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Create Custom Study Pack</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Pack Configuration */}
        <div className="p-4 border-b bg-gray-50">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-64">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pack Name
              </label>
              <input
                type="text"
                value={packName}
                onChange={(e) => setPackName(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter custom pack name"
              />
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={selectAll}
                className="px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Select All ({filteredMaterials.length})
              </button>
              <button
                onClick={clearSelection}
                className="px-3 py-2 text-sm bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Clear ({selectedMaterials.length})
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="p-4 border-b bg-gray-50">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search materials..."
              />
            </div>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              {materialTypes.map(type => (
                <option key={type} value={type}>
                  {type.replace('-', ' ').toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Materials List */}
        <div className="flex-1 overflow-y-auto" style={{ maxHeight: '400px' }}>
          {filteredMaterials.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p>No materials found matching your criteria</p>
            </div>
          ) : (
            <div className="p-4">
              {filteredMaterials.map((material) => {
                const isSelected = selectedMaterials.some(m => m.id === material.id);
                return (
                  <div
                    key={material.id}
                    className={`border rounded-lg p-4 mb-3 cursor-pointer transition-colors ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => toggleMaterialSelection(material)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-1 ${
                          isSelected 
                            ? 'bg-blue-600 border-blue-600' 
                            : 'border-gray-300'
                        }`}>
                          {isSelected && (
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{material.title}</h4>
                          {material.description && (
                            <p className="text-sm text-gray-600 mt-1">{material.description}</p>
                          )}
                          
                          <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-500">
                            <span className="bg-gray-100 px-2 py-1 rounded">
                              {material.type?.replace('-', ' ').toUpperCase() || 'General'}
                            </span>
                            <span>{formatFileSize(material.size)}</span>
                            {material.uploadDate && (
                              <span>
                                {new Date(material.uploadDate.seconds * 1000).toLocaleDateString()}
                              </span>
                            )}
                            {material.ratingScore && (
                              <span className="text-green-600">
                                ⭐ {material.ratingScore.toFixed(1)}%
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            <span className="font-medium">{selectedMaterials.length}</span> materials selected
            {selectedMaterials.length > 0 && (
              <span className="ml-2">
                • Total size: {formatFileSize(calculateTotalSize())}
              </span>
            )}
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={generateCustomZip}
              disabled={selectedMaterials.length === 0 || generating}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {generating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Generating...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Create ZIP
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomZipBuilder;