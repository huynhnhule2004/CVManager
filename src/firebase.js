// firebase.js
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, push, onValue, update, get  } from 'firebase/database';
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAJSlLv3-LxG2FvXATzivaZlrKKTyMTceU",
  authDomain: "vuejs-cb0f7.firebaseapp.com",
  projectId: "vuejs-cb0f7",
  storageBucket: "vuejs-cb0f7.appspot.com",
  messagingSenderId: "422783484607",
  appId: "1:422783484607:web:807c56bdbdaeb8e1c63c0a",
  measurementId: "G-247N50KPPP",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const database = getDatabase(app);

export { storage, storageRef, uploadBytesResumable, getDownloadURL, database, ref, set, push, onValue, update, get };  // Đảm bảo export push ở đây
