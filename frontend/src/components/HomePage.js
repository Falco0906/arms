import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  FileText, 
  AlertCircle, 
  BookOpen,
  Calendar,
  Download,
  Clock,
  Star,
  User,
  HelpCircle,
  Trash2
} from 'lucide-react';
import { newsAPI, courseAPI, materialAPI, userAPI, getFileUrl } from '../services/api';

const HomePage = ({ user, setShowCreateNews, error, selectedCourse, onCourseSelect, news = [], onDeleteNews, onUserSelect }) => {
  const [recentCourses, setRecentCourses] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [topDownloads, setTopDownloads] = useState([]);
  const [loading, setLoading] = useState({
    courses: false,
    events: false,
    downloads: false
  });
  const [showGuide, setShowGuide] = useState(false);
  const [guideStep, setGuideStep] = useState(0);

  // Load initial data and set up polling for recent courses
  useEffect(() => {
    const loadData = async () => {
      await loadInitialData();
    };
    loadData();

    // Set up polling to refresh recent courses every 30 seconds
    const interval = setInterval(async () => {
      try {
        const coursesData = await courseAPI.getRecentCourses();
        setRecentCourses(coursesData.data.slice(0, 4));
      } catch (err) {
        console.error('Failed to refresh recent courses:', err);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Update recent courses when a course is selected
  useEffect(() => {
    const updateRecentCourses = async () => {
      if (!selectedCourse) return;
      
      try {
        // First update the backend
        await courseAPI.addRecentCourse(selectedCourse.id);
        
        // Then immediately fetch the updated list
        const coursesData = await courseAPI.getRecentCourses();
        if (coursesData && coursesData.data) {
          setRecentCourses(coursesData.data.slice(0, 4));
        }
      } catch (err) {
        console.error('Failed to update recent courses:', err);
      }
    };

    updateRecentCourses();
  }, [selectedCourse]);

  const loadInitialData = async () => {
    // Load recently visited courses
    setLoading(prev => ({ ...prev, courses: true }));
    try {
      const coursesData = await courseAPI.getRecentCourses();
      setRecentCourses(coursesData.data.slice(0, 4));
    } catch (err) {
      console.error('Failed to load recent courses:', err);
    } finally {
      setLoading(prev => ({ ...prev, courses: false }));
    }

    // Load upcoming events
    setLoading(prev => ({ ...prev, events: true }));
    try {
      const eventsData = await newsAPI.getUpcomingEvents();
      setUpcomingEvents(eventsData.data);
    } catch (err) {
      console.error('Failed to load events:', err);
    } finally {
      setLoading(prev => ({ ...prev, events: false }));
    }

    // Load most downloaded files
    setLoading(prev => ({ ...prev, downloads: true }));
    try {
      const downloadsData = await materialAPI.getTopDownloads();
      const filesWithUploaders = await Promise.all(
        (downloadsData?.data || []).slice(0, 6).map(async (file) => {
          let uploaderData = file.uploader;
          
          // Fetch uploader data if missing
          if (!uploaderData && file.uploaderId) {
            try {
              const userData = await userAPI.getUserById(file.uploaderId);
              uploaderData = {
                id: userData.id,
                name: userData.name || userData.email || 'Unknown',
                email: userData.email
              };
            } catch (e) {
              console.error('Failed to fetch uploader:', e);
            }
          }
          
          // Get course short name
          let courseShortName = file.courseCode || file.course?.code;
          const courseNameMap = {
            '24SC2006A': 'OOPS',
            '24AD2103A': 'DBMS', 
            '24CS2101': 'OS',
            '24MT2019': 'P&S',
            '24SDCS01A': 'FEDF',
            '24CS06HF': 'ADS',
            '24AD2102': 'DSV'
          };
          courseShortName = courseNameMap[courseShortName] || courseShortName;
          
          return {
            id: file.id,
            title: file.title || file.name || 'Untitled',
            downloads: file.downloads || file.downloadCount || 0,
            url: file.url,
            path: file.path,
            courseCode: courseShortName,
            courseName: file.courseName || file.course?.title,
            uploaderName: uploaderData?.name || 'Unknown',
            uploaderId: uploaderData?.id || file.uploaderId,
            courseId: file.courseId || file.course?.id
          };
        })
      );
      setTopDownloads(filesWithUploaders);
    } catch (err) {
      console.error('Failed to load top downloads:', err);
      setTopDownloads([]);
    } finally {
      setLoading(prev => ({ ...prev, downloads: false }));
    }
  };

  const handleCourseClick = async (courseId) => {
    try {
      // First call the parent's onCourseSelect handler
      if (onCourseSelect) {
        await onCourseSelect(courseId);
      }
      
      // Then manually trigger a refresh of recent courses
      const coursesData = await courseAPI.getRecentCourses();
      if (coursesData && coursesData.data) {
        setRecentCourses(coursesData.data.slice(0, 4));
      }
    } catch (err) {
      console.error('Failed to handle course click:', err);
    }
  };

  const handleUserProfileClick = async (uploaderId) => {
    if (!uploaderId || !onUserSelect) return;
    try {
      const userData = await userAPI.getUserById(uploaderId);
      onUserSelect(userData, 'home');
    } catch (err) {
      console.error('Failed to load user profile:', err);
    }
  };

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  };

  const guideSteps = [
    {
      title: 'Welcome to ARMS! 🎓',
      body: 'Academic Resource Management System - Your one-stop platform for course materials, notes, and collaboration.'
    },
    {
      title: 'News & Announcements 📰',
      body: 'Check the homepage for exam timetables, important announcements, and event updates. Click any image to view full size.'
    },
    {
      title: 'Dashboard & Courses 📚',
      body: 'Browse courses using short names (OOPS, DBMS, etc.). Click a course to view materials, search, filter by type, and download resources. You can also delete your own uploads.'
    },
    {
      title: 'Upload Materials 📤',
      body: 'Click Upload in the top bar to share notes, assignments, code, and more. Select course, type, and add a description. Your uploads appear in your profile and course pages.'
    },
    {
      title: 'Course Chat 💬',
      body: 'Each course has a dedicated chat in the sidebar. Ask questions, discuss topics, and collaborate. Hover over your messages to delete them (for you or for everyone).'
    },
    {
      title: 'Direct Messages 📨',
      body: 'Click the inbox icon to chat privately with other users. Start conversations from user profiles or the chat page. Messages are private and secure.'
    },
    {
      title: 'Rankings & Profiles 🏆',
      body: 'See top contributors in Rankings. Click any user to view their profile, uploaded materials, and statistics. Edit your own profile name by clicking the edit icon.'
    },
    {
      title: 'Personal Notes 📝',
      body: 'Keep private notes in the sidebar. Notes auto-save locally and remain after logout. Perfect for quick reminders and study notes.'
    },
    {
      title: 'Search & Filter 🔍',
      body: 'Use the global search bar to find courses, materials, or people. Filter materials by type (Notes, Assignments, Code, etc.) in course pages.'
    },
    {
      title: 'Dark Mode 🌙',
      body: 'Toggle dark mode in settings (top-right). Your preference is saved and works across all pages for comfortable viewing.'
    }
  ];

  return (
    <div className="min-h-screen bg-transparent dark:bg-transparent">
      <header className="bg-white dark:bg-neutral-900 shadow-sm border-b border-gray-200 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-gray-400" />
              <h1 className="ml-2 text-xl font-semibold text-gray-900 dark:text-gray-100">ARMS Platform</h1>
            </div>
            <div></div>
          </div>
        </div>
      </header>

      <div className="py-10">
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Good {getTimeOfDay()}</h1>
              <button
                onClick={() => { setGuideStep(0); setShowGuide(true); }}
                className="flex items-center space-x-2 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-sm dark:text-gray-300"
              >
                <HelpCircle size={16} className="text-gray-400" />
                <span>Get started</span>
              </button>
            </div>

            {user?.email === '2410080079@klh.edu.in' && (
              <button 
                onClick={() => setShowCreateNews(true)}
                className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-2"
              >
                <Plus size={16} />
                <span>Upload News/Event</span>
              </button>
            )}
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 mb-6">
              <AlertCircle className="text-red-500" size={20} />
              <span className="text-red-700">{error}</span>
            </div>
          )}

          <div className="space-y-6">

            {/* News & Announcements - Full Width */}
            <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-800">
              <div className="border-b border-gray-200 dark:border-neutral-800 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">News & Announcements</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Important updates, timetables, and events</p>
                  </div>
                  <Calendar size={24} className="text-gray-400" />
                </div>
              </div>
              
              <div className="p-6">
                {news && news.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {news.map(item => (
                      <div key={item.id} className="group rounded-lg border border-gray-200 dark:border-neutral-800 overflow-hidden hover:shadow-lg transition-all">
                        {item.imageUrl && (
                          <div className="aspect-video w-full overflow-hidden bg-gray-100 dark:bg-neutral-800 relative">
                            <img 
                              src={item.imageUrl} 
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                              onClick={() => window.open(item.imageUrl, '_blank')}
                            />
                            {user?.email === '2410080079@klh.edu.in' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (window.confirm('Delete this news item?')) {
                                    onDeleteNews?.(item.id);
                                  }
                                }}
                                className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                title="Delete news"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        )}
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className={`text-xs font-semibold px-2 py-1 rounded ${
                              item.type === 'URGENT' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                              item.type === 'TIMETABLE' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                              item.type === 'EVENT' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                              'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                            }`}>
                              {item.type}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {item.createdAt?.toDate ? item.createdAt.toDate().toLocaleDateString() : 
                               item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}
                            </span>
                          </div>
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{item.title}</h4>
                          {item.content && (
                            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{item.content}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <Calendar size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No announcements yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* Featured Uploads - Full Width */}
            <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-800 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Featured Uploads</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Highlighted and popular materials</p>
                </div>
                <Star size={24} className="text-gray-400" />
              </div>
              
              {loading.downloads ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
                  <p className="text-gray-600 mt-2">Loading materials...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {topDownloads.map(file => (
                    <div key={file.id} className="flex flex-col p-4 rounded-lg border border-gray-200 dark:border-neutral-800 hover:shadow-md dark:hover:bg-neutral-800 transition-all">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="p-2 bg-gray-100 dark:bg-neutral-800 rounded-lg">
                          <FileText size={20} className="text-gray-600 dark:text-gray-400 flex-shrink-0" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100 truncate">{file.title}</h4>
                          <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                            <Download size={12} />
                            <span>{file.downloads} downloads</span>
                          </div>
                        </div>
                      </div>
                      <div className="mb-3 flex-1">
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          <span className="inline-block px-2 py-1 bg-gray-100 dark:bg-neutral-800 rounded font-medium text-gray-700 dark:text-gray-300">{file.courseCode}</span>
                          {file.courseName && <span className="ml-2">{file.courseName}</span>}
                        </p>
                      </div>
                      <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100 dark:border-neutral-700">
                        <button 
                          onClick={() => file.uploaderId && handleUserProfileClick(file.uploaderId)}
                          className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                          disabled={!file.uploaderId}
                          title={`View ${file.uploaderName}'s profile`}
                        >
                          <User size={14} className="flex-shrink-0" />
                          <span className="truncate max-w-[120px]">{file.uploaderName}</span>
                        </button>
                        <a 
                          href={file.url || getFileUrl(file.path || '')} 
                          className="flex items-center space-x-1 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm"
                          title="Download file"
                          download
                          onClick={async (e) => {
                            // Track download
                            try {
                              await materialAPI.incrementDownload(file.id);
                            } catch (err) {
                              console.error('Failed to track download:', err);
                            }
                          }}
                        >
                          <Download size={14} />
                          <span>Download</span>
                        </a>
                      </div>
                    </div>
                  ))}
                  {topDownloads.length === 0 && (
                    <div className="col-span-3 text-center py-8 text-gray-500 dark:text-gray-400">
                      <FileText className="mx-auto text-gray-400 dark:text-gray-500 mb-3" size={32} />
                      <p>No downloads yet</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black bg-opacity-30" onClick={() => setShowGuide(false)}></div>
          <div className="relative bg-white dark:bg-neutral-900 rounded-xl shadow-lg border border-gray-200 dark:border-neutral-800 max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{guideSteps[guideStep].title}</h3>
              <button onClick={() => setShowGuide(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">✕</button>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-6">{guideSteps[guideStep].body}</p>
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowGuide(false)}
                className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Skip tour
              </button>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setGuideStep(Math.max(0, guideStep - 1))}
                  disabled={guideStep === 0}
                  className={`px-3 py-2 text-sm border rounded-lg ${guideStep === 0 ? 'text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-700' : 'text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                >
                  Back
                </button>
                {guideStep < guideSteps.length - 1 ? (
                  <button
                    onClick={() => setGuideStep(Math.min(guideSteps.length - 1, guideStep + 1))}
                    className="px-3 py-2 text-sm bg-gray-700 text-white rounded-lg hover:bg-gray-600"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    onClick={() => setShowGuide(false)}
                    className="px-3 py-2 text-sm bg-gray-700 text-white rounded-lg hover:bg-gray-600"
                  >
                    Finish
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;