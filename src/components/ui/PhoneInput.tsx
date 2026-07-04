import { StyleSheet, TextInput } from "react-native";
import { COLORS } from "../../config/app";

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
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    backgroundColor: COLORS.gray50,
    color: COLORS.cardForeground,
  },
});
