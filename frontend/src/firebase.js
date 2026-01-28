import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Replace with your actual Firebase project config
const firebaseConfig = {
    apiKey: "AIzaSyCde9GtKppxOrAgEvnnxh5zDqL8QUWM4-Q",
    authDomain: "mdp-ote.firebaseapp.com",
    projectId: "mdp-ote",
    storageBucket: "mdp-ote.firebasestorage.app",
    messagingSenderId: "298098664840",
    appId: "1:298098664840:web:9c566f1e3705d79c40863d",
    measurementId: "G-TR78EXDB7V"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
