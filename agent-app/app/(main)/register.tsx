import Button from "@/components/Button";
import InputField from "@/components/InputField";
import { COLORS } from "@/constants/colors";
import { View,Text,StyleSheet } from "react-native";


export default function Register() {
    return(
        <View style={styles.container}>
            <Text style={styles.title}>Register Customer</Text>

            <InputField placeholder="First Name" />
            <InputField placeholder="Last Name" />
            <InputField placeholder="Phone Number" />
            <InputField placeholder="Account Number" />

            <Button title="Save Customer" onPress={() => {}} />
        </View>
    )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 50,
    backgroundColor: COLORS.background,
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },
});