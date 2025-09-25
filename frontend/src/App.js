import React, { useState, useEffect, useCallback, memo } from 'react';
import { 
  Search, 
  Bell, 
  Upload, 
  Filter, 
  User, 
  FileText, 
  BookOpen, 
  Trophy, 
  Star,
  X,
  Plus,
  Home,
  Inbox,
  Pin,
  PinOff,
  Settings,
  LogOut,
  Download,
  AlertCircle,
  CheckCircle,
  Trash2
} from 'lucide-react';
import HomePage from './components/HomePage';
import NotificationSidebar from './components/common/NotificationSidebar';
import { authService } from './services/authService';
import { courseAPI, materialAPI, rankingsAPI, newsAPI, userAPI, getFileUrl, handleAPIError } from './services/api';
import SearchInput from './components/SearchInput';


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
  const [profileBackTo, setProfileBackTo] = useState('rankings');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showRegister, setShowRegister] = useState(false);
  const [showCreateNews, setShowCreateNews] = useState(false);
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
  const [isInboxOpen, setIsInboxOpen] = useState(false);
  const [pinnedCourseIds, setPinnedCourseIds] = useState([]);
  const [recentCourseIds, setRecentCourseIds] = useState([]);

  const getPinsKey = (userId) => `arms:${userId}:pins`;
  const getRecentsKey = (userId) => `arms:${userId}:recentCourses`;
  
  // Upload modal states
  const [uploadForm, setUploadForm] = useState({
    courseId: '',
    title: '',
    type: 'OTHER',
    file: null
  });
  const [uploading, setUploading] = useState(false);

  const loadPinsRecentsFromStorage = (uid) => {
    try {
      const pins = JSON.parse(localStorage.getItem(getPinsKey(uid)) || '[]');
      const recents = JSON.parse(localStorage.getItem(getRecentsKey(uid)) || '[]');
      setPinnedCourseIds(Array.isArray(pins) ? pins : []);
      setRecentCourseIds(Array.isArray(recents) ? recents : []);
    } catch (e) {
      setPinnedCourseIds([]);
      setRecentCourseIds([]);
    }
  };

  // Check authentication on mount
  useEffect(() => {
    const token = authService.getToken();
    const savedUser = authService.getUser();
    console.log('Initial user load:', { token: !!token, savedUser });
    if (token && savedUser) {
      setUser(savedUser);
      setCurrentPage('home');
      // load pins/recents from localStorage
      loadPinsRecentsFromStorage(savedUser.id);
      loadInitialData();
    }

    // Load Google Identity script for login page
    const scriptId = 'google-identity';
    if (!document.getElementById(scriptId)) {
      const s = document.createElement('script');
      s.src = 'https://accounts.google.com/gsi/client';
      s.async = true; s.defer = true; s.id = scriptId;
      document.body.appendChild(s);
      s.onload = () => {
        if (window.google && window.google.accounts && document.getElementById('google-signin-container')) {
          window.google.accounts.id.initialize({
            client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID || '',
            callback: async (response) => {
              try {
                const res = await authService.loginWithGoogle(response.credential);
                setUser(res.user);
                setCurrentPage('home');
                loadPinsRecentsFromStorage(res.user.id);
                loadInitialData();
              } catch (err) {
                setError(err.error || 'Google sign-in failed');
              }
            },
            auto_select: false,
            hd: 'klh.edu.in'
          });
          window.google.accounts.id.renderButton(
            document.getElementById('google-signin-container'),
            { theme: 'outline', size: 'large', text: 'signin_with', shape: 'rectangular' }
          );
        }
      };
    }
  }, []);

  // Close search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchResults.length > 0 && !event.target.closest('.search-dropdown')) {
        setSearchResults([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [searchResults.length]);

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
      loadPinsRecentsFromStorage(response.user.id);
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
      loadPinsRecentsFromStorage(response.user.id);
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
    // keep pins/recents in localStorage, just clear in-memory
    setPinnedCourseIds(prev => prev);
    setRecentCourseIds(prev => prev);
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
      formData.append('title', uploadForm.title || uploadForm.file.name);
      formData.append('type', uploadForm.type);

      console.log('Uploading file:', {
        courseId: uploadForm.courseId,
        fileName: uploadForm.file.name,
        fileSize: uploadForm.file.size,
        fileType: uploadForm.file.type
      });

      const response = await materialAPI.uploadMaterial(uploadForm.courseId, formData);
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
      const maxSize = process.env.REACT_APP_MAX_FILE_SIZE || 104857600; // 100MB default
      if (file.size > maxSize) {
        setError(`File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds maximum limit of ${(maxSize / 1024 / 1024).toFixed(2)}MB`);
        event.target.value = ''; // Reset file input
        return;
      }
      setError(null);
      // Auto-fill title if empty
      setUploadForm(prev => ({ 
        ...prev, 
        file,
        title: prev.title || file.name
      }));
      console.log('File selected:', { name: file.name, size: `${(file.size / 1024 / 1024).toFixed(2)}MB`, type: file.type });
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

      // update recent course ids
      setRecentCourseIds(prev => {
        const next = [course.id, ...prev.filter(id => id !== course.id)].slice(0, 5);
        try { if (user?.id) localStorage.setItem(getRecentsKey(user.id), JSON.stringify(next)); } catch (e) {}
        return next;
      });
    } catch (err) {
      setError(handleAPIError(err));
    } finally {
      setLoading(false);
    }
  };


  const filterMaterials = useCallback((searchQuery, materialType) => {
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
  }, [materials]);

  const handleUserSelect = async (user, backTo) => {
    console.log('handleUserSelect called with user:', user);
    setSelectedUser(user);
    if (backTo) setProfileBackTo(backTo);
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

  const handleUserSearch = useCallback(async (query) => {
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
  }, []);

  // Debounced user search to prevent too many API calls
  const debouncedUserSearch = useCallback(
    (value) => {
      setSearchQuery(value);
      const handler = () => handleUserSearch(value);
      const timeoutId = setTimeout(handler, 300);
      return () => clearTimeout(timeoutId);
    },
    [handleUserSearch]
  );

  const handleCourseSearch = useCallback((value) => {
    setCourseSearchQuery(value);
    if (value.trim() === '') {
      setFilteredCourses(courses);
    } else {
      const filtered = courses.filter(course => 
        course.title.toLowerCase().includes(value.toLowerCase()) ||
        course.code.toLowerCase().includes(value.toLowerCase()) ||
        (course.description && course.description.toLowerCase().includes(value.toLowerCase()))
      );
      setFilteredCourses(filtered);
    }
  }, [courses, setFilteredCourses]);

  const handleMaterialSearch = useCallback((value) => {
    setMaterialSearchQuery(value);
    filterMaterials(value, selectedMaterialType);
  }, [selectedMaterialType, filterMaterials]);

  const handleMaterialTypeFilter = useCallback((type) => {
    setSelectedMaterialType(type);
    filterMaterials(materialSearchQuery, type);
  }, [materialSearchQuery]);

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

              // Validate email domain
              if (!email.endsWith('@klh.edu.in')) {
                setError('Only @klh.edu.in email addresses are allowed to login');
                return;
              }

              handleLogin(email, password);
            }}
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="mx-2 text-xs text-gray-400">OR</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>
          <div id="google-signin-container" className="flex justify-center"></div>
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

              // Validate email domain
              if (!email.endsWith('@klh.edu.in')) {
                setError('Only @klh.edu.in email addresses are allowed to register');
                return;
              }

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
    <div className="w-64 bg-white border-r border-gray-200 h-full flex flex-col relative z-20">
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
          onClick={() => {
            setIsInboxOpen(prev => {
              const next = !prev;
              if (next) setNotifications(0);
              return next;
            });
          }}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${currentPage === 'inbox' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700 hover:bg-gray-100'}`}
        >
          <span className="flex items-center space-x-3">
            <Inbox size={20} />
            <span>Inbox</span>
          </span>
          {notifications > 0 && (
            <span className="ml-2 bg-red-500 text-white text-xs rounded-full h-5 px-2 flex items-center justify-center">
              {notifications}
            </span>
          )}
        </button>
        <button 
          onClick={() => setCurrentPage('rankings')}
          className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${currentPage === 'rankings' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700 hover:bg-gray-100'}`}
        >
          <Trophy size={20} />
          <span>Rankings</span>
        </button>

        {/* Pinned Courses */}
        {pinnedCourseIds.length > 0 && (
          <div className="pt-4">
            <div className="text-xs font-semibold text-gray-500 px-3 mb-2">Pinned</div>
            <div className="space-y-1">
              {pinnedCourseIds
                .map(id => courses.find(c => c.id === id))
                .filter(Boolean)
                .map(course => (
                  <div key={course.id} className="group flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-100">
                    <button
                      onClick={() => { setCurrentPage('dashboard'); handleCourseSelect(course); }}
                      className="text-sm text-gray-700 truncate text-left flex-1"
                      title={`${course.code} - ${course.title}`}
                    >
                      {course.code}
                    </button>
                    <button
                      onClick={() => {
                        setPinnedCourseIds(prev => {
                          const next = prev.filter(id => id !== course.id);
                          try { localStorage.setItem('arms:pins', JSON.stringify(next)); } catch (e) {}
                          return next;
                        });
                      }}
                      className="opacity-70 group-hover:opacity-100 text-gray-500 hover:text-gray-700"
                      title="Unpin"
                    >
                      <PinOff size={16} />
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Recent Courses */}
        {recentCourseIds.length > 0 && (
          <div className="pt-4">
            <div className="text-xs font-semibold text-gray-500 px-3 mb-2">Recent</div>
            <div className="space-y-1">
              {recentCourseIds
                .map(id => courses.find(c => c.id === id))
                .filter(Boolean)
                .map(course => (
                  <div key={course.id} className="group flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-100">
                    <button
                      onClick={() => { setCurrentPage('dashboard'); handleCourseSelect(course); }}
                      className="text-sm text-gray-700 truncate text-left flex-1"
                      title={`${course.code} - ${course.title}`}
                    >
                      {course.code}
                    </button>
                    <button
                      onClick={() => {
                        setPinnedCourseIds(prev => {
                          const next = prev.includes(course.id) ? prev : [...prev, course.id];
                          try { localStorage.setItem('arms:pins', JSON.stringify(next)); } catch (e) {}
                          return next;
                        });
                      }}
                      className="opacity-70 group-hover:opacity-100 text-gray-500 hover:text-gray-700"
                      title="Pin"
                    >
                      <Pin size={16} />
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}
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

  const Header = memo(() => (
    <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="search-dropdown">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search courses, materials, or people..."
              className="pl-10 pr-4 py-2 w-96 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              value={searchQuery}
              onChange={(e) => debouncedUserSearch(e.target.value)}
            />
          </div>
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
              {searchResults.map(user => (
                <div 
                  key={user.id} 
                  className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                  onClick={() => handleUserSelect({ userId: user.id, name: user.name }, 'home')}
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
        
        <div 
          className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white font-semibold cursor-pointer hover:bg-indigo-700 transition-colors"
          onClick={async () => {
            console.log('User object when clicking profile:', user);
            setSelectedUser({ userId: user.id, name: user.name });
            setProfileBackTo('home');
            setLoading(true);
            setError(null);
            try {
              console.log('Fetching own profile for userId:', user.id);
              const profileData = await userAPI.getUserProfile(user.id);
              console.log('Own profile data received:', profileData.data);
              setUserProfile(profileData.data);
              setCurrentPage('user-profile');
            } catch (err) {
              console.error('Error fetching own profile:', err);
              setError(handleAPIError(err));
            } finally {
              setLoading(false);
            }
          }}
        >
          {user?.name?.charAt(0)}
        </div>
      </div>
    </div>
  ));

  const InboxView = () => (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Inbox</h1>
        {notificationList.length > 0 && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setNotifications(0)}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
            >
              Mark all as read
            </button>
            <button
              onClick={() => { setNotificationList([]); setNotifications(0); }}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {notificationList.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            You're all caught up
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {notificationList.map(item => (
              <div key={item.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{item.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{item.timestamp.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // HomePage component is imported from './components/HomePage'

  const Dashboard = memo(() => {

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
  });

  const CourseDetail = memo(() => (
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
                  <div className="flex items-center space-x-2 mb-1">
                    <button 
                      onClick={() => material.uploader ? handleUserSelect({ userId: material.uploader.id, name: material.uploader.name }, 'course') : null}
                      className="text-sm text-gray-600 hover:text-indigo-600 flex items-center space-x-1"
                    >
                      <User size={14} />
                      <span>{material.uploader?.fullName || material.uploader?.firstName || material.uploader?.name || material.uploader?.email || 'Unknown uploader'}</span>
                    </button>
                  </div>
                  <div className="text-sm text-gray-500 mb-2">
                    {material.size ? `${(material.size / 1024 / 1024).toFixed(1)} MB` : 'Unknown size'}
                  </div>
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
                        <div className="flex items-center space-x-3">
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
                          <div className="text-sm text-gray-500">
                            {material.size ? `${(material.size / 1024 / 1024).toFixed(1)} MB` : 'Unknown size'}
                          </div>
                        </div>
                        <div className="flex items-center mt-1">
                          <button 
                            onClick={() => material.uploader ? handleUserSelect({ userId: material.uploader.id, name: material.uploader.name }, 'course') : null}
                            className="text-sm text-gray-600 hover:text-indigo-600 flex items-center space-x-1"
                          >
                            <User size={14} />
                            <span>{material.uploader?.name || 'Unknown uploader'}</span>
                          </button>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {material.createdAt ? new Date(material.createdAt).toLocaleDateString() : 'Unknown date'}
                        </div>
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
  ));

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
              <div key={user.userId} className="p-6 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => handleUserSelect(user, 'rankings')}>
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
            if (profileBackTo === 'course') {
              setCurrentPage('dashboard');
            } else if (profileBackTo === 'home') {
              setCurrentPage('home');
            } else {
              setCurrentPage('rankings');
            }
          }}
          className="text-indigo-600 hover:text-indigo-700"
        >
          ← Back to {profileBackTo === 'course' ? 'course' : profileBackTo === 'home' ? 'home' : 'rankings'}
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
      
      {(() => {
        console.log('Profile render state:', { loading, userProfile, selectedUser });
        return null;
      })()}
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
            {uploadForm.file && (
              <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FileText size={16} className="text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">{uploadForm.file.name}</p>
                      <p className="text-xs text-gray-500">
                        {(uploadForm.file.size / 1024 / 1024).toFixed(2)} MB • {uploadForm.file.type || 'Unknown type'}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setUploadForm(prev => ({ ...prev, file: null }))}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            )}
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

  const FilterModal = memo(() => (
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
              onChange={(e) => handleCourseSearch(e.target.value)}
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
  ));

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
          {currentPage === 'home' && <HomePage user={user} setShowCreateNews={setShowCreateNews} error={error} />}
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
      <NotificationSidebar 
        isOpen={isInboxOpen}
        onClose={() => setIsInboxOpen(false)}
        items={notificationList}
        onMarkAllRead={() => setNotifications(0)}
        onClearAll={() => { setNotificationList([]); setNotifications(0); }}
      />
    </div>
  );
};

export default ARMSPlatform;
