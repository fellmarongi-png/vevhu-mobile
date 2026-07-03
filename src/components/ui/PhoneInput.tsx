import { StyleSheet, TextInput } from "react-native";

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function PhoneInput({ value, onChange }: PhoneInputProps) {
  return (
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChange}
      placeholder="07XX XXX XXX"
      placeholderTextColor="#999"
      keyboardType="phone-pad"
      maxLength={15}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
  },
});
