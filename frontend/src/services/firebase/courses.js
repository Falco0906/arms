import { 
  collection,
  doc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../../firebase';

export const courseService = {
  // Get all courses
  getAllCourses: async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'courses'));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw new Error(error.message);
    }
  },

  // Search courses
  searchCourses: async (searchQuery) => {
    try {
      const q = query(
        collection(db, 'courses'),
        where('title', '>=', searchQuery),
        where('title', '<=', searchQuery + '\uf8ff')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw new Error(error.message);
    }
  },

  // Get course by ID
  getCourseById: async (id) => {
    try {
      const docRef = doc(db, 'courses', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        };
      } else {
        throw new Error('Course not found');
      }
    } catch (error) {
      throw new Error(error.message);
    }
  },

  // Add to recently visited courses
  addRecentCourse: async (userId, courseId) => {
    try {
      const recentRef = collection(db, 'users', userId, 'recentCourses');
      await addDoc(recentRef, {
        courseId,
        visitedAt: serverTimestamp()
      });
    } catch (error) {
      throw new Error(error.message);
    }
  },

  // Get recently visited courses
  getRecentCourses: async (userId) => {
    try {
      const q = query(
        collection(db, 'users', userId, 'recentCourses'),
        orderBy('visitedAt', 'desc'),
        limit(4)
      );
      const querySnapshot = await getDocs(q);
      
      // Get full course details for each recent course
      const courses = await Promise.all(
        querySnapshot.docs.map(async (doc) => {
          const courseDoc = await getDoc(doc(db, 'courses', doc.data().courseId));
          return {
            id: courseDoc.id,
            ...courseDoc.data()
          };
        })
      );

      return courses;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  // Create new course
  createCourse: async (courseData) => {
    try {
      const docRef = await addDoc(collection(db, 'courses'), {
        ...courseData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      throw new Error(error.message);
    }
  }
};