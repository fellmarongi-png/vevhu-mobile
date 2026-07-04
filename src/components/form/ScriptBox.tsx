import { StyleSheet, Text, View } from "react-native";
import { COLORS } from "../../config/app";
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
    backgroundColor: COLORS.secondary,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    padding: 16,
    borderRadius: 10,
    marginBottom: 20,
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.primaryDark,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  text: {
    fontSize: 15,
    color: COLORS.cardForeground,
    lineHeight: 22,
    fontStyle: "italic",
  },
});
