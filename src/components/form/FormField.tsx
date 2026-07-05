import { StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { COLORS } from "../../config/app";
import type { FormField as FormFieldType } from "../../types/form";
import { Dropdown } from "../ui/Dropdown";
import { NationalIdInput } from "../ui/NationalIdInput";
import { PhoneInput } from "../ui/PhoneInput";

interface FormFieldProps {
  fieldDef: FormFieldType;
  value: any;
  onChange: (value: any) => void;
  error?: string;
}

export function FormField({ fieldDef, value, onChange, error }: FormFieldProps) {
  const isNameField = fieldDef.id.toLowerCase().includes("name");
  const isStandField = fieldDef.id.toLowerCase().includes("stand");

  const renderInput = () => {
    switch (fieldDef.type) {
      case "text":
        return (
          <TextInput
            style={styles.input}
            value={value || ""}
            onChangeText={onChange}
            placeholder={fieldDef.placeholder || fieldDef.label}
            placeholderTextColor={COLORS.gray400}
            autoCapitalize={isNameField ? "words" : isStandField ? "characters" : "sentences"}
            autoCorrect={!isStandField}
            textContentType={isNameField ? "name" : undefined}
          />
        );
      case "national_id":
        return (
          <NationalIdInput
            value={value || ""}
            onChange={onChange}
            placeholder={fieldDef.placeholder}
          />
        );
      case "long_text":
        return (
          <TextInput
            style={[styles.input, styles.multiline]}
            value={value || ""}
            onChangeText={onChange}
            placeholder={fieldDef.placeholder || fieldDef.label}
            placeholderTextColor={COLORS.gray400}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        );
      case "number":
        return (
          <TextInput
            style={[styles.input, styles.numberInput]}
            value={value?.toString() || ""}
            onChangeText={(v) => onChange(v ? Number(v) : null)}
            placeholder={fieldDef.placeholder || fieldDef.label}
            placeholderTextColor={COLORS.gray400}
            keyboardType="numeric"
          />
        );
      case "phone":
        return <PhoneInput value={value || ""} onChange={onChange} />;
      case "dropdown":
        return (
          <Dropdown
            options={fieldDef.options || []}
            value={value}
            onChange={onChange}
            placeholder={`Select ${fieldDef.label}`}
          />
        );
      case "toggle":
        return (
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>{fieldDef.label}</Text>
            <Switch
              value={!!value}
              onValueChange={onChange}
              trackColor={{ false: COLORS.gray300, true: COLORS.primary }}
              thumbColor={COLORS.white}
            />
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.fieldContainer}>
      {fieldDef.type !== "toggle" && (
        <Text style={styles.label}>
          {fieldDef.label}
          {fieldDef.required && <Text style={styles.required}> *</Text>}
        </Text>
      )}
      {renderInput()}
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  fieldContainer: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: "600", color: COLORS.gray700, marginBottom: 6 },
  required: { color: COLORS.error },
  input: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    backgroundColor: COLORS.gray50,
    color: COLORS.cardForeground,
  },
  numberInput: {
    fontVariant: ["tabular-nums"],
  },
  multiline: { height: 100, textAlignVertical: "top" },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  toggleLabel: { fontSize: 16, color: COLORS.cardForeground, flex: 1, marginRight: 12 },
  error: { color: COLORS.error, fontSize: 12, marginTop: 4 },
});
