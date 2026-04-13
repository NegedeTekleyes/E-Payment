import Button from "@/components/Button";
import InputField from "@/components/InputField";
import { COLORS } from "@/constants/colors";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { addCustomer, customerExists } from "@/services/customerService";

export default function Register() {
  const router = useRouter();

  // State for form fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [account, setAccount] = useState("");
  
  // Loading state
  const [isLoading, setIsLoading] = useState(false);
  // Success message state
  const [successMessage, setSuccessMessage] = useState("");

  // Validation helpers
  const validatePhone = (text: string) => {
    const numeric = text.replace(/[^0-9]/g, "");
    if (numeric.length > 10) return numeric.slice(0, 10);
    return numeric;
  };

  const validateAccount = (text: string) => {
    const numeric = text.replace(/[^0-9]/g, "");
    if (numeric.length > 12) return numeric.slice(0, 12);
    return numeric;
  };

  const handleSave = async () => {
    // Trim spaces
    const fname = firstName.trim();
    const lname = lastName.trim();
    const phoneNum = phone.trim();
    const accNum = account.trim();

    // Validation
    if (!fname || !lname) {
      Alert.alert("Error", "Please enter both first name and last name.");
      return;
    }
    if (phoneNum.length !== 10) {
      Alert.alert("Error", "Phone number must be exactly 10 digits.");
      return;
    }
    if (accNum.length !== 12) {
      Alert.alert("Error", "Account number must be exactly 12 digits.");
      return;
    }

    setIsLoading(true);
    setSuccessMessage(""); // clear any previous success message

    try {
      // Check if account already exists
      const exists = await customerExists(accNum);
      if (exists) {
        Alert.alert("Duplicate", "An account with this number already exists.");
        setIsLoading(false);
        return;
      }

      // Save customer
      const newCustomer = {
        firstName: fname,
        lastName: lname,
        phone: phoneNum,
        account: accNum,
        createdAt: new Date().toISOString(),
      };

      await addCustomer(newCustomer);
      
      // Show success message (inline)
      setSuccessMessage("✅ Customer registered successfully!");
      
      // Clear form fields after successful save (optional)
      setFirstName("");
      setLastName("");
      setPhone("");
      setAccount("");
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
      
      // Also show an alert (optional – you can remove if you only want inline text)
      Alert.alert("Success", "Customer registered successfully!", [
        { text: "OK", onPress: () => router.back() }
      ]);
    } catch (error: any) {
      console.error("Save error:", error);
      Alert.alert("Error", `Failed to save: ${error.message || "Unknown error"}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Header with back arrow */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Register Customer</Text>
      </View>

      {/* Form fields */}
      <Text style={styles.label}>First Name</Text>
      <InputField
        placeholder="Enter First Name"
        value={firstName}
        onChangeText={setFirstName}
      />

      <Text style={styles.label}>Last Name</Text>
      <InputField
        placeholder="Enter Last Name"
        value={lastName}
        onChangeText={setLastName}
      />

      <Text style={styles.label}>Phone Number (10 digits)</Text>
      <InputField
        placeholder="e.g., 0912345678"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={(text: any) => setPhone(validatePhone(text))}
        maxLength={10}
      />

      <Text style={styles.label}>Contract Account Number (12 digits)</Text>
      <InputField
        placeholder="e.g., 100001064426"
        keyboardType="phone-pad"
        value={account}
        onChangeText={(text: any) => setAccount(validateAccount(text))}
        maxLength={12}
      />

      {/* Success message inline */}
      {successMessage !== "" && (
        <View style={styles.successContainer}>
          <Text style={styles.successText}>{successMessage}</Text>
        </View>
      )}

      <Button 
        title={isLoading ? "Saving..." : "Save Customer"} 
        onPress={handleSave} 
        disabled={isLoading}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  backButton: {
    marginRight: 15,
    padding: 5,
  },
  backArrow: {
    fontSize: 28,
    color: COLORS.primary,
    fontWeight: "600",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.textPrimary || "#1f2937",
  },
  label: {
    fontWeight: "bold",
    marginBottom: 5,
    marginTop: 10,
  },
  successContainer: {
    backgroundColor: "#d4edda",
    padding: 12,
    borderRadius: 8,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: "#c3e6cb",
  },
  successText: {
    color: "#155724",
    fontSize: 14,
    textAlign: "center",
    fontWeight: "500",
  },
});