import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, setDoc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import config from '@/firebase-applet-config.json';

// Initialize Firebase
const app = initializeApp(config);
export const db = getFirestore(app);

export { collection, addDoc, getDocs, deleteDoc, doc, setDoc, query, orderBy, serverTimestamp };
