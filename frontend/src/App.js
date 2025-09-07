import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Bell, 
  Upload, 
  Filter, 
  User, 
  FileText, 
  Video, 
  Image, 
  BookOpen, 
  Trophy, 
  Star,
  X,
  Plus,
  Home,
  Settings,
  LogOut,
  Eye,
  Download,
  Calendar,
  Users,
  AlertCircle,
  CheckCircle,
  Trash2
} from 'lucide-react';
import { authService } from './services/authService';
import { courseAPI, materialAPI, rankingsAPI, newsAPI, userAPI, getFileUrl, handleAPIError } from './services/api';

const ARMSPlatform = () => {
  const [currentPage, setCurrentPage] = useState('login');
  const [user, setUser] = useState(null);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [courseSearchQuery, setCourseSearchQuery] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState(0);
  const [notificationList, setNotificationList] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showRegister, setShowRegister] = useState(false);
  const [showCreateNews, setShowCreateNews] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [newsForm, setNewsForm] = useState({
    title: '',
    content: '',
    type: 'ANNOUNCEMENT'
  });
  
  // API data states
  const [courses, setCourses] = useState([]);
  const [rankings, setRankings] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [filteredMaterials, setFilteredMaterials] = useState([]);
  const [materialSearchQuery, setMaterialSearchQuery] = useState('');
  const [selectedMaterialType, setSelectedMaterialType] = useState('ALL');
  const [recentMaterials, setRecentMaterials] = useState([]);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Upload modal states
  const [uploadForm, setUploadForm] = useState({
    courseId: '',
    title: '',
    type: 'OTHER',
    file: null
  });
  const [uploading, setUploading] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    const token = authService.getToken();
    const savedUser = authService.getUser();
    console.log('Initial user load:', { token: !!token, savedUser });
    if (token && savedUser) {
      setUser(savedUser);
      setCurrentPage('home');
      loadInitialData();
    }
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showNotifications && !event.target.closest('.notification-dropdown')) {
        setShowNotifications(false);
      }
      if (searchResults.length > 0 && !event.target.closest('.search-dropdown')) {
        setSearchResults([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications, searchResults.length]);

  const loadInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [coursesData, rankingsData, newsData] = await Promise.all([
        courseAPI.getAllCourses(),
        rankingsAPI.getTopUploaders(10),
        newsAPI.getRecentNews(5)
      ]);
      setCourses(coursesData.data);
      setFilteredCourses(coursesData.data);
      setRankings(rankingsData.data);
      setNews(newsData.data);
    } catch (err) {
      setError(handleAPIError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.login(email, password);
      console.log('Login response:', response);
      setUser(response.user);
      setCurrentPage('home');
      loadInitialData();
    } catch (err) {
      setError(err.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.register(userData);
      setUser(response.user);
      setCurrentPage('home');
      setShowRegister(false);
      loadInitialData();
    } catch (err) {
      setError(err.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setCurrentPage('login');
    setCourses([]);
    setRankings([]);
    setMaterials([]);
  };

  const handleUpload = async () => {
    if (!uploadForm.courseId || !uploadForm.file) {
      setError('Please select a course and file');
      return;
    }

    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', uploadForm.file);
      formData.append('title', uploadForm.title);
      formData.append('type', uploadForm.type);

      await materialAPI.uploadMaterial(uploadForm.courseId, formData);
      setShowUploadModal(false);
      setUploadForm({ courseId: '', title: '', type: 'OTHER', file: null });
      
      // Add notification
      const course = courses.find(c => c.id == uploadForm.courseId);
      const newNotification = {
        id: Date.now(),
        message: `New ${uploadForm.type.toLowerCase()} uploaded to ${course?.code || 'course'}`,
        type: 'upload',
        timestamp: new Date(),
        courseId: uploadForm.courseId
      };
      setNotificationList(prev => [newNotification, ...prev]);
      setNotifications(prev => prev + 1);
      
      // Refresh rankings after upload
      const rankingsData = await rankingsAPI.getTopUploaders(10);
      setRankings(rankingsData.data);
    } catch (err) {
      setError(handleAPIError(err));
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadForm(prev => ({ ...prev, file }));
    }
  };

  const handleCourseSelect = async (course) => {
    setSelectedCourse(course);
    setLoading(true);
    setMaterialSearchQuery('');
    setSelectedMaterialType('ALL');
    try {
      const materialsData = await materialAPI.getMaterialsByCourse(course.id);
      setMaterials(materialsData.data);
      setFilteredMaterials(materialsData.data);
      
      // Get recent materials (last 5 uploaded)
      const recent = materialsData.data
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        .slice(0, 5);
      setRecentMaterials(recent);
    } catch (err) {
      setError(handleAPIError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleMaterialSearch = (query) => {
    setMaterialSearchQuery(query);
    filterMaterials(query, selectedMaterialType);
  };

  const handleMaterialTypeFilter = (type) => {
    setSelectedMaterialType(type);
    filterMaterials(materialSearchQuery, type);
  };

  const filterMaterials = (searchQuery, materialType) => {
    let filtered = materials;
    
    // Filter by search query
    if (searchQuery.trim() !== '') {
      filtered = filtered.filter(material => 
        material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        material.type.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Filter by material type
    if (materialType !== 'ALL') {
      filtered = filtered.filter(material => material.type === materialType);
    }
    
    setFilteredMaterials(filtered);
  };

  const handleUserSelect = async (user) => {
    console.log('handleUserSelect called with user:', user);
    setSelectedUser(user);
    setLoading(true);
    setError(null);
    try {
      // Ensure userId is a number
      const userId = typeof user.userId === 'string' ? parseInt(user.userId) : user.userId;
      console.log('Fetching profile for userId:', userId);
      const profileData = await userAPI.getUserProfile(userId);
      console.log('Profile data received:', profileData.data);
      setUserProfile(profileData.data);
      setCurrentPage('user-profile');
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setError(handleAPIError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMaterial = async (materialId) => {
    if (!window.confirm('Are you sure you want to delete this material? This action cannot be undone.')) {
      return;
    }
    
    try {
      await materialAPI.deleteMaterial(materialId);
      // Refresh the user profile to update the materials list
      if (selectedUser) {
        await handleUserSelect(selectedUser);
      }
    } catch (error) {
      setError(handleAPIError(error));
    }
  };

  const handleUserSearch = async (query) => {
    setUserSearchQuery(query);
    if (query.trim() === '') {
      setSearchResults([]);
      return;
    }
    
    try {
      const searchData = await userAPI.searchUsers(query);
      setSearchResults(searchData.data);
    } catch (err) {
      setError(handleAPIError(err));
    }
  };

  const LoginPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-4xl font-bold text-indigo-600 mb-2">ARMS</div>
          <p className="text-gray-600">Academic Resource Management System</p>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
            <AlertCircle className="text-red-500" size={16} />
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        )}
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input 
              type="email" 
              id="login-email"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" 
              placeholder="your.email@university.edu" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              type="password" 
              id="login-password"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" 
            />
          </div>
          <button 
            onClick={() => {
              const email = document.getElementById('login-email').value;
              const password = document.getElementById('login-password').value;
              handleLogin(email, password);
            }}
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
          <p className="text-center text-sm text-gray-600">
            Don't have an account? <span 
              className="text-indigo-600 cursor-pointer hover:underline"
              onClick={() => setShowRegister(true)}
            >Register here</span>
          </p>
        </div>
      </div>
    </div>
  );

  const RegisterPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-4xl font-bold text-indigo-600 mb-2">ARMS</div>
          <p className="text-gray-600">Create your account</p>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
            <AlertCircle className="text-red-500" size={16} />
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        )}
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input 
              type="text" 
              id="register-name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" 
              placeholder="John Doe" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input 
              type="email" 
              id="register-email"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" 
              placeholder="your.email@university.edu" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              type="password" 
              id="register-password"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" 
            />
          </div>
          <button 
            onClick={() => {
              const name = document.getElementById('register-name').value;
              const email = document.getElementById('register-email').value;
              const password = document.getElementById('register-password').value;
              handleRegister({ name, email, password });
            }}
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
          <p className="text-center text-sm text-gray-600">
            Already have an account? <span 
              className="text-indigo-600 cursor-pointer hover:underline"
              onClick={() => setShowRegister(false)}
            >Sign in here</span>
          </p>
        </div>
      </div>
    </div>
  );

  const Sidebar = () => (
    <div className="w-64 bg-white border-r border-gray-200 h-full flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <div className="text-2xl font-bold text-indigo-600">ARMS</div>
        <p className="text-sm text-gray-600 mt-1">Welcome back, {user?.name}</p>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        <button 
          onClick={() => setCurrentPage('home')}
          className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${currentPage === 'home' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700 hover:bg-gray-100'}`}
        >
          <Home size={20} />
          <span>Home</span>
        </button>
        <button 
          onClick={() => setCurrentPage('dashboard')}
          className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${currentPage === 'dashboard' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700 hover:bg-gray-100'}`}
        >
          <BookOpen size={20} />
          <span>Dashboard</span>
        </button>
        <button 
          onClick={() => setCurrentPage('rankings')}
          className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${currentPage === 'rankings' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700 hover:bg-gray-100'}`}
        >
          <Trophy size={20} />
          <span>Rankings</span>
        </button>
      </nav>
      
      <div className="p-4 border-t border-gray-200 space-y-2">
        <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
          <Settings size={20} />
          <span>Settings</span>
        </button>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  const Header = () => (
    <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="relative search-dropdown">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search courses, materials, or people..."
            className="pl-10 pr-4 py-2 w-96 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              handleUserSearch(e.target.value);
            }}
          />
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
              {searchResults.map(user => (
                <div 
                  key={user.id} 
                  className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                  onClick={() => handleUserSelect({ userId: user.id, name: user.name })}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <button 
          onClick={() => setShowUploadModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
        >
          <Upload size={16} />
          <span>Upload</span>
        </button>
        
        <div className="relative notification-dropdown">
          <Bell 
            className="text-gray-600 cursor-pointer hover:text-gray-800" 
            size={24} 
            onClick={() => setShowNotifications(!showNotifications)}
          />
          {notifications > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {notifications}
            </span>
          )}
          
          {showNotifications && (
            <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notificationList.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    No notifications
                  </div>
                ) : (
                  notificationList.map(notification => (
                    <div key={notification.id} className="p-4 border-b border-gray-100 hover:bg-gray-50">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {notification.timestamp.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {notificationList.length > 0 && (
                <div className="p-2 border-t border-gray-200">
                  <button 
                    onClick={() => {
                      setNotificationList([]);
                      setNotifications(0);
                    }}
                    className="w-full text-sm text-gray-600 hover:text-gray-800 py-2"
                  >
                    Clear all notifications
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div 
          className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white font-semibold cursor-pointer hover:bg-indigo-700 transition-colors"
          onClick={() => {
            console.log('User object when clicking profile:', user);
            setSelectedUser({ userId: user.id, name: user.name });
            setCurrentPage('user-profile');
          }}
        >
          {user?.name?.charAt(0)}
        </div>
      </div>
    </div>
  );

  const HomePage = () => (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Welcome to ARMS</h1>
        {(user?.role === 'FACULTY' || user?.role === 'ADMIN') && (
          <button 
            onClick={() => setShowCreateNews(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
          >
            <Plus size={16} />
            <span>Create News</span>
          </button>
        )}
      </div>
      
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
          <AlertCircle className="text-red-500" size={20} />
          <span className="text-red-700">{error}</span>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {/* News and Announcements */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">University News & Announcements</h3>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">Loading...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {news.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No news or announcements available.
                  </div>
                ) : (
                  news.map((item, index) => (
                    <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            item.type === 'URGENT' ? 'bg-red-100 text-red-800' :
                            item.type === 'ANNOUNCEMENT' ? 'bg-blue-100 text-blue-800' :
                            item.type === 'EVENT' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {item.type}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h4>
                      <p className="text-gray-600 text-sm line-clamp-2">{item.content}</p>
                      <div className="mt-2 text-xs text-gray-500">
                        By {item.author?.name || 'Unknown'}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
          
          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Top Contributors</h3>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">Loading...</p>
              </div>
            ) : (
              <div className="space-y-3">
                {rankings.slice(0, 5).map((user, index) => (
                  <div key={user.userId} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                       onClick={() => setSelectedUser(user)}>
                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                      <span className="text-indigo-600 font-semibold">{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.uploads} uploads</p>
                    </div>
                  </div>
                ))}
              </div>                      
            )}
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Courses</span>
                <span className="font-semibold">{courses.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Top Contributors</span>
                <span className="font-semibold">{rankings.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Recent News</span>
                <span className="font-semibold">{news.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const Dashboard = () => {
    const handleCourseSearch = (query) => {
      setCourseSearchQuery(query);
      if (query.trim() === '') {
        setFilteredCourses(courses);
      } else {
        const filtered = courses.filter(course => 
          course.title.toLowerCase().includes(query.toLowerCase()) ||
          course.code.toLowerCase().includes(query.toLowerCase()) ||
          (course.description && course.description.toLowerCase().includes(query.toLowerCase()))
        );
        setFilteredCourses(filtered);
      }
    };

    const applyCourseFilter = () => {
      if (selectedCourses.length === 0) {
        setFilteredCourses(courses);
      } else {
        const filtered = courses.filter(course => selectedCourses.includes(course.id));
        setFilteredCourses(filtered);
      }
      setShowFilterModal(false);
    };

    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">
            {selectedCourses.length > 0 ? `Selected Courses (${selectedCourses.length})` : 'Available Courses'}
          </h1>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Search courses..."
                className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                value={courseSearchQuery}
                onChange={(e) => handleCourseSearch(e.target.value)}
              />
            </div>
            <button 
              onClick={() => setShowFilterModal(true)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter size={16} />
              <span>Filter</span>
            </button>
          </div>
        </div>
        
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
            <AlertCircle className="text-red-500" size={20} />
            <span className="text-red-700">{error}</span>
          </div>
        )}
        
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading courses...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map(course => (
              <div 
                key={course.id} 
                className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleCourseSelect(course)}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                      {course.code.substring(0, 2)}
                    </div>
                    {selectedCourses.includes(course.id) && (
                      <CheckCircle className="text-green-500" size={20} />
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{course.code}</h3>
                  <p className="text-gray-600 mb-4">{course.title}</p>
                  {course.description && (
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">{course.description}</p>
                  )}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span className="flex items-center">
                      <FileText size={16} className="mr-1" />
                      View materials
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {filteredCourses.length === 0 && (
              <div className="col-span-full text-center py-12">
                <div className="text-gray-500 text-lg">No courses found</div>
                <div className="text-gray-400 text-sm mt-2">
                  {courseSearchQuery ? 'Try adjusting your search terms' : 'No courses match your current filter'}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const CourseDetail = () => (
    <div className="p-6 space-y-6">
      <div className="flex items-center space-x-4">
        <button 
          onClick={() => setSelectedCourse(null)}
          className="text-indigo-600 hover:text-indigo-700"
        >
          ← Back to courses
        </button>
        <h1 className="text-3xl font-bold text-gray-900">{selectedCourse?.code} - {selectedCourse?.title}</h1>
      </div>
      
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
          <AlertCircle className="text-red-500" size={20} />
          <span className="text-red-700">{error}</span>
        </div>
      )}
      
      {/* Recently Uploaded Section */}
      {recentMaterials.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Recently Uploaded</h2>
                <p className="text-gray-600">Latest materials added to this course</p>
              </div>
              <div className="flex items-center space-x-2">
                <Bell className="text-indigo-600" size={20} />
                <span className="text-sm font-medium text-indigo-600">{recentMaterials.length} new</span>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentMaterials.map(material => (
                <div key={material.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900 truncate">{material.title}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      material.type === 'NOTES' ? 'bg-blue-100 text-blue-800' :
                      material.type === 'ASSIGNMENT' ? 'bg-green-100 text-green-800' :
                      material.type === 'CODE' ? 'bg-purple-100 text-purple-800' :
                      material.type === 'PPT' ? 'bg-orange-100 text-orange-800' :
                      material.type === 'DOC' ? 'bg-gray-100 text-gray-800' :
                      'bg-indigo-100 text-indigo-800'
                    }`}>
                      {material.type}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-2">
                    {material.size ? `${(material.size / 1024 / 1024).toFixed(1)} MB` : 'Unknown size'}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      {material.createdAt ? new Date(material.createdAt).toLocaleDateString() : 'Unknown date'}
                    </span>
                    <a 
                      href={getFileUrl(material.path)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-700 text-sm flex items-center space-x-1"
                    >
                      <Download size={14} />
                      <span>Download</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">All Course Materials</h2>
              <p className="text-gray-600">Complete list of materials for this course</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Search materials..."
                  className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={materialSearchQuery}
                  onChange={(e) => handleMaterialSearch(e.target.value)}
                />
              </div>
              <select 
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                value={selectedMaterialType}
                onChange={(e) => handleMaterialTypeFilter(e.target.value)}
              >
                <option value="ALL">All Types</option>
                <option value="NOTES">Lecture Notes</option>
                <option value="ASSIGNMENT">Assignment</option>
                <option value="CODE">Code/Lab</option>
                <option value="PPT">Presentation</option>
                <option value="DOC">Document</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading materials...</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredMaterials.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                {materials.length === 0 ? 
                  'No materials uploaded yet for this course.' : 
                  'No materials match your search criteria.'
                }
              </div>
            ) : (
              filteredMaterials.map(material => (
                <div key={material.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <FileText className="text-indigo-600" size={20} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{material.title}</h3>
                        <p className="text-sm text-gray-500">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            material.type === 'NOTES' ? 'bg-blue-100 text-blue-800' :
                            material.type === 'ASSIGNMENT' ? 'bg-green-100 text-green-800' :
                            material.type === 'CODE' ? 'bg-purple-100 text-purple-800' :
                            material.type === 'PPT' ? 'bg-orange-100 text-orange-800' :
                            material.type === 'DOC' ? 'bg-gray-100 text-gray-800' :
                            'bg-indigo-100 text-indigo-800'
                          }`}>
                            {material.type}
                          </span>
                          {' '}• {material.size ? `${(material.size / 1024 / 1024).toFixed(1)} MB` : 'Unknown size'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <a 
                        href={getFileUrl(material.path)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-700 p-2 rounded-lg hover:bg-indigo-50 transition-colors"
                      >
                        <Download size={16} />
                      </a>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );

  const Rankings = () => (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Top Contributors</h1>
      </div>
      
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
          <AlertCircle className="text-red-500" size={20} />
          <span className="text-red-700">{error}</span>
        </div>
      )}
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Leaderboard</h2>
          <p className="text-gray-600">Based on total uploads and contributions</p>
        </div>
        
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading rankings...</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {rankings.map((user, index) => (
              <div key={user.userId} className="p-6 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => handleUserSelect(user)}>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-8 h-8">
                    {index === 0 && <Trophy className="text-yellow-500" size={24} />}
                    {index === 1 && <Star className="text-gray-400" size={24} />}
                    {index === 2 && <Star className="text-orange-400" size={24} />}
                    {index > 2 && <span className="text-gray-400 font-semibold">{index + 1}</span>}
                  </div>
                  
                  <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {user.name.charAt(0)}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                    <p className="text-gray-600">{user.uploads} total uploads</p>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-2xl font-bold text-indigo-600">{user.uploads}</div>
                    <div className="text-sm text-gray-500">uploads</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const UserProfile = () => (
    <div className="p-6 space-y-6">
      <div className="flex items-center space-x-4">
        <button 
          onClick={() => {
            setSelectedUser(null);
            setUserProfile(null);
            // If viewing own profile, go back to home, otherwise go to rankings
            setCurrentPage(selectedUser && selectedUser.userId === user.id ? 'home' : 'rankings');
          }}
          className="text-indigo-600 hover:text-indigo-700"
        >
          ← Back to {selectedUser && selectedUser.userId === user.id ? 'home' : 'rankings'}
        </button>
        <h1 className="text-3xl font-bold text-gray-900">
          {selectedUser && selectedUser.userId === user.id ? 'My Profile' : `${userProfile?.name}'s Profile`}
        </h1>
      </div>
      
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
          <AlertCircle className="text-red-500" size={20} />
          <span className="text-red-700">{error}</span>
        </div>
      )}
      
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading profile...</p>
        </div>
      ) : userProfile ? (
        <div className="space-y-6">
          {/* User Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                {userProfile.name.charAt(0)}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900">{userProfile.name}</h2>
                <p className="text-gray-600">{userProfile.email}</p>
                <p className="text-sm text-gray-500 capitalize">{userProfile.role.toLowerCase()}</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-indigo-600">{userProfile.totalUploads}</div>
                <div className="text-sm text-gray-500">Total Uploads</div>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Upload Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{userProfile.statistics.notes}</div>
                <div className="text-sm text-blue-800">Notes</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{userProfile.statistics.assignments}</div>
                <div className="text-sm text-green-800">Assignments</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{userProfile.statistics.code}</div>
                <div className="text-sm text-purple-800">Code</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{userProfile.statistics.presentations}</div>
                <div className="text-sm text-orange-800">Presentations</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-600">{userProfile.statistics.documents}</div>
                <div className="text-sm text-gray-800">Documents</div>
              </div>
              <div className="text-center p-4 bg-indigo-50 rounded-lg">
                <div className="text-2xl font-bold text-indigo-600">{userProfile.statistics.other}</div>
                <div className="text-sm text-indigo-800">Other</div>
              </div>
            </div>
          </div>

          {/* Materials by Course */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Contributions by Course</h3>
              <p className="text-gray-600">Materials uploaded to each course</p>
            </div>
            <div className="divide-y divide-gray-200">
              {Object.entries(userProfile.materialsByCourse).map(([courseName, materials]) => (
                <div key={courseName} className="p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">{courseName}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {materials.map(material => (
                      <div key={material.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium text-gray-900 truncate">{material.title}</h5>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              material.type === 'NOTES' ? 'bg-blue-100 text-blue-800' :
                              material.type === 'ASSIGNMENT' ? 'bg-green-100 text-green-800' :
                              material.type === 'CODE' ? 'bg-purple-100 text-purple-800' :
                              material.type === 'PPT' ? 'bg-orange-100 text-orange-800' :
                              material.type === 'DOC' ? 'bg-gray-100 text-gray-800' :
                              'bg-indigo-100 text-indigo-800'
                            }`}>
                              {material.type}
                            </span>
                            {/* Show delete button only for current user's own materials */}
                            {selectedUser && selectedUser.userId === user.id && (
                              <button
                                onClick={() => handleDeleteMaterial(material.id)}
                                className="text-red-500 hover:text-red-700 transition-colors"
                                title="Delete material"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-500">
                          {material.size ? `${(material.size / 1024 / 1024).toFixed(1)} MB` : 'Unknown size'}
                        </p>
                        <div className="mt-2">
                          <a 
                            href={getFileUrl(material.path)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:text-indigo-700 text-sm flex items-center space-x-1"
                          >
                            <Download size={14} />
                            <span>Download</span>
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {Object.keys(userProfile.materialsByCourse).length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  No materials uploaded yet.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">Profile not found</div>
        </div>
      )}
    </div>
  );

  const UploadModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Upload Material</h2>
          <button onClick={() => setShowUploadModal(false)}>
            <X className="text-gray-400 hover:text-gray-600" size={24} />
          </button>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
            <AlertCircle className="text-red-500" size={16} />
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        )}
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
            <select 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              value={uploadForm.courseId}
              onChange={(e) => setUploadForm(prev => ({ ...prev, courseId: e.target.value }))}
            >
              <option value="">Select a course</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>{course.code} - {course.title}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content Type</label>
            <select 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              value={uploadForm.type}
              onChange={(e) => setUploadForm(prev => ({ ...prev, type: e.target.value }))}
            >
              <option value="OTHER">Other</option>
              <option value="NOTES">Lecture Notes</option>
              <option value="ASSIGNMENT">Assignment</option>
              <option value="CODE">Code/Lab</option>
              <option value="PPT">Presentation</option>
              <option value="DOC">Document</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input 
              type="text" 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" 
              placeholder="Enter material title"
              value={uploadForm.title}
              onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">File</label>
            <input
              type="file"
              onChange={handleFileSelect}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          
          <div className="flex space-x-3 pt-4">
            <button 
              onClick={() => setShowUploadModal(false)}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleUpload}
              disabled={uploading || !uploadForm.courseId || !uploadForm.file}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const FilterModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Select Courses</h2>
          <button onClick={() => setShowFilterModal(false)}>
            <X className="text-gray-400 hover:text-gray-600" size={24} />
          </button>
        </div>
        
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search courses..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              value={courseSearchQuery}
              onChange={(e) => setCourseSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {courses.filter(course => 
            course.title.toLowerCase().includes(courseSearchQuery.toLowerCase()) ||
            course.code.toLowerCase().includes(courseSearchQuery.toLowerCase()) ||
            (course.description && course.description.toLowerCase().includes(courseSearchQuery.toLowerCase()))
          ).map(course => (
            <label key={course.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input 
                type="checkbox" 
                checked={selectedCourses.includes(course.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedCourses([...selectedCourses, course.id]);
                  } else {
                    setSelectedCourses(selectedCourses.filter(id => id !== course.id));
                  }
                }}
                className="text-indigo-600 focus:ring-indigo-500"
              />
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                {course.code.substring(0, 2)}
              </div>
              <div>
                <p className="font-medium text-gray-900">{course.code}</p>
                <p className="text-sm text-gray-600">{course.title}</p>
              </div>
            </label>
          ))}
        </div>
        
        <div className="flex space-x-3 pt-4 mt-4 border-t border-gray-200">
          <button 
            onClick={() => setShowFilterModal(false)}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={() => {
              if (selectedCourses.length === 0) {
                setFilteredCourses(courses);
              } else {
                const filtered = courses.filter(course => selectedCourses.includes(course.id));
                setFilteredCourses(filtered);
              }
              setShowFilterModal(false);
            }}
            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Apply Filter
          </button>
        </div>
      </div>
    </div>
  );

  const CreateNewsModal = () => {
    const handleCreateNews = async () => {
      if (!newsForm.title || !newsForm.content) {
        setError('Please fill in all required fields');
        return;
      }

      setLoading(true);
      setError(null);
      try {
        await newsAPI.createNews(newsForm);
        setShowCreateNews(false);
        setNewsForm({ title: '', content: '', type: 'ANNOUNCEMENT' });
        
        // Refresh news
        const newsData = await newsAPI.getRecentNews(5);
        setNews(newsData.data);
      } catch (err) {
        setError(handleAPIError(err));
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-2xl w-full p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Create News/Announcement</h2>
            <button onClick={() => setShowCreateNews(false)}>
              <X className="text-gray-400 hover:text-gray-600" size={24} />
            </button>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
              <AlertCircle className="text-red-500" size={16} />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input 
                type="text" 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" 
                placeholder="Enter news title"
                value={newsForm.title}
                onChange={(e) => setNewsForm(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                value={newsForm.type}
                onChange={(e) => setNewsForm(prev => ({ ...prev, type: e.target.value }))}
              >
                <option value="ANNOUNCEMENT">Announcement</option>
                <option value="NEWS">News</option>
                <option value="EVENT">Event</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Content *</label>
              <textarea 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 h-32" 
                placeholder="Enter news content"
                value={newsForm.content}
                onChange={(e) => setNewsForm(prev => ({ ...prev, content: e.target.value }))}
              />
            </div>
            
            <div className="flex space-x-3 pt-4">
              <button 
                onClick={() => setShowCreateNews(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateNews}
                disabled={loading || !newsForm.title || !newsForm.content}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create News'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!user) {
    if (showRegister) {
      return <RegisterPage />;
    }
    return <LoginPage />;
  }

  return (
    <div className="h-screen flex bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <div className="flex-1 overflow-y-auto">
          {currentPage === 'home' && <HomePage />}
          {currentPage === 'dashboard' && selectedCourse ? (
            <CourseDetail />
          ) : currentPage === 'dashboard' ? (
            <Dashboard />
          ) : null}
          {currentPage === 'rankings' && <Rankings />}
          {currentPage === 'user-profile' && <UserProfile />}
        </div>
      </div>
      
      {showUploadModal && <UploadModal />}
      {showFilterModal && <FilterModal />}
      {showCreateNews && <CreateNewsModal />}
    </div>
  );
};

export default ARMSPlatform;
