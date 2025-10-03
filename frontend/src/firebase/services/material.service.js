import { 
  ref, 
  uploadBytes,
  getDownloadURL,
  deleteObject,
  uploadBytesResumable
} from 'firebase/storage';
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
  increment,
  serverTimestamp
} from 'firebase/firestore';
import { storage, db } from '../config';

export const materialService = {
  // Upload a file with progress tracking
  async uploadFile(file, metadata, onProgress) {
    try {
      const timestamp = Date.now();
      const filename = `${metadata.courseId}/${timestamp}_${file.name}`;
      const storageRef = ref(storage, `materials/${filename}`);

      // Create upload task with progress monitoring
      const uploadTask = uploadBytesResumable(storageRef, file);

      // Set up progress monitoring
      uploadTask.on('state_changed', 
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress && onProgress(progress);
        },
        (error) => {
          throw error;
        }
      );

      // Wait for upload to complete
      await uploadTask;

      // Get download URL
      const downloadURL = await getDownloadURL(storageRef);

      // Add material metadata to Firestore
      const materialRef = await addDoc(collection(db, 'materials'), {
        title: metadata.title || file.name,
        description: metadata.description || '',
        courseId: metadata.courseId,
        uploaderId: metadata.uploaderId,
        filename: file.name,
        path: filename,
        url: downloadURL,
        type: file.type,
        size: file.size,
        downloadCount: 0,
        uploadDate: serverTimestamp()
      });

      return {
        id: materialRef.id,
        url: downloadURL
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  },

  // Download a file (increment counter and return URL)
  async downloadFile(materialId) {
    try {
      const materialRef = doc(db, 'materials', materialId);
      const materialDoc = await getDoc(materialRef);

      if (!materialDoc.exists()) {
        throw new Error('Material not found');
      }

      // Increment download counter
      await updateDoc(materialRef, {
        downloadCount: increment(1)
      });

      return materialDoc.data().url;
    } catch (error) {
      console.error('Error downloading file:', error);
      throw error;
    }
  },

  // Get materials for a course
  async getMaterialsByCourse(courseId) {
    try {
      const q = query(
        collection(db, 'materials'),
        where('courseId', '==', courseId),
        orderBy('uploadDate', 'desc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting materials:', error);
      throw error;
    }
  },

  // Get most downloaded materials
  async getTopDownloads(limit = 6) {
    try {
      const q = query(
        collection(db, 'materials'),
        orderBy('downloadCount', 'desc'),
        limit(limit)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting top downloads:', error);
      throw error;
    }
  },

  // Delete a material
  async deleteMaterial(materialId) {
    try {
      // Get material data
      const materialRef = doc(db, 'materials', materialId);
      const materialDoc = await getDoc(materialRef);

      if (!materialDoc.exists()) {
        throw new Error('Material not found');
      }

      const materialData = materialDoc.data();

      // Delete file from storage
      const storageRef = ref(storage, `materials/${materialData.path}`);
      await deleteObject(storageRef);

      // Delete metadata from Firestore
      await deleteDoc(materialRef);
    } catch (error) {
      console.error('Error deleting material:', error);
      throw error;
    }
  }
};