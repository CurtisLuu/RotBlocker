import { StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "../theme";

/** Signature mark: REELS struck through — the product thesis. */
export function StruckReels({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const fontSize = size === "lg" ? 42 : size === "sm" ? 16 : 22;
  const lineTop = size === "lg" ? 22 : size === "sm" ? 9 : 12;

  return (
    <View style={styles.wrap} accessibilityLabel="Reels, crossed out">
      <Text
        style={[
          styles.word,
          {
            fontSize,
            lineHeight: fontSize * 1.05,
          },
        ]}
      >
        REELS
      </Text>
      <View
        style={[
          styles.cut,
          {
            top: lineTop,
            height: size === "lg" ? 4 : 2.5,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: "flex-start",
    position: "relative",
  },
  word: {
    fontFamily: fonts.displayExtra,
    color: colors.stamp,
    letterSpacing: 2,
  },
  cut: {
    position: "absolute",
    left: -4,
    right: -4,
    backgroundColor: colors.ink,
    transform: [{ rotate: "-8deg" }],
  },
});
