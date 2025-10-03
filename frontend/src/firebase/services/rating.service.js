import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  increment,
  serverTimestamp,
  runTransaction
} from 'firebase/firestore';
import { db } from '../config';

export const ratingService = {
  // Rate a material (thumbs up/down)
  async rateMaterial(materialId, userId, rating) {
    try {
      if (!['up', 'down'].includes(rating)) {
        throw new Error('Invalid rating. Use "up" or "down"');
      }

      return await runTransaction(db, async (transaction) => {
        const materialRef = doc(db, 'materials', materialId);
        const ratingRef = doc(db, 'ratings', `${materialId}_${userId}`);
        
        // Check if user already rated this material
        const existingRating = await transaction.get(ratingRef);
        const materialDoc = await transaction.get(materialRef);
        
        if (!materialDoc.exists()) {
          throw new Error('Material not found');
        }

        const materialData = materialDoc.data();
        let upVotes = materialData.upVotes || 0;
        let downVotes = materialData.downVotes || 0;
        let totalRatings = materialData.totalRatings || 0;

        if (existingRating.exists()) {
          // User already rated, update the rating
          const oldRating = existingRating.data().rating;
          
          if (oldRating === rating) {
            // Same rating - remove it (toggle off)
            transaction.delete(ratingRef);
            
            if (rating === 'up') {
              upVotes = Math.max(0, upVotes - 1);
            } else {
              downVotes = Math.max(0, downVotes - 1);
            }
            totalRatings = Math.max(0, totalRatings - 1);
          } else {
            // Different rating - update it
            transaction.set(ratingRef, {
              materialId,
              userId,
              rating,
              updatedAt: serverTimestamp()
            });
            
            if (oldRating === 'up' && rating === 'down') {
              upVotes = Math.max(0, upVotes - 1);
              downVotes += 1;
            } else if (oldRating === 'down' && rating === 'up') {
              downVotes = Math.max(0, downVotes - 1);
              upVotes += 1;
            }
          }
        } else {
          // New rating
          transaction.set(ratingRef, {
            materialId,
            userId,
            rating,
            createdAt: serverTimestamp()
          });
          
          if (rating === 'up') {
            upVotes += 1;
          } else {
            downVotes += 1;
          }
          totalRatings += 1;
        }

        // Calculate rating score (percentage of positive ratings)
        const ratingScore = totalRatings > 0 ? (upVotes / totalRatings) * 100 : 0;

        // Update material with new rating stats
        transaction.update(materialRef, {
          upVotes,
          downVotes,
          totalRatings,
          ratingScore: Math.round(ratingScore * 100) / 100, // Round to 2 decimal places
          lastRatedAt: serverTimestamp()
        });

        return {
          upVotes,
          downVotes,
          totalRatings,
          ratingScore,
          userRating: existingRating.exists() && existingRating.data().rating === rating ? null : rating
        };
      });

    } catch (error) {
      console.error('Error rating material:', error);
      throw error;
    }
  },

  // Get user's rating for a material
  async getUserRating(materialId, userId) {
    try {
      const ratingRef = doc(db, 'ratings', `${materialId}_${userId}`);
      const ratingDoc = await getDoc(ratingRef);
      
      if (ratingDoc.exists()) {
        return ratingDoc.data().rating;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting user rating:', error);
      throw error;
    }
  },

  // Get top rated materials for a course
  async getTopRatedMaterials(courseId, limitCount = 10) {
    try {
      const materialsQuery = query(
        collection(db, 'materials'),
        where('courseId', '==', courseId),
        where('totalRatings', '>=', 1), // Only materials with at least 1 rating
        orderBy('ratingScore', 'desc'),
        orderBy('totalRatings', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(materialsQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting top rated materials:', error);
      throw error;
    }
  },

  // Get rating statistics for a material
  async getMaterialRatingStats(materialId) {
    try {
      const materialRef = doc(db, 'materials', materialId);
      const materialDoc = await getDoc(materialRef);
      
      if (!materialDoc.exists()) {
        throw new Error('Material not found');
      }

      const data = materialDoc.data();
      return {
        upVotes: data.upVotes || 0,
        downVotes: data.downVotes || 0,
        totalRatings: data.totalRatings || 0,
        ratingScore: data.ratingScore || 0,
        lastRatedAt: data.lastRatedAt
      };
    } catch (error) {
      console.error('Error getting material rating stats:', error);
      throw error;
    }
  },

  // Get materials with ratings for a course
  async getMaterialsWithRatings(courseId, sortBy = 'recent') {
    try {
      let materialsQuery;

      switch (sortBy) {
        case 'rating':
          materialsQuery = query(
            collection(db, 'materials'),
            where('courseId', '==', courseId),
            orderBy('ratingScore', 'desc'),
            orderBy('totalRatings', 'desc')
          );
          break;
        case 'popular':
          materialsQuery = query(
            collection(db, 'materials'),
            where('courseId', '==', courseId),
            orderBy('totalRatings', 'desc'),
            orderBy('ratingScore', 'desc')
          );
          break;
        default: // recent
          materialsQuery = query(
            collection(db, 'materials'),
            where('courseId', '==', courseId),
            orderBy('uploadDate', 'desc')
          );
      }

      const snapshot = await getDocs(materialsQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting materials with ratings:', error);
      throw error;
    }
  },

  // Get user's rating history
  async getUserRatingHistory(userId, limitCount = 50) {
    try {
      const ratingsQuery = query(
        collection(db, 'ratings'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(ratingsQuery);
      const ratings = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Get material details for each rating
      const ratingsWithMaterials = await Promise.all(
        ratings.map(async (rating) => {
          try {
            const materialDoc = await getDoc(doc(db, 'materials', rating.materialId));
            return {
              ...rating,
              material: materialDoc.exists() ? {
                id: materialDoc.id,
                ...materialDoc.data()
              } : null
            };
          } catch (error) {
            console.warn(`Failed to get material ${rating.materialId}:`, error);
            return { ...rating, material: null };
          }
        })
      );

      return ratingsWithMaterials.filter(r => r.material !== null);
    } catch (error) {
      console.error('Error getting user rating history:', error);
      throw error;
    }
  },

  // Get rating analytics for a course (for teachers)
  async getCourseRatingAnalytics(courseId) {
    try {
      const materialsQuery = query(
        collection(db, 'materials'),
        where('courseId', '==', courseId)
      );

      const snapshot = await getDocs(materialsQuery);
      const materials = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const analytics = {
        totalMaterials: materials.length,
        ratedMaterials: materials.filter(m => (m.totalRatings || 0) > 0).length,
        totalRatings: materials.reduce((sum, m) => sum + (m.totalRatings || 0), 0),
        totalUpVotes: materials.reduce((sum, m) => sum + (m.upVotes || 0), 0),
        totalDownVotes: materials.reduce((sum, m) => sum + (m.downVotes || 0), 0),
        averageRatingScore: 0,
        topRatedMaterials: materials
          .filter(m => (m.totalRatings || 0) > 0)
          .sort((a, b) => (b.ratingScore || 0) - (a.ratingScore || 0))
          .slice(0, 5),
        leastRatedMaterials: materials
          .filter(m => (m.totalRatings || 0) > 0)
          .sort((a, b) => (a.ratingScore || 0) - (b.ratingScore || 0))
          .slice(0, 5)
      };

      // Calculate average rating score
      const ratedMaterials = materials.filter(m => (m.totalRatings || 0) > 0);
      if (ratedMaterials.length > 0) {
        analytics.averageRatingScore = ratedMaterials.reduce((sum, m) => sum + (m.ratingScore || 0), 0) / ratedMaterials.length;
        analytics.averageRatingScore = Math.round(analytics.averageRatingScore * 100) / 100;
      }

      return analytics;
    } catch (error) {
      console.error('Error getting course rating analytics:', error);
      throw error;
    }
  }
};