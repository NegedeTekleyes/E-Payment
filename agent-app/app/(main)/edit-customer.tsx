import { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import InputField from '../../components/InputField';
import Button from '../../components/Button';
import { COLORS } from '../../constants/colors';
import { db } from '../../services/firbase/config'; 
import { doc, updateDoc, setDoc, deleteDoc, getDoc, collection, getDocs } from 'firebase/firestore';

export default function EditCustomer() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const oldAccount = params.account as string;

  const [firstName, setFirstName] = useState(params.firstName as string);
  const [lastName, setLastName] = useState(params.lastName as string);
  const [phone, setPhone] = useState(params.phone as string);
  const [newAccount, setNewAccount] = useState(params.account as string); // ✅ editable account
  const [loading, setLoading] = useState(false);

  // Validate account number (12 digits)
  const validateAccount = (text: string) => {
    const numeric = text.replace(/[^0-9]/g, '');
    if (numeric.length > 12) return numeric.slice(0, 12);
    return numeric;
  };

  const handleUpdate = async () => {
    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const trimmedPhone = phone.trim();
    const trimmedNewAccount = newAccount.trim();

    if (!trimmedFirstName || !trimmedLastName) {
      Alert.alert('Error', 'First name and last name are required.');
      return;
    }
    if (trimmedPhone.length !== 10) {
      Alert.alert('Error', 'Phone number must be exactly 10 digits.');
      return;
    }
    if (trimmedNewAccount.length !== 12) {
      Alert.alert('Error', 'Account number must be exactly 12 digits.');
      return;
    }

    setLoading(true);
    try {
      // If account number is being changed
      if (trimmedNewAccount !== oldAccount) {
        // 1. Check if new account already exists
        const newAccountRef = doc(db, 'customers', trimmedNewAccount);
        const newAccountSnap = await getDoc(newAccountRef);
        if (newAccountSnap.exists()) {
          Alert.alert('Error', 'Account number already exists. Please use a different one.');
          setLoading(false);
          return;
        }

        // 2. Get all payments from old account
        const oldPaymentsRef = collection(db, 'customers', oldAccount, 'payments');
        const paymentsSnapshot = await getDocs(oldPaymentsRef);
        const payments: { [key: string]: any } = {};
        paymentsSnapshot.forEach(doc => {
          payments[doc.id] = doc.data();
        });

        // 3. Create new customer document with new account ID
        const newCustomerData = {
          firstName: trimmedFirstName,
          lastName: trimmedLastName,
          phone: trimmedPhone,
          account: trimmedNewAccount,
          createdAt: new Date().toISOString(),
        };
        await setDoc(newAccountRef, newCustomerData);

        // 4. Copy all payments to new account's subcollection
        for (const [month, paymentData] of Object.entries(payments)) {
          const newPaymentRef = doc(db, 'customers', trimmedNewAccount, 'payments', month);
          await setDoc(newPaymentRef, paymentData);
        }

        // 5. Delete old customer document (subcollections auto-delete when parent doc is deleted in newer Firestore versions, but we already copied)
        const oldCustomerRef = doc(db, 'customers', oldAccount);
        await deleteDoc(oldCustomerRef);

        Alert.alert('Success', 'Customer updated successfully (account number changed).', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      } else {
        // Account number unchanged – simple update
        const customerRef = doc(db, 'customers', oldAccount);
        await updateDoc(customerRef, {
          firstName: trimmedFirstName,
          lastName: trimmedLastName,
          phone: trimmedPhone,
        });
        Alert.alert('Success', 'Customer updated successfully.', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to update customer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backArrow}>←</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Edit Customer</Text>

      <Text style={styles.label}>First Name</Text>
      <InputField value={firstName} onChangeText={setFirstName} placeholder="First Name" />

      <Text style={styles.label}>Last Name</Text>
      <InputField value={lastName} onChangeText={setLastName} placeholder="Last Name" />

      <Text style={styles.label}>Phone Number (10 digits)</Text>
      <InputField
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        maxLength={10}
        placeholder="e.g., 0912345678"
      />

      <Text style={styles.label}>Account Number (12 digits) – editable</Text>
      <InputField
        value={newAccount}
        onChangeText={(text) => setNewAccount(validateAccount(text))}
        keyboardType="numeric"
        maxLength={12}
        placeholder="e.g., 100001064426"
      />

      <Button title={loading ? "Updating..." : "Update Customer"} onPress={handleUpdate} disabled={loading} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    padding: 20,
    paddingTop: 50,
  },
  backButton: {
    marginBottom: 20,
  },
  backArrow: {
    fontSize: 28,
    color: COLORS.primary,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: COLORS.textPrimary || '#1f2937',
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 5,
    marginTop: 10,
  },
});