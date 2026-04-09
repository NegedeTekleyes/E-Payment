import Card from "@/components/Card";
import { COLORS } from "@/constants/colors";
import { useRouter } from "expo-router";
import { View,Text,StyleSheet } from "react-native";


export default function Dashboard() {
    const router = useRouter();
    return (
      <View style={styles.container}>
        <Text style={styles.title}>
            Dashboard
        </Text>

        <Card
        title= "Register Customer"
        subtitle="Add new customer info"
        onPress={() => router.push("/register")}
        />

        <Card
        title= "Search Customer"
        subtitle="Find and manage customers"
        onPress={() => router.push("/search")}
        />
        <Card
        title= "Export Payment Data"
        subtitle="Download payment information"
        onPress={() => router.push("/export")}
        />
      </View>
    )
}

const styles = StyleSheet.create({
  container: {  
    flex: 1,
    marginTop: 100,
    backgroundColor: COLORS.background,
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },
});