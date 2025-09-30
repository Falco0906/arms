import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  FileText, 
  Video, 
  Image, 
  BookOpen, 
  Calendar,
  User,
  Clock,
  ArrowLeft,
  X
} from 'lucide-react';
import FileUpload from '../upload/FileUpload';

const CourseDetail = ({ course, onBack }) => {
  const [materials, setMaterials] = useState([]);
  const [filteredMaterials, setFilteredMaterials] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Updated to use the actual API endpoint
  useEffect(() => {
    const fetchMaterials = async () => {
      if (!course?.id) return;
      
      try {
        setLoading(true);
        const response = await fetch(`/api/materials/course/${course.id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch materials');
        }
        
        const data = await response.json();
        
        // Transform the API response to match your UI expectations
        const transformedData = data.map(material => ({
          id: material.id,
          title: material.originalFilename,
          description: material.description || 'No description provided',
          type: mapCategoryToType(material.category),
          uploader: { name: 'User' }, // You'd need to join with user data
          uploadedAt: material.uploadTimestamp,
          downloadCount: 0, // Not tracking downloads yet
          fileSize: material.fileSize,
          downloadUrl: material.downloadUrl,
          category: material.category
        }));
        
        setMaterials(transformedData);
        setFilteredMaterials(transformedData);
        setError(null);
      } catch (error) {
        console.error('Error fetching materials:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMaterials();
  }, [course?.id]);

  // Map database categories to your UI types
  const mapCategoryToType = (category) => {
    switch (category) {
      case 'NOTES': return 'notes';
      case 'ASSIGNMENT': return 'assignment';
      case 'CODE': return 'code';
      case 'PPT': return 'presentation';
      case 'DOC': return 'document';
      case 'OTHER': return 'document';
      default: return 'document';
    }
  };

  // Map UI types back to database categories
  const mapTypeToCategory = (type) => {
    switch (type) {
      case 'notes': return 'NOTES';
      case 'assignment': return 'ASSIGNMENT';
      case 'code': return 'CODE';
      case 'presentation': return 'PPT';
      case 'document': return 'DOC';
      default: return 'OTHER';
    }
  };

  useEffect(() => {
    let filtered = materials;
    
    if (searchQuery) {
      filtered = filtered.filter(material => 
        material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        material.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (selectedType !== 'all') {
      filtered = filtered.filter(material => material.type === selectedType);
    }
    
    setFilteredMaterials(filtered);
  }, [searchQuery, selectedType, materials]);

  // Handle successful file upload
  const handleUploadSuccess = (uploadResult) => {
    console.log('File uploaded successfully:', uploadResult);
    
    // Refresh the materials list
    const fetchMaterials = async () => {
      try {
        const response = await fetch(`/api/materials/course/${course.id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          const transformedData = data.map(material => ({
            id: material.id,
            title: material.originalFilename || material.filename,
            description: material.description || 'No description provided',
            type: mapCategoryToType(material.category),
            uploader: { name: material.uploaderName || 'User' },
            uploadedAt: material.uploadTimestamp,
            downloadCount: material.downloadCount || 0,
            fileSize: material.fileSize,
            downloadUrl: material.downloadUrl,
            category: material.category
          }));
          
          setMaterials(transformedData);
        }
      } catch (error) {
        console.error('Error refreshing materials:', error);
      }
    };
    
    fetchMaterials();
    setShowUploadModal(false);
  };

  // Handle file download
  const handleDownload = (material) => {
    const link = document.createElement('a');
    link.href = material.downloadUrl;
    link.download = material.title;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle file preview
  const handlePreview = (material) => {
    const previewUrl = `/api/materials/${material.id}/view`;
    window.open(previewUrl, '_blank');
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'notes': return <BookOpen size={16} className="text-blue-600" />;
      case 'assignment': return <FileText size={16} className="text-green-600" />;
      case 'code': return <FileText size={16} className="text-purple-600" />;
      case 'presentation': return <FileText size={16} className="text-orange-600" />;
      case 'document': return <FileText size={16} className="text-gray-600" />;
      default: return <FileText size={16} className="text-gray-600" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'notes': return 'bg-blue-100 text-blue-800';
      case 'assignment': return 'bg-green-100 text-green-800';
      case 'code': return 'bg-purple-100 text-purple-800';
      case 'presentation': return 'bg-orange-100 text-orange-800';
      case 'document': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button 
          onClick={onBack}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{course.code}</h1>
          <p className="text-gray-600">{course.name}</p>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">Error: {error}</p>
        </div>
      )}

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search materials..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter size={16} className="text-gray-500" />
            <select 
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="notes">Notes</option>
              <option value="assignment">Assignments</option>
              <option value="code">Code/Labs</option>
              <option value="presentation">Presentations</option>
              <option value="document">Documents</option>
            </select>
          </div>
          
          <button 
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Upload Material
          </button>
        </div>
      </div>

      {/* Materials List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Materials ({filteredMaterials.length})
          </h2>
          <p className="text-sm text-gray-500">
            {materials.length} total materials
          </p>
        </div>

        {filteredMaterials.length === 0 ? (
          <div className="text-center py-12">
            <FileText size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No materials found</h3>
            <p className="text-gray-500">
              {searchQuery || selectedType !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Upload your first material to get started'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredMaterials.map(material => (
              <div key={material.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getTypeColor(material.type)}`}>
                    {getTypeIcon(material.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">{material.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(material.type)}`}>
                        {material.type}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-3">{material.description}</p>
                    
                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <span className="flex items-center">
                        <User size={14} className="mr-1" />
                        {material.uploader ? material.uploader.name : 'Unknown'}
                      </span>
                      <span className="flex items-center">
                        <Clock size={14} className="mr-1" />
                        {new Date(material.uploadedAt).toLocaleDateString()}
                      </span>
                      <span className="flex items-center">
                        <Download size={14} className="mr-1" />
                        {material.downloadCount || 0} downloads
                      </span>
                      <span>{formatFileSize(material.fileSize)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => handlePreview(material)}
                      className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                      title="Preview"
                    >
                      <Eye size={16} className="text-gray-600" />
                    </button>
                    <button 
                      onClick={() => handleDownload(material)}
                      className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                      title="Download"
                    >
                      <Download size={16} className="text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Upload Material</h2>
                <button 
                  onClick={() => setShowUploadModal(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>
              
              <FileUpload 
                courseId={course.id}
                uploaderId={(JSON.parse(localStorage.getItem('user')||'{}')).id}
                onUploadSuccess={handleUploadSuccess}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseDetail;
