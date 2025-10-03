// Firebase Enhanced Features Service
// This adds new features on top of existing working API
import { auth, db, storage } from '../firebase';
import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  updateDoc, 
  deleteDoc,
  serverTimestamp 
} from 'firebase/firestore';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export const enhancedFeaturesService = {
  // Exam Pack Generation - works with existing materials
  generateExamPack: async (courseId, courseName, materials) => {
    try {
      const zip = new JSZip();
      const courseFolder = zip.folder(courseName || `Course_${courseId}`);
      
      // Filter exam-related materials
      const examMaterials = materials.filter(m => 
        m.type === 'ASSIGNMENT' || 
        m.type === 'NOTES' ||
        m.title.toLowerCase().includes('exam') ||
        m.title.toLowerCase().includes('test') ||
        m.title.toLowerCase().includes('assignment')
      );
      
      // Add materials to ZIP (placeholder - would need actual file fetching)
      examMaterials.forEach(material => {
        courseFolder.file(`${material.title}.txt`, `Material: ${material.title}\nType: ${material.type}\nDescription: ${material.description || 'No description'}`);
      });
      
      // Generate and download ZIP
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `${courseName || `Course_${courseId}`}_ExamPack.zip`);
      
      // Track activity in Firebase
      if (auth.currentUser) {
        await addDoc(collection(db, 'activities'), {
          userId: auth.currentUser.uid,
          type: 'exam_pack_generated',
          courseId: courseId,
          courseName: courseName,
          materialCount: examMaterials.length,
          createdAt: serverTimestamp()
        });
      }
      
      return { success: true, count: examMaterials.length };
    } catch (error) {
      console.error('Error generating exam pack:', error);
      throw error;
    }
  },

  // Rating System - works with existing materials
  rateMaterial: async (materialId, rating) => {
    if (!auth.currentUser) throw new Error('Must be logged in to rate');
    
    try {
      const ratingRef = doc(db, 'ratings', `${auth.currentUser.uid}_${materialId}`);
      await updateDoc(ratingRef, {
        userId: auth.currentUser.uid,
        materialId: materialId,
        rating: rating, // 1 for thumbs up, -1 for thumbs down
        createdAt: serverTimestamp()
      }).catch(async () => {
        // If document doesn't exist, create it
        await addDoc(collection(db, 'ratings'), {
          userId: auth.currentUser.uid,
          materialId: materialId,
          rating: rating,
          createdAt: serverTimestamp()
        });
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error rating material:', error);
      throw error;
    }
  },

  // Get material ratings
  getMaterialRating: async (materialId) => {
    try {
      const q = query(collection(db, 'ratings'), where('materialId', '==', materialId));
      const snapshot = await getDocs(q);
      
      let likes = 0, dislikes = 0;
      snapshot.docs.forEach(doc => {
        const rating = doc.data().rating;
        if (rating > 0) likes++;
        else if (rating < 0) dislikes++;
      });
      
      return { likes, dislikes, total: likes + dislikes };
    } catch (error) {
      console.error('Error getting ratings:', error);
      return { likes: 0, dislikes: 0, total: 0 };
    }
  },

  // Pin System
  pinMaterial: async (materialId, materialData) => {
    if (!auth.currentUser) throw new Error('Must be logged in to pin');
    
    try {
      await addDoc(collection(db, 'pins'), {
        userId: auth.currentUser.uid,
        materialId: materialId,
        materialTitle: materialData.title,
        materialType: materialData.type,
        courseId: materialData.courseId,
        createdAt: serverTimestamp()
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error pinning material:', error);
      throw error;
    }
  },

  unpinMaterial: async (materialId) => {
    if (!auth.currentUser) throw new Error('Must be logged in to unpin');
    
    try {
      const q = query(
        collection(db, 'pins'), 
        where('userId', '==', auth.currentUser.uid),
        where('materialId', '==', materialId)
      );
      const snapshot = await getDocs(q);
      
      snapshot.docs.forEach(async (docRef) => {
        await deleteDoc(doc(db, 'pins', docRef.id));
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error unpinning material:', error);
      throw error;
    }
  },

  // Get user's pinned materials
  getPinnedMaterials: async () => {
    if (!auth.currentUser) return [];
    
    try {
      const q = query(
        collection(db, 'pins'), 
        where('userId', '==', auth.currentUser.uid)
      );
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting pinned materials:', error);
      return [];
    }
  },

  // Check if material is pinned
  isMaterialPinned: async (materialId) => {
    if (!auth.currentUser) return false;
    
    try {
      const q = query(
        collection(db, 'pins'), 
        where('userId', '==', auth.currentUser.uid),
        where('materialId', '==', materialId)
      );
      const snapshot = await getDocs(q);
      return !snapshot.empty;
    } catch (error) {
      console.error('Error checking pin status:', error);
      return false;
    }
  },

  // Activity Tracking
  trackActivity: async (activity) => {
    if (!auth.currentUser) return;
    
    try {
      await addDoc(collection(db, 'activities'), {
        userId: auth.currentUser.uid,
        ...activity,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error tracking activity:', error);
    }
  },

  // Get user activities
  getUserActivities: async (limit = 20) => {
    if (!auth.currentUser) return [];
    
    try {
      const q = query(
        collection(db, 'activities'),
        where('userId', '==', auth.currentUser.uid)
      );
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).slice(0, limit);
    } catch (error) {
      console.error('Error getting activities:', error);
      return [];
    }
  }
};