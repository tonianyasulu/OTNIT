import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {

  apiKey: "AIzaSyCqBGPCUGbLtykBzkHH89DyHKl5KZKGhPM",

  authDomain: "romantic-surprise-e5386.firebaseapp.com",

  projectId: "romantic-surprise-e5386",

  storageBucket: "romantic-surprise-e5386.firebasestorage.app",

  messagingSenderId: "961943296976",

  appId: "1:961943296976:web:b423cce6a4377f319237d5"

};


let db = null

try {
  const app = initializeApp(firebaseConfig)
  db = getFirestore(app)
} catch (e) {
  console.error('Firebase init failed', e)
}

export { db }