import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  updateDoc,
  arrayUnion,
  arrayRemove,
  increment
} from 'firebase/firestore';
import { db } from '../config';

export const userService = {
  // Get user profile
  async getUserProfile(userId) {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        throw new Error('User not found');
      }

      const userData = userDoc.data();

      // Get user's contribution stats
      const materialsQuery = query(
        collection(db, 'materials'),
        where('uploaderId', '==', userId)
      );
      const materialsSnapshot = await getDocs(materialsQuery);

      return {
        id: userDoc.id,
        ...userData,
        contributionCount: materialsSnapshot.size
      };
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  },

  // Update user profile
  async updateUserProfile(userId, profileData) {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        ...profileData,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  },

  // Get top contributors
  async getTopContributors(limit = 10) {
    try {
      // First get all materials to count contributions
      const materialsSnapshot = await getDocs(collection(db, 'materials'));
      
      // Count contributions per user
      const contributionsMap = {};
      materialsSnapshot.forEach(doc => {
        const { uploaderId } = doc.data();
        contributionsMap[uploaderId] = (contributionsMap[uploaderId] || 0) + 1;
      });

      // Sort users by contribution count
      const sortedContributors = Object.entries(contributionsMap)
        .sort(([, a], [, b]) => b - a)
        .slice(0, limit);

      // Get detailed user data for top contributors
      const topContributors = await Promise.all(
        sortedContributors.map(async ([userId, count]) => {
          const userDoc = await getDoc(doc(db, 'users', userId));
          return {
            id: userId,
            ...userDoc.data(),
            contributionCount: count
          };
        })
      );

      return topContributors;
    } catch (error) {
      console.error('Error getting top contributors:', error);
      throw error;
    }
  },

  // Follow user
  async followUser(userId, followerId) {
    try {
      const userRef = doc(db, 'users', userId);
      const followerRef = doc(db, 'users', followerId);

      await updateDoc(userRef, {
        followers: arrayUnion(followerId)
      });

      await updateDoc(followerRef, {
        following: arrayUnion(userId)
      });

      // Create notification
      await addDoc(collection(db, 'notifications'), {
        userId,
        type: 'follow',
        actorId: followerId,
        createdAt: new Date(),
        read: false
      });
    } catch (error) {
      console.error('Error following user:', error);
      throw error;
    }
  },

  // Unfollow user
  async unfollowUser(userId, followerId) {
    try {
      const userRef = doc(db, 'users', userId);
      const followerRef = doc(db, 'users', followerId);

      await updateDoc(userRef, {
        followers: arrayRemove(followerId)
      });

      await updateDoc(followerRef, {
        following: arrayRemove(userId)
      });
    } catch (error) {
      console.error('Error unfollowing user:', error);
      throw error;
    }
  },

  // Search users
  async searchUsers(searchQuery, limit = 10) {
    try {
      const q = query(
        collection(db, 'users'),
        where('name', '>=', searchQuery),
        where('name', '<=', searchQuery + '\uf8ff'),
        limit(limit)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  }
};