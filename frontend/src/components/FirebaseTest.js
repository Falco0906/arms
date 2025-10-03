import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { collection, addDoc, getDocs } from 'firebase/firestore';

const FirebaseTest = () => {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('test@klh.edu.in');
  const [password, setPassword] = useState('test123');
  const [status, setStatus] = useState('');

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setStatus(user ? `Signed in as: ${user.email}` : 'Not signed in');
    });
    return unsubscribe;
  }, []);

  const testSignUp = async () => {
    try {
      setStatus('Creating account...');
      await createUserWithEmailAndPassword(auth, email, password);
      setStatus('Account created successfully!');
    } catch (error) {
      setStatus(`Sign up error: ${error.message}`);
    }
  };

  const testSignIn = async () => {
    try {
      setStatus('Signing in...');
      await signInWithEmailAndPassword(auth, email, password);
      setStatus('Signed in successfully!');
    } catch (error) {
      setStatus(`Sign in error: ${error.message}`);
    }
  };

  const testFirestore = async () => {
    try {
      setStatus('Testing Firestore...');
      
      // Add a test document
      const docRef = await addDoc(collection(db, 'test'), {
        message: 'Hello Firebase!',
        timestamp: new Date()
      });
      
      // Read documents
      const querySnapshot = await getDocs(collection(db, 'test'));
      const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      setStatus(`Firestore works! Added doc ${docRef.id}. Found ${docs.length} documents.`);
    } catch (error) {
      setStatus(`Firestore error: ${error.message}`);
    }
  };

  const testSignOut = async () => {
    try {
      await signOut(auth);
      setStatus('Signed out successfully!');
    } catch (error) {
      setStatus(`Sign out error: ${error.message}`);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-md mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-4">Firebase Test</h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg"
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Password:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg"
        />
      </div>
      
      <div className="space-y-2 mb-4">
        <button onClick={testSignUp} className="w-full bg-blue-500 text-white py-2 rounded-lg">
          Test Sign Up
        </button>
        <button onClick={testSignIn} className="w-full bg-green-500 text-white py-2 rounded-lg">
          Test Sign In
        </button>
        <button onClick={testFirestore} className="w-full bg-purple-500 text-white py-2 rounded-lg">
          Test Firestore
        </button>
        <button onClick={testSignOut} className="w-full bg-red-500 text-white py-2 rounded-lg">
          Sign Out
        </button>
      </div>
      
      <div className="p-3 bg-gray-100 rounded-lg">
        <strong>Status:</strong> {status}
      </div>
      
      {user && (
        <div className="mt-4 p-3 bg-green-100 rounded-lg">
          <strong>User:</strong> {user.email}
        </div>
      )}
    </div>
  );
};

export default FirebaseTest;