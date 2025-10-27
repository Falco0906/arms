import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase';

export const userService = {
  getUserById: async (id) => {
    const docRef = doc(db, 'users', id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      // Return a safe default profile
      return {
        id,
        name: '',
        email: '',
        role: 'STUDENT',
        statistics: { notes: 0, uploads: 0, downloads: 0 },
        recentCourses: [],
        pinnedCourses: [],
        materials: [],
        badges: [],
        achievements: [],
        preferences: {},
        social: {},
        settings: {}
      };
    }
    const data = docSnap.data();
    const result = {
      id: docSnap.id,
      ...data,
      statistics: data.statistics || { notes: 0, uploads: 0, downloads: 0 },
      recentCourses: data.recentCourses || [],
      pinnedCourses: data.pinnedCourses || [],
      materials: data.materials || [],
      badges: data.badges || [],
      achievements: data.achievements || [],
      preferences: data.preferences || {},
      social: data.social || {},
      settings: data.settings || {}
    };
    // Derived fields expected by UI
    result.uploads = result.uploads ?? result.statistics.uploads ?? 0;
    result.downloads = result.downloads ?? result.statistics.downloads ?? 0;
    result.notes = result.notes ?? result.statistics.notes ?? 0;
    result.rank = result.rank ?? 1;
    return result;
  },
  searchUsers: async (term) => {
    const build = (d) => {
      const data = d.data();
      const obj = {
        id: d.id,
        ...data,
        statistics: data.statistics || { notes: 0, uploads: 0, downloads: 0 },
        recentCourses: data.recentCourses || [],
        pinnedCourses: data.pinnedCourses || [],
        materials: data.materials || [],
        badges: data.badges || [],
        achievements: data.achievements || [],
        preferences: data.preferences || {},
        social: data.social || {},
        settings: data.settings || {}
      };
      obj.uploads = obj.uploads ?? obj.statistics.uploads ?? 0;
      obj.downloads = obj.downloads ?? obj.statistics.downloads ?? 0;
      obj.notes = obj.notes ?? obj.statistics.notes ?? 0;
      obj.rank = obj.rank ?? 1;
      return obj;
    };
    try {
      // Try name prefix
      const qName = query(collection(db, 'users'), where('name', '>=', term), where('name', '<=', term + '\\uf8ff'));
      const snapName = await getDocs(qName);
      if (!snapName.empty) return snapName.docs.map(build);
      // Try email prefix
      const qEmail = query(collection(db, 'users'), where('email', '>=', term), where('email', '<=', term + '\\uf8ff'));
      const snapEmail = await getDocs(qEmail);
      if (!snapEmail.empty) return snapEmail.docs.map(build);
      // Fallback to client-side contains on name/email (case-insensitive)
      const snapAll = await getDocs(collection(db, 'users'));
      const t = (term || '').toLowerCase();
      return snapAll.docs
        .map(build)
        .filter(u => (u.name || '').toLowerCase().includes(t) || (u.email || '').toLowerCase().includes(t));
    } catch (e) {
      const snapAll = await getDocs(collection(db, 'users'));
      const t = (term || '').toLowerCase();
      return snapAll.docs
        .map(build)
        .filter(u => (u.name || '').toLowerCase().includes(t) || (u.email || '').toLowerCase().includes(t));
    }
  },
  getTopUploaders: async (limit = 50) => {
    const materialsSnapshot = await getDocs(collection(db, 'materials'));
    const uploaderCounts = {};
    materialsSnapshot.forEach(d => {
      const { uploaderId } = d.data();
      uploaderCounts[uploaderId] = (uploaderCounts[uploaderId] || 0) + 1;
    });
    const entries = Object.entries(uploaderCounts).sort(([,a],[,b]) => b - a).slice(0, limit);
    const users = await Promise.all(entries.map(async ([userId, count]) => {
      const userDoc = await getDoc(doc(db, 'users', userId));
      return { id: userId, ...userDoc.data(), uploadCount: count };
    }));
    return users;
  }
};
