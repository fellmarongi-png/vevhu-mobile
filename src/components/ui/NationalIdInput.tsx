import { StyleSheet, TextInput } from "react-native";
import { COLORS } from "../../config/app";

interface NationalIdInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function formatNationalId(raw: string): string {
  const clean = raw.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  if (!clean) return "";

  if (clean.length <= 2) {
    return clean;
  }
  if (clean.length <= 9) {
    return `${clean.slice(0, 2)}-${clean.slice(2)}`;
  }
  if (clean.length <= 10) {
    return `${clean.slice(0, 2)}-${clean.slice(2, 9)} ${clean.slice(9, 10)}`;
  }
  return `${clean.slice(0, 2)}-${clean.slice(2, 9)} ${clean.slice(9, 10)} ${clean.slice(10, 12)}`;
}

export function NationalIdInput({ value, onChange, placeholder }: NationalIdInputProps) {
  const handleChangeText = (text: string) => {
    const formatted = formatNationalId(text);
    onChange(formatted);
  };

  return (
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={handleChangeText}
      placeholder={placeholder || "63-2235942 E 59"}
      placeholderTextColor={COLORS.gray400}
      autoCapitalize="characters"
      autoCorrect={false}
      keyboardType="default"
      maxLength={16}
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
    fontWeight: "600",
    backgroundColor: COLORS.gray50,
    color: COLORS.cardForeground,
    letterSpacing: 1.5,
    fontVariant: ["tabular-nums"],
  },
});
