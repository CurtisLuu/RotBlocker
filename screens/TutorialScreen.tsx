import { useMemo, useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { StruckReels } from "../components/StruckReels";
import { SpliceBackground } from "../components/SpliceBackground";
import { Button, IconBadge, type IconName } from "../components/Kit";
import { colors, fonts, GUTTER } from "../theme";

type Props = {
  onFinished: () => void;
};

type Step = {
  icon: IconName;
  title: string;
  body: string;
  points?: string[];
  showMark?: boolean;
};

const STEPS: Step[] = [
  {
    icon: "eye-off-outline",
    title: "Instagram without Reels",
    body: "RotBlocker hides Reels and leaves the rest of Instagram working normally.",
    showMark: true,
    points: ["Free and open source", "Nothing leaves your phone"],
  },
  {
    icon: "notifications-outline",
    title: "Keep the Instagram app",
    body: "If you delete it, you stop getting message and story notifications. Leave it installed and browse here instead.",
  },
  {
    icon: "shield-checkmark-outline",
    title: "Stop the app from opening",
    body: "RotBlocker can use Screen Time to block Instagram, so opening it brings you back here.",
    points: ["Set it up under Block the Instagram app"],
  },
  {
    icon: "checkmark-circle-outline",
    title: "You're ready",
    body: "Open Instagram from RotBlocker whenever you want to browse.",
  },
];

export function TutorialScreen({ onFinished }: Props) {
  const [index, setIndex] = useState(0);
  const fade = useRef(new Animated.Value(1)).current;
  const slide = useRef(new Animated.Value(0)).current;
  const step = STEPS[index];
  const isLast = index === STEPS.length - 1;

  const progress = useMemo(() => STEPS.map((_, i) => i <= index), [index]);

  /** Fade the current step out, drop the next one in from the side. */
  const goTo = (next: number) => {
    const direction = next > index ? 1 : -1;
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 0,
        duration: 110,
        useNativeDriver: true,
      }),
      Animated.timing(slide, {
        toValue: -8 * direction,
        duration: 110,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIndex(next);
      slide.setValue(10 * direction);
      Animated.parallel([
        Animated.timing(fade, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slide, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  return (
    <SpliceBackground>
      <SafeAreaView style={styles.safe}>
        <View style={styles.top}>
          <View style={styles.dots}>
            {progress.map((done, i) => (
              <View
                key={STEPS[i].title}
                style={[
                  styles.dot,
                  done && styles.dotDone,
                  i === index && styles.dotActive,
                ]}
              />
            ))}
          </View>
          <Pressable onPress={onFinished} hitSlop={12} accessibilityRole="button">
            <Text style={styles.skip}>Skip</Text>
          </Pressable>
        </View>

        <Animated.View
          style={[
            styles.bodyWrap,
            { opacity: fade, transform: [{ translateX: slide }] },
          ]}
        >
          {/* The mark is the icon on the step that shows it — never both. */}
          {step.showMark ? (
            <StruckReels size="lg" />
          ) : (
            <IconBadge name={step.icon} size="lg" />
          )}
          <Text style={styles.title}>{step.title}</Text>
          <Text style={styles.body}>{step.body}</Text>
          {step.points?.length ? (
            <View style={styles.points}>
              {step.points.map((point) => (
                <View key={point} style={styles.pointRow}>
                  <Ionicons
                    name="checkmark"
                    size={16}
                    color={colors.mint}
                    style={styles.check}
                  />
                  <Text style={styles.point}>{point}</Text>
                </View>
              ))}
            </View>
          ) : null}
        </Animated.View>

        <View style={styles.footer}>
          {index > 0 ? (
            <Button
              label="Back"
              tone="quiet"
              onPress={() => goTo(index - 1)}
              style={styles.secondary}
            />
          ) : (
            <View style={styles.secondary} />
          )}
          <Button
            label={isLast ? "Get started" : "Next"}
            tone="primary"
            onPress={() => (isLast ? onFinished() : goTo(index + 1))}
            style={styles.primary}
          />
        </View>
      </SafeAreaView>
    </SpliceBackground>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    paddingRight: 26,
    paddingLeft: GUTTER,
  },
  top: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 10,
    paddingBottom: 16,
  },
  dots: { flexDirection: "row", gap: 6, alignItems: "center" },
  dot: {
    width: 8,
    height: 3,
    borderRadius: 1,
    backgroundColor: colors.lineStrong,
  },
  dotDone: { backgroundColor: colors.textFaint },
  dotActive: {
    backgroundColor: colors.mint,
    width: 22,
  },
  skip: {
    fontFamily: fonts.bodyMed,
    color: colors.textMuted,
    fontSize: 14,
  },
  bodyWrap: {
    flex: 1,
    justifyContent: "center",
    gap: 14,
    paddingBottom: 16,
  },
  title: {
    fontFamily: fonts.display,
    color: colors.text,
    fontSize: 29,
    letterSpacing: -0.4,
    lineHeight: 36,
    marginTop: 2,
  },
  body: {
    fontFamily: fonts.body,
    color: colors.textMuted,
    fontSize: 16,
    lineHeight: 25,
    maxWidth: 330,
  },
  points: { gap: 10, marginTop: 6 },
  pointRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  check: { marginTop: 3 },
  point: {
    flex: 1,
    fontFamily: fonts.bodyMed,
    color: colors.text,
    fontSize: 15,
    lineHeight: 22,
  },
  footer: {
    flexDirection: "row",
    gap: 12,
    paddingBottom: 18,
  },
  secondary: { flex: 1 },
  primary: { flex: 1.4 },
});
