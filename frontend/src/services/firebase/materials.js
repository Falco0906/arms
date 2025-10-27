import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { collection, doc, addDoc, getDoc, getDocs, query, where, orderBy, limit as fbLimit, deleteDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { storage, db } from '../../firebase';

export const materialService = {
  uploadMaterial: async (courseId, file, metadata) => {
    const timestamp = Date.now();
    const filename = `${courseId}/${timestamp}_${file.name}`;
    const storageRef = ref(storage, `materials/${filename}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadUrl = await getDownloadURL(snapshot.ref);
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
    const materialDoc = await getDoc(doc(db, 'materials', materialId));
    if (!materialDoc.exists()) throw new Error('Material not found');
    const materialData = materialDoc.data();
    const storageRef = ref(storage, `materials/${materialData.path}`);
    await deleteObject(storageRef);
    await deleteDoc(doc(db, 'materials', materialId));
  },
  incrementDownloads: async (materialId) => {
    const materialRef = doc(db, 'materials', materialId);
    const materialDoc = await getDoc(materialRef);
    if (!materialDoc.exists()) throw new Error('Material not found');
    await updateDoc(materialRef, { downloads: (materialDoc.data().downloads || 0) + 1 });
  }
};
