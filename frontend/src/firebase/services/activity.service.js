import {
  collection,
  doc,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  updateDoc,
  increment
} from 'firebase/firestore';
import { db } from '../config';

export const activityService = {
  // Track user activity
  async trackActivity(userId, activity) {
    try {
      const activityData = {
        userId,
        type: activity.type, // 'view', 'download', 'upload', 'rate', 'search', 'login'
        resourceType: activity.resourceType, // 'material', 'course', 'user', 'announcement'
        resourceId: activity.resourceId,
        resourceTitle: activity.resourceTitle,
        details: activity.details || {},
        timestamp: serverTimestamp(),
        sessionId: this.getSessionId(),
        userAgent: navigator.userAgent,
        platform: this.getPlatform()
      };

      // Add activity record
      await addDoc(collection(db, 'userActivity'), activityData);

      // Update user's recent activity cache (for quick access)
      await this.updateRecentActivity(userId, activityData);

    } catch (error) {
      console.error('Error tracking activity:', error);
      // Don't throw error to avoid breaking main functionality
    }
  },

  // Get user's recent activity
  async getRecentActivity(userId, limitCount = 20) {
    try {
      const activityQuery = query(
        collection(db, 'userActivity'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(activityQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting recent activity:', error);
      throw error;
    }
  },

  // Get recently accessed materials
  async getRecentlyAccessedMaterials(userId, limitCount = 10) {
    try {
      const activityQuery = query(
        collection(db, 'userActivity'),
        where('userId', '==', userId),
        where('resourceType', '==', 'material'),
        where('type', 'in', ['view', 'download']),
        orderBy('timestamp', 'desc'),
        limit(limitCount * 2) // Get more to filter duplicates
      );

      const snapshot = await getDocs(activityQuery);
      const activities = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Remove duplicates and get unique materials
      const uniqueMaterials = [];
      const seenMaterials = new Set();

      for (const activity of activities) {
        if (!seenMaterials.has(activity.resourceId)) {
          seenMaterials.add(activity.resourceId);
          uniqueMaterials.push({
            materialId: activity.resourceId,
            title: activity.resourceTitle,
            lastAccessed: activity.timestamp,
            accessType: activity.type,
            details: activity.details
          });

          if (uniqueMaterials.length >= limitCount) break;
        }
      }

      return uniqueMaterials;
    } catch (error) {
      console.error('Error getting recently accessed materials:', error);
      throw error;
    }
  },

  // Get user's search history
  async getSearchHistory(userId, limitCount = 15) {
    try {
      const searchQuery = query(
        collection(db, 'userActivity'),
        where('userId', '==', userId),
        where('type', '==', 'search'),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(searchQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        searchTerm: doc.data().details?.searchTerm || '',
        timestamp: doc.data().timestamp,
        resultsCount: doc.data().details?.resultsCount || 0
      }));
    } catch (error) {
      console.error('Error getting search history:', error);
      throw error;
    }
  },

  // Get activity analytics for a user
  async getUserAnalytics(userId, days = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const activityQuery = query(
        collection(db, 'userActivity'),
        where('userId', '==', userId),
        where('timestamp', '>=', startDate),
        orderBy('timestamp', 'desc')
      );

      const snapshot = await getDocs(activityQuery);
      const activities = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Calculate analytics
      const analytics = {
        totalActivities: activities.length,
        materialViews: activities.filter(a => a.type === 'view' && a.resourceType === 'material').length,
        materialDownloads: activities.filter(a => a.type === 'download').length,
        searchCount: activities.filter(a => a.type === 'search').length,
        uploadCount: activities.filter(a => a.type === 'upload').length,
        ratingCount: activities.filter(a => a.type === 'rate').length,
        uniqueMaterials: new Set(
          activities
            .filter(a => a.resourceType === 'material')
            .map(a => a.resourceId)
        ).size,
        activeDays: new Set(
          activities.map(a => {
            const date = a.timestamp?.toDate?.() || new Date(a.timestamp);
            return date.toDateString();
          })
        ).size,
        activityByType: {},
        activityByDay: {},
        mostAccessedMaterials: {}
      };

      // Group activities by type
      activities.forEach(activity => {
        const type = activity.type;
        analytics.activityByType[type] = (analytics.activityByType[type] || 0) + 1;

        // Group by day
        const date = activity.timestamp?.toDate?.() || new Date(activity.timestamp);
        const dayKey = date.toDateString();
        analytics.activityByDay[dayKey] = (analytics.activityByDay[dayKey] || 0) + 1;

        // Count material accesses
        if (activity.resourceType === 'material') {
          const materialKey = `${activity.resourceId}:${activity.resourceTitle}`;
          analytics.mostAccessedMaterials[materialKey] = 
            (analytics.mostAccessedMaterials[materialKey] || 0) + 1;
        }
      });

      return analytics;
    } catch (error) {
      console.error('Error getting user analytics:', error);
      throw error;
    }
  },

  // Update recent activity cache for quick access
  async updateRecentActivity(userId, activityData) {
    try {
      const userRef = doc(db, 'users', userId);
      
      // Only update for important activities
      if (['view', 'download', 'upload'].includes(activityData.type)) {
        await updateDoc(userRef, {
          lastActivity: activityData.timestamp,
          [`activityCount.${activityData.type}`]: increment(1)
        });
      }
    } catch (error) {
      console.warn('Error updating recent activity cache:', error);
      // Non-critical error
    }
  },

  // Get session ID for tracking user sessions
  getSessionId() {
    let sessionId = sessionStorage.getItem('arms_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('arms_session_id', sessionId);
    }
    return sessionId;
  },

  // Get platform information
  getPlatform() {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Mobile')) return 'mobile';
    if (userAgent.includes('Tablet')) return 'tablet';
    return 'desktop';
  },

  // Track material view
  async trackMaterialView(userId, materialId, materialTitle, courseId) {
    await this.trackActivity(userId, {
      type: 'view',
      resourceType: 'material',
      resourceId: materialId,
      resourceTitle: materialTitle,
      details: { courseId }
    });
  },

  // Track material download
  async trackMaterialDownload(userId, materialId, materialTitle, courseId) {
    await this.trackActivity(userId, {
      type: 'download',
      resourceType: 'material',
      resourceId: materialId,
      resourceTitle: materialTitle,
      details: { courseId }
    });
  },

  // Track search
  async trackSearch(userId, searchTerm, resultsCount, filters = {}) {
    await this.trackActivity(userId, {
      type: 'search',
      resourceType: 'system',
      resourceId: 'search',
      resourceTitle: 'Search',
      details: {
        searchTerm,
        resultsCount,
        filters
      }
    });
  },

  // Track material upload
  async trackMaterialUpload(userId, materialId, materialTitle, courseId) {
    await this.trackActivity(userId, {
      type: 'upload',
      resourceType: 'material',
      resourceId: materialId,
      resourceTitle: materialTitle,
      details: { courseId }
    });
  },

  // Track rating
  async trackRating(userId, materialId, materialTitle, rating) {
    await this.trackActivity(userId, {
      type: 'rate',
      resourceType: 'material',
      resourceId: materialId,
      resourceTitle: materialTitle,
      details: { rating }
    });
  },

  // Clear user activity history (GDPR compliance)
  async clearUserActivity(userId) {
    try {
      const activityQuery = query(
        collection(db, 'userActivity'),
        where('userId', '==', userId)
      );

      const snapshot = await getDocs(activityQuery);
      const deletePromises = snapshot.docs.map(doc => 
        deleteDoc(doc.ref)
      );

      await Promise.all(deletePromises);
      
      return { deleted: snapshot.docs.length };
    } catch (error) {
      console.error('Error clearing user activity:', error);
      throw error;
    }
  }
};