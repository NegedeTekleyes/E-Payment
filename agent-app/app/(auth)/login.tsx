import Button from "@/components/Button";
import InputField from "@/components/InputField";
import { COLORS } from "@/constants/colors";
import { useRouter } from "expo-router";
import { useState } from "react";
import { View, Text, StyleSheet, Alert, TouchableOpacity } from "react-native";
import { loginAgent } from "../../services/authService";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter email and password");
      return;
    }

    setLoading(true);
    const result = await loginAgent(email, password);
    setLoading(false);

    if (result.success) {
      router.replace("/dashboard");
    } else {
      Alert.alert("Login Failed", result.error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Electric Payment</Text>
      <Text style={styles.subtitle}>Agent Portal</Text>

      <InputField
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <InputField
        placeholder="Password"
        secureTextEntry={true}
        value={password}
        onChangeText={setPassword}
      />

      <Button title={loading ? "Logging in..." : "Login"} onPress={handleLogin} disabled={loading} />
    </View>
  );
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
  linkContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  link: {
    color: COLORS.primary,
    fontSize: 16,
  },
});