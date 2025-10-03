import React, { useState } from 'react';
import { courseService } from '../../services/firebase/courses';
import { materialService } from '../../services/firebase/materials';
import { newsService } from '../../services/firebase/news';

const SetupWizard = ({ onComplete }) => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState('');

  const initializeDatabase = async () => {
    setLoading(true);
    try {
      setProgress('Creating sample courses...');
      
      // Create sample courses
      const courses = [
        {
          code: 'CS101',
          name: 'Introduction to Computer Science',
          description: 'Fundamentals of programming and computer science concepts',
          instructor: 'Dr. Smith',
          semester: 'Fall 2024',
          credits: 3
        },
        {
          code: 'MATH201',
          name: 'Calculus II',
          description: 'Advanced calculus including integration techniques and series',
          instructor: 'Prof. Johnson',
          semester: 'Fall 2024',
          credits: 4
        },
        {
          code: 'PHYS301',
          name: 'Classical Mechanics',
          description: 'Newton\'s laws, energy, momentum, and rotational dynamics',
          instructor: 'Dr. Wilson',
          semester: 'Fall 2024',
          credits: 3
        },
        {
          code: 'ENG102',
          name: 'Technical Writing',
          description: 'Professional writing skills for technical communication',
          instructor: 'Prof. Davis',
          semester: 'Fall 2024',
          credits: 2
        }
      ];

      const createdCourses = [];
      for (const course of courses) {
        const courseId = await courseService.createCourse(course);
        createdCourses.push({ id: courseId, ...course });
      }

      setProgress('Creating sample materials...');
      
      // Create sample materials for each course
      const materials = [
        // CS101 materials
        {
          courseId: createdCourses[0].id,
          title: 'Introduction to Programming',
          type: 'NOTES',
          description: 'Basic programming concepts and syntax',
          path: '/sample/cs101_intro.pdf',
          size: 1024000,
          uploader: { name: 'Dr. Smith', email: 'smith@klh.edu.in' }
        },
        {
          courseId: createdCourses[0].id,
          title: 'Assignment 1 - Hello World',
          type: 'ASSIGNMENT',
          description: 'First programming assignment',
          path: '/sample/cs101_assignment1.pdf',
          size: 512000,
          uploader: { name: 'Dr. Smith', email: 'smith@klh.edu.in' }
        },
        {
          courseId: createdCourses[0].id,
          title: 'Python Code Examples',
          type: 'CODE',
          description: 'Sample Python programs',
          path: '/sample/cs101_examples.zip',
          size: 256000,
          uploader: { name: 'TA John', email: 'john@klh.edu.in' }
        },
        // MATH201 materials
        {
          courseId: createdCourses[1].id,
          title: 'Integration Techniques',
          type: 'NOTES',
          description: 'Methods of integration and applications',
          path: '/sample/math201_integration.pdf',
          size: 2048000,
          uploader: { name: 'Prof. Johnson', email: 'johnson@klh.edu.in' }
        },
        {
          courseId: createdCourses[1].id,
          title: 'Calculus Formulas',
          type: 'PPT',
          description: 'Quick reference for calculus formulas',
          path: '/sample/math201_formulas.pptx',
          size: 1536000,
          uploader: { name: 'Prof. Johnson', email: 'johnson@klh.edu.in' }
        },
        // PHYS301 materials
        {
          courseId: createdCourses[2].id,
          title: 'Newton\'s Laws Explained',
          type: 'NOTES',
          description: 'Detailed explanation of Newton\'s three laws',
          path: '/sample/phys301_newton.pdf',
          size: 1792000,
          uploader: { name: 'Dr. Wilson', email: 'wilson@klh.edu.in' }
        },
        {
          courseId: createdCourses[2].id,
          title: 'Lab Report Template',
          type: 'DOC',
          description: 'Template for physics lab reports',
          path: '/sample/phys301_template.docx',
          size: 128000,
          uploader: { name: 'Lab Assistant', email: 'lab@klh.edu.in' }
        },
        // ENG102 materials
        {
          courseId: createdCourses[3].id,
          title: 'Technical Writing Guidelines',
          type: 'NOTES',
          description: 'Best practices for technical documentation',
          path: '/sample/eng102_guidelines.pdf',
          size: 896000,
          uploader: { name: 'Prof. Davis', email: 'davis@klh.edu.in' }
        }
      ];

      for (const material of materials) {
        await materialService.createMaterial(material);
      }

      setProgress('Creating sample announcements...');
      
      // Create sample announcements
      const announcements = [
        {
          title: 'Welcome to Fall 2024!',
          content: 'Welcome to the new semester. Please check the course materials and upcoming assignments.',
          courseId: createdCourses[0].id,
          author: 'Dr. Smith',
          priority: 'high'
        },
        {
          title: 'Midterm Exam Schedule',
          content: 'Midterm examinations will be held during the week of October 15-19. Please prepare accordingly.',
          courseId: createdCourses[1].id,
          author: 'Prof. Johnson',
          priority: 'high'
        },
        {
          title: 'Lab Safety Reminder',
          content: 'Please review the lab safety guidelines before attending the next physics lab session.',
          courseId: createdCourses[2].id,
          author: 'Dr. Wilson',
          priority: 'medium'
        }
      ];

      for (const announcement of announcements) {
        await newsService.createNews(announcement);
      }

      setProgress('Database initialization complete!');
      setTimeout(() => {
        onComplete();
      }, 1000);

    } catch (error) {
      console.error('Error initializing database:', error);
      setProgress('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Initialize Database</h2>
        <p className="text-gray-600 mb-6">
          This will create sample courses, materials, and announcements to get you started.
        </p>
        
        {loading && (
          <div className="mb-4">
            <div className="text-sm text-gray-600 mb-2">{progress}</div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-indigo-600 h-2 rounded-full animate-pulse" style={{ width: '50%' }}></div>
            </div>
          </div>
        )}
        
        <div className="flex space-x-4">
          <button
            onClick={initializeDatabase}
            disabled={loading}
            className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Initializing...' : 'Initialize Database'}
          </button>
          <button
            onClick={onComplete}
            disabled={loading}
            className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
};

export default SetupWizard;