import { StyleSheet, Text, View } from "react-native";
import type { TalkingScript } from "../../types/form";

interface ScriptBoxProps {
  script: TalkingScript;
}

export function ScriptBox({ script }: ScriptBoxProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>SAY TO RESIDENT:</Text>
      <Text style={styles.text}>{script.text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#E3F2FD",
    borderLeftWidth: 4,
    borderLeftColor: "#1976D2",
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
    color: "#1976D2",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  text: {
    fontSize: 15,
    color: "#333",
    lineHeight: 22,
    fontStyle: "italic",
  },
});
