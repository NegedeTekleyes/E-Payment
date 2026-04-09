import Button from "@/components/Button";
import InputField from "@/components/InputField";
import { COLORS } from "@/constants/colors";
import { useRouter } from "expo-router";
import { View, Text, StyleSheet } from "react-native";


export default function Login() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Electric Payment</Text>
            <Text style={styles.subtitle}>Agent Portal</Text>

         <InputField placeholder="Phone Number" />
         <InputField placeholder="Password" secure={true} />


         <Button title="Login" onPress={() => router.push("/dashboard")} />
        </View>

    )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 10,
    backgroundColor: COLORS.background,
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 26,
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