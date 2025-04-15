// /integrations/firebase/client.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBmsxcmhn02O6HEHgp2URqFQq3MbR12yac",
    authDomain: "mary-group-project.firebaseapp.com",
    projectId: "mary-group-project",
    storageBucket: "mary-group-project.firebasestorage.app",
    messagingSenderId: "1015249751156",
    appId: "1:1015249751156:web:63955568fb693c5b6b9521"
  };

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
