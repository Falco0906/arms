import React, { useState, useEffect } from 'react';
import { eventService } from '../../firebase/services/event.service';
import { materialService } from '../../firebase/services/material.service';

const CourseTimeline = ({ courseId, course }) => {
  const [timelineItems, setTimelineItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [viewMode, setViewMode] = useState('all'); // all, milestones, materials, events

  useEffect(() => {
    loadTimelineData();
  }, [courseId]);

  const loadTimelineData = async () => {
    try {
      setLoading(true);
      
      // Load materials, events, and milestones
      const [materials, events] = await Promise.all([
        materialService.getMaterialsByCourse(courseId),
        eventService.getUpcomingEvents()
      ]);

      // Create timeline items with different types
      const items = [];

      // Add materials as timeline items
      materials.forEach(material => {
        items.push({
          id: `material-${material.id}`,
          type: 'material',
          title: material.title,
          description: material.description,
          date: material.uploadDate ? new Date(material.uploadDate.seconds * 1000) : new Date(),
          data: material,
          icon: getIconForMaterialType(material.type),
          color: getColorForMaterialType(material.type)
        });
      });

      // Add events as timeline items
      events.filter(event => event.courseId === courseId).forEach(event => {
        items.push({
          id: `event-${event.id}`,
          type: 'event',
          title: event.title,
          description: event.description,
          date: event.date ? new Date(event.date.seconds * 1000) : new Date(),
          data: event,
          icon: getIconForEventType(event.type),
          color: 'bg-purple-500'
        });
      });

      // Add predefined milestones
      const milestones = generateCourseMilestones(course);
      milestones.forEach(milestone => {
        items.push({
          id: `milestone-${milestone.id}`,
          type: 'milestone',
          title: milestone.title,
          description: milestone.description,
          date: milestone.date,
          data: milestone,
          icon: '🎯',
          color: 'bg-yellow-500'
        });
      });

      // Sort by date (most recent first)
      items.sort((a, b) => b.date - a.date);

      setTimelineItems(items);
    } catch (error) {
      console.error('Error loading timeline data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateCourseMilestones = (course) => {
    const currentDate = new Date();
    const semesterStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - 2, 1);
    const semesterEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 3, 30);
    
    return [
      {
        id: 'start',
        title: 'Course Started',
        description: `${course?.name || 'Course'} began`,
        date: semesterStart,
        type: 'course-start'
      },
      {
        id: 'midterm',
        title: 'Midterm Period',
        description: 'Midterm examinations',
        date: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 15),
        type: 'midterm'
      },
      {
        id: 'final',
        title: 'Final Exams',
        description: 'Final examination period',
        date: new Date(currentDate.getFullYear(), currentDate.getMonth() + 3, 1),
        type: 'final'
      },
      {
        id: 'end',
        title: 'Course Completion',
        description: 'Course officially ends',
        date: semesterEnd,
        type: 'course-end'
      }
    ];
  };

  const getIconForMaterialType = (type) => {
    const icons = {
      'notes': '📝',
      'lecture-notes': '📚',
      'past-papers': '📄',
      'summaries': '📋',
      'assignment': '📝',
      'quiz': '❓',
      'slides': '📊',
      'video': '🎥',
      'audio': '🎵',
      'default': '📄'
    };
    return icons[type] || icons.default;
  };

  const getColorForMaterialType = (type) => {
    const colors = {
      'notes': 'bg-blue-500',
      'lecture-notes': 'bg-green-500',
      'past-papers': 'bg-red-500',
      'summaries': 'bg-indigo-500',
      'assignment': 'bg-orange-500',
      'quiz': 'bg-pink-500',
      'slides': 'bg-teal-500',
      'video': 'bg-purple-500',
      'audio': 'bg-yellow-500',
      'default': 'bg-gray-500'
    };
    return colors[type] || colors.default;
  };

  const getIconForEventType = (type) => {
    const icons = {
      'exam': '📝',
      'assignment-due': '⏰',
      'lecture': '🎓',
      'lab': '🔬',
      'announcement': '📢',
      'default': '📅'
    };
    return icons[type] || icons.default;
  };

  const filteredItems = timelineItems.filter(item => {
    if (viewMode === 'all') return true;
    if (viewMode === 'milestones') return item.type === 'milestone';
    if (viewMode === 'materials') return item.type === 'material';
    if (viewMode === 'events') return item.type === 'event';
    return true;
  });

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleItemClick = (item) => {
    if (item.type === 'milestone') {
      setSelectedMilestone(item);
    } else if (item.type === 'material') {
      // Handle material download or view
      window.open(item.data.url, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading timeline...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="border-b p-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Course Timeline</h2>
          
          {/* View Mode Selector */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            {[
              { key: 'all', label: 'All', count: timelineItems.length },
              { key: 'milestones', label: 'Milestones', count: timelineItems.filter(i => i.type === 'milestone').length },
              { key: 'materials', label: 'Materials', count: timelineItems.filter(i => i.type === 'material').length },
              { key: 'events', label: 'Events', count: timelineItems.filter(i => i.type === 'event').length }
            ].map((mode) => (
              <button
                key={mode.key}
                onClick={() => setViewMode(mode.key)}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  viewMode === mode.key
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {mode.label} ({mode.count})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="p-4">
        {filteredItems.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>No {viewMode === 'all' ? 'items' : viewMode} found for this course</p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>
            
            {/* Timeline Items */}
            <div className="space-y-6">
              {filteredItems.map((item, index) => (
                <div
                  key={item.id}
                  className={`relative flex items-start cursor-pointer group ${
                    item.type === 'milestone' ? 'hover:bg-yellow-50' : 'hover:bg-gray-50'
                  } rounded-lg p-3 -ml-3 transition-colors`}
                  onClick={() => handleItemClick(item)}
                >
                  {/* Timeline Dot */}
                  <div className={`relative z-10 flex items-center justify-center w-16 h-16 rounded-full border-4 border-white shadow-sm ${item.color}`}>
                    <span className="text-2xl">{item.icon}</span>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 ml-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className={`font-medium ${
                          item.type === 'milestone' ? 'text-yellow-800' : 'text-gray-900'
                        } group-hover:text-blue-600`}>
                          {item.title}
                        </h3>
                        
                        {item.description && (
                          <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                        )}
                        
                        {/* Metadata */}
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span className="bg-gray-100 px-2 py-1 rounded capitalize">
                            {item.type.replace('-', ' ')}
                          </span>
                          
                          {item.type === 'material' && item.data.size && (
                            <span>{(item.data.size / 1024 / 1024).toFixed(1)} MB</span>
                          )}
                          
                          {item.data.ratingScore && (
                            <span className="text-green-600">
                              ⭐ {item.data.ratingScore.toFixed(1)}%
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Date */}
                      <div className="text-right ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {formatDate(item.date)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatTime(item.date)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Milestone Details Modal */}
      {selectedMilestone && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <span className="text-3xl mr-3">{selectedMilestone.icon}</span>
                <h3 className="text-lg font-semibold">{selectedMilestone.title}</h3>
              </div>
              
              <p className="text-gray-600 mb-4">{selectedMilestone.description}</p>
              
              <div className="text-sm text-gray-500 mb-6">
                <strong>Date:</strong> {formatDate(selectedMilestone.date)}
              </div>
              
              <button
                onClick={() => setSelectedMilestone(null)}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseTimeline;