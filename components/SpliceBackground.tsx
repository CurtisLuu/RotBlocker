import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { colors } from "../theme";

/**
 * The film gate with the lights down.
 *
 * A flat dark field and a sprocket rail down the left edge. The rail is why
 * every screen's content is inset further on the left than the right — that
 * asymmetry is the layout's signature, not an accident.
 *
 * There was a wash of light spilling from the top of the gate here, faked with
 * stacked translucent views. It was invisible against near-black, but once the
 * field lifted off black its hard edges banded into visible seams. A flat field
 * is easier to look at than a fake gradient, so the spill is gone rather than
 * subdivided into more layers.
 */
export function SpliceBackground({ children }: { children: ReactNode }) {
  return (
    <View style={styles.root}>
      <View style={styles.rail} pointerEvents="none">
        <View style={styles.railLine} />
        {FRAMES.map((frame) => (
          <View key={frame} style={styles.sprocket} />
        ))}
      </View>

      <View style={styles.content}>{children}</View>
    </View>
  );
}

/**
 * Perforation positions down the rail. These carried frame numbers at 7px,
 * which is a fussy thing to park in the corner of someone's eye for the life
 * of the screen — the rhythm alone says "film strip" without the fine print.
 */
const FRAMES = ["04", "08", "12", "16", "20", "24"] as const;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.base,
  },
  rail: {
    position: "absolute",
    left: 12,
    top: 96,
    bottom: 72,
    width: 16,
    justifyContent: "space-between",
    alignItems: "center",
  },
  railLine: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: StyleSheet.hairlineWidth,
    backgroundColor: colors.line,
  },
  sprocket: {
    width: 7,
    height: 7,
    borderRadius: 1,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.base,
  },
  content: {
    flex: 1,
  },
});
