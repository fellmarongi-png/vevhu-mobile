import { StyleSheet, TextInput } from "react-native";
import { COLORS } from "../../config/app";

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function formatPhone(raw: string): string {
  const clean = raw.replace(/[^\d+]/g, "");
  if (!clean) return "";

  if (clean.startsWith("+") || clean.startsWith("263")) {
    const digits = clean.replace(/\D/g, "");
    if (digits.length <= 3) return `+${digits}`;
    if (digits.length <= 5) return `+${digits.slice(0, 3)} ${digits.slice(3)}`;
    if (digits.length <= 8)
      return `+${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5)}`;
    return `+${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8, 12)}`;
  }

  const digits = clean.replace(/\D/g, "");
  if (digits.length <= 4) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 4)} ${digits.slice(4)}`;
  return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 10)}`;
}

export function PhoneInput({ value, onChange }: PhoneInputProps) {
  const handleChangeText = (text: string) => {
    const formatted = formatPhone(text);
    onChange(formatted);
  };

  return (
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={handleChangeText}
      placeholder="077X XXX XXX or +263..."
      placeholderTextColor={COLORS.gray400}
      keyboardType="phone-pad"
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
    backgroundColor: COLORS.gray50,
    color: COLORS.cardForeground,
    fontVariant: ["tabular-nums"],
  },
});
