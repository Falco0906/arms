import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from '../../firebase';

export const userService = {
  // Get user by ID
  getUserById: async (id) => {
    try {
      const docRef = doc(db, 'users', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        };
      } else {
        throw new Error('User not found');
      }
    } catch (error) {
      throw new Error(error.message);
    }
  },

  // Search users
  searchUsers: async (query) => {
    try {
      const q = query(
        collection(db, 'users'),
        where('name', '>=', query),
        where('name', '<=', query + '\uf8ff')
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

  // Get top uploaders
  getTopUploaders: async (limit = 50) => {
    try {
      // Get all materials first
      const materialsSnapshot = await getDocs(collection(db, 'materials'));
      
      // Count uploads per user
      const uploaderCounts = {};
      materialsSnapshot.forEach(doc => {
        const { uploaderId } = doc.data();
        uploaderCounts[uploaderId] = (uploaderCounts[uploaderId] || 0) + 1;
      });

      // Get user details for top uploaders
      const topUploaders = await Promise.all(
        Object.entries(uploaderCounts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, limit)
          .map(async ([userId, count]) => {
            const userDoc = await getDoc(doc(db, 'users', userId));
            return {
              id: userId,
              ...userDoc.data(),
              uploadCount: count
            };
          })
      );

      return topUploaders;
    } catch (error) {
      throw new Error(error.message);
    }
  }
};