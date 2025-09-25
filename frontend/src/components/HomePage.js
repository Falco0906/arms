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
  HelpCircle
} from 'lucide-react';
import { newsAPI, courseAPI, materialAPI, userAPI, getFileUrl } from '../services/api';

const HomePage = ({ user, setShowCreateNews, error, selectedCourse, onCourseSelect }) => {
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
      const files = (downloadsData?.data || []).slice(0, 6).map(file => ({
        id: file.id,
        title: file.title || file.name || 'Untitled',
        downloads: file.downloads || file.downloadCount || 0,
        path: file.path || file.url || '',
        courseCode: file.courseCode || file.course?.code,
        courseName: file.courseName || file.course?.title,
        uploaderName: file.uploader?.name,
        uploaderAvatar: file.uploader?.avatar,
        uploaderId: file.uploader?.id || file.uploaderId
      }));
      setTopDownloads(files);
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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-indigo-600" />
              <h1 className="ml-2 text-xl font-semibold text-gray-900">ARMS Platform</h1>
            </div>
            <div></div>
          </div>
        </div>
      </header>

      <div className="py-10">
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <h1 className="text-3xl font-bold text-gray-900">Good {getTimeOfDay()}</h1>
              <button
                onClick={() => { setGuideStep(0); setShowGuide(true); }}
                className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
              >
                <HelpCircle size={16} className="text-indigo-600" />
                <span>Get started</span>
              </button>
            </div>
            {(user?.role === 'FACULTY' || user?.role === 'ADMIN') && (
              <button 
                onClick={() => setShowCreateNews(true)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
              >
                <Plus size={16} />
                <span>Create Event</span>
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

            {/* Upcoming Events - Full Width */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="border-b border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900">Upcoming Events</h2>
                    <p className="text-gray-500 mt-1">Stay updated with latest events and deadlines</p>
                  </div>
                  <Calendar size={24} className="text-gray-400" />
                </div>
              </div>
              
              <div className="p-6">
                {loading.events ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {upcomingEvents.map(event => (
                      <div key={event.id} className="flex items-start space-x-4 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                        <div className="w-16 text-center p-2 bg-indigo-50 rounded-lg">
                          <div className="text-xl font-bold text-indigo-600">{new Date(event.date).toLocaleDateString('en-US', { day: '2-digit' })}</div>
                          <div className="text-sm font-medium text-indigo-500">{new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}</div>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-gray-900 mb-1">{event.title}</h4>
                          <p className="text-gray-600 mb-2">{event.description}</p>
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock size={14} className="mr-1" />
                            {new Date(event.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    ))}
                    {upcomingEvents.length === 0 && (
                      <div className="col-span-3 text-center py-8 text-gray-500">
                        No upcoming events
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Featured Uploads - Full Width */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">Featured Uploads</h2>
                  <p className="text-sm text-gray-500 mt-1">Highlighted and popular materials</p>
                </div>
                <Star size={24} className="text-gray-400" />
              </div>
              
              {loading.downloads ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                  <p className="text-gray-600 mt-2">Loading materials...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {topDownloads.map(file => (
                    <div key={file.id} className="flex flex-col p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-3 mb-3">
                        <FileText size={20} className="text-gray-400 flex-shrink-0" />
                        <div className="min-w-0">
                          <h4 className="text-base font-medium text-gray-900 truncate">{file.title}</h4>
                          <p className="text-sm text-gray-500">{file.downloads} downloads</p>
                        </div>
                      </div>
                      <div className="mb-3">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">{file.courseCode}</span> - {file.courseName}
                        </p>
                      </div>
                      <div className="flex items-center justify-between mt-auto">
                        <div 
                          onClick={() => handleUserProfileClick(file.uploaderId)}
                          className="flex items-center space-x-2 cursor-pointer"
                        >
                          <img
                            src={file.uploaderAvatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'}
                            alt={file.uploaderName}
                            className="h-6 w-6 rounded-full"
                          />
                          <span className="text-sm text-gray-600">{file.uploaderName}</span>
                        </div>
                        <a 
                          href={getFileUrl(file.path || file.url || '')} 
                          className="text-indigo-600 hover:text-indigo-700 p-2"
                          title="Download file"
                          target="_blank" rel="noopener noreferrer"
                        >
                          <Download size={16} />
                        </a>
                      </div>
                    </div>
                  ))}
                  {topDownloads.length === 0 && (
                    <div className="col-span-3 text-center py-8 text-gray-500">
                      <FileText className="mx-auto text-gray-400 mb-3" size={32} />
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
          <div className="relative bg-white rounded-xl shadow-lg border border-gray-200 max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-semibold text-gray-900">{guideSteps[guideStep].title}</h3>
              <button onClick={() => setShowGuide(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <p className="text-gray-600 mb-6">{guideSteps[guideStep].body}</p>
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowGuide(false)}
                className="px-3 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Skip tour
              </button>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setGuideStep(Math.max(0, guideStep - 1))}
                  disabled={guideStep === 0}
                  className={`px-3 py-2 text-sm border rounded-lg ${guideStep === 0 ? 'text-gray-400 border-gray-200' : 'text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                >
                  Back
                </button>
                {guideStep < guideSteps.length - 1 ? (
                  <button
                    onClick={() => setGuideStep(Math.min(guideSteps.length - 1, guideStep + 1))}
                    className="px-3 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    onClick={() => setShowGuide(false)}
                    className="px-3 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
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