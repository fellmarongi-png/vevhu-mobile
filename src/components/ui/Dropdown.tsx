import { useState } from "react";
import { FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS } from "../../config/app";

interface DropdownProps {
  options: string[];
  value: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function Dropdown({ options, value, onChange, placeholder }: DropdownProps) {
  const [visible, setVisible] = useState(false);

  return (
    <View>
      <TouchableOpacity style={styles.trigger} onPress={() => setVisible(true)}>
        <Text style={value ? styles.value : styles.placeholder}>
          {value || placeholder || "Select..."}
        </Text>
        <Text style={styles.arrow}>▼</Text>
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="fade">
        <TouchableOpacity style={styles.overlay} onPress={() => setVisible(false)}>
          <View style={styles.dropdown}>
            <FlatList
              data={options}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.option, item === value && styles.selected]}
                  onPress={() => {
                    onChange(item);
                    setVisible(false);
                  }}
                >
                  <Text style={[styles.optionText, item === value && styles.selectedText]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  trigger: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.gray50,
  },
  value: { fontSize: 16, color: COLORS.cardForeground },
  placeholder: { fontSize: 16, color: COLORS.gray400 },
  arrow: { fontSize: 12, color: COLORS.gray500 },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", padding: 32 },
  dropdown: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    maxHeight: 300,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  option: { padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.gray100 },
  selected: { backgroundColor: COLORS.secondary },
  optionText: { fontSize: 16, color: COLORS.cardForeground },
  selectedText: { color: COLORS.primaryDark, fontWeight: "600" },
});
