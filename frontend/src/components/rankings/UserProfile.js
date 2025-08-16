import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Trophy, 
  Star, 
  FileText, 
  BookOpen, 
  Calendar, 
  Download, 
  Eye,
  Users,
  TrendingUp
} from 'lucide-react';

const UserProfile = ({ user, onBack }) => {
  const [materials, setMaterials] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [courseStats, setCourseStats] = useState({});

  // Mock data - in real app, this would come from API
  useEffect(() => {
    const mockMaterials = [
      {
        id: 1,
        title: 'Advanced Data Structures Notes',
        course: 'CS101',
        type: 'notes',
        uploadedAt: '2 hours ago',
        downloadCount: 156,
        fileSize: '3.2 MB'
      },
      {
        id: 2,
        title: 'Operating Systems Lab 3',
        course: 'CS201',
        type: 'code',
        uploadedAt: '1 day ago',
        downloadCount: 89,
        fileSize: '2.1 MB'
      },
      {
        id: 3,
        title: 'Database Design Assignment',
        course: 'CS301',
        type: 'assignment',
        uploadedAt: '3 days ago',
        downloadCount: 234,
        fileSize: '1.8 MB'
      },
      {
        id: 4,
        title: 'Machine Learning Project Report',
        course: 'CS401',
        type: 'document',
        uploadedAt: '1 week ago',
        downloadCount: 178,
        fileSize: '5.6 MB'
      }
    ];
    setMaterials(mockMaterials);

    // Mock course statistics
    setCourseStats({
      'CS101': { count: 45, totalDownloads: 2340 },
      'CS201': { count: 32, totalDownloads: 1890 },
      'CS301': { count: 79, totalDownloads: 4560 },
      'CS401': { count: 56, totalDownloads: 3120 }
    });
  }, []);

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

  const filteredMaterials = selectedCourse === 'all' 
    ? materials 
    : materials.filter(m => m.course === selectedCourse);

  const courses = Object.keys(courseStats);

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
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {user.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
            <p className="text-gray-600">{user.role} • {user.uploads} total uploads</p>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Uploads</p>
              <p className="text-2xl font-bold text-gray-900">{user.uploads}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Download size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Downloads</p>
              <p className="text-2xl font-bold text-gray-900">
                {Object.values(courseStats).reduce((sum, stat) => sum + stat.totalDownloads, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <BookOpen size={20} className="text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Courses</p>
              <p className="text-2xl font-bold text-gray-900">{courses.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <TrendingUp size={20} className="text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Ranking</p>
              <p className="text-2xl font-bold text-gray-900">#{user.rank || 1}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Course Contributions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Course Contributions</h2>
          <p className="text-gray-600">Breakdown of uploads by course</p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {courses.map(course => (
              <div key={course} className="text-center p-4 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <span className="text-indigo-600 font-bold text-lg">{course.substring(0, 2)}</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{course}</h3>
                <p className="text-2xl font-bold text-indigo-600">{courseStats[course].count}</p>
                <p className="text-sm text-gray-500">uploads</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Materials List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Uploaded Materials</h2>
              <p className="text-gray-600">{filteredMaterials.length} materials</p>
            </div>
            
            <select 
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Courses</option>
              {courses.map(course => (
                <option key={course} value={course}>{course}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="p-6">
          {filteredMaterials.length === 0 ? (
            <div className="text-center py-12">
              <FileText size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No materials found</h3>
              <p className="text-gray-500">Try selecting a different course</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredMaterials.map(material => (
                <div key={material.id} className="flex items-center space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getTypeColor(material.type)}`}>
                    {getTypeIcon(material.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">{material.title}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                      <span className="flex items-center">
                        <BookOpen size={14} className="mr-1" />
                        {material.course}
                      </span>
                      <span className="flex items-center">
                        <Calendar size={14} className="mr-1" />
                        {material.uploadedAt}
                      </span>
                      <span className="flex items-center">
                        <Download size={14} className="mr-1" />
                        {material.downloadCount} downloads
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                      <Eye size={16} className="text-gray-600" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                      <Download size={16} className="text-gray-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
