import Card from "@/components/Card";
import { COLORS } from "@/constants/colors";
import { useRouter } from "expo-router";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native";

export default function Dashboard() {
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: () => {
            // Clear any stored auth data (e.g., AsyncStorage, context, etc.)
            // For now, just navigate to login screen
            // Replace '/login' with your actual login route
            router.replace("/login");
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>📋 Dashboard</Text>

      <Card
        title="➕ Register Customer"
        subtitle="Add new customer info"
        onPress={() => router.push("/register")}
      />

      <Card
        title="🔍 Search Customer"
        subtitle="Find and manage customers"
        onPress={() => router.push("/search")}
      />

      <Card
        title="📤 Export Payment Data"
        subtitle="Download payment information"
        onPress={() => router.push("/export")}
      />

      {/* Logout button at bottom */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>🚪 Logout</Text>
      </TouchableOpacity>
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
    paddingTop: 60,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 30,
    color: COLORS.textPrimary || "#1f2937",
    textAlign: "center",
  },
  logoutButton: {
    marginTop: 40,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#dc2626",
    backgroundColor: "#fff",
    alignItems: "center",
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#dc2626",
  },
});