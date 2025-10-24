import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyDhGT54sMQCx0NHHlSslYxR9qgbX0LhTeI",
  authDomain: "portfolio-58276.firebaseapp.com",
  projectId: "portfolio-58276",
  storageBucket: "portfolio-58276.firebasestorage.app",
  messagingSenderId: "1060040067617",
  appId: "1:1060040067617:web:70ff11640986ce98c53160",
  measurementId: "G-8QNZP59JRH"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firestore
export const db = getFirestore(app)

// Initialize Auth
export const auth = getAuth(app)

export default app
