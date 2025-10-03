import {
  collection,
  doc,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../../firebase';

export const newsService = {
  // Get all news
  getAllNews: async (page = 0, size = 10, search = null, type = null) => {
    try {
      let q = collection(db, 'news');
      
      if (search) {
        q = query(q, where('title', '>=', search), where('title', '<=', search + '\uf8ff'));
      }
      
      if (type) {
        q = query(q, where('type', '==', type));
      }
      
      q = query(q, orderBy('createdAt', 'desc'), limit(size));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw new Error(error.message);
    }
  },

  // Get recent news
  getRecentNews: async (limit = 5) => {
    try {
      const q = query(
        collection(db, 'news'),
        orderBy('createdAt', 'desc'),
        limit(limit)
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

  // Create news
  createNews: async (newsData) => {
    try {
      const docRef = await addDoc(collection(db, 'news'), {
        ...newsData,
        createdAt: serverTimestamp()
      });
      return {
        id: docRef.id,
        ...newsData
      };
    } catch (error) {
      throw new Error(error.message);
    }
  },

  // Get upcoming events
  getUpcomingEvents: async () => {
    try {
      const now = new Date();
      const q = query(
        collection(db, 'news'),
        where('type', '==', 'EVENT'),
        where('date', '>=', now.toISOString()),
        orderBy('date', 'asc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw new Error(error.message);
    }
  }
};