import Button from "@/components/Button";
import InputField from "@/components/InputField";
import { COLORS } from "@/constants/colors";
import { View,Text,StyleSheet } from "react-native";


export default function Search( ){
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Search Customer</Text>
            <InputField placeholder="Enter Phone or Account Number" />
            <Button title="Search" onPress={()=> {}}/>

                {/* result placeholdr */}
                <View style={styles.resultBox}>
                    <Text>Customer Info Will Apper Here!</Text>
                </View>
        </View>
    )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 20,
  },
  title: {
    fontSize: 22,
     marginTop:30,
    fontWeight: "bold",
    marginBottom: 20,
  },
  resultBox: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 12,
  },
  resultText: {
    color: COLORS.textSecondary,
  },
});