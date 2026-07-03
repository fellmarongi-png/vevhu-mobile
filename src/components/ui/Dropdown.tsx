import { useState } from "react";
import { FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

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
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  value: { fontSize: 16, color: "#333" },
  placeholder: { fontSize: 16, color: "#999" },
  arrow: { fontSize: 12, color: "#666" },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 32 },
  dropdown: { backgroundColor: "#fff", borderRadius: 12, maxHeight: 300, paddingVertical: 8 },
  option: { padding: 16, borderBottomWidth: 1, borderBottomColor: "#f0f0f0" },
  selected: { backgroundColor: "#E3F2FD" },
  optionText: { fontSize: 16, color: "#333" },
  selectedText: { color: "#1976D2", fontWeight: "600" },
});
