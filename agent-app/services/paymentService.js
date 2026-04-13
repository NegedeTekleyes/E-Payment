import { db } from '../services/firbase/config';
import { doc, setDoc, getDocs, collection } from 'firebase/firestore';

// Add a payment for a specific customer (customerId is the phone number)
export const addPayment = async (customerId, month, amount) => {
  if (!customerId || !month || amount === undefined) return;
  const numericAmount = Number(amount);
  if (isNaN(numericAmount) || numericAmount <= 0) return;

  try {
    // Reference: customers/{customerId}/payments/{month}
    const paymentRef = doc(db, 'customers', customerId, 'payments', month);
    await setDoc(paymentRef, {
      amount: numericAmount,
      date: new Date().toISOString(),
    });
    console.log(`Payment added for ${customerId} - ${month}`);
  } catch (error) {
    console.error('Error adding payment:', error);
    throw error;
  }
};

// Get all payments for a customer
export const getPaymentsForCustomer = async (customerId) => {
  try {
    const paymentsCollection = collection(db, 'customers', customerId, 'payments');
    const snapshot = await getDocs(paymentsCollection);
    const payments = {};
    snapshot.forEach(doc => {
      payments[doc.id] = doc.data();
    });
    return payments;
  } catch (error) {
    console.error('Error getting payments for customer:', error);
    return {};
  }
};

// The following functions are kept for backward compatibility but are not used with Firestore
// If your old code calls getPayments() or savePayments(), you can remove them.
// To avoid breaking changes, we keep them but they will not work as expected.
export const getPayments = async () => {
  console.warn('getPayments() is deprecated and returns empty object. Use getPaymentsForCustomer() instead.');
  return {};
};

export const savePayments = async (payments) => {
  console.warn('savePayments() is deprecated and does nothing. Use addPayment() instead.');
};

// Update an existing payment (overwrites amount and updates date)
export const updatePayment = async (customerId, month, newAmount) => {
  if (!customerId || !month || newAmount === undefined) return;
  const numericAmount = Number(newAmount);
  if (isNaN(numericAmount) || numericAmount <= 0) return;

  try {
    const paymentRef = doc(db, 'customers', customerId, 'payments', month);
    await setDoc(paymentRef, {
      amount: numericAmount,
      date: new Date().toISOString(), // update the date to now
    });
    console.log(`Payment updated for ${customerId} - ${month} to ${numericAmount}`);
  } catch (error) {
    console.error('Error updating payment:', error);
    throw error;
  }
};
// Legacy alias (if your CustomerDetail uses addPayments, we map it to addPayment)
export const addPayments = addPayment;