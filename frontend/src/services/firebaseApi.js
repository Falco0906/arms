import { db, storage } from '../firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';

// Course API
export const getCourses = async () => {
  try {
    const q = query(collection(db, 'courses'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching courses:', error);
    throw error;
  }
};

// Material API
export const getMaterials = async (courseId) => {
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
    console.error('Error fetching materials:', error);
    throw error;
  }
};

// Upload file to Firebase Storage
export const uploadFile = async (file, path = 'materials') => {
  try {
    const storageRef = ref(storage, `${path}/${uuidv4()}-${file.name}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return {
      path: downloadURL,
      name: file.name,
      type: file.type,
      size: file.size
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

// Add material to Firestore
export const addMaterial = async (materialData) => {
  try {
    const docRef = await addDoc(collection(db, 'materials'), {
      ...materialData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { id: docRef.id, ...materialData };
  } catch (error) {
    console.error('Error adding material:', error);
    throw error;
  }
};

// News API
export const getNews = async () => {
  try {
    const q = query(collection(db, 'news'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching news:', error);
    throw error;
  }
};

export default {
  getCourses,
  getMaterials,
  uploadFile,
  addMaterial,
  getNews
};
