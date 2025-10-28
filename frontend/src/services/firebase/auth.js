import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase';

export const authService = {
  register: async (userData) => {
    const { email, password, name, role = 'STUDENT' } = userData;
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    await updateProfile(user, { displayName: name });
    await setDoc(doc(db, 'users', user.uid), {
      name,
      email,
      role,
      statistics: { notes: 0, uploads: 0, downloads: 0 },
      createdAt: new Date().toISOString()
    });
    return { id: user.uid, name: user.displayName, email: user.email, role };
  },
  login: async (credentials) => {
    const { email, password } = credentials;
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const userData = userDoc.data();
    
    // Ensure statistics are initialized
    if (!userData?.statistics || typeof userData.statistics.uploads === 'undefined') {
      await updateDoc(doc(db, 'users', user.uid), {
        statistics: { notes: 0, uploads: 0, downloads: 0 }
      });
    }
    
    return { id: user.uid, name: user.displayName, email: user.email, role: userData?.role };
  },
  logout: async () => { await signOut(auth); },
  getCurrentUser: async () => {
    const user = auth.currentUser;
    if (!user) return null;
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const userData = userDoc.data();
    return { id: user.uid, name: user.displayName, email: user.email, role: userData?.role };
  }
};
