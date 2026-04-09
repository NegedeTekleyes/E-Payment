import { TextInput, View,StyleSheet } from "react-native";


export default function InputField({ placeholder,secure }: any) {
    return (
<View style={styles.container}>
    <TextInput
     placeholder={placeholder} 
     secureTextEntry={secure}
     style={styles.input} 
     />
</View>
    )
}



const styles = StyleSheet.create({
container: {
    marginBottom: 12,


},
input: {
    backgroundColor: "#acbde0",
    padding: 20,
    borderRadius: 12,
    borderColor: "#E5E7EB",
    borderWidth: 1,
    
}
})