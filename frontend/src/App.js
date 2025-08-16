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
  Users
} from 'lucide-react';
import CourseDetail from './components/dashboard/CourseDetail';
import UserProfile from './components/rankings/UserProfile';
import RegisterPage from './components/auth/RegisterPage';

const OOPSPlatform = () => {
  const [currentPage, setCurrentPage] = useState('login');
  const [user, setUser] = useState(null);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState(3);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showRegister, setShowRegister] = useState(false);

  // Mock data
  const courses = [
    { id: 1, code: 'CS101', name: 'Data Structures', notifications: 2, color: 'bg-blue-500' },
    { id: 2, code: 'CS201', name: 'Operating Systems', notifications: 0, color: 'bg-green-500' },
    { id: 3, code: 'CS301', name: 'Database Systems', notifications: 1, color: 'bg-purple-500' },
    { id: 4, code: 'MATH101', name: 'Linear Algebra', notifications: 0, color: 'bg-orange-500' },
    { id: 5, code: 'CS401', name: 'Machine Learning', notifications: 3, color: 'bg-red-500' },
    { id: 6, code: 'CS501', name: 'Software Engineering', notifications: 1, color: 'bg-indigo-500' }
  ];

  const rankings = [
    { id: 1, name: 'Sarah Chen', uploads: 156, avatar: '👩‍💻', contributions: { 'CS101': 45, 'CS201': 32, 'CS301': 79 } },
    { id: 2, name: 'Alex Kumar', uploads: 142, avatar: '👨‍🎓', contributions: { 'CS101': 38, 'CS401': 56, 'MATH101': 48 } },
    { id: 3, name: 'Emily Rodriguez', uploads: 128, avatar: '👩‍🔬', contributions: { 'CS301': 67, 'CS501': 34, 'CS401': 27 } }
  ];

  const newsItems = [
    {
      id: 1,
      title: 'New CS401 Machine Learning Materials Available',
      author: 'Prof. Johnson',
      time: '2 hours ago',
      content: 'Latest lecture notes and assignments for Week 8 have been uploaded.',
      type: 'announcement'
    },
    {
      id: 2,
      title: 'Database Systems Midterm Results',
      author: 'Prof. Smith',
      time: '1 day ago',
      content: 'Midterm exam results and feedback are now available in CS301.',
      type: 'news'
    }
  ];

  const recentUploads = [
    { id: 1, title: 'Sorting Algorithms Implementation', course: 'CS101', type: 'code', uploader: 'Sarah Chen', time: '30 min ago' },
    { id: 2, title: 'Process Scheduling Notes', course: 'CS201', type: 'notes', uploader: 'Alex Kumar', time: '1 hour ago' },
    { id: 3, title: 'SQL Query Examples', course: 'CS301', type: 'document', uploader: 'Emily Rodriguez', time: '2 hours ago' }
  ];

  const LoginPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-4xl font-bold text-indigo-600 mb-2">ARMS</div>
          <p className="text-gray-600">Academic Resource Management System</p>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" placeholder="your.email@university.edu" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
          </div>
          <button 
            onClick={() => {
              setUser({ name: 'John Doe', email: 'john@university.edu' });
              setCurrentPage('home');
              setSelectedCourses([1, 3, 5]);
            }}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Sign In
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
          onClick={() => {
            setUser(null);
            setCurrentPage('login');
          }}
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
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search courses, materials, or people..."
            className="pl-10 pr-4 py-2 w-96 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
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
        
        <div className="relative">
          <Bell className="text-gray-600 cursor-pointer hover:text-gray-800" size={24} />
          {notifications > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {notifications}
            </span>
          )}
        </div>
        
        <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white font-semibold cursor-pointer">
          {user?.name?.charAt(0)}
        </div>
      </div>
    </div>
  );

  const HomePage = () => (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">University News & Announcements</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {newsItems.map(item => (
            <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-xl font-semibold text-gray-900">{item.title}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.type === 'announcement' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                  {item.type}
                </span>
              </div>
              <p className="text-gray-600 mb-4">{item.content}</p>
              <div className="flex items-center text-sm text-gray-500">
                <User size={16} className="mr-1" />
                <span className="mr-4">{item.author}</span>
                <Calendar size={16} className="mr-1" />
                <span>{item.time}</span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Uploads</h3>
            <div className="space-y-3">
              {recentUploads.map(upload => (
                <div key={upload.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${upload.type === 'code' ? 'bg-green-100' : upload.type === 'notes' ? 'bg-blue-100' : 'bg-purple-100'}`}>
                    {upload.type === 'code' ? <FileText size={16} className="text-green-600" /> : 
                     upload.type === 'notes' ? <BookOpen size={16} className="text-blue-600" /> : 
                     <FileText size={16} className="text-purple-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{upload.title}</p>
                    <p className="text-xs text-gray-500">{upload.course} • {upload.uploader}</p>
                    <p className="text-xs text-gray-400">{upload.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const Dashboard = () => (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
        <button 
          onClick={() => setShowFilterModal(true)}
          className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Filter size={16} />
          <span>Filter Courses</span>
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.filter(course => selectedCourses.includes(course.id)).map(course => (
          <div 
            key={course.id} 
            className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setSelectedCourse(course)}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${course.color} rounded-lg flex items-center justify-center text-white font-bold text-lg`}>
                  {course.code.substring(0, 2)}
                </div>
                {course.notifications > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
                    {course.notifications}
                  </span>
                )}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{course.code}</h3>
              <p className="text-gray-600 mb-4">{course.name}</p>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span className="flex items-center">
                  <Users size={16} className="mr-1" />
                  245 students
                </span>
                <span className="flex items-center">
                  <FileText size={16} className="mr-1" />
                  12 materials
                </span>
              </div>
            </div>
            <div className="px-6 py-3 bg-gray-50 rounded-b-xl">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Recently uploaded</span>
                <span className="text-indigo-600 font-medium">View all</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const Rankings = () => (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Top Contributors</h1>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Leaderboard</h2>
          <p className="text-gray-600">Based on total uploads and contributions</p>
        </div>
        
        <div className="divide-y divide-gray-200">
          {rankings.map((user, index) => (
            <div 
              key={user.id} 
              className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => setSelectedUser({ ...user, rank: index + 1, role: 'STUDENT' })}
            >
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-8 h-8">
                  {index === 0 && <Trophy className="text-yellow-500" size={24} />}
                  {index === 1 && <Star className="text-gray-400" size={24} />}
                  {index === 2 && <Star className="text-orange-400" size={24} />}
                  {index > 2 && <span className="text-gray-400 font-semibold">{index + 1}</span>}
                </div>
                
                <div className="text-3xl">{user.avatar}</div>
                
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                  <p className="text-gray-600">{user.uploads} total uploads</p>
                </div>
                
                <div className="text-right">
                  <div className="text-2xl font-bold text-indigo-600">{user.uploads}</div>
                  <div className="text-sm text-gray-500">uploads</div>
                </div>
              </div>
              
              <div className="mt-4 ml-16">
                <div className="flex flex-wrap gap-2">
                  {Object.entries(user.contributions).map(([course, count]) => (
                    <span key={course} className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded-md">
                      {course}: {count}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
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
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
              <option value="">Select a course</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>{course.code} - {course.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content Type</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
              <option value="">Select type</option>
              <option value="notes">Lecture Notes</option>
              <option value="assignment">Assignment</option>
              <option value="code">Code/Lab</option>
              <option value="presentation">Presentation</option>
              <option value="document">Document</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" placeholder="Enter material title" />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">File</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-400 transition-colors cursor-pointer">
              <Upload className="mx-auto text-gray-400 mb-2" size={32} />
              <p className="text-gray-600">Click to browse or drag files here</p>
              <p className="text-sm text-gray-400 mt-1">Max size: 50MB</p>
            </div>
          </div>
          
          <div className="flex space-x-3 pt-4">
            <button 
              onClick={() => setShowUploadModal(false)}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
              Upload
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
            />
          </div>
        </div>
        
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {courses.map(course => (
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
              <div className={`w-8 h-8 ${course.color} rounded-lg flex items-center justify-center text-white text-sm font-bold`}>
                {course.code.substring(0, 2)}
              </div>
              <div>
                <p className="font-medium text-gray-900">{course.code}</p>
                <p className="text-sm text-gray-600">{course.name}</p>
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
            onClick={() => setShowFilterModal(false)}
            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );

  if (!user) {
    if (showRegister) {
      return (
        <RegisterPage 
          onBackToLogin={() => setShowRegister(false)}
          onRegister={(userData) => {
            // In a real app, this would make an API call
            console.log('Registering user:', userData);
            setShowRegister(false);
            // For demo purposes, auto-login after registration
            setUser({ 
              name: `${userData.firstName} ${userData.lastName}`, 
              email: userData.email,
              role: userData.role
            });
            setCurrentPage('home');
            setSelectedCourses([1, 3, 5]);
          }}
        />
      );
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
            <CourseDetail 
              course={selectedCourse} 
              onBack={() => setSelectedCourse(null)} 
            />
          ) : (
            <Dashboard />
          )}
          {currentPage === 'rankings' && selectedUser ? (
            <UserProfile 
              user={selectedUser} 
              onBack={() => setSelectedUser(null)} 
            />
          ) : (
            <Rankings />
          )}
        </div>
      </div>
      
      {showUploadModal && <UploadModal />}
      {showFilterModal && <FilterModal />}
    </div>
  );
};

export default OOPSPlatform;
