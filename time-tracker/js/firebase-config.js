// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDpdBTdauiwq0RU1lic4kBlMoVbjdW4-co",
    authDomain: "yghgjhg.firebaseapp.com",
    projectId: "yghgjhg",
    storageBucket: "yghgjhg.firebasestorage.app",
    messagingSenderId: "164220086048",
    appId: "1:164220086048:web:25f38250b06d16d2b7d945",
    measurementId: "G-ZF9FRKRCF9"
  };
  
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  
  // Initialize Firebase Authentication and get a reference to the service
  const auth = firebase.auth();
  
  // Initialize Cloud Firestore and get a reference to the service
  const db = firebase.firestore();
  
  // Initialize Cloud Storage and get a reference to the service
  const storage = firebase.storage();