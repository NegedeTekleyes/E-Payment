import Button from "@/components/Button";
import InputField from "@/components/InputField";
import { COLORS } from "@/constants/colors";
import { useRouter } from "expo-router";
import { useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";


export default function Login() {
    const router = useRouter();

    const [phone, setPhone] = useState("")
    const [password, setPassword] = useState("")

    // Hard coded
    const VALID_PHONE = "0941416514"
    const VALID_PASSWORD = "1234"


    const validatePhone = (text: string) => {
    const numeric = text.replace(/[^0-9]/g, "");
    if (numeric.length > 10) return numeric.slice(0, 10);
    return numeric;
  
  };

    const handleLogin = () => {
    const trimmedPhone = phone.trim();
    const trimmedPassword = password.trim();

    // Validation
    if (trimmedPhone.length !== 10) {
      Alert.alert("Error", "Phone number must be exactly 10 digits.");
      return;
    }
    if (!trimmedPassword) {
      Alert.alert("Error", "Password cannot be empty.");
      return;
    }

    // Authentication
    if (trimmedPhone === VALID_PHONE && trimmedPassword === VALID_PASSWORD) {
      // Success – navigate to dashboard
      router.replace("/dashboard"); // use replace to prevent going back to login
    } else {
      Alert.alert("Login Failed", "Invalid phone number or password.");
    }
  };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Electric Payment</Text>
            <Text style={styles.subtitle}>Agent Portal</Text>

       <InputField
        placeholder="Phone Number"
        value={phone}
        onChangeText={(text: any) => setPhone(validatePhone(text))}
      />
         <InputField 
          placeholder="Password"
          secureTextEntry={true}
          value={password}
          onChangeText={setPassword}
          />


         <Button title="Login" onPress={handleLogin} />
        </View>

    )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 26,
    marginTop: 30,
    fontWeight: "bold",
    textAlign: "center",
    color: COLORS.textPrimary,
  },
  subtitle: {
    textAlign: "center",
    marginBottom: 30,
    color: COLORS.textSecondary,
  },
});