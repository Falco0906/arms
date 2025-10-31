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
  HelpCircle
} from 'lucide-react';
import { newsAPI, courseAPI, materialAPI, userAPI, getFileUrl } from '../services/api';

const HomePage = ({ user, setShowCreateNews, error, selectedCourse, onCourseSelect, news = [] }) => {
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
          
          return {
            id: file.id,
            title: file.title || file.name || 'Untitled',
            downloads: file.downloads || file.downloadCount || 0,
            url: file.url,
            path: file.path,
            courseCode: file.courseCode || file.course?.code,
            courseName: file.courseName || file.course?.title,
            uploaderName: uploaderData?.name || 'Unknown',
            uploaderId: uploaderData?.id || file.uploaderId
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

  const handleUserProfileClick = (userId) => {
    window.location.href = `/profile/${userId}`;
  };

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  };

  const guideSteps = [
    {
      title: 'Welcome to ARMS',
      body: 'This quick tour will help you find your way around the platform.'
    },
    {
      title: 'Inbox',
      body: 'Open Inbox from the left sidebar to view uploads and updates related to your activity.'
    },
    {
      title: 'Dashboard & Courses',
      body: 'Browse all courses in Dashboard. Click a course to view materials, filter by type, search, and open an uploader\'s profile from each material.'
    },
    {
      title: 'Upload',
      body: 'Use the Upload button in the top bar to add notes, assignments, code, and more.'
    },
    {
      title: 'Rankings & Profiles',
      body: 'See top contributors in Rankings and open any user to view their profile and materials. The profile back button returns to where you came from (home/rankings/course).'
    },
    {
      title: 'Pinned & Recent',
      body: 'Use the sidebar to access Pinned courses and Recently visited courses. Pins and recents are saved per user and persist across logins.'
    },
    {
      title: 'Personal Notes',
      body: 'Keep private notes using the Personal Notes page in the sidebar. Notes auto-save locally per user and remain after logout.'
    },
    {
      title: 'Google Sign-In',
      body: 'Sign in with your college Google account (@klh.edu.in). Other accounts are blocked for security.'
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
                      <div key={item.id} className="group rounded-lg border border-gray-200 dark:border-neutral-800 overflow-hidden hover:shadow-lg transition-all cursor-pointer">
                        {item.imageUrl && (
                          <div className="aspect-video w-full overflow-hidden bg-gray-100 dark:bg-neutral-800">
                            <img 
                              src={item.imageUrl} 
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onClick={() => window.open(item.imageUrl, '_blank')}
                            />
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
                    <div key={file.id} className="flex flex-col p-4 rounded-lg border border-gray-200 dark:border-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-900 transition-colors">
                      <div className="flex items-center space-x-3 mb-3">
                        <FileText size={20} className="text-gray-400 flex-shrink-0" />
                        <div className="min-w-0">
                          <h4 className="text-base font-medium text-gray-900 dark:text-gray-100 truncate">{file.title}</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{file.downloads} downloads</p>
                        </div>
                      </div>
                      <div className="mb-3">
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          <span className="font-medium">{file.courseCode}</span> - {file.courseName}
                        </p>
                      </div>
                      <div className="flex items-center justify-between mt-auto">
                        <button 
                          onClick={() => file.uploaderId && handleUserProfileClick(file.uploaderId)}
                          className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                          disabled={!file.uploaderId}
                        >
                          <User size={16} className="flex-shrink-0" />
                          <span>{file.uploaderName}</span>
                        </button>
                        <a 
                          href={file.url || getFileUrl(file.path || '')} 
                          className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 p-2 transition-colors"
                          title="Download file"
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          <Download size={16} />
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