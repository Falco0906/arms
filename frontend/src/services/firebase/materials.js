import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { collection, doc, addDoc, getDoc, getDocs, setDoc, query, where, orderBy, limit as fbLimit, deleteDoc, updateDoc, serverTimestamp, onSnapshot, increment } from 'firebase/firestore';
import { storage, db } from '../../firebase';
import { supabaseStorageService } from '../supabase/storage';
import { isSupabaseConfigured } from '../../supabaseClient';

const USE_SUPABASE = process.env.REACT_APP_USE_SUPABASE === 'true';

export const materialService = {
  uploadMaterial: async (courseId, file, metadata) => {
    if (!db) {
      throw new Error('Firebase is not configured for database');
    }

    const timestamp = Date.now();
    const filename = `${courseId}/${timestamp}_${file.name}`;
    let downloadUrl;
    let storagePath;

    // Use Supabase for storage if configured
    if (USE_SUPABASE && isSupabaseConfigured()) {
      try {
        const result = await supabaseStorageService.uploadFile(file, filename);
        downloadUrl = result.url;
        storagePath = result.path;
        console.log('File uploaded to Supabase:', storagePath);
      } catch (e) {
        console.error('Supabase upload failed:', e);
        throw e;
      }
    } else {
      // Fallback to Firebase Storage
      if (!storage) {
        throw new Error('Firebase Storage is not configured');
      }
      const storageRef = ref(storage, `materials/${filename}`);
      let snapshot;
      try {
        snapshot = await uploadBytes(storageRef, file);
      } catch (e) {
        console.error('Firebase uploadBytes failed:', e);
        throw e;
      }
      try {
        downloadUrl = await getDownloadURL(snapshot.ref);
        storagePath = filename;
      } catch (e) {
        console.error('Firebase getDownloadURL failed:', e);
        throw e;
      }
    }
    let materialRef;
    try {
      // Get uploader info from localStorage
      let uploaderData = null;
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.id) {
          uploaderData = {
            id: user.id,
            name: user.name || user.email || 'Unknown',
            email: user.email
          };
        }
      } catch (_) {}

      materialRef = await addDoc(collection(db, 'materials'), {
      courseId,
      title: metadata.title || file.name,
      description: metadata.description || '',
      filename: file.name,
      path: storagePath || filename,
      storageProvider: USE_SUPABASE && isSupabaseConfigured() ? 'supabase' : 'firebase',
      url: downloadUrl,
      type: (metadata.materialType || 'OTHER'),
      size: file.size,
      uploaderId: metadata.uploaderId,
      uploader: uploaderData,
      downloads: 0,
      createdAt: serverTimestamp()
    });
    } catch (e) {
      console.error('Firebase addDoc(materials) failed:', e);
      throw e;
    }
    
    // Update user's upload statistics
    if (metadata.uploaderId) {
      try {
        const userRef = doc(db, 'users', metadata.uploaderId);
        await updateDoc(userRef, {
          'statistics.uploads': increment(1)
        });
      } catch (e) {
        console.error('Failed to update user statistics:', e);
        // Don't throw - upload was successful even if stats update failed
      }
    }
    
    return { id: materialRef.id, url: downloadUrl };
  },
  searchMaterials: async (term) => {
    try {
      const q = query(
        collection(db, 'materials'),
        where('title', '>=', term),
        where('title', '<=', term + '\uf8ff')
      );
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {
      // Fallback without index: fetch all and filter on client
      const snap = await getDocs(collection(db, 'materials'));
      const termLc = (term || '').toLowerCase();
      return snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(m => (m.title || '').toLowerCase().includes(termLc) || (m.description || '').toLowerCase().includes(termLc));
    }
  },
  getMaterialsByCourse: async (courseId) => {
    if (!db) {
      throw new Error('Firebase is not configured for database');
    }
    try {
      const q = query(
        collection(db, 'materials'),
        where('courseId', '==', courseId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {
      // Fallback if composite index is missing: run without orderBy
      const q2 = query(collection(db, 'materials'), where('courseId', '==', courseId));
      const snap2 = await getDocs(q2);
      return snap2.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => new Date(b.createdAt?.toDate?.() || b.createdAt || 0) - new Date(a.createdAt?.toDate?.() || a.createdAt || 0));
    }
  },
  getTopDownloads: async (limit = 6) => {
    const q = query(collection(db, 'materials'), orderBy('downloads', 'desc'), fbLimit(limit));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  },
  deleteMaterial: async (materialId) => {
    if (!db) {
      throw new Error('Firebase is not configured for database');
    }
    const materialDoc = await getDoc(doc(db, 'materials', materialId));
    if (!materialDoc.exists()) throw new Error('Material not found');
    const materialData = materialDoc.data();
    
    // Delete from appropriate storage provider
    if (materialData.storageProvider === 'supabase' && isSupabaseConfigured()) {
      try {
        await supabaseStorageService.deleteFile(materialData.path);
        console.log('File deleted from Supabase:', materialData.path);
      } catch (e) {
        console.error('Supabase delete failed:', e);
        // Continue to delete from Firestore even if storage delete fails
      }
    } else {
      // Delete from Firebase Storage
      if (storage) {
        try {
          const storageRef = ref(storage, `materials/${materialData.path}`);
          await deleteObject(storageRef);
        } catch (e) {
          console.error('Firebase Storage delete failed:', e);
          // Continue to delete from Firestore even if storage delete fails
        }
      }
    }
    
    // Delete from Firestore
    await deleteDoc(doc(db, 'materials', materialId));
  },
  incrementDownloads: async (materialId, userId) => {
    if (!db) {
      throw new Error('Firebase is not configured for database');
    }
    
    // Check if user has already downloaded this material
    if (userId) {
      const downloadRef = doc(db, 'materials', materialId, 'downloads', userId);
      const downloadDoc = await getDoc(downloadRef);
      
      // If already downloaded, don't increment
      if (downloadDoc.exists()) {
        console.log('User already downloaded this material');
        return;
      }
      
      // Mark as downloaded by this user
      await setDoc(downloadRef, {
        userId: userId,
        downloadedAt: serverTimestamp()
      });
    }
    
    // Increment material download count
    const materialRef = doc(db, 'materials', materialId);
    const materialDoc = await getDoc(materialRef);
    if (!materialDoc.exists()) throw new Error('Material not found');
    await updateDoc(materialRef, { downloads: (materialDoc.data().downloads || 0) + 1 });
    
    // Update user's download statistics (only if first time downloading this material)
    if (userId) {
      try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
          'statistics.downloads': increment(1)
        });
      } catch (e) {
        console.error('Failed to update user download statistics:', e);
        // Don't throw - download was successful even if stats update failed
      }
    }
  },
  isLikedByUser: async (materialId, userId) => {
    if (!db) {
      throw new Error('Firebase is not configured for database');
    }
    const likeDoc = await getDoc(doc(db, 'materials', materialId, 'likes', userId));
    return likeDoc.exists();
  },
  getLikesCount: async (materialId) => {
    if (!db) {
      throw new Error('Firebase is not configured for database');
    }
    const snap = await getDocs(collection(db, 'materials', materialId, 'likes'));
    return snap.size;
  },
  toggleLike: async (materialId, user) => {
    if (!db) {
      throw new Error('Firebase is not configured for database');
    }
    const likeRef = doc(db, 'materials', materialId, 'likes', user.id);
    const exists = (await getDoc(likeRef)).exists();
    if (exists) {
      await deleteDoc(likeRef);
      return { liked: false };
    } else {
      await setDoc(likeRef, { userId: user.id, userName: user.name || user.email || '', createdAt: serverTimestamp() });
      return { liked: true };
    }
  },
  subscribeToComments: (materialId, cb) => {
    if (!db) throw new Error('Firebase is not configured for database');
    const q = query(collection(db, 'materials', materialId, 'comments'), orderBy('createdAt', 'asc'));
    return onSnapshot(q, (snap) => {
      const comments = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      cb(comments);
    });
  },
  addComment: async (materialId, { userId, userName, text }) => {
    if (!db) throw new Error('Firebase is not configured for database');
    if (!text || !text.trim()) return;
    await addDoc(collection(db, 'materials', materialId, 'comments'), {
      userId,
      userName,
      text: text.trim(),
      createdAt: serverTimestamp(),
    });
  },
  deleteComment: async (materialId, commentId) => {
    if (!db) throw new Error('Firebase is not configured for database');
    await deleteDoc(doc(db, 'materials', materialId, 'comments', commentId));
  },
  getCommentsCount: async (materialId) => {
    if (!db) throw new Error('Firebase is not configured for database');
    const snap = await getDocs(collection(db, 'materials', materialId, 'comments'));
    return snap.size;
  },
};
