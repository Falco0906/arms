import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config';

export const eventService = {
  // Create a new event
  async createEvent(eventData) {
    try {
      const eventRef = await addDoc(collection(db, 'events'), {
        ...eventData,
        createdAt: serverTimestamp(),
        status: 'active'
      });

      // Create notifications for relevant users
      if (eventData.notifyUsers) {
        const notificationPromises = eventData.notifyUsers.map(userId => 
          addDoc(collection(db, 'notifications'), {
            userId,
            eventId: eventRef.id,
            type: 'event',
            title: eventData.title,
            message: eventData.description,
            createdAt: serverTimestamp(),
            read: false
          })
        );

        await Promise.all(notificationPromises);
      }

      return {
        id: eventRef.id,
        ...eventData
      };
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  },

  // Get upcoming events
  async getUpcomingEvents() {
    try {
      const now = new Date();
      const q = query(
        collection(db, 'events'),
        where('date', '>=', now),
        where('status', '==', 'active'),
        orderBy('date', 'asc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting upcoming events:', error);
      throw error;
    }
  },

  // Get user notifications
  async getUserNotifications(userId, limit = 50) {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limit)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting notifications:', error);
      throw error;
    }
  },

  // Mark notification as read
  async markNotificationRead(notificationId) {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, {
        read: true,
        readAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  // Get unread notification count
  async getUnreadCount(userId) {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        where('read', '==', false)
      );

      const snapshot = await getDocs(q);
      return snapshot.size;
    } catch (error) {
      console.error('Error getting unread count:', error);
      throw error;
    }
  },

  // Delete notification
  async deleteNotification(notificationId) {
    try {
      await deleteDoc(doc(db, 'notifications', notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }
};