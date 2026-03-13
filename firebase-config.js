/**
 * FIREBASE CONFIGURATION & SETUP
 * 
 * QUICK START:
 * 1. Replace firebaseConfig values below with your actual config
 * 2. See FIREBASE_GUIDE.md for complete setup instructions
 */

// ====================================
// REPLACE WITH YOUR FIREBASE CONFIG
// ====================================
// Get your config from: Firebase Console → Settings → Project Settings
const firebaseConfig = {
  apiKey: "AIzaSyAwvzNFT3ITPIDnlNA2FOZY8DFy_nYZwbQ",
  authDomain: "caffernaum-93d95.firebaseapp.com",
  projectId: "caffernaum-93d95",
  storageBucket: "caffernaum-93d95.firebasestorage.app",
  messagingSenderId: "393502562468",
  appId: "1:393502562468:web:d8587800c4ae189a526e31",
  measurementId: "G-H6K00LQHQN"
};

// ====================================
// INITIALIZE FIREBASE
// ====================================
// Import Firebase modules from CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { 
  getFirestore,
  collection,
  addDoc,
  setDoc,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Export Firestore functions for use in other files
export { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  collection, 
  addDoc, 
  setDoc,
  getDocs, 
  doc, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp 
};
