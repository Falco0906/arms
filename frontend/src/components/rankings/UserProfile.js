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
  TrendingUp,
  Edit2,
  Check,
  X
} from 'lucide-react';

const UserProfile = ({ user, onBack, currentUserId }) => {
  const [materials, setMaterials] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [courseStats, setCourseStats] = useState({});
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(user?.name || '');
  const [isSaving, setIsSaving] = useState(false);
  
  const isOwnProfile = currentUserId === user?.id;

  // Safe user object with defaults
  const safeUser = {
    name: user?.name || 'Unknown',
    role: user?.role || 'STUDENT',
    uploads: user?.uploads || 0,
    rank: user?.rank || 1,
    ...(user || {})
  };

  // Use actual user materials from profile data
  useEffect(() => {
    // Get materials from user object
    const userMaterials = user?.materials || [];
    setMaterials(userMaterials);

    // Calculate course statistics from actual materials
    const stats = {};
    userMaterials.forEach(material => {
      const courseId = material.courseId || material.course;
      if (!stats[courseId]) {
        stats[courseId] = { count: 0, totalDownloads: 0 };
      }
      stats[courseId].count++;
      stats[courseId].totalDownloads += material.downloads || 0;
    });
    setCourseStats(stats);
  }, [user]);

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

  const courses = Object.keys(courseStats || {});

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
          <div className="w-16 h-16 bg-gray-700 dark:bg-neutral-800 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {safeUser.name.charAt(0)}
          </div>
          <div className="flex-1">
            {isEditingName && isOwnProfile ? (
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="text-2xl font-bold text-gray-900 dark:text-gray-100 bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-700 rounded px-2 py-1"
                  autoFocus
                />
                <button
                  onClick={async () => {
                    setIsSaving(true);
                    try {
                      // Update name in Firestore
                      const { doc, updateDoc } = await import('firebase/firestore');
                      const { db } = await import('../../firebase');
                      await updateDoc(doc(db, 'users', user.id), { name: editedName });
                      // Update local user object
                      user.name = editedName;
                      setIsEditingName(false);
                    } catch (error) {
                      console.error('Failed to update name:', error);
                      alert('Failed to update name. Please try again.');
                    } finally {
                      setIsSaving(false);
                    }
                  }}
                  disabled={isSaving || !editedName.trim()}
                  className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/20 rounded-lg transition-colors disabled:opacity-50"
                  title="Save"
                >
                  <Check size={20} />
                </button>
                <button
                  onClick={() => {
                    setEditedName(user?.name || '');
                    setIsEditingName(false);
                  }}
                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors"
                  title="Cancel"
                >
                  <X size={20} />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{safeUser.name}</h1>
                {isOwnProfile && (
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                    title="Edit name"
                  >
                    <Edit2 size={18} />
                  </button>
                )}
              </div>
            )}
            <p className="text-gray-600 dark:text-gray-400">{safeUser.role} • {safeUser.uploads} total uploads</p>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-800 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Uploads</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{safeUser.uploads}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-800 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Download size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Downloads</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {Object.values(courseStats || {}).reduce((sum, stat) => sum + (stat?.totalDownloads || 0), 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-800 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <BookOpen size={20} className="text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Courses</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{courses.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-800 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <TrendingUp size={20} className="text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Ranking</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">#{safeUser.rank}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Course Contributions */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-800">
        <div className="p-6 border-b border-gray-200 dark:border-neutral-800">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Course Contributions</h2>
          <p className="text-gray-600 dark:text-gray-400">Breakdown of uploads by course</p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {courses.map(course => (
              <div key={course} className="text-center p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors">
                <div className="w-12 h-12 bg-gray-200 dark:bg-neutral-800 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <span className="text-gray-700 dark:text-gray-200 font-bold text-lg">{course.substring(0, 2)}</span>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{course}</h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{courseStats[course]?.count || 0}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">uploads</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Materials List */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-800">
        <div className="p-6 border-b border-gray-200 dark:border-neutral-800">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Uploaded Materials</h2>
              <p className="text-gray-600 dark:text-gray-400">{filteredMaterials.length} materials</p>
            </div>
            
            <select 
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent dark:bg-neutral-900 dark:text-gray-100"
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
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No materials found</h3>
              <p className="text-gray-500 dark:text-gray-400">Try selecting a different course</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredMaterials.map(material => (
                <div key={material.id} className="flex items-center space-x-4 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getTypeColor(material.type)}`}>
                    {getTypeIcon(material.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">{material.title}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mt-1">
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
