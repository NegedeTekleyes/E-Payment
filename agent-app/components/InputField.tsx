import { TextInput, View, StyleSheet } from "react-native";

interface InputFieldProps {
  placeholder?: string;
  secureTextEntry?: boolean;
  value?: string;
  onChangeText?: (text: string) => void;
  keyboardType?: "default" | "numeric" | "phone-pad" | "email-address";
  maxLength?: number;
}

export default function InputField({
  placeholder,
  secureTextEntry,
  value,
  onChangeText,
  keyboardType,
  maxLength,
}: InputFieldProps) {
  return (
    <View style={styles.container}>
      <TextInput
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        maxLength={maxLength}
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  input: {
    backgroundColor: "#acbde0",
    padding: 12, // reduced from 20 to look better
    borderRadius: 12,
    borderColor: "#E5E7EB",
    borderWidth: 1,
    fontSize: 16,
  },
});