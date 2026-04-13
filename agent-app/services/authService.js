import { auth } from '../services/firbase/config';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';

// Register a new agent
export const registerAgent = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    let message = 'Registration failed';
    if (error.code === 'auth/email-already-in-use') message = 'Email already in use';
    else if (error.code === 'auth/invalid-email') message = 'Invalid email address';
    else if (error.code === 'auth/weak-password') message = 'Password should be at least 6 characters';
    return { success: false, error: message };
  }
};

// Login existing agent
export const loginAgent = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    let message = 'Login failed';
    if (error.code === 'auth/user-not-found') message = 'No account found with this email';
    else if (error.code === 'auth/wrong-password') message = 'Incorrect password';
    else if (error.code === 'auth/invalid-email') message = 'Invalid email address';
    return { success: false, error: message };
  }
};

// Logout
export const logoutAgent = async () => {
  await signOut(auth);
};

// Listen to auth state changes
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};