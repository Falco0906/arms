import { collection, doc, query, where, orderBy, limit, getDocs, getDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';

export const courseService = {
  getAllCourses: async () => {
    const querySnapshot = await getDocs(collection(db, 'courses'));
    return querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  },
  searchCourses: async (searchQuery) => {
    try {
      const q = query(
        collection(db, 'courses'),
        where('title', '>=', searchQuery),
        where('title', '<=', searchQuery + '\\uf8ff')
      );
      const querySnapshot = await getDocs(q);
      const results = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      if (results.length > 0) return results;
      // Fallback to client filter if no title-prefix matches
      const snapAll = await getDocs(collection(db, 'courses'));
      const term = (searchQuery || '').toLowerCase();
      return snapAll.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(c =>
          (c.title || '').toLowerCase().includes(term) ||
          (c.code || '').toLowerCase().includes(term) ||
          (c.description || '').toLowerCase().includes(term)
        );
    } catch (e) {
      const snapAll = await getDocs(collection(db, 'courses'));
      const term = (searchQuery || '').toLowerCase();
      return snapAll.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(c =>
          (c.title || '').toLowerCase().includes(term) ||
          (c.code || '').toLowerCase().includes(term) ||
          (c.description || '').toLowerCase().includes(term)
        );
    }
  },
  getCourseById: async (id) => {
    const docRef = doc(db, 'courses', id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) throw new Error('Course not found');
    return { id: docSnap.id, ...docSnap.data() };
  },
  addRecentCourse: async (userId, courseId) => {
    const recentRef = collection(db, 'users', userId, 'recentCourses');
    await addDoc(recentRef, { courseId, visitedAt: serverTimestamp() });
    return true;
  },
  getRecentCourses: async (userId) => {
    const q = query(
      collection(db, 'users', userId, 'recentCourses'),
      orderBy('visitedAt', 'desc'),
      limit(4)
    );
    const snap = await getDocs(q);
    const courseDocs = await Promise.all(
      snap.docs.map(async (d) => {
        const cd = await getDoc(doc(db, 'courses', d.data().courseId));
        return { id: cd.id, ...cd.data() };
      })
    );
    return courseDocs;
  },
  createCourse: async (courseData) => {
    const docRef = await addDoc(collection(db, 'courses'), { ...courseData, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
    return docRef.id;
  }
};
