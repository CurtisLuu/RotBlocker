import {
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { colors, fonts } from "../theme";

/**
 * Signature mark: REELS struck through — the product thesis in one glyph.
 *
 * On the dark bench the emphasis inverts from the light version: the word is
 * dimmed toward the background (it's on its way out) and the splice itself
 * carries the accent color. The orange line is the app.
 */
export function StruckReels({
  size = "md",
  style,
}: {
  size?: "sm" | "md" | "lg";
  /** For optical alignment when the mark sits inline in a run of text. */
  style?: StyleProp<ViewStyle>;
}) {
  const fontSize = size === "lg" ? 38 : size === "sm" ? 17 : 22;
  const cutHeight = size === "lg" ? 4 : size === "sm" ? 2 : 2.5;
  // Sit the cut on the optical middle of the caps, not the line box middle.
  const cutTop = fontSize * 0.52 - cutHeight / 2;

  return (
    <View style={[styles.wrap, style]} accessibilityLabel="Reels, crossed out">
      <Text
        style={[styles.word, { fontSize, lineHeight: fontSize * 1.05 }]}
        allowFontScaling={false}
      >
        REELS
      </Text>
      <View
        style={[styles.cut, { top: cutTop, height: cutHeight }]}
        pointerEvents="none"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: "flex-start",
    position: "relative",
    // The cut overhangs the word, so the mark reserves room for it inline.
    marginHorizontal: 6,
  },
  word: {
    fontFamily: fonts.displayExtra,
    color: colors.textMuted,
    letterSpacing: 1.5,
  },
  cut: {
    position: "absolute",
    left: -5,
    right: -5,
    backgroundColor: colors.splice,
    transform: [{ rotate: "-7deg" }],
  },
});
