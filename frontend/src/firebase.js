import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, addDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

// Initialize Firebase safely (do not crash if env vars are missing)
let app = null;
try {
  // Basic sanity: require at least apiKey and projectId
  if (firebaseConfig.apiKey && firebaseConfig.projectId) {
    app = initializeApp(firebaseConfig);
  } else {
    // Attempt initialization anyway; if it fails, we'll catch below
    app = initializeApp(firebaseConfig);
  }
} catch (e) {
  console.warn('Firebase initialization skipped or failed. Set REACT_APP_FIREBASE_* env vars to enable.', e?.message || e);
}

export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;
export const storage = app ? getStorage(app) : null;

export default app;

export async function seedCourses(items) {
  const col = collection(db, 'courses');
  for (const item of items) {
    const docData = {
      code: item.code,
      title: item.title,
      description: item.description || '',
      year: item.year,
      academicYear: item.academicYear,
      semester: item.semester,
      ltps: item.ltps,
      section: item.section,
      facultyName: item.facultyName,
      createdAt: serverTimestamp()
    };
    await addDoc(col, docData);
  }
}

export async function seedNews(items) {
  const col = collection(db, 'news');
  for (const item of items) {
    const docData = {
      title: item.title,
      content: item.content,
      type: item.type || 'ANNOUNCEMENT',
      author: item.author || 'Admin',
      priority: item.priority || 'medium',
      createdAt: serverTimestamp()
    };
    await addDoc(col, docData);
  }
}

export async function seedMaterials(items) {
  // Note: This creates metadata only; actual file uploads require Firebase Storage (Blaze plan)
  const col = collection(db, 'materials');
  for (const item of items) {
    const docData = {
      courseId: item.courseId,
      title: item.title,
      description: item.description || '',
      filename: item.filename || item.title,
      path: item.path || '',
      url: item.url || '',
      type: item.type || 'application/pdf',
      size: item.size || 0,
      uploaderId: item.uploaderId,
      downloads: 0,
      createdAt: serverTimestamp()
    };
    await addDoc(col, docData);
  }
}

export async function fixCurrentUser() {
  const user = auth.currentUser;
  if (!user) {
    console.error('No user logged in');
    return;
  }
  const userRef = doc(db, 'users', user.uid);
  await setDoc(userRef, {
    name: user.displayName || '',
    email: user.email || '',
    role: 'STUDENT',
    statistics: { notes: 0, uploads: 0, downloads: 0 },
    recentCourses: [],
    pinnedCourses: [],
    materials: [],
    badges: [],
    achievements: [],
    preferences: {},
    social: {},
    settings: {},
    createdAt: new Date().toISOString()
  }, { merge: true });
  console.log('User doc updated for', user.uid);
  return true;
}

if (process.env.NODE_ENV !== 'production') {
  // eslint-disable-next-line no-undef
  window.seedCourses = seedCourses;
  // eslint-disable-next-line no-undef
  window.seedNews = seedNews;
  // eslint-disable-next-line no-undef
  window.seedMaterials = seedMaterials;
  // eslint-disable-next-line no-undef
  window.fixCurrentUser = fixCurrentUser;
}
