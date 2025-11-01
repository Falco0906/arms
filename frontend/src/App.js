import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
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
  Trash2,
  ThumbsUp,
  MessageCircle,
  Sun,
  Moon,
  Github,
  BarChart3,
  BookMarked,
  ChevronDown,
  MessageSquare,
  Edit2,
  Check,
  Calendar,
  Send,
  Reply,
  CornerUpLeft
} from 'lucide-react';
import HomePage from './components/HomePage';
import NotificationSidebar from './components/common/NotificationSidebar';
import { authService } from './services/authService';
import { courseAPI, materialAPI, rankingsAPI, newsAPI, userAPI, searchAPI, chatAPI, getFileUrl, handleAPIError } from './services/api';
import SearchInput from './components/SearchInput';
import UserProfile from './components/rankings/UserProfile';


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
    type: 'ANNOUNCEMENT',
    imageFile: null,
    imagePreview: null
  });
  
  // Admin email for news/events management
  const NEWS_ADMIN_EMAIL = '2410080079@klh.edu.in';
  
  // Fun popup for placeholder features
  const [showPlaceholderPopup, setShowPlaceholderPopup] = useState(false);
  const [placeholderMessage, setPlaceholderMessage] = useState('');
  
  // API data states
  const [courses, setCourses] = useState([]);
  const [rankings, setRankings] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [filteredMaterials, setFilteredMaterials] = useState([]);
  const [materialSearchQuery, setMaterialSearchQuery] = useState('');
  const [selectedMaterialType, setSelectedMaterialType] = useState('ALL');
  const [recentMaterials, setRecentMaterials] = useState([]);
  const [likesCountMap, setLikesCountMap] = useState({});
  const [likedMap, setLikedMap] = useState({});
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isInboxOpen, setIsInboxOpen] = useState(false);
  const [showCourseChat, setShowCourseChat] = useState(false);
  const [courseMessages, setCourseMessages] = useState([]);
  const [courseChatText, setCourseChatText] = useState('');
  const [replyingToCourseMsg, setReplyingToCourseMsg] = useState(null);
  const courseChatUnsubRef = useRef(null);
  const [showGlobalChat, setShowGlobalChat] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [dmMessages, setDmMessages] = useState([]);
  const [unreadDMCount, setUnreadDMCount] = useState(0);
  const [dmText, setDmText] = useState('');
  const [replyingToDM, setReplyingToDM] = useState(null);
  const dmUnsubRef = useRef(null);
  const convUnsubRef = useRef(null);
  const dmMessagesEndRef = useRef(null);
  const [chatUserQuery, setChatUserQuery] = useState('');
  const [chatUserResults, setChatUserResults] = useState([]);
  const chatSearchTimeoutRef = useRef(null);
  const [pinnedCourseIds, setPinnedCourseIds] = useState([]);
  const [recentCourseIds, setRecentCourseIds] = useState([]);
  const [commentsMap, setCommentsMap] = useState({});
  const [courseLastVisit, setCourseLastVisit] = useState({});
  const [commentsOpen, setCommentsOpen] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [commentCounts, setCommentCounts] = useState({});
  const commentUnsubsRef = useRef({});
  const [darkMode, setDarkMode] = useState(() => {
    try { return (localStorage.getItem('arms:theme') || 'light') === 'dark'; } catch (_) { return false; }
  });

  const getPinsKey = (userId) => `arms:${userId}:pins`;
  const getRecentsKey = (userId) => `arms:${userId}:recentCourses`;
  const getLastVisitKey = (userId) => `arms:${userId}:courseVisits`;
  
  // Upload modal states
  const [uploadForm, setUploadForm] = useState({
    courseId: '',
    title: '',
    type: 'OTHER',
    file: null
  });
  const [uploading, setUploading] = useState(false);
  const [uploadCourseQuery, setUploadCourseQuery] = useState('');
  const searchTimeoutRef = useRef(null);

  const loadPinsRecentsFromStorage = (uid) => {
    try {
      let pins = JSON.parse(localStorage.getItem(getPinsKey(uid)) || '[]');
      // migrate legacy key if present
      if ((!Array.isArray(pins) || pins.length === 0)) {
        const legacy = JSON.parse(localStorage.getItem('arms:pins') || '[]');
        if (Array.isArray(legacy) && legacy.length > 0) {
          pins = legacy;
          try { localStorage.setItem(getPinsKey(uid), JSON.stringify(legacy)); } catch (e) {}
        }
      }
      const recents = JSON.parse(localStorage.getItem(getRecentsKey(uid)) || '[]');
      const visits = JSON.parse(localStorage.getItem(getLastVisitKey(uid)) || '{}');
      setPinnedCourseIds(Array.isArray(pins) ? pins : []);
      setRecentCourseIds(Array.isArray(recents) ? recents : []);
      setCourseLastVisit(typeof visits === 'object' ? visits : {});
    } catch (e) {
      setPinnedCourseIds([]);
      setRecentCourseIds([]);
      setCourseLastVisit({});
    }
  };

  // Minimal Notes page with per-user local storage
  const NotesPage = () => {
    const storageKey = user ? `arms:${user.id}:notes` : 'arms:anon:notes';
    const [text, setText] = useState(() => localStorage.getItem(storageKey) || '');
    const [saving, setSaving] = useState(false);
    useEffect(() => {
      setSaving(true);
      const id = setTimeout(() => {
        try { localStorage.setItem(storageKey, text); } catch (e) {}
        setSaving(false);
      }, 400);
      return () => clearTimeout(id);
    }, [text, storageKey]);
    useEffect(() => {
      setText(localStorage.getItem(storageKey) || '');
    }, [storageKey]);
    return (
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Personal Notes</h1>
          <span className="text-sm text-gray-500 dark:text-gray-400">{saving ? 'Saving…' : 'Saved'}</span>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full h-[60vh] p-4 border border-gray-300 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-gray-400 dark:bg-neutral-900 dark:text-gray-100"
          placeholder="Write anything you want to remember…"
        />
      </div>
    );
  };

  // Minimal Rankings page using existing state
  const Rankings = () => (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Top Contributors</h1>
      </div>
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
          <AlertCircle className="text-red-500" size={20} />
          <span className="text-red-700">{error}</span>
        </div>
      )}
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-800">
        <div className="p-6 border-b border-gray-200 dark:border-neutral-800">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Leaderboard</h2>
          <p className="text-gray-600 dark:text-gray-400">Based on total uploads and contributions</p>
        </div>
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-500 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading rankings...</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {rankings.map((u, index) => (
              <div key={u.userId || index} className="p-6 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer" onClick={() => handleUserSelect(u, 'rankings')}>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-8 h-8 text-gray-400">
                    {index + 1}
                  </div>
                  <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center text-white font-semibold">
                    {(u.name || 'U').charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{u.name}</h3>
                    <p className="text-gray-600 dark:text-gray-400">{u.uploadCount || u.uploads || 0} total uploads</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{u.uploadCount || u.uploads || 0}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">uploads</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

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

  // Cleanup pending global search timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Auto-close inbox when clicking anywhere outside the notifications panel
  useEffect(() => {
    const closeOnOutside = (e) => {
      if (!isInboxOpen) return;
      if (e.target.closest('.notifications-panel')) return;
      setIsInboxOpen(false);
    };
    document.addEventListener('mousedown', closeOnOutside);
    return () => document.removeEventListener('mousedown', closeOnOutside);
  }, [isInboxOpen]);

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
      const timeoutId = setTimeout(() => {
        try { setUploading(false); } catch (_) {}
        try { setError('Upload timed out. Please check your network or configuration and try again.'); } catch (_) {}
      }, 30000);
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
      clearTimeout(timeoutId);
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
      try {
        setError(handleAPIError(err));
      } catch (_) {
        setError('Upload failed. Please try again.');
      }
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
    setIsInboxOpen(false);
    setLoading(true);
    setMaterialSearchQuery('');
    setSelectedMaterialType('ALL');
    
    // Mark course as visited with current timestamp
    const now = Date.now();
    setCourseLastVisit(prev => {
      const updated = { ...prev, [course.id]: now };
      if (user?.id) {
        try {
          localStorage.setItem(getLastVisitKey(user.id), JSON.stringify(updated));
        } catch (e) {}
      }
      return updated;
    });
    
    try {
      const materialsData = await materialAPI.getMaterialsByCourse(course.id);
      
      // Enrich materials with uploader data if missing
      const enrichedMaterials = await Promise.all(materialsData.data.map(async (material) => {
        if (!material.uploader && material.uploaderId) {
          try {
            const uploaderData = await userAPI.getUserById(material.uploaderId);
            return {
              ...material,
              uploader: {
                id: uploaderData.id,
                name: uploaderData.name || uploaderData.email || 'Unknown',
                email: uploaderData.email
              }
            };
          } catch (e) {
            return material;
          }
        }
        return material;
      }));
      
      setMaterials(enrichedMaterials);
      setFilteredMaterials(enrichedMaterials);
      // Load likes (counts and current user's like state)
      try {
        const ids = materialsData.data.map(m => m.id);
        const countsEntries = await Promise.all(ids.map(async (id) => [id, await materialAPI.getLikesCount(id).then(r => r.data).catch(() => 0)]));
        const likesEntries = await Promise.all(ids.map(async (id) => [id, await materialAPI.isLikedByUser(id, user?.id).then(r => r.data).catch(() => false)]));
        setLikesCountMap(Object.fromEntries(countsEntries));
        setLikedMap(Object.fromEntries(likesEntries));
        const commentsCountsEntries = await Promise.all(ids.map(async (id) => [id, await materialAPI.getCommentsCount(id).then(r => r.data).catch(() => 0)]));
        setCommentCounts(Object.fromEntries(commentsCountsEntries));
      } catch (e) {}
      
      // Get recent materials (last 5 uploaded)
      const recent = materialsData.data
        .sort((a, b) => new Date(b.uploadedAt || b.createdAt || 0) - new Date(a.uploadedAt || a.createdAt || 0))
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
      const userId = user.userId || user.id;
      console.log('Fetching profile for userId:', userId);
      const profileData = await userAPI.getUserProfile(userId);
      console.log('Profile data received:', profileData.data);
      const p = profileData.data || {};
      const normalized = {
        id: p.id || userId,
        name: p.name || user.name || '',
        email: p.email || user.email || '',
        role: p.role || 'STUDENT',
        statistics: p.statistics || { notes: 0, uploads: 0, downloads: 0 },
        materialsByCourse: p.materialsByCourse || {},
        recentCourses: p.recentCourses || [],
        pinnedCourses: p.pinnedCourses || [],
        materials: p.materials || [],
        badges: p.badges || [],
        achievements: p.achievements || [],
        preferences: p.preferences || {},
        social: p.social || {},
        settings: p.settings || {},
        totalUploads: p.totalUploads ?? p.statistics?.uploads ?? 0,
      };
      normalized.uploads = normalized.uploads ?? normalized.statistics.uploads ?? 0;
      normalized.downloads = normalized.downloads ?? normalized.statistics.downloads ?? 0;
      normalized.notes = normalized.notes ?? normalized.statistics.notes ?? 0;
      normalized.rank = normalized.rank ?? 1;
      setUserProfile(normalized);
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
      
      // Refresh the materials list
      if (selectedCourse) {
        // Remove from local state immediately for better UX
        setMaterials(prev => prev.filter(m => m.id !== materialId));
        setFilteredMaterials(prev => prev.filter(m => m.id !== materialId));
        
        // Optionally refresh from server
        const materialsData = await materialAPI.getMaterialsByCourse(selectedCourse.id);
        const enrichedMaterials = await Promise.all(materialsData.data.map(async (material) => {
          if (!material.uploader && material.uploaderId) {
            try {
              const uploaderData = await userAPI.getUserById(material.uploaderId);
              return {
                ...material,
                uploader: {
                  id: uploaderData.id,
                  name: uploaderData.name || uploaderData.email || 'Unknown',
                  email: uploaderData.email
                }
              };
            } catch (e) {
              return material;
            }
          }
          return material;
        }));
        setMaterials(enrichedMaterials);
        setFilteredMaterials(enrichedMaterials);
      }
      
      // Refresh the user profile if viewing profile
      if (selectedUser) {
        await handleUserSelect(selectedUser);
      }
    } catch (error) {
      setError(handleAPIError(error));
    }
  };

  const handleDeleteNews = async (newsId) => {
    try {
      await newsAPI.deleteNews(newsId);
      // Refresh news
      const newsData = await newsAPI.getRecentNews(5);
      setNews(newsData.data);
    } catch (error) {
      setError(handleAPIError(error));
    }
  };

  const showPlaceholderFeature = (message) => {
    const funMessages = [
      "🚧 You caught us! We're still building this...",
      "🎨 Coming soon! Our devs are on it!",
      "⚡ Feature under construction! Check back later!",
      "🔮 This feature is in the future... literally!",
      "🛠️ Oops! Still hammering away at this one!",
      "🎯 Almost there! Just a few more lines of code...",
      "🚀 This feature is launching soon!",
      "💡 Great minds think alike! We're working on it!",
      "🎪 The show must go on... but this feature isn't ready yet!",
      "🎭 Plot twist: This button doesn't work yet!"
    ];
    const randomMessage = message || funMessages[Math.floor(Math.random() * funMessages.length)];
    setPlaceholderMessage(randomMessage);
    setShowPlaceholderPopup(true);
    setTimeout(() => setShowPlaceholderPopup(false), 3000);
  };

  const handleGlobalSearch = useCallback(async (query) => {
    setUserSearchQuery(query);
    if (query.trim() === '') {
      setSearchResults([]);
      return;
    }
    try {
      const { data } = await searchAPI.searchAll(query);
      setSearchResults(data || []);
    } catch (err) {
      setError(handleAPIError(err));
    }
  }, []);

  // Apply theme
  useEffect(() => {
    try { localStorage.setItem('arms:theme', darkMode ? 'dark' : 'light'); } catch (_) {}
    document.documentElement.classList.toggle('dark', !!darkMode);
  }, [darkMode]);

  // Debounced user search to prevent too many API calls
  const debouncedGlobalSearch = useCallback((value) => {
    setSearchQuery(value);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      handleGlobalSearch(value);
    }, 300);
  }, [handleGlobalSearch]);

  const handleGlobalSearchSelect = useCallback(async (item) => {
    setSearchResults([]);
    if (item.type === 'user') {
      await handleUserSelect({ userId: item.id, name: item.name, email: item.email }, 'home');
      return;
    }
    if (item.type === 'course') {
      const course = courses.find(c => c.id === item.id);
      setCurrentPage('dashboard');
      if (course) {
        await handleCourseSelect(course);
      } else {
        try {
          const res = await courseAPI.getCourseById(item.id);
          await handleCourseSelect(res.data);
        } catch (err) {
          setError(handleAPIError(err));
        }
      }
      return;
    }
    if (item.type === 'material') {
      // Navigate to its course page
      const course = courses.find(c => c.id === item.courseId);
      setCurrentPage('dashboard');
      if (course) {
        await handleCourseSelect(course);
      } else {
        try {
          const res = await courseAPI.getCourseById(item.courseId);
          await handleCourseSelect(res.data);
        } catch (err) {
          setError(handleAPIError(err));
        }
      }
      return;
    }
  }, [courses]);

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

  const handleToggleLike = async (materialId) => {
    try {
      const res = await materialAPI.toggleLike(materialId, user);
      const liked = !!res.data?.liked;
      setLikedMap(prev => ({ ...prev, [materialId]: liked }));
      setLikesCountMap(prev => ({ ...prev, [materialId]: Math.max(0, (prev[materialId] || 0) + (liked ? 1 : -1)) }));
    } catch (err) {
      // Fallback: toggle locally when backend/Firebase is unavailable
      setLikedMap(prev => {
        const nextLiked = !prev[materialId];
        setLikesCountMap(counts => ({ ...counts, [materialId]: Math.max(0, (counts[materialId] || 0) + (nextLiked ? 1 : -1)) }));
        return { ...prev, [materialId]: nextLiked };
      });
    }
  };

  // Seed demo materials for current course (no real storage required)
  const seedDemoMaterialsForCourse = useCallback(() => {
    if (!selectedCourse?.id) return;
    const now = Date.now();
    const samples = [
      { title: 'Syllabus Overview', type: 'DOC' },
      { title: 'Lecture 1 Notes', type: 'NOTES' },
      { title: 'Assignment 1', type: 'ASSIGNMENT' },
      { title: 'Lab Code Starter', type: 'CODE' },
      { title: 'Week 1 Slides', type: 'PPT' },
      { title: 'Reference Paper', type: 'OTHER' },
    ];
    const fileUrl = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
    const demo = samples.map((s, i) => ({
      id: `demo-${selectedCourse.id}-${now}-${i}`,
      courseId: selectedCourse.id,
      title: s.title,
      description: '',
      filename: `${s.title}.pdf`,
      path: fileUrl,
      url: fileUrl,
      type: s.type,
      size: 512 * 1024,
      uploader: user ? { id: user.id, name: user.name } : null,
      uploadedAt: new Date(now - i * 60000).toISOString(),
    }));
    setMaterials(prev => {
      const next = [...demo, ...prev];
      setFilteredMaterials(next);
      setLikesCountMap(prevCounts => ({ ...prevCounts, ...Object.fromEntries(demo.map(d => [d.id, 0])) }));
      setLikedMap(prevLiked => ({ ...prevLiked, ...Object.fromEntries(demo.map(d => [d.id, false])) }));
      setCommentCounts(prevCounts => ({ ...prevCounts, ...Object.fromEntries(demo.map(d => [d.id, 0])) }));
      const recent = next
        .slice()
        .sort((a, b) => new Date(b.uploadedAt || b.createdAt || 0) - new Date(a.uploadedAt || a.createdAt || 0))
        .slice(0, 5);
      setRecentMaterials(recent);
      return next;
    });
  }, [selectedCourse?.id, user]);

  // Comments handlers
  const toggleComments = useCallback((materialId) => {
    setCommentsOpen(prev => {
      const next = { ...prev, [materialId]: !prev[materialId] };
      const nowOpen = next[materialId];
      if (nowOpen && !commentUnsubsRef.current[materialId]) {
        try {
          commentUnsubsRef.current[materialId] = materialAPI.subscribeToComments(materialId, (comments) => {
            setCommentsMap(prevMap => ({ ...prevMap, [materialId]: comments }));
            setCommentCounts(prevCounts => ({ ...prevCounts, [materialId]: comments.length }));
          });
        } catch (_) {
          // No Firebase/backend available; show empty comments without subscription
          setCommentsMap(prevMap => ({ ...prevMap, [materialId]: prevMap[materialId] || [] }));
        }
      } else if (!nowOpen && commentUnsubsRef.current[materialId]) {
        try { commentUnsubsRef.current[materialId](); } catch (_) {}
        delete commentUnsubsRef.current[materialId];
      }
      return next;
    });
  }, []);

  const handleCommentInputChange = useCallback((materialId, value) => {
    setCommentInputs(prev => ({ ...prev, [materialId]: value }));
  }, []);
  const addCommentToMaterial = useCallback(async (materialId) => {
    const text = (commentInputs[materialId] || '').trim();
    if (!text || !user?.id) return;
    try {
      await materialAPI.addComment(materialId, { userId: user.id, userName: user.name || user.email || '', text });
      setCommentInputs(prev => ({ ...prev, [materialId]: '' }));
    } catch (err) {
      // Local demo fallback: append comment client-side only
      setCommentsMap(prev => {
        const list = prev[materialId] || [];
        const demoComment = {
          id: `local-${Date.now()}`,
          userId: user.id,
          userName: user.name || user.email || 'You',
          text,
          createdAt: new Date().toISOString(),
        };
        const next = { ...prev, [materialId]: [...list, demoComment] };
        setCommentCounts(cnt => ({ ...cnt, [materialId]: (cnt[materialId] || 0) + 1 }));
        return next;
      });
      setCommentInputs(prev => ({ ...prev, [materialId]: '' }));
    }
  }, [commentInputs, user]);

  const deleteCommentFromMaterial = useCallback(async (materialId, comment) => {
    if (!user?.id || comment.userId !== user.id) return;
    try {
      await materialAPI.deleteComment(materialId, comment.id);
    } catch (err) {
      // Local demo fallback: remove from client state
      setCommentsMap(prev => {
        const list = prev[materialId] || [];
        const nextList = list.filter(c => c.id !== comment.id);
        const next = { ...prev, [materialId]: nextList };
        setCommentCounts(cnt => ({ ...cnt, [materialId]: Math.max(0, (cnt[materialId] || 0) - 1) }));
        return next;
      });
    }
  }, [user]);

  // Cleanup all comment subscriptions when switching course or unmounting
  useEffect(() => {
    return () => {
      const map = commentUnsubsRef.current || {};
      Object.values(map).forEach((unsub) => { try { unsub && unsub(); } catch (_) {} });
      commentUnsubsRef.current = {};
      setCommentsOpen({});
      setCommentsMap({});
      setCommentInputs({});
    };
  }, [selectedCourse?.id]);

  // Course chat subscriptions (always on sidebar)
  useEffect(() => {
    if (!selectedCourse?.id) return;
    if (courseChatUnsubRef.current) { try { courseChatUnsubRef.current(); } catch (_) {} }
    if (typeof chatAPI.subscribeToCourseMessages === 'function') {
      courseChatUnsubRef.current = chatAPI.subscribeToCourseMessages(selectedCourse.id, (msgs) => setCourseMessages(msgs));
    } else {
      courseChatUnsubRef.current = null;
    }
    return () => { if (courseChatUnsubRef.current) { try { courseChatUnsubRef.current(); } catch (_) {} } };
  }, [selectedCourse?.id]);

  const sendCourseChat = async () => {
    if (!courseChatText.trim() || !selectedCourse?.id) return;
    try {
      const messageData = { 
        userId: user?.id, 
        userName: user?.name || user?.email || '', 
        text: courseChatText 
      };
      
      // Add reply data if replying
      if (replyingToCourseMsg) {
        messageData.replyTo = {
          id: replyingToCourseMsg.id,
          userName: replyingToCourseMsg.userName,
          text: replyingToCourseMsg.text
        };
      }
      
      await chatAPI.sendCourseMessage(selectedCourse.id, messageData);
    } catch (err) {
      // no-op offline
    } finally {
      setCourseChatText('');
      setReplyingToCourseMsg(null);
    }
  };

  // Global chat subscriptions
  useEffect(() => {
    if (!user?.id) return;
    if (convUnsubRef.current) { try { convUnsubRef.current(); } catch (_) {} }
    if (typeof chatAPI.subscribeToUserConversations === 'function') {
      let previousConvs = [];
      convUnsubRef.current = chatAPI.subscribeToUserConversations(user.id, (convs) => {
        // Sort by latest message
        const sorted = convs.sort((a, b) => {
          const aTime = a.updatedAt?.toDate?.() || new Date(0);
          const bTime = b.updatedAt?.toDate?.() || new Date(0);
          return bTime - aTime;
        });
        setConversations(sorted);
        
        // Calculate unread count
        const unread = sorted.filter(c => {
          const readBy = c.readBy || [];
          const lastSender = c.lastMessageSender;
          return lastSender && lastSender !== user.id && !readBy.includes(user.id);
        }).length;
        setUnreadDMCount(unread);
        
        // Add inbox notification for new messages
        if (previousConvs.length > 0) {
          sorted.forEach(conv => {
            const prevConv = previousConvs.find(c => c.id === conv.id);
            const isNewMessage = prevConv && 
              conv.lastMessage && 
              conv.lastMessage !== prevConv.lastMessage &&
              conv.lastMessageSender !== user.id;
            
            if (isNewMessage) {
              const sender = (conv.participants || []).find(p => p.id === conv.lastMessageSender);
              const newNotification = {
                id: Date.now() + Math.random(),
                message: `New message from ${sender?.name || 'Someone'}`,
                type: 'message',
                timestamp: new Date(),
                conversationId: conv.id
              };
              setNotificationList(prev => [newNotification, ...prev]);
              setNotifications(prev => prev + 1);
            }
          });
        }
        previousConvs = sorted;
      });
    } else {
      convUnsubRef.current = null;
    }
    return () => { if (convUnsubRef.current) { try { convUnsubRef.current(); } catch (_) {} } };
  }, [user?.id]);

  // Auto-scroll to latest message
  useEffect(() => {
    if (dmMessagesEndRef.current) {
      dmMessagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [dmMessages]);

  const openConversation = (conv) => {
    setActiveConversation(conv);
    // Mark as read
    if (user?.id && typeof chatAPI.markConversationAsRead === 'function') {
      chatAPI.markConversationAsRead(conv.id, user.id).catch(() => {});
    }
    if (dmUnsubRef.current) { try { dmUnsubRef.current(); } catch (_) {} }
    if (typeof chatAPI.subscribeToDM === 'function') {
      dmUnsubRef.current = chatAPI.subscribeToDM(conv.id, (msgs) => {
        setDmMessages(msgs);
        // Scroll to bottom when conversation opens
        setTimeout(() => {
          if (dmMessagesEndRef.current) {
            dmMessagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      });
    } else {
      dmUnsubRef.current = null;
    }
  };

  const sendDM = async () => {
    if (!activeConversation?.id || !dmText.trim()) return;
    try {
      const messageData = { 
        userId: user?.id, 
        userName: user?.name || user?.email || '', 
        text: dmText 
      };
      
      // Add reply data if replying
      if (replyingToDM) {
        messageData.replyTo = {
          id: replyingToDM.id,
          userName: replyingToDM.userName,
          text: replyingToDM.text
        };
      }
      
      await chatAPI.sendDM(activeConversation.id, messageData);
      setDmText('');
      setReplyingToDM(null);
      // Scroll to bottom after sending
      setTimeout(() => {
        if (dmMessagesEndRef.current) {
          dmMessagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } catch (err) {
      // no-op offline
    }
  };

  const handleChatUserSearch = useCallback((value) => {
    setChatUserQuery(value);
    if (chatSearchTimeoutRef.current) clearTimeout(chatSearchTimeoutRef.current);
    chatSearchTimeoutRef.current = setTimeout(async () => {
      if (!value.trim()) { setChatUserResults([]); return; }
      try { const res = await userAPI.searchUsers(value); setChatUserResults(res.data || []); } catch (_) { setChatUserResults([]); }
    }, 300);
  }, []);

  const startDMWithUser = async (targetUser) => {
    if (!user?.id || !targetUser?.id) return;
    try {
      // Create or get conversation from Firebase
      const currentUserData = {
        id: user.id,
        name: user.name || user.displayName || user.email,
        email: user.email
      };
      const targetUserData = {
        id: targetUser.id,
        name: targetUser.name || targetUser.displayName || targetUser.email,
        email: targetUser.email
      };
      
      const conversation = await chatAPI.getOrCreateDMConversation(currentUserData, targetUserData);
      
      // Open the conversation
      openConversation(conversation);
      setChatUserQuery('');
      setChatUserResults([]);
    } catch (err) {
      console.error('Failed to start DM:', err);
      setError('Failed to start conversation. Please try again.');
    }
  };

  // Overlays defined after handlers to avoid temporal dead zone
  const CourseChatEl = (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-neutral-900 rounded-xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-200 dark:border-neutral-800">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Course Chat · {selectedCourse?.code}</h2>
          <button onClick={() => { if (courseChatUnsubRef.current) courseChatUnsubRef.current(); setShowCourseChat(false); }}>
            <X className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" size={24} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto space-y-3 p-6 min-h-0">
          {courseMessages
            .filter(m => !(m.deletedFor || []).includes(user?.id))
            .map(m => (
            <div key={m.id || Math.random()} className={`group text-sm ${m.userId === (user?.id) ? 'text-right' : 'text-left'}`}>
              <div className="flex items-baseline space-x-2 justify-between">
                <div className="flex items-baseline space-x-2">
                  <span className="font-medium text-gray-800 dark:text-gray-200">{m.userId === (user?.id) ? 'You' : (m.userName || 'User')}</span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">{m.createdAt?.toDate ? m.createdAt.toDate().toLocaleString() : (m.createdAt ? new Date(m.createdAt).toLocaleString() : '')}</span>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <button
                    onClick={() => setReplyingToCourseMsg(m)}
                    className="text-xs text-gray-400 hover:text-blue-500 dark:text-gray-500 dark:hover:text-blue-400"
                    title="Reply"
                  >
                    <Reply size={14} />
                  </button>
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      try {
                        await chatAPI.deleteCourseMessageForMe(selectedCourse.id, m.id, user?.id);
                      } catch (err) {
                        console.error('Failed to delete message:', err);
                      }
                    }}
                    className="text-xs text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400"
                    title="Delete for me"
                  >
                    <Trash2 size={14} />
                  </button>
                  {m.userId === user?.id && (
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (window.confirm('Delete this message for everyone?')) {
                          try {
                            await chatAPI.deleteCourseMessageForEveryone(selectedCourse.id, m.id);
                          } catch (err) {
                            console.error('Failed to delete message:', err);
                          }
                        }
                      }}
                      className="text-xs text-gray-400 hover:text-red-600 dark:text-gray-500 dark:hover:text-red-500"
                      title="Delete for everyone"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>
              {m.replyTo && (
                <div className="mt-1 mb-1 p-2 bg-gray-100 dark:bg-neutral-800 rounded border-l-2 border-gray-400 dark:border-gray-600 text-xs">
                  <div className="font-medium text-gray-600 dark:text-gray-400">{m.replyTo.userName}</div>
                  <div className="text-gray-500 dark:text-gray-500 truncate">{m.replyTo.text}</div>
                </div>
              )}
              <div className="text-gray-700 dark:text-gray-300">{m.text}</div>
            </div>
          ))}
          {courseMessages.filter(m => !(m.deletedFor || []).includes(user?.id)).length === 0 && (
            <div className="text-center text-gray-400 dark:text-gray-500">No messages yet. Say hello!</div>
          )}
        </div>
        <div className="p-6 pt-4 border-t border-gray-200 dark:border-neutral-800">
          {replyingToCourseMsg && (
            <div className="mb-2 p-2 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800 flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-1 text-xs text-blue-600 dark:text-blue-400 mb-1">
                  <CornerUpLeft size={12} />
                  <span>Replying to {replyingToCourseMsg.userName}</span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 truncate">{replyingToCourseMsg.text}</div>
              </div>
              <button
                onClick={() => setReplyingToCourseMsg(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 ml-2"
              >
                <X size={16} />
              </button>
            </div>
          )}
          <div className="flex items-center space-x-2">
            <input
              value={courseChatText}
              onChange={(e) => setCourseChatText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') sendCourseChat(); }}
              placeholder="Type a message"
              className="flex-1 min-w-0 px-3 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-gray-400 dark:bg-neutral-800 dark:text-gray-100"
            />
            <button onClick={sendCourseChat} disabled={!courseChatText.trim()} className="flex-shrink-0 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 transition-colors">Send</button>
          </div>
        </div>
      </div>
    </div>
  );

  const GlobalChatEl = (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-neutral-900 rounded-xl w-full max-w-4xl p-6 h-[80vh] flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Messages</h2>
          <button onClick={() => { if (convUnsubRef.current) convUnsubRef.current(); if (dmUnsubRef.current) dmUnsubRef.current(); setShowGlobalChat(false); setActiveConversation(null); }}>
            <X className="text-gray-400 hover:text-gray-600" size={24} />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-4 flex-1 min-h-0">
          <div className="col-span-1 border border-gray-100 dark:border-neutral-800 rounded-lg flex flex-col">
            <div className="p-3 border-b border-gray-100 dark:border-neutral-800">
              <SearchInput
                className="w-full"
                placeholder="Search users to chat..."
                value={chatUserQuery}
                onChange={handleChatUserSearch}
              />
              {chatUserResults.length > 0 && (
                <div className="mt-2 max-h-40 overflow-y-auto border border-gray-100 dark:border-neutral-800 rounded-lg">
                  {chatUserResults.map(u => (
                    <div key={u.id} className="p-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-neutral-800" onClick={() => startDMWithUser(u)}>
                      <div className="text-sm font-medium text-gray-800 dark:text-gray-200">{u.name || u.email}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{u.email}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-neutral-800">
              {conversations.map(c => {
                const other = (c.participants || []).find(p => p.id !== (user?.id || '')) || { name: 'Conversation' };
                const isUnread = c.lastMessageSender && c.lastMessageSender !== user?.id && !(c.readBy || []).includes(user?.id);
                return (
                  <div key={c.id} className={`group p-3 hover:bg-gray-50 dark:hover:bg-neutral-800 ${activeConversation?.id === c.id ? 'bg-gray-100 dark:bg-neutral-800' : ''}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1 cursor-pointer flex items-center gap-2" onClick={() => openConversation(c)}>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <div className={`font-medium text-gray-800 dark:text-gray-200 text-sm ${isUnread ? 'font-bold' : ''}`}>{other.name}</div>
                            {isUnread && (
                              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                            )}
                          </div>
                          <div className="text-xs text-gray-400 dark:text-gray-500 truncate">{c.lastMessage || (c.updatedAt?.toDate ? c.updatedAt.toDate().toLocaleString() : '')}</div>
                        </div>
                      </div>
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (window.confirm('Delete this conversation?')) {
                            await chatAPI.deleteConversation(c.id);
                            if (activeConversation?.id === c.id) setActiveConversation(null);
                          }
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400"
                        title="Delete conversation"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
              {conversations.length === 0 && (
                <div className="p-3 text-sm text-gray-400">No conversations yet</div>
              )}
            </div>
          </div>
          <div className="col-span-2 border border-gray-100 dark:border-neutral-800 rounded-lg flex flex-col max-h-[60vh]">
            <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
              {activeConversation ? (
                <>
                  {dmMessages
                    .filter(m => !(m.deletedFor || []).includes(user?.id))
                    .map(m => (
                    <div key={m.id} className={`group text-sm ${m.userId === (user?.id) ? 'text-right' : 'text-left'}`}>
                      <div className="text-xs text-gray-400 dark:text-gray-500">{m.userId === (user?.id) ? 'You' : (m.userName || 'User')} · {m.createdAt?.toDate ? m.createdAt.toDate().toLocaleString() : ''}</div>
                      <div className="inline-flex items-center gap-2">
                        <div className={`inline-block px-3 py-2 rounded-lg ${m.userId === (user?.id) ? 'bg-neutral-700 text-white' : 'bg-gray-100 dark:bg-neutral-700 text-gray-800 dark:text-gray-200'}`}>
                          {m.replyTo && (
                            <div className="mb-1 pb-1 border-b border-gray-500 dark:border-gray-600 text-xs opacity-75">
                              <div className="font-medium">{m.replyTo.userName}</div>
                              <div className="truncate">{m.replyTo.text}</div>
                            </div>
                          )}
                          {m.text}
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                          <button
                            onClick={() => setReplyingToDM(m)}
                            className="text-xs text-gray-400 hover:text-blue-500 dark:text-gray-500 dark:hover:text-blue-400"
                            title="Reply"
                          >
                            <Reply size={14} />
                          </button>
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              try {
                                await chatAPI.deleteMessageForMe(activeConversation.id, m.id, user?.id);
                              } catch (err) {
                                console.error('Failed to delete message:', err);
                              }
                            }}
                            className="text-xs text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400"
                            title="Delete for me"
                          >
                            <Trash2 size={14} />
                          </button>
                          {m.userId === user?.id && (
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                if (window.confirm('Delete this message for everyone?')) {
                                  try {
                                    await chatAPI.deleteMessageForEveryone(activeConversation.id, m.id);
                                  } catch (err) {
                                    console.error('Failed to delete message:', err);
                                  }
                                }
                              }}
                              className="text-xs text-gray-400 hover:text-red-600 dark:text-gray-500 dark:hover:text-red-500"
                              title="Delete for everyone"
                            >
                              <X size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={dmMessagesEndRef} />
                </>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400 dark:text-gray-500">Select a conversation</div>
              )}
            </div>
            <div className="p-3 border-t border-gray-100 dark:border-neutral-800">
              {replyingToDM && (
                <div className="mb-2 p-2 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800 flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-1 text-xs text-blue-600 dark:text-blue-400 mb-1">
                      <CornerUpLeft size={12} />
                      <span>Replying to {replyingToDM.userName}</span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 truncate">{replyingToDM.text}</div>
                  </div>
                  <button
                    onClick={() => setReplyingToDM(null)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 ml-2"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <input
                  value={dmText}
                  onChange={(e) => setDmText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') sendDM(); }}
                  placeholder={activeConversation ? 'Type a message' : 'Select a conversation'}
                  disabled={!activeConversation}
                  className="flex-1 min-w-0 px-3 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-gray-400 dark:bg-neutral-900 dark:text-gray-100"
                />
                <button onClick={sendDM} disabled={!activeConversation || !dmText.trim()} className="flex-shrink-0 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 transition-colors">Send</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const LoginPage = () => (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-4xl font-bold text-gray-900 mb-2">ARMS</div>
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
              placeholder="your.email@university.edu" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              type="password" 
              id="login-password"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
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
            className="w-full bg-gray-700 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="mx-2 text-xs text-gray-400">OR</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>
          <div id="google-signin-container" className="flex justify-center"></div>
          <p className="text-center text-sm text-gray-600 dark:text-gray-300">
            Don't have an account? <span 
              className="text-gray-700 dark:text-gray-300 cursor-pointer hover:underline"
              onClick={() => setShowRegister(true)}
            >Register here</span>
          </p>
        </div>
      </div>
    </div>
  );

  const RegisterPage = () => (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-neutral-900 dark:border dark:border-neutral-800 rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">ARMS</div>
          <p className="text-gray-600 dark:text-gray-300">Create your account</p>
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
              placeholder="John Doe" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input 
              type="email" 
              id="register-email"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
              placeholder="your.email@university.edu" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              type="password" 
              id="register-password"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
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
            className="w-full bg-gray-700 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
          <p className="text-center text-sm text-gray-600 dark:text-gray-300">
            Already have an account? <span 
              className="text-gray-700 dark:text-gray-300 cursor-pointer hover:underline"
              onClick={() => setShowRegister(false)}
            >Sign in here</span>
          </p>
        </div>
      </div>
    </div>
  );

  const Sidebar = () => (
    <div className="w-64 bg-white dark:bg-neutral-900 border-r border-gray-200 dark:border-neutral-800 h-full min-h-0 flex flex-col relative z-20">
      <div className="p-6 border-b border-gray-200 dark:border-neutral-800">
        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">ARMS</div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Welcome back, {user?.name}</p>
      </div>
      
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <button 
          onClick={() => { setIsInboxOpen(false); setCurrentPage('home'); }}
          className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${currentPage === 'home' ? 'bg-gray-100 dark:bg-neutral-800 text-gray-900 dark:text-gray-100' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800'}`}
        >
          <Home size={20} />
          <span>Home</span>
        </button>
        <button 
          onClick={() => { setIsInboxOpen(false); setCurrentPage('dashboard'); }}
          className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${currentPage === 'dashboard' ? 'bg-gray-100 dark:bg-neutral-800 text-gray-900 dark:text-gray-100' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800'}`}
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
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${currentPage === 'inbox' ? 'bg-gray-100 dark:bg-neutral-800 text-gray-900 dark:text-gray-100' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800'}`}
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
          onClick={() => { setIsInboxOpen(false); setCurrentPage('rankings'); }}
          className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${currentPage === 'rankings' ? 'bg-gray-100 dark:bg-neutral-800 text-gray-900 dark:text-gray-100' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800'}`}
        >
          <Trophy size={20} />
          <span>Rankings</span>
        </button>

        <button 
          onClick={() => { setIsInboxOpen(false); setCurrentPage('notes'); }}
          className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${currentPage === 'notes' ? 'bg-gray-100 dark:bg-neutral-800 text-gray-900 dark:text-gray-100' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800'}`}
        >
          <FileText size={20} />
          <span>Personal Notes</span>
        </button>

        {/* Pinned Courses */}
        {pinnedCourseIds.length > 0 && (
          <div className="pt-4">
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-3 mb-2">Pinned</div>
            <div className="space-y-1">
              {pinnedCourseIds
                .map(id => courses.find(c => c.id === id))
                .filter(Boolean)
                .map(course => (
                  <div key={course.id} className="group flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800">
                    <button
                      onClick={() => { setCurrentPage('dashboard'); handleCourseSelect(course); }}
                      className="text-sm text-gray-700 dark:text-gray-300 truncate text-left flex-1"
                      title={`${course.shortName || course.code} - ${course.title}`}
                    >
                      {course.shortName || course.code}
                    </button>
                    <button
                      onClick={() => {
                        setPinnedCourseIds(prev => {
                          const next = prev.filter(id => id !== course.id);
                          try { if (user?.id) localStorage.setItem(getPinsKey(user.id), JSON.stringify(next)); } catch (e) {}
                          return next;
                        });
                      }}
                      className="opacity-70 group-hover:opacity-100 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
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
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-3 mb-2">Recent</div>
            <div className="space-y-1">
              {recentCourseIds
                .map(id => courses.find(c => c.id === id))
                .filter(Boolean)
                .map(course => (
                  <div key={course.id} className="group flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800">
                    <button
                      onClick={() => { setCurrentPage('dashboard'); handleCourseSelect(course); }}
                      className="text-sm text-gray-700 dark:text-gray-300 truncate text-left flex-1"
                      title={`${course.shortName || course.code} - ${course.title}`}
                    >
                      {course.shortName || course.code}
                    </button>
                    <button
                      onClick={() => {
                        setPinnedCourseIds(prev => {
                          const next = prev.includes(course.id) ? prev : [...prev, course.id];
                          try { if (user?.id) localStorage.setItem(getPinsKey(user.id), JSON.stringify(next)); } catch (e) {}
                          return next;
                        });
                      }}
                      className="opacity-70 group-hover:opacity-100 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
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
      
      <div className="p-4 border-t border-gray-200 dark:border-neutral-800 space-y-2 relative">
        {/* Popup positioned above Settings button */}
        {showPlaceholderPopup && (
          <div className="absolute bottom-full left-4 right-4 mb-2 z-50">
            <div className="bg-gray-800 dark:bg-gray-700 text-white px-3 py-2 rounded-lg shadow-lg text-xs flex items-center space-x-2">
              <span>{placeholderMessage}</span>
            </div>
          </div>
        )}
        
        <button 
          onClick={() => showPlaceholderFeature()}
          className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
        >
          <Settings size={20} />
          <span>Settings</span>
        </button>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
        <a
          href="https://github.com/Falco0906"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors text-sm"
        >
          <Github size={18} />
          <span>GitHub</span>
        </a>
      </div>
    </div>
  );

  const HeaderEl = (
    <div className="bg-white dark:bg-neutral-900 border-b border-gray-200 dark:border-neutral-800 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="search-dropdown relative">
          <SearchInput
            className="w-96"
            placeholder="Search courses, materials, or people..."
            value={searchQuery}
            onChange={debouncedGlobalSearch}
          />
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
              {searchResults.map(item => (
                <div
                  key={`${item.type}-${item.id}`}
                  className="p-3 hover:bg-gray-50 dark:hover:bg-neutral-800 cursor-pointer border-b border-gray-100 dark:border-neutral-800 last:border-b-0"
                  onClick={() => handleGlobalSearchSelect(item)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-white font-semibold text-xs uppercase">
                      {item.type === 'user' ? (item.name || item.email || '?').charAt(0) : item.type.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      {item.type === 'user' && (
                        <>
                          <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{item.name || item.email}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{item.email}</p>
                        </>
                      )}
                      {item.type === 'course' && (
                        <>
                          <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{item.code}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{item.title}</p>
                        </>
                      )}
                      {item.type === 'material' && (
                        <>
                          <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{item.title}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">Material</p>
                        </>
                      )}
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
          onClick={() => setDarkMode(v => !v)}
          className="px-3 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors flex items-center space-x-2 text-gray-700 dark:text-gray-300"
          title="Toggle theme"
        >
          {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          <span className="hidden sm:inline">{darkMode ? 'Light' : 'Dark'}</span>
        </button>
        <button 
          onClick={() => { setIsInboxOpen(false); setShowUploadModal(true); }}
          className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-2"
        >
          <Upload size={16} />
          <span>Upload</span>
        </button>
        <button
          onClick={() => { setIsInboxOpen(false); setShowGlobalChat(true); }}
          className="relative px-3 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors flex items-center space-x-2 text-gray-700 dark:text-gray-300"
          title="Chat"
        >
          <MessageCircle size={16} />
          <span>Chat</span>
          {unreadDMCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
              {unreadDMCount > 9 ? '9+' : unreadDMCount}
            </span>
          )}
        </button>
        
        <div 
          className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-white font-semibold cursor-pointer hover:bg-gray-700 transition-colors"
          onClick={async () => {
            setIsInboxOpen(false);
            console.log('User object when clicking profile:', user);
            setSelectedUser({ userId: user.id, name: user.name });
            setProfileBackTo('home');
            setLoading(true);
            setError(null);
            try {
              console.log('Fetching own profile for userId:', user.id);
              const profileData = await userAPI.getUserProfile(user.id);
              console.log('Own profile data received:', profileData.data);
              const p = profileData.data || {};
              const normalized = {
                id: p.id || user.id,
                name: p.name || user.name || '',
                email: p.email || user.email || '',
                role: p.role || 'STUDENT',
                statistics: p.statistics || { notes: 0, uploads: 0, downloads: 0, assignments: 0, code: 0, presentations: 0, documents: 0, other: 0 },
                materialsByCourse: p.materialsByCourse || {},
                recentCourses: p.recentCourses || [],
                pinnedCourses: p.pinnedCourses || [],
                materials: p.materials || [],
                badges: p.badges || [],
                achievements: p.achievements || [],
                preferences: p.preferences || {},
                social: p.social || {},
                settings: p.settings || {},
                totalUploads: p.totalUploads ?? p.statistics?.uploads ?? 0,
              };
              normalized.uploads = normalized.uploads ?? normalized.statistics.uploads ?? 0;
              normalized.downloads = normalized.downloads ?? normalized.statistics.downloads ?? 0;
              normalized.notes = normalized.notes ?? normalized.statistics.notes ?? 0;
              setUserProfile(normalized);
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
  );

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

      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-800">
        {notificationList.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            You're all caught up
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {notificationList.map(item => (
              <div key={item.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-gray-400 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 dark:text-gray-100">{item.message}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.timestamp.toLocaleString()}</p>
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

  const DashboardEl = (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {selectedCourses.length > 0 ? `Selected Courses (${selectedCourses.length})` : 'Available Courses'}
          </h1>
          <div className="flex items-center space-x-3">
            <SearchInput
              className="w-64"
              placeholder="Search courses..."
              value={courseSearchQuery}
              onChange={handleCourseSearch}
            />
            <button 
              onClick={() => { setIsInboxOpen(false); setShowFilterModal(true); }}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-neutral-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-800 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-500 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading courses...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map(course => (
              <div 
                key={course.id} 
                className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-800 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleCourseSelect(course)}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                      {course.code.substring(0, 2)}
                    </div>
                    {selectedCourses.includes(course.id) && (
                      <CheckCircle className="text-green-500" size={20} />
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{course.code}</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">{course.title}</p>
                  {course.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">{course.description}</p>
                  )}
                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
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

  const CourseDetailEl = (
    <div className="p-6 space-y-6">
      <div className="flex items-center space-x-4">
        <button 
          onClick={() => setSelectedCourse(null)}
          className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
        >
          ← Back to courses
        </button>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{selectedCourse?.code} - {selectedCourse?.title}</h1>
      </div>
      
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
          <AlertCircle className="text-red-500" size={20} />
          <span className="text-red-700">{error}</span>
        </div>
      )}
      
      {/* Recently Uploaded Section */}
      {recentMaterials.length > 0 && (() => {
        // Calculate new materials since last visit
        const lastVisitTime = courseLastVisit[selectedCourse?.id] || 0;
        const newMaterialsCount = recentMaterials.filter(m => {
          const materialTime = new Date(m.uploadedAt || m.createdAt || 0).getTime();
          return materialTime > lastVisitTime;
        }).length;
        
        return (
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-800 mb-6">
          <div className="p-6 border-b border-gray-200 dark:border-neutral-800">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Recently Uploaded</h2>
                <p className="text-gray-600 dark:text-gray-400">Latest materials added to this course</p>
              </div>
              {newMaterialsCount > 0 && (
                <div className="flex items-center space-x-2">
                  <Bell className="text-gray-500" size={20} />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{newMaterialsCount} new</span>
                </div>
              )}
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentMaterials.map(material => (
                <div key={material.id} className="border border-gray-200 dark:border-neutral-800 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">{material.title}</h3>
                    <span className={"px-2 py-1 text-xs font-medium rounded-full bg-gray-200 text-gray-800 dark:bg-neutral-800 dark:text-gray-200"}>
                      {material.type}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 mb-1">
                    <button 
                      onClick={() => material.uploader ? handleUserSelect({ userId: material.uploader.id, name: material.uploader.name }, 'course') : null}
                      className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 flex items-center space-x-1"
                    >
                      <User size={14} />
                      <span>{material.uploader?.fullName || material.uploader?.firstName || material.uploader?.name || material.uploader?.email || 'Unknown uploader'}</span>
                    </button>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    {(() => { const s = material.size ?? material.fileSize; return s ? `${(s / 1024 / 1024).toFixed(1)} MB` : 'Unknown size'; })()}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {(() => { 
                        const d = material.uploadedAt || material.createdAt; 
                        if (!d) return 'Unknown date';
                        try {
                          // Handle Firebase Timestamp
                          if (d.toDate) return d.toDate().toLocaleDateString();
                          // Handle ISO string or timestamp
                          const date = new Date(d);
                          return isNaN(date.getTime()) ? 'Unknown date' : date.toLocaleDateString();
                        } catch (e) {
                          return 'Unknown date';
                        }
                      })()}
                    </span>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleToggleLike(material.id)}
                        className={`text-sm flex items-center space-x-1 px-2 py-1 rounded dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-neutral-800 ${likedMap[material.id] ? 'text-gray-900 bg-gray-200 dark:text-gray-100 dark:bg-neutral-800' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-neutral-800'}`}
                        title="Like"
                      >
                        <ThumbsUp size={14} />
                        <span>{likesCountMap[material.id] || 0}</span>
                      </button>
                      <a 
                        href={material.url || getFileUrl(material.path)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => materialAPI.incrementDownloads(material.id, user?.id).catch(() => {})}
                        className="text-gray-700 dark:text-gray-300 text-sm flex items-center space-x-1 hover:text-gray-900 dark:hover:text-gray-100"
                      >
                        <Download size={14} />
                        <span>Download</span>
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        );
      })()}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-800">
            <div className="p-6 border-b border-gray-200 dark:border-neutral-800">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">All Course Materials</h2>
                  <p className="text-gray-600 dark:text-gray-400">Complete list of materials for this course</p>
                </div>
                <div className="flex items-center space-x-3">
                  <SearchInput
                    className="w-64"
                    placeholder="Search materials..."
                    value={materialSearchQuery}
                    onChange={handleMaterialSearch}
                  />
                  <select 
                    className="px-3 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-gray-500 dark:bg-neutral-900 dark:text-gray-100"
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
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-500 mx-auto"></div>
                <p className="text-gray-600 mt-2">Loading materials...</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredMaterials.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    {materials.length === 0 ? 
                      'No materials uploaded yet for this course.' : 
                      'No materials match your search criteria.'
                    }
                  </div>
                ) : (
                  filteredMaterials.map(material => (
                    <div key={material.id} className="p-6 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gray-200 dark:bg-neutral-700 rounded-lg flex items-center justify-center">
                            <FileText className="text-gray-700 dark:text-gray-200" size={20} />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{material.title}</h3>
                            <div className="flex items-center space-x-3">
                              <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-200 text-gray-800 dark:bg-neutral-800 dark:text-gray-200">
                                {material.type}
                              </span>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {(() => { const s = material.size ?? material.fileSize; return s ? `${(s / 1024 / 1024).toFixed(1)} MB` : 'Unknown size'; })()}
                              </div>
                            </div>
                            <div className="flex items-center mt-1">
                              <button 
                                onClick={() => material.uploader ? handleUserSelect({ userId: material.uploader.id, name: material.uploader.name }, 'course') : null}
                                className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 flex items-center space-x-1"
                              >
                                <User size={14} />
                                <span>{material.uploader?.fullName || material.uploader?.firstName || material.uploader?.name || material.uploader?.email || 'Unknown uploader'}</span>
                              </button>
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {(() => { 
                                const d = material.uploadedAt || material.createdAt; 
                                if (!d) return 'Unknown date';
                                try {
                                  // Handle Firebase Timestamp
                                  if (d.toDate) return d.toDate().toLocaleDateString();
                                  // Handle ISO string or timestamp
                                  const date = new Date(d);
                                  return isNaN(date.getTime()) ? 'Unknown date' : date.toLocaleDateString();
                                } catch (e) {
                                  return 'Unknown date';
                                }
                              })()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleToggleLike(material.id)}
                            className={`p-2 rounded-lg transition-colors dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-neutral-800 ${likedMap[material.id] ? 'text-gray-900 bg-gray-200 dark:text-gray-100 dark:bg-neutral-800' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                            title="Like"
                          >
                            <div className="flex items-center space-x-1">
                              <ThumbsUp size={16} />
                              <span className="text-sm">{likesCountMap[material.id] || 0}</span>
                            </div>
                          </button>
                          <button
                            onClick={() => toggleComments(material.id)}
                            className={`p-2 rounded-lg transition-colors dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-neutral-800 ${commentsOpen[material.id] ? 'text-gray-900 bg-gray-200 dark:text-gray-100 dark:bg-neutral-800' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                            title="Comments"
                          >
                            <div className="flex items-center space-x-1">
                              <MessageCircle size={16} />
                              <span className="text-sm">{commentCounts[material.id] || 0}</span>
                            </div>
                          </button>
                          <a 
                            href={material.url || getFileUrl(material.path)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => materialAPI.incrementDownloads(material.id, user?.id).catch(() => {})}
                            className="text-gray-700 dark:text-gray-300 p-2 rounded-lg hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
                            title="Download"
                          >
                            <Download size={16} />
                          </a>
                          {(material.uploaderId === user?.id || material.uploader?.id === user?.id) && (
                            <button
                              onClick={() => handleDeleteMaterial(material.id)}
                              className="text-red-500 dark:text-red-400 p-2 rounded-lg hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                              title="Delete material"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                      {commentsOpen[material.id] && (
                        <div className="mt-4 border-t border-gray-100 pt-4">
                          <div className="max-h-48 overflow-y-auto space-y-3">
                            {(commentsMap[material.id] || []).map(c => (
                              <div key={c.id} className="text-sm">
                                <div className="flex items-baseline justify-between">
                                  <div className="flex items-baseline space-x-2">
                                    <span className="font-medium text-gray-800 dark:text-gray-200">{c.userId === (user?.id) ? 'You' : (c.userName || 'User')}</span>
                                    <span className="text-xs text-gray-400 dark:text-gray-500">{c.createdAt?.toDate ? c.createdAt.toDate().toLocaleString() : (c.createdAt ? new Date(c.createdAt).toLocaleString() : '')}</span>
                                  </div>
                                  {c.userId === (user?.id) && (
                                    <button className="text-xs text-red-500 hover:text-red-700" onClick={() => deleteCommentFromMaterial(material.id, c)}>Delete</button>
                                  )}
                                </div>
                                <div className="text-gray-700 dark:text-gray-200">{c.text}</div>
                              </div>
                            ))}
                            {(commentsMap[material.id] || []).length === 0 && (
                              <div className="text-center text-gray-400 dark:text-gray-500">No comments yet</div>
                            )}
                          </div>
                          <div className="mt-3 flex items-center space-x-2">
                            <input
                              value={commentInputs[material.id] || ''}
                              onChange={(e) => handleCommentInputChange(material.id, e.target.value)}
                              onKeyDown={(e) => { if (e.key === 'Enter') addCommentToMaterial(material.id); }}
                              placeholder="Write a comment"
                              className="flex-1 px-3 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-gray-400 dark:bg-neutral-900 dark:text-gray-100"
                            />
                            <button onClick={() => addCommentToMaterial(material.id)} disabled={!((commentInputs[material.id] || '').trim())} className="px-3 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50">Post</button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-800 p-6 lg:col-span-1">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Course Chat</h3>
          </div>
          <div className="flex flex-col h-[480px]">
            <div className="flex-1 overflow-y-auto space-y-3 border border-gray-100 dark:border-neutral-800 rounded-lg p-3">
              {courseMessages
                .filter(m => !(m.deletedFor || []).includes(user?.id))
                .map(m => (
                <div key={m.id || Math.random()} className="group text-sm">
                  <div className="flex items-baseline justify-between">
                    <div className="flex items-baseline space-x-2">
                      <span className="font-medium text-gray-800 dark:text-gray-200">{m.userId === (user?.id) ? 'You' : (m.userName || 'User')}</span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">{m.createdAt?.toDate ? m.createdAt.toDate().toLocaleString() : (m.createdAt ? new Date(m.createdAt).toLocaleString() : '')}</span>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <button
                        onClick={() => setReplyingToCourseMsg(m)}
                        className="text-xs text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                        title="Reply"
                      >
                        Reply
                      </button>
                      {m.userId === (user?.id) && (
                        <>
                          <span className="text-gray-300 dark:text-gray-600">|</span>
                          <button
                            onClick={async () => {
                              try {
                                await chatAPI.deleteCourseMessageForMe(selectedCourse.id, m.id, user?.id);
                              } catch (err) {
                                console.error('Failed to delete message:', err);
                              }
                            }}
                            className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                            title="Delete for me"
                          >
                            Delete for me
                          </button>
                          <span className="text-gray-300 dark:text-gray-600">|</span>
                          <button
                            onClick={async () => {
                              if (window.confirm('Delete this message for everyone?')) {
                                try {
                                  await chatAPI.deleteCourseMessageForEveryone(selectedCourse.id, m.id);
                                } catch (err) {
                                  console.error('Failed to delete message:', err);
                                }
                              }
                            }}
                            className="text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                            title="Delete for everyone"
                          >
                            Delete for all
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  {m.replyTo && (
                    <div className="mt-1 mb-1 p-2 bg-gray-100 dark:bg-neutral-800 rounded border-l-2 border-gray-400 dark:border-gray-600 text-xs">
                      <div className="font-medium text-gray-600 dark:text-gray-400">{m.replyTo.userName}</div>
                      <div className="text-gray-500 dark:text-gray-500 truncate">{m.replyTo.text}</div>
                    </div>
                  )}
                  <div className="text-gray-700 dark:text-gray-200">{m.text}</div>
                </div>
              ))}
              {courseMessages.length === 0 && (
                <div className="text-center text-gray-400 dark:text-gray-500">No messages yet. Say hello!</div>
              )}
            </div>
            {replyingToCourseMsg && (
              <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800 flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-1 text-xs text-blue-600 dark:text-blue-400 mb-1">
                    <CornerUpLeft size={12} />
                    <span>Replying to {replyingToCourseMsg.userName}</span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 truncate">{replyingToCourseMsg.text}</div>
                </div>
                <button
                  onClick={() => setReplyingToCourseMsg(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 ml-2"
                >
                  <X size={16} />
                </button>
              </div>
            )}
            <div className="mt-3 flex items-center space-x-2">
              <input
                value={courseChatText}
                onChange={(e) => setCourseChatText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') sendCourseChat(); }}
                placeholder="Type a message"
                className="flex-1 min-w-0 px-3 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-gray-400 dark:bg-neutral-900 dark:text-gray-100"
              />
              <button onClick={sendCourseChat} className="flex-shrink-0 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50">Send</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const UploadModalEl = (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-neutral-900 rounded-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Upload Material</h2>
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Find Course</label>
            <div className="relative">
              <SearchInput
                className="w-full"
                placeholder="Search courses..."
                value={uploadCourseQuery}
                onChange={setUploadCourseQuery}
              />
              {uploadCourseQuery && courses.filter(c => (c.code + ' ' + c.title).toLowerCase().includes(uploadCourseQuery.toLowerCase())).slice(0,6).length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg shadow z-50 max-h-48 overflow-y-auto">
                  {courses
                    .filter(c => (c.code + ' ' + c.title).toLowerCase().includes(uploadCourseQuery.toLowerCase()))
                    .slice(0,6)
                    .map(c => (
                      <div key={c.id} className="p-2 hover:bg-gray-50 dark:hover:bg-neutral-800 cursor-pointer flex items-center justify-between" onClick={() => { setUploadForm(prev => ({ ...prev, courseId: c.id })); setUploadCourseQuery(c.code + ' - ' + c.title); }}>
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-gray-700 rounded-lg text-white text-sm font-bold flex items-center justify-center">{c.code.substring(0,2)}</div>
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{c.code}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{c.title}</div>
                          </div>
                        </div>
                        <span className="text-xs text-gray-400 dark:text-gray-500">Select</span>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Course</label>
            <select 
              className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-gray-400 dark:bg-neutral-900 dark:text-gray-100"
              value={uploadForm.courseId}
              onChange={(e) => setUploadForm(prev => ({ ...prev, courseId: e.target.value }))}
            >
              <option value="">Select a course</option>
              {courses
                .filter(course => {
                  const q = (uploadCourseQuery || '').toLowerCase();
                  if (!q) return true;
                  return (
                    course.code.toLowerCase().includes(q) ||
                    course.title.toLowerCase().includes(q) ||
                    (course.description || '').toLowerCase().includes(q)
                  );
                })
                .map(course => (
                  <option key={course.id} value={course.id}>{course.code} - {course.title}</option>
                ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Content Type</label>
            <select 
              className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-gray-400 dark:bg-neutral-900 dark:text-gray-100"
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
            <input 
              type="text" 
              className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-gray-400 dark:bg-neutral-900 dark:text-gray-100" 
              placeholder="Enter material title"
              value={uploadForm.title}
              onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">File</label>
            <input
              type="file"
              onChange={handleFileSelect}
              className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-gray-400 dark:bg-neutral-900 dark:text-gray-100"
            />
            {uploadForm.file && (
              <div className="mt-2 p-3 bg-gray-50 dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FileText size={16} className="text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{uploadForm.file.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
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
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleUpload}
              disabled={uploading || !uploadForm.courseId || !uploadForm.file}
              className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const FilterModalEl = (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-neutral-900 rounded-xl max-w-md w-full p-6 border border-gray-200 dark:border-neutral-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Select Courses</h2>
          <button onClick={() => { setShowFilterModal(false); }}>
            <X className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" size={24} />
          </button>
        </div>
        
        <div className="mb-4">
          <SearchInput
            className="w-full"
            placeholder="Search courses..."
            value={courseSearchQuery}
            onChange={handleCourseSearch}
          />
        </div>
        
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {courses.filter(course => 
            course.title.toLowerCase().includes(courseSearchQuery.toLowerCase()) ||
            course.code.toLowerCase().includes(courseSearchQuery.toLowerCase()) ||
            (course.description && course.description.toLowerCase().includes(courseSearchQuery.toLowerCase()))
          ).map(course => (
            <label key={course.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-800 cursor-pointer transition-colors">
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
                className="text-gray-700 dark:text-gray-300 focus:ring-purple-500 dark:focus:ring-purple-400 rounded"
              />
              <div className="w-8 h-8 bg-gray-700 dark:bg-gray-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                {course.code.substring(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{course.code}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{course.title}</p>
              </div>
            </label>
          ))}
        </div>
        
        <div className="flex space-x-3 pt-4 mt-4 border-t border-gray-200 dark:border-neutral-800">
          <button 
            onClick={() => setShowFilterModal(false)}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-neutral-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
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
            className="flex-1 px-4 py-2 bg-gray-700 dark:bg-gray-600 text-white rounded-lg hover:bg-gray-600 dark:hover:bg-gray-500 transition-colors"
          >
            Apply Filter
          </button>
        </div>
      </div>
    </div>
  );

  const handleImageSelect = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setNewsForm(prev => ({
        ...prev,
        imageFile: file,
        imagePreview: reader.result
      }));
    };
    reader.readAsDataURL(file);
  }, []);
  
  const handleCreateNews = useCallback(async () => {
      if (!newsForm.title) {
        setError('Please enter a title');
        return;
      }
      
      if (!newsForm.imageFile) {
        setError('Please select an image');
        return;
      }

      setLoading(true);
      setError(null);
      try {
        // Upload image to Supabase
        const { supabase, STORAGE_BUCKET } = await import('./supabaseClient');
        const fileName = `news/${Date.now()}-${newsForm.imageFile.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from(STORAGE_BUCKET)
          .upload(fileName, newsForm.imageFile);
        
        if (uploadError) throw uploadError;
        
        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from(STORAGE_BUCKET)
          .getPublicUrl(fileName);
        
        // Create news with image URL
        await newsAPI.createNews({
          title: newsForm.title,
          content: newsForm.content || '',
          type: newsForm.type,
          imageUrl: publicUrl,
          createdBy: user?.email
        });
        
        setShowCreateNews(false);
        setNewsForm({ title: '', content: '', type: 'ANNOUNCEMENT', imageFile: null, imagePreview: null });
        
        // Refresh news
        const newsData = await newsAPI.getRecentNews(5);
        setNews(newsData.data);
      } catch (err) {
        setError(handleAPIError(err));
      } finally {
        setLoading(false);
      }
  }, [newsForm, user]);

  const CreateNewsModal = React.memo(() => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-neutral-900 rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Upload News/Event Image</h2>
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
              <input 
                type="text"
                autoFocus
                className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-gray-500 dark:bg-neutral-800 dark:text-gray-100" 
                placeholder="e.g., Mid-Term Exam Timetable"
                value={newsForm.title}
                onChange={(e) => setNewsForm(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-gray-500 dark:bg-neutral-800 dark:text-gray-100"
                value={newsForm.type}
                onChange={(e) => setNewsForm(prev => ({ ...prev, type: e.target.value }))}
              >
                <option value="ANNOUNCEMENT">Announcement</option>
                <option value="EVENT">Event</option>
                <option value="TIMETABLE">Timetable</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description (Optional)</label>
              <textarea 
                className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-gray-500 dark:bg-neutral-800 dark:text-gray-100 h-20" 
                placeholder="Add any additional details..."
                value={newsForm.content}
                onChange={(e) => setNewsForm(prev => ({ ...prev, content: e.target.value }))}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Image *</label>
              <input 
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-gray-500 dark:bg-neutral-800 dark:text-gray-100"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Max size: 5MB. Supported: JPG, PNG, GIF, WebP</p>
            </div>
            
            {newsForm.imagePreview && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Preview</label>
                <img 
                  src={newsForm.imagePreview} 
                  alt="Preview" 
                  className="w-full max-h-96 object-contain rounded-lg border border-gray-300 dark:border-neutral-700"
                />
              </div>
            )}
            
            <div className="flex space-x-3 pt-4">
              <button 
                onClick={() => setShowCreateNews(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateNews}
                disabled={loading || !newsForm.title || !newsForm.imageFile}
                className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
              >
                {loading ? 'Uploading...' : 'Upload Image'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  });

  if (!user) {
    if (showRegister) {
      return <RegisterPage />;
    }
    return <LoginPage />;
  }

  return (
    <div className="h-screen flex bg-gray-50 dark:bg-neutral-950 text-gray-900 dark:text-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {HeaderEl}
        <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-neutral-950">
          {currentPage === 'home' && <HomePage user={user} setShowCreateNews={setShowCreateNews} error={error} news={news} onDeleteNews={handleDeleteNews} onUserSelect={handleUserSelect} />}
          {currentPage === 'dashboard' && selectedCourse ? (
            CourseDetailEl
          ) : currentPage === 'dashboard' ? (
            DashboardEl
          ) : null}
          {currentPage === 'rankings' && <Rankings />}
          {currentPage === 'notes' && <NotesPage />}
          {currentPage === 'user-profile' && userProfile && (
            <UserProfile 
              user={userProfile}
              currentUserId={user?.id}
              onBack={() => {
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
            />
          )}
        </div>
      </div>
      
      {showUploadModal && UploadModalEl}
      {showFilterModal && FilterModalEl}
      {showCreateNews && <CreateNewsModal />}
      {showCourseChat && CourseChatEl}
      {showGlobalChat && GlobalChatEl}
      <NotificationSidebar 
        isOpen={isInboxOpen}
        onClose={() => setIsInboxOpen(false)}
        items={notificationList}
        onMarkAllRead={() => setNotifications(0)}
        onClearAll={() => { setNotificationList([]); setNotifications(0); }}
        onItemClick={(item) => {
          if (item.type === 'message' && item.conversationId) {
            const conv = conversations.find(c => c.id === item.conversationId);
            if (conv) {
              setIsInboxOpen(false);
              setShowGlobalChat(true);
              setTimeout(() => openConversation(conv), 100);
            }
          }
        }}
      />
    </div>
  );
};

export default ARMSPlatform;
