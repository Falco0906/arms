import { collection, doc, addDoc, getDoc, getDocs, query, where, orderBy, serverTimestamp, onSnapshot, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';

export const chatService = {
  subscribeToCourseMessages: (courseId, cb) => {
    const q = query(collection(db, 'courses', courseId, 'messages'), orderBy('createdAt', 'asc'));
    return onSnapshot(q, (snap) => {
      const msgs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      cb(msgs);
    });
  },
  sendCourseMessage: async (courseId, { userId, userName, text }) => {
    if (!text || !text.trim()) return;
    await addDoc(collection(db, 'courses', courseId, 'messages'), {
      userId,
      userName,
      text: text.trim(),
      createdAt: serverTimestamp(),
      deletedFor: [],
    });
  },
  deleteCourseMessageForMe: async (courseId, messageId, userId) => {
    if (!db) throw new Error('Firebase is not configured for database');
    const messageRef = doc(db, 'courses', courseId, 'messages', messageId);
    const messageDoc = await getDoc(messageRef);
    if (!messageDoc.exists()) return;
    const deletedFor = messageDoc.data().deletedFor || [];
    if (!deletedFor.includes(userId)) {
      await updateDoc(messageRef, { deletedFor: [...deletedFor, userId] });
    }
  },
  deleteCourseMessageForEveryone: async (courseId, messageId) => {
    if (!db) throw new Error('Firebase is not configured for database');
    await deleteDoc(doc(db, 'courses', courseId, 'messages', messageId));
  },

  getOrCreateDMConversation: async (currentUser, otherUser) => {
    const q = query(collection(db, 'conversations'), where('participantIds', 'array-contains', currentUser.id));
    const snap = await getDocs(q);
    let conv = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      .find(c => Array.isArray(c.participantIds) && c.participantIds.includes(otherUser.id));
    if (conv) return conv;
    const participantIds = [currentUser.id, otherUser.id].sort();
    const participants = [
      { id: currentUser.id, name: currentUser.name || currentUser.email || '' },
      { id: otherUser.id, name: otherUser.name || otherUser.email || '' },
    ];
    const ref = await addDoc(collection(db, 'conversations'), {
      type: 'dm',
      participantIds,
      participants,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    const newDoc = await getDoc(ref);
    return { id: ref.id, ...newDoc.data() };
  },
  subscribeToUserConversations: (userId, cb) => {
    const q = query(collection(db, 'conversations'), where('participantIds', 'array-contains', userId));
    return onSnapshot(q, (snap) => {
      const convs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      cb(convs);
    });
  },
  subscribeToDM: (conversationId, cb) => {
    const q = query(collection(db, 'conversations', conversationId, 'messages'), orderBy('createdAt', 'asc'));
    return onSnapshot(q, (snap) => {
      const msgs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      cb(msgs);
    });
  },
  sendDM: async (conversationId, { userId, userName, text }) => {
    if (!text || !text.trim()) return;
    await addDoc(collection(db, 'conversations', conversationId, 'messages'), {
      userId,
      userName,
      text: text.trim(),
      createdAt: serverTimestamp(),
      deletedFor: [], // Track who deleted this message
    });
    await updateDoc(doc(db, 'conversations', conversationId), { 
      updatedAt: serverTimestamp(),
      lastMessage: text.trim(),
      lastMessageSender: userId
    });
  },
  markConversationAsRead: async (conversationId, userId) => {
    if (!db) throw new Error('Firebase is not configured for database');
    const convRef = doc(db, 'conversations', conversationId);
    const convDoc = await getDoc(convRef);
    if (!convDoc.exists()) return;
    const readBy = convDoc.data().readBy || [];
    if (!readBy.includes(userId)) {
      await updateDoc(convRef, { readBy: [...readBy, userId] });
    }
  },
  deleteMessageForMe: async (conversationId, messageId, userId) => {
    if (!db) throw new Error('Firebase is not configured for database');
    const messageRef = doc(db, 'conversations', conversationId, 'messages', messageId);
    const messageDoc = await getDoc(messageRef);
    if (!messageDoc.exists()) return;
    const deletedFor = messageDoc.data().deletedFor || [];
    if (!deletedFor.includes(userId)) {
      await updateDoc(messageRef, { deletedFor: [...deletedFor, userId] });
    }
  },
  deleteMessageForEveryone: async (conversationId, messageId) => {
    if (!db) throw new Error('Firebase is not configured for database');
    await deleteDoc(doc(db, 'conversations', conversationId, 'messages', messageId));
  },
  deleteConversation: async (conversationId) => {
    if (!db) throw new Error('Firebase is not configured for database');
    // Delete all messages first
    const messagesSnap = await getDocs(collection(db, 'conversations', conversationId, 'messages'));
    await Promise.all(messagesSnap.docs.map(d => deleteDoc(d.ref)));
    // Delete conversation
    await deleteDoc(doc(db, 'conversations', conversationId));
  },
};
