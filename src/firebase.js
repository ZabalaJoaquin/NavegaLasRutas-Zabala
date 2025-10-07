// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getFirestore, getDocs, collection } from "firebase/firestore"
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCKqkM1QIb8mViWTFqcyqIzgO_0alg4CBc",
  authDomain: "distrimax-c06b7.firebaseapp.com",
  projectId: "distrimax-c06b7",
  storageBucket: "distrimax-c06b7.firebasestorage.app",
  messagingSenderId: "73229978791",
  appId: "1:73229978791:web:91a6f145bc1da26785df82"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const db=getFirestore(app)

export async function getItems(){
    const querySnapshot = await getDocs(collection(db, "items"));
    querySnapshot.forEach((doc) => {
      console.log(`${doc.id} => ${doc.data()}`);
    });
}