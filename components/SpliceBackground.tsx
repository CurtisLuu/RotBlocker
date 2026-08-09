import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { colors } from "../theme";

/** Quiet linen field with soft vertical “sprocket” rhythm — atmosphere, not chrome. */
export function SpliceBackground({ children }: { children: ReactNode }) {
  return (
    <View style={styles.root}>
      <View style={styles.wash} />
      <View style={styles.sprocketCol} pointerEvents="none">
        {Array.from({ length: 14 }).map((_, i) => (
          <View key={i} style={styles.sprocket} />
        ))}
      </View>
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.linen,
  },
  wash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.linen,
    borderTopWidth: 120,
    borderTopColor: colors.linenDeep,
    borderBottomWidth: 80,
    borderBottomColor: colors.linenDeep,
    opacity: 0.55,
  },
  sprocketCol: {
    position: "absolute",
    left: 10,
    top: 48,
    bottom: 48,
    width: 10,
    justifyContent: "space-between",
    opacity: 0.35,
  },
  sprocket: {
    width: 8,
    height: 8,
    borderRadius: 1,
    borderWidth: 1.5,
    borderColor: colors.mist,
    backgroundColor: "transparent",
  },
  content: {
    flex: 1,
  },
});
