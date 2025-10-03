import { 
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  deleteDoc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import { storage, db } from '../../firebase';

export const materialService = {
  // Upload material
  uploadMaterial: async (courseId, file, metadata) => {
    try {
      // Generate a unique filename
      const timestamp = Date.now();
      const filename = `${courseId}/${timestamp}_${file.name}`;
      const storageRef = ref(storage, `materials/${filename}`);

      // Upload file to Firebase Storage
      const snapshot = await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(snapshot.ref);

      // Add material metadata to Firestore
      const materialRef = await addDoc(collection(db, 'materials'), {
        courseId,
        title: metadata.title || file.name,
        description: metadata.description || '',
        filename: file.name,
        path: filename,
        url: downloadUrl,
        type: file.type,
        size: file.size,
        uploaderId: metadata.uploaderId,
        downloads: 0,
        createdAt: serverTimestamp()
      });

      return {
        id: materialRef.id,
        url: downloadUrl
      };
    } catch (error) {
      throw new Error(error.message);
    }
  },

  // Get materials by course
  getMaterialsByCourse: async (courseId) => {
    try {
      const q = query(
        collection(db, 'materials'),
        where('courseId', '==', courseId),
        orderBy('createdAt', 'desc')
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

  // Get top downloaded materials
  getTopDownloads: async (limit = 6) => {
    try {
      const q = query(
        collection(db, 'materials'),
        orderBy('downloads', 'desc'),
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

  // Delete material
  deleteMaterial: async (materialId) => {
    try {
      // Get material data first
      const materialDoc = await getDoc(doc(db, 'materials', materialId));
      if (!materialDoc.exists()) {
        throw new Error('Material not found');
      }

      const materialData = materialDoc.data();
      
      // Delete file from storage
      const storageRef = ref(storage, `materials/${materialData.path}`);
      await deleteObject(storageRef);

      // Delete metadata from Firestore
      await deleteDoc(doc(db, 'materials', materialId));
    } catch (error) {
      throw new Error(error.message);
    }
  },

  // Increment download count
  incrementDownloads: async (materialId) => {
    try {
      const materialRef = doc(db, 'materials', materialId);
      const materialDoc = await getDoc(materialRef);
      
      if (!materialDoc.exists()) {
        throw new Error('Material not found');
      }

      await updateDoc(materialRef, {
        downloads: materialDoc.data().downloads + 1
      });
    } catch (error) {
      throw new Error(error.message);
    }
  },

  // Create material (for setup wizard)
  createMaterial: async (materialData) => {
    try {
      const docRef = await addDoc(collection(db, 'materials'), {
        ...materialData,
        downloads: 0,
        createdAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      throw new Error(error.message);
    }
  }
};