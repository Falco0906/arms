import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase';

export const authService = {
  // Register a new user
  register: async (userData) => {
    try {
      const { email, password, name, role = 'STUDENT' } = userData;
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update user profile
      await updateProfile(user, {
        displayName: name
      });

      // Create user document in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        name,
        email,
        role,
        createdAt: new Date().toISOString()
      });

      return {
        id: user.uid,
        name: user.displayName,
        email: user.email,
        role
      };
    } catch (error) {
      throw new Error(error.message);
    }
  },

  // Login user
  login: async (credentials) => {
    try {
      const { email, password } = credentials;
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Get additional user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();

      return {
        id: user.uid,
        name: user.displayName,
        email: user.email,
        role: userData.role
      };
    } catch (error) {
      throw new Error(error.message);
    }
  },

  // Logout user
  logout: async () => {
    try {
      await signOut(auth);
    } catch (error) {
      throw new Error(error.message);
    }
  },

  // Get current user
  getCurrentUser: async () => {
    const user = auth.currentUser;
    if (!user) return null;

    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const userData = userDoc.data();

    return {
      id: user.uid,
      name: user.displayName,
      email: user.email,
      role: userData.role
    };
  }
};