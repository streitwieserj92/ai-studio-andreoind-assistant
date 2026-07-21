import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, setDoc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import config from '@/firebase-applet-config.json';

// Initialize Firebase with environment variable override for the API key
const firebaseConfig = {
  ...config,
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || config.apiKey
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export { collection, addDoc, getDocs, deleteDoc, doc, setDoc, query, orderBy, serverTimestamp };
