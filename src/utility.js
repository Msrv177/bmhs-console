import { app, database, db, storage } from './firebase-config';
import { collection, query, where, getDocs, addDoc, doc, setDoc } from "firebase/firestore"; 

const setCookie = (name, value, days) => {
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/; SameSite=Lax; Secure";
};

const getCookie = (name) => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

// New function to manage local storage for user login data
const setLocalStorageLoginData = (email) => {
  const loginData = {
    email: email,
    timestamp: new Date().getTime() // Store current timestamp
  };
  localStorage.setItem('userLoginData', JSON.stringify(loginData));
};

const getLocalStorageLoginData = () => {
  const storedData = localStorage.getItem('userLoginData');
  if (storedData) {
    try {
      const userData = JSON.parse(storedData);
      const now = new Date().getTime();
      const fortyEightHours = 48 * 60 * 60 * 1000;

      if (now - userData.timestamp < fortyEightHours) {
        return userData;
      } else {
        // Data is older than 48 hours, clear it
        localStorage.removeItem('userLoginData');
        return null;
      }
    } catch (e) {
      console.error("Error parsing userLoginData from localStorage:", e);
      localStorage.removeItem('userLoginData'); // Clear corrupted data
      return null;
    }
  }
  return null;
};

const clearLocalStorageLoginData = () => {
  localStorage.removeItem('userLoginData');
};

// Check if a user's collection has any documents (exists or not)
const checkUserByMailInDb = async (mail) => {
  try {
    const userCollectionRef = collection(db, mail); // user mail = collection name
    const snapshot = await getDocs(userCollectionRef);

    return !snapshot.empty; // true if collection has docs, false otherwise
  } catch (error) {
    console.error("Error checking user collection:", error);
    throw error;
  }
};

// Save user data with fixed document ID "Personal_Data"
const saveUserData = async (userData) => {
  try {
    if (!userData.mail) {
      throw new Error("mail field is required in userData");
    }

    // Reference to: /{mail}/Personal_Data
    const userDocRef = doc(collection(db, userData.mail), "Personal_Data");

    await setDoc(userDocRef, {
      ...userData,
      updatedAt: Date.now(),
    }, { merge: true }); // merge: true -> update instead of overwrite

    console.log(`User data saved in collection "${userData.mail}" with doc ID "Personal_Data"`);
    return "Personal_Data";
  } catch (error) {
    console.error("Error saving user data:", error);
    throw error;
  }
};



export { saveUserData, checkUserByMailInDb, setCookie, getCookie, setLocalStorageLoginData, getLocalStorageLoginData, clearLocalStorageLoginData };

