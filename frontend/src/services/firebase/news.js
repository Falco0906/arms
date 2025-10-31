import { collection, addDoc, getDocs, query, where, orderBy, limit, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';

export const newsService = {
  getAllNews: async (page = 0, size = 10, search = null, type = null) => {
    let q = collection(db, 'news');
    if (search) q = query(q, where('title', '>=', search), where('title', '<=', search + '\uf8ff'));
    if (type) q = query(q, where('type', '==', type));
    q = query(q, orderBy('createdAt', 'desc'), limit(size));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  },
  getRecentNews: async (lim = 5) => {
    const q = query(collection(db, 'news'), orderBy('createdAt', 'desc'), limit(lim));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  },
  createNews: async (newsData) => {
    const docRef = await addDoc(collection(db, 'news'), { ...newsData, createdAt: serverTimestamp() });
    return { id: docRef.id, ...newsData };
  },
  deleteNews: async (newsId) => {
    await deleteDoc(doc(db, 'news', newsId));
  }
};
