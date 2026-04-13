import { db } from '../services/firbase/config';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs ,
  deleteDoc
} from 'firebase/firestore';

const CUSTOMERS_COLLECTION = 'customers';

// Get all customers
export const getCustomers = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, CUSTOMERS_COLLECTION));
    const customers = [];
    querySnapshot.forEach((doc) => {
      customers.push(doc.data());
    });
    return customers;
  } catch (error) {
    console.error('Error getting customers:', error);
    return [];
  }
};

// Save customers (not needed for Firestore, but kept for compatibility if any code calls it)
// Firestore writes are done directly with addCustomer/updateCustomer
export const saveCustomers = async (customers) => {
  // This function is no longer used with Firestore.
  // If you call it, it will overwrite all customers – avoid using it.
  console.warn('saveCustomers is deprecated. Use addCustomer or updateCustomer instead.');
};

// Add a new customer (using account number as document ID)
export const addCustomer = async (customer) => {
  try {
    const customerRef = doc(db, CUSTOMERS_COLLECTION, customer.account);
    await setDoc(customerRef, customer);
    console.log('Customer added with account:', customer.account);
  } catch (error) {
    console.error('Error adding customer:', error);
    throw error;
  }
};

// Check if a customer exists by account number
export const customerExists = async (accountNumber) => {
  try {
    const customerRef = doc(db, CUSTOMERS_COLLECTION, accountNumber);
    const docSnap = await getDoc(customerRef);
    return docSnap.exists();
  } catch (error) {
    console.error('Error checking customer existence:', error);
    return false;
  }
};

// Get a single customer by account number
export const getCustomerByAccount = async (accountNumber) => {
  try {
    const customerRef = doc(db, CUSTOMERS_COLLECTION, accountNumber);
    const docSnap = await getDoc(customerRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } catch (error) {
    console.error('Error getting customer by account:', error);
    return null;
  }
};

export const deleteCustomerAndPayments = async (account) => {
  try {
    // 1. Delete all payment documents in the subcollection
    const paymentsRef = collection(db, 'customers', account, 'payments');
    const paymentsSnapshot = await getDocs(paymentsRef);
    const deletePromises = paymentsSnapshot.docs.map(paymentDoc => deleteDoc(paymentDoc.ref));
    await Promise.all(deletePromises);
    
    // 2. Delete the customer document itself
    const customerRef = doc(db, 'customers', account);
    await deleteDoc(customerRef);
    
    console.log(`Customer ${account} and all payments deleted.`);
  } catch (error) {
    console.error('Error deleting customer:', error);
    throw error;
  }
};