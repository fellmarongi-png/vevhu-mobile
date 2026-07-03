import { StyleSheet, Switch, Text, TextInput, View } from "react-native";
import type { FormField as FormFieldType } from "../../types/form";
import { Dropdown } from "../ui/Dropdown";
import { PhoneInput } from "../ui/PhoneInput";

interface FormFieldProps {
  fieldDef: FormFieldType;
  value: any;
  onChange: (value: any) => void;
  error?: string;
}

export function FormField({ fieldDef, value, onChange, error }: FormFieldProps) {
  const renderInput = () => {
    switch (fieldDef.type) {
      case "text":
        return (
          <TextInput
            style={styles.input}
            value={value || ""}
            onChangeText={onChange}
            placeholder={fieldDef.placeholder || fieldDef.label}
            placeholderTextColor="#999"
          />
        );
      case "long_text":
        return (
          <TextInput
            style={[styles.input, styles.multiline]}
            value={value || ""}
            onChangeText={onChange}
            placeholder={fieldDef.placeholder || fieldDef.label}
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
          />
        );
      case "number":
        return (
          <TextInput
            style={styles.input}
            value={value?.toString() || ""}
            onChangeText={(v) => onChange(v ? Number(v) : null)}
            placeholder={fieldDef.placeholder || fieldDef.label}
            placeholderTextColor="#999"
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
              trackColor={{ false: "#ccc", true: "#4CAF50" }}
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
  label: { fontSize: 14, fontWeight: "600", color: "#333", marginBottom: 6 },
  required: { color: "#e53935" },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  multiline: { height: 100, textAlignVertical: "top" },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  toggleLabel: { fontSize: 16, color: "#333" },
  error: { color: "#e53935", fontSize: 12, marginTop: 4 },
});
